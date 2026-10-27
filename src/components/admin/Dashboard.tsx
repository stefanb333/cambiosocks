import Link from 'next/link'
import { formatPrice } from '@/lib/money'
import type { ServerProps } from 'payload'

/**
 * Pregled prodavnice na početnoj strani admina (D-059): pozdrav sa brzim akcijama, brojke za
 * poslednjih 30 dana sa poređenjem, prihod po danu, poslednje porudžbine i varijante sa niskom
 * zalihom. Server komponenta: podaci se čitaju direktno iz baze, bez JS-a u pregledaču.
 * Ispod nje ostaju Payload kartice kolekcija.
 */

const TZ = 'Europe/Belgrade'
const DAY = 24 * 60 * 60 * 1000
const CHART_DAYS = 14
const ORDERS = '/admin/collections/orders'

const STATUS_LABELS: Record<string, string> = {
  nova: 'Nova',
  potvrdjena: 'Potvrđena',
  poslata: 'Poslata',
  isporucena: 'Isporučena',
  otkazana: 'Otkazana',
}

/** Ponoć u Beogradu za dati trenutak (server na Netlify-u radi u UTC-u). */
function startOfDay(date: Date): Date {
  const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(date)
  const offset =
    new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'longOffset' })
      .formatToParts(date)
      .find((p) => p.type === 'timeZoneName')
      ?.value.replace('GMT', '') || '+00:00'
  return new Date(`${ymd}T00:00:00${offset}`)
}

function greeting(date: Date): string {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: 'numeric', hourCycle: 'h23' }).format(
      date,
    ),
  )
  if (hour < 11) return 'Dobro jutro'
  if (hour < 18) return 'Dobar dan'
  return 'Dobro veče'
}

const relative = new Intl.RelativeTimeFormat('sr-Latn', { numeric: 'auto' })
function timeAgo(iso: string, now: number): string {
  const minutes = Math.round((new Date(iso).getTime() - now) / 60000)
  if (Math.abs(minutes) < 60) return relative.format(minutes, 'minute')
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return relative.format(hours, 'hour')
  return relative.format(Math.round(hours / 24), 'day')
}

/** Promena u odnosu na prethodnih 30 dana, u procentima (null kada nema osnove za poređenje). */
function trend(current: number, previous: number): number | null {
  if (!previous) return null
  return Math.round(((current - previous) / previous) * 100)
}

export async function Dashboard({ payload, user }: ServerProps) {
  const now = new Date()
  const today = startOfDay(now)
  const from30 = new Date(today.getTime() - 29 * DAY)
  const from60 = new Date(today.getTime() - 59 * DAY)
  // Prag iz admina (Podešavanja prodavnice > Prag za nisku zalihu)
  const settings = await payload.findGlobal({ slug: 'shop-settings', depth: 0 })
  const lowStockLimit = settings.lowStockThreshold ?? 5

  const [orders, pending, recent, activeProducts, lowStock, pendingReviews] = await Promise.all([
    payload.find({
      collection: 'orders',
      where: { createdAt: { greater_than_equal: from60.toISOString() } },
      select: { total: true, status: true, createdAt: true },
      pagination: false,
      depth: 0,
    }),
    payload.count({ collection: 'orders', where: { status: { equals: 'nova' } } }),
    payload.find({
      collection: 'orders',
      sort: '-createdAt',
      limit: 6,
      depth: 0,
      select: {
        name: true,
        total: true,
        status: true,
        createdAt: true,
        email: true,
        shippingAddress: true,
      },
    }),
    payload.count({ collection: 'products', where: { status: { equals: 'active' } } }),
    payload.find({
      collection: 'variants',
      where: {
        and: [{ trackInventory: { equals: true } }, { stock: { less_than_equal: lowStockLimit } }],
      },
      sort: 'stock',
      limit: 6,
      depth: 1,
      select: { title: true, stock: true, product: true },
      populate: { products: { title: true } },
    }),
    payload.count({ collection: 'reviews', where: { status: { equals: 'pending' } } }),
  ])

  // --- Brojke za 30 dana i poređenje sa prethodnih 30 (otkazane se ne računaju u prihod)
  const valid = orders.docs.filter((o) => o.status !== 'otkazana')
  const inRange = (o: (typeof valid)[number], start: Date, end: Date) => {
    const t = new Date(o.createdAt).getTime()
    return t >= start.getTime() && t < end.getTime()
  }
  const current = valid.filter((o) => inRange(o, from30, new Date(now.getTime() + 1)))
  const previous = valid.filter((o) => inRange(o, from60, from30))
  const sum = (list: typeof valid) => list.reduce((s, o) => s + (o.total ?? 0), 0)
  const revenue = sum(current)
  const average = current.length ? revenue / current.length : 0
  const todayCount = current.filter((o) => inRange(o, today, new Date(now.getTime() + 1))).length

  // --- Prihod po danu (poslednjih 14 dana)
  const days = Array.from({ length: CHART_DAYS }, (_, i) => {
    const start = new Date(today.getTime() - (CHART_DAYS - 1 - i) * DAY)
    const end = new Date(start.getTime() + DAY)
    return { start, total: sum(current.filter((o) => inRange(o, start, end))) }
  })
  const max = Math.max(...days.map((d) => d.total), 1)
  const dayLabel = new Intl.DateTimeFormat('sr-Latn', {
    timeZone: TZ,
    day: 'numeric',
    month: 'short',
  })

  const name = (user as { name?: string | null } | undefined)?.name?.trim().split(/\s+/)[0]
  const dateLine = new Intl.DateTimeFormat('sr-Latn', {
    timeZone: TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now)

  const stats = [
    {
      label: 'Prihod, 30 dana',
      value: formatPrice(revenue),
      change: trend(revenue, sum(previous)),
    },
    {
      label: 'Porudžbine, 30 dana',
      value: String(current.length),
      change: trend(current.length, previous.length),
    },
    {
      label: 'Prosečna korpa',
      value: formatPrice(average),
      change: trend(average, previous.length ? sum(previous) / previous.length : 0),
    },
    { label: 'Aktivni proizvodi', value: String(activeProducts.totalDocs), change: null },
  ]

  return (
    <div className="cambio-dash">
      <section className="cambio-dash__hero">
        <div className="cambio-dash__hero-text">
          <p className="cambio-dash__eyebrow">{dateLine}</p>
          <h1 className="cambio-dash__title">
            {greeting(now)}
            {name ? `, ${name}` : ''}
          </h1>
          <p className="cambio-dash__lead">
            {todayCount
              ? `Danas ${todayCount === 1 ? 'je stigla 1 porudžbina' : `je stiglo ${todayCount} porudžbina`}.`
              : 'Danas još nema novih porudžbina.'}{' '}
            {pending.totalDocs
              ? `${pending.totalDocs} čeka potvrdu.`
              : 'Sve porudžbine su obrađene.'}
          </p>
        </div>
        <div className="cambio-dash__actions">
          <Link
            className="cambio-pill cambio-pill--yellow"
            href="/admin/collections/products/create"
          >
            Novi proizvod
          </Link>
          <Link
            className="cambio-pill cambio-pill--glass"
            href={`${ORDERS}?where[status][equals]=nova`}
          >
            Za obradu
            {pending.totalDocs ? (
              <span className="cambio-pill__count">{pending.totalDocs}</span>
            ) : null}
          </Link>
          {/* Recenzije kupaca na čekanju (D-068) */}
          <Link
            className="cambio-pill cambio-pill--glass"
            href="/admin/collections/reviews?where[status][equals]=pending"
          >
            Recenzije
            {pendingReviews.totalDocs ? (
              <span className="cambio-pill__count">{pendingReviews.totalDocs}</span>
            ) : null}
          </Link>
          <a className="cambio-pill cambio-pill--glass" href="/" target="_blank" rel="noreferrer">
            Otvori prodavnicu ↗
          </a>
        </div>
      </section>

      <section className="cambio-dash__stats" aria-label="Brojke">
        {stats.map((s) => (
          <div key={s.label} className="cambio-card cambio-stat">
            <p className="cambio-stat__label">{s.label}</p>
            <p className="cambio-stat__value">{s.value}</p>
            {s.change !== null ? (
              <p className={`cambio-stat__trend ${s.change >= 0 ? 'is-up' : 'is-down'}`}>
                {s.change >= 0 ? '↑' : '↓'} {Math.abs(s.change)}%{' '}
                <span>u odnosu na prethodnih 30 dana</span>
              </p>
            ) : (
              <p className="cambio-stat__trend">
                <span>
                  {s.label === 'Aktivni proizvodi'
                    ? 'vidljivo u prodavnici'
                    : 'nema podataka za poređenje'}
                </span>
              </p>
            )}
          </div>
        ))}
      </section>

      <div className="cambio-dash__grid">
        <section className="cambio-card cambio-chart" aria-labelledby="cambio-chart-title">
          <div className="cambio-card__head">
            <h2 id="cambio-chart-title">Prihod po danu</h2>
            <span>poslednjih {CHART_DAYS} dana</span>
          </div>
          <ol className="cambio-chart__bars">
            {days.map((d, i) => (
              <li key={i} title={`${dayLabel.format(d.start)}: ${formatPrice(d.total)}`}>
                <span className="cambio-chart__track">
                  <span
                    className="cambio-chart__bar"
                    style={
                      {
                        height: `${Math.max(3, (d.total / max) * 100)}%`,
                        '--i': i,
                      } as React.CSSProperties
                    }
                    data-empty={d.total ? undefined : ''}
                  />
                </span>
                {/* Datum ispod svakog drugog stubića, uključujući danas */}
                <span className="cambio-chart__day">
                  {(CHART_DAYS - 1 - i) % 2 ? '' : dayLabel.format(d.start)}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="cambio-card cambio-stock" aria-labelledby="cambio-stock-title">
          <div className="cambio-card__head">
            <h2 id="cambio-stock-title">Niska zaliha</h2>
            <span>{lowStockLimit} kom ili manje</span>
          </div>
          {lowStock.docs.length ? (
            <ul className="cambio-stock__list">
              {lowStock.docs.map((v) => {
                const product = typeof v.product === 'object' && v.product ? v.product : null
                return (
                  <li key={v.id}>
                    <Link href={`/admin/collections/variants/${v.id}`}>
                      <span className="cambio-stock__name">
                        {product?.title ?? 'Proizvod'}
                        <small>{v.title}</small>
                      </span>
                      <span className={`cambio-stock__qty ${(v.stock ?? 0) <= 0 ? 'is-out' : ''}`}>
                        {(v.stock ?? 0) <= 0 ? 'Nema' : `${v.stock} kom`}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="cambio-empty">
              Sve varijante imaju više od {lowStockLimit} komada na stanju.
            </p>
          )}
        </section>

        <section className="cambio-card cambio-orders" aria-labelledby="cambio-orders-title">
          <div className="cambio-card__head">
            <h2 id="cambio-orders-title">Poslednje porudžbine</h2>
            <Link href={ORDERS}>Sve porudžbine →</Link>
          </div>
          {recent.docs.length ? (
            <table className="cambio-orders__table">
              <thead>
                <tr>
                  <th scope="col">Broj</th>
                  <th scope="col">Kupac</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="is-num">
                    Iznos
                  </th>
                  <th scope="col" className="is-num">
                    Vreme
                  </th>
                </tr>
              </thead>
              <tbody>
                {recent.docs.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`${ORDERS}/${o.id}`}>{o.name ?? `#${o.id}`}</Link>
                    </td>
                    <td className="cambio-orders__customer">
                      {o.shippingAddress?.name || o.email}
                    </td>
                    <td>
                      <span className={`cambio-status cambio-status--${o.status}`}>
                        {STATUS_LABELS[o.status ?? ''] ?? o.status}
                      </span>
                    </td>
                    <td className="is-num">{formatPrice(o.total ?? 0)}</td>
                    <td className="is-num cambio-orders__time">
                      {timeAgo(o.createdAt, now.getTime())}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="cambio-empty">
              Još nema porudžbina. Kada kupac poruči, porudžbina se pojavljuje ovde.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
