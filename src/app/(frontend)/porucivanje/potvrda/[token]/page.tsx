import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { getShopInfo } from '@/lib/data'
import { formatPrice } from '@/lib/money'
import { getPayload } from '@/lib/payload'
import type { Order } from '@/payload-types'
import type { Metadata } from 'next'

type Props = { params: Promise<{ token: string }> }

export const metadata: Metadata = {
  title: 'Porudžbina primljena',
  robots: { index: false, follow: false },
}
export const dynamic = 'force-dynamic'

const STATUS: Record<string, string> = {
  nova: 'Primljena',
  potvrdjena: 'Potvrđena',
  poslata: 'Poslata',
  isporucena: 'Isporučena',
  otkazana: 'Otkazana',
}

/** Potvrda porudžbine: otvara se preko tajnog tokena, ne preko broja porudžbine (D-010). */
export default async function ConfirmationPage({ params }: Props) {
  const { token } = await params
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) notFound()
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'orders',
    where: { accessToken: { equals: token } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  const order = docs[0] as Order | undefined
  if (!order) notFound()
  const shop = await getShopInfo()
  const a = order.shippingAddress

  return (
    <>
      <Header />
      <main id="sadrzaj" className="bg-paper">
        <div className="mx-auto flex max-w-[720px] flex-col gap-8 px-[var(--gutter)] py-12 lg:py-20">
          <div className="flex flex-col gap-4">
            <span
              className="flex size-[52px] items-center justify-center rounded-[99px] bg-primary"
              aria-hidden
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  stroke="#fff"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h1 className="font-display text-[clamp(32px,calc(32px+16*var(--vw-ratio)),48px)] leading-[1.15] font-bold tracking-[-1.2px] text-black">
              Hvala na porudžbini!
            </h1>
            <p className="text-[16px] leading-6 text-neutral-700">
              Porudžbina <strong className="text-black">{order.name}</strong> je primljena. Potvrda
              je poslata na <strong className="text-black">{order.email}</strong>. Javljamo se kada
              pošiljka krene; očekivani rok isporuke je{' '}
              {shop.deliveryEstimate || '1 do 3 radna dana'}.
            </p>
          </div>

          <section className="flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-[0_18px_50px_rgba(15,15,15,0.07)] sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[20px] leading-7 font-bold text-black">
                Porudžbina {order.name}
              </h2>
              <span className="rounded-[99px] bg-neutral-100 px-3 py-1.5 text-[12px] font-semibold text-black">
                {STATUS[order.status] ?? order.status}
              </span>
            </div>
            <ul className="flex flex-col divide-y divide-neutral-100">
              {(order.lineItems ?? []).map((item, i) => (
                <li key={item.id ?? i} className="flex items-center justify-between gap-4 py-3">
                  <span className="flex flex-col">
                    <span className="font-display text-[15px] font-bold tracking-[-0.5px] text-primary capitalize">
                      {item.title}
                    </span>
                    <span className="text-[13px] text-neutral-700">
                      {item.variantTitle} · {item.quantity} kom
                    </span>
                  </span>
                  <span className="text-[14px] font-medium whitespace-nowrap text-neutral-700">
                    {formatPrice(item.lineTotal ?? 0)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 border-t border-neutral-400 pt-4 text-[14px] text-neutral-700">
              <dt>Ukupno Proizvodi</dt>
              <dd className="text-right">{formatPrice(order.subtotal ?? 0)}</dd>
              {order.discountTotal ? (
                <>
                  <dt>Popust{order.discountCode ? ` (${order.discountCode})` : ''}</dt>
                  <dd className="text-right">-{formatPrice(order.discountTotal)}</dd>
                </>
              ) : null}
              <dt>Troškovi Dostave</dt>
              <dd className="text-right">{formatPrice(order.shippingTotal ?? 0)}</dd>
              <dt className="pt-2 text-[16px] font-semibold text-black">Za plaćanje pouzećem</dt>
              <dd className="pt-2 text-right text-[16px] font-semibold text-black">
                {formatPrice(order.total ?? 0)}
              </dd>
            </dl>
          </section>

          {a ? (
            <section className="flex flex-col gap-2 rounded-2xl bg-white p-6 shadow-[0_18px_50px_rgba(15,15,15,0.07)] sm:p-8">
              <h2 className="font-display text-[20px] leading-7 font-bold text-black">
                Adresa za dostavu
              </h2>
              <p className="text-[15px] leading-6 text-neutral-700">
                {[
                  a.name,
                  a.address1,
                  a.address2,
                  `${a.postalCode ?? ''} ${a.city ?? ''}`.trim(),
                  a.country,
                  order.phone,
                ]
                  .filter(Boolean)
                  .map((line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ))}
              </p>
            </section>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/kolekcije/sve"
              className="flex h-12 lg:h-[42px] items-center justify-center rounded-[99px] bg-primary px-6 text-[14px] font-medium text-white"
            >
              Nastavi kupovinu
            </Link>
            {shop.phone ? (
              <a
                href={`tel:${shop.phone.replace(/[^\d+]/g, '')}`}
                className="flex h-12 lg:h-[42px] items-center justify-center rounded-[99px] bg-neutral-100 px-6 text-[14px] font-medium text-neutral-700"
              >
                Pitanja? Pozovite {shop.phone}
              </a>
            ) : null}
          </div>
        </div>
      </main>
    </>
  )
}
