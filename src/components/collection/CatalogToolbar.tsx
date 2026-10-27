'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { WordReveal } from '@/components/motion/WordReveal'
import { Sheet } from '@/components/ui/Sheet'

export type Pill = { label: string; href: string; active: boolean }
type Option = { value: string; label: string }
type FacetRow = { s: string[]; c: string[]; k: string[]; d: string[]; p: number }

export type ToolbarProps = {
  heading: string
  count: number
  pills: Pill[]
  sortLabel: string
  sorts: { value: string; label: string }[]
  currentSort: string
  facets: {
    sizes: string[]
    colors: { name: string; hex: string }[]
    category: Option[]
    pattern: Option[]
    price: [number, number]
  }
  index: FacetRow[]
  selected: {
    sizes: string[]
    colors: string[]
    category: string[]
    pattern: string[]
    price: [number, number] | null
  }
  /** Mreža proizvoda: renderuje se u istom roditelju kao sticky traka, da traka ostane zalepljena. */
  children?: React.ReactNode
}

const plural = (n: number) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? 'proizvod' : 'proizvoda'}`

/**
 * Figma "Catalog heading" (54:982): naslov i broj proizvoda levo, pill dugmad desno
 * (Sve / kolekcije / Sortiraj). Na telefonu traka sa dugmadima je sticky ispod headera.
 * "Sortiraj" otvara Figma panel "Filteri" (128:1407) sa sortiranjem i filterima (D-028).
 */
export function CatalogToolbar(props: ToolbarProps) {
  const [open, setOpen] = useState(false)
  const activeCount =
    props.selected.sizes.length +
    props.selected.colors.length +
    props.selected.category.length +
    props.selected.pattern.length +
    (props.selected.price ? 1 : 0)

  const pillClass = (active: boolean) =>
    `hit flex shrink-0 items-center rounded-[99px] border border-sand-200 px-[18px] py-[11px] text-[12px] leading-4 whitespace-nowrap transition-colors ${
      active ? 'bg-primary text-white' : 'bg-white text-black hover:border-black'
    }`

  const sortButton = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={pillClass(activeCount > 0)}
      aria-haspopup="dialog"
    >
      {props.sortLabel}
      {activeCount ? <span className="ml-1">({activeCount})</span> : null}
    </button>
  )

  return (
    <>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-[var(--gutter)] md:flex-row md:items-start md:justify-between lg:px-16">
        <div className="flex flex-col gap-2.5 whitespace-nowrap">
          <WordReveal text={props.heading} className="t-heading text-black" />
          <p className="text-[12px] leading-4 text-stone-600" aria-live="polite">
            {plural(props.count)}
          </p>
        </div>
        {/* Desktop i tablet */}
        <div className="hidden flex-wrap justify-end gap-2.5 md:flex">
          {props.pills.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className={pillClass(p.active)}
              aria-current={p.active ? 'page' : undefined}
            >
              {p.label}
            </Link>
          ))}
          {sortButton}
        </div>
      </div>

      {/* Telefon: sticky traka ispod headera */}
      <div className="sticky top-[calc(56px+var(--safe-top))] z-20 mt-4 flex items-center gap-2 border-b border-neutral-200 bg-white/95 py-2 pl-[var(--gutter)] backdrop-blur md:hidden">
        <div className="snap-row min-w-0 flex-1 gap-2 py-1">
          {props.pills.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className={pillClass(p.active)}
              aria-current={p.active ? 'page' : undefined}
            >
              {p.label}
            </Link>
          ))}
        </div>
        <div className="shrink-0 pr-[var(--gutter)] shadow-[-12px_0_12px_-8px_rgba(255,255,255,1)]">
          {sortButton}
        </div>
      </div>

      {props.children}

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        side="bottom-center"
        label="Filteri i sortiranje"
      >
        {open ? <FilterPanel {...props} onClose={() => setOpen(false)} /> : null}
      </Sheet>
    </>
  )
}

function FilterPanel({
  facets,
  index,
  selected,
  sorts,
  currentSort,
  onClose,
}: ToolbarProps & { onClose: () => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [sort, setSort] = useState(currentSort)
  const [sizes, setSizes] = useState(selected.sizes)
  const [colors, setColors] = useState(selected.colors)
  const [category, setCategory] = useState(selected.category)
  const [pattern, setPattern] = useState(selected.pattern)
  const [price, setPrice] = useState<[number, number]>(selected.price ?? facets.price)

  const priceActive = price[0] > facets.price[0] || price[1] < facets.price[1]
  const count = useMemo(
    () =>
      index.filter(
        (r) =>
          (!sizes.length || r.s.some((v) => sizes.includes(v))) &&
          (!colors.length || r.c.some((v) => colors.includes(v))) &&
          (!category.length || r.k.some((v) => category.includes(v))) &&
          (!pattern.length || r.d.some((v) => pattern.includes(v))) &&
          (!priceActive || (r.p >= price[0] && r.p <= price[1])),
      ).length,
    [index, sizes, colors, category, pattern, price, priceActive],
  )

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

  const apply = () => {
    const params = new URLSearchParams(searchParams.toString())
    const put = (key: string, values: string[]) =>
      values.length ? params.set(key, values.join(',')) : params.delete(key)
    put('velicina', sizes)
    put('boja', colors)
    put('kategorija', category)
    put('dezen', pattern)
    if (priceActive) params.set('cena', `${price[0]}-${price[1]}`)
    else params.delete('cena')
    if (sort && sort !== 'featured') params.set('sort', sort)
    else params.delete('sort')
    params.delete('strana')
    const qs = params.toString()
    onClose()
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const clear = () => {
    setSizes([])
    setColors([])
    setCategory([])
    setPattern([])
    setPrice(facets.price)
  }

  return (
    <div className="flex max-h-[90dvh] flex-col font-display text-ink">
      <div data-swipe-handle className="flex shrink-0 flex-col px-4 pt-3 md:pt-6">
        <span className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-400 md:hidden" aria-hidden />
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1 leading-[normal] whitespace-nowrap">
            <h2 className="text-[28px] font-bold text-ink">Filteri</h2>
            <p className="text-[11px] text-stone-700">{plural(count)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zatvori filtere"
            className="hit flex size-9 items-center justify-center rounded-[999px] bg-sand-100"
          >
            <img loading="lazy" src="/figma/filters-close.svg" alt="" width={14} height={14} />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 pt-4">
        <Group title="Sortiraj">
          <Options>
            {sorts.map((s) => (
              <Chip
                key={s.value}
                active={sort === s.value}
                onClick={() => setSort(s.value)}
                role="radio"
              >
                {s.label}
              </Chip>
            ))}
          </Options>
        </Group>

        {facets.price[1] > facets.price[0] ? (
          <Group title="Cena">
            <PriceRange
              min={facets.price[0]}
              max={facets.price[1]}
              value={price}
              onChange={setPrice}
            />
          </Group>
        ) : null}

        {facets.sizes.length ? (
          <Group title="Veličina">
            <Options>
              {facets.sizes.map((v) => (
                <Chip key={v} active={sizes.includes(v)} onClick={() => toggle(sizes, setSizes, v)}>
                  {v}
                </Chip>
              ))}
            </Options>
          </Group>
        ) : null}

        {facets.category.length ? (
          <Group title="Kategorije">
            <Options>
              {facets.category.map((o) => (
                <Chip
                  key={o.value}
                  active={category.includes(o.value)}
                  onClick={() => toggle(category, setCategory, o.value)}
                >
                  {o.label}
                </Chip>
              ))}
            </Options>
          </Group>
        ) : null}

        {facets.pattern.length ? (
          <Group title="Dezen/Šara">
            <Options>
              {facets.pattern.map((o) => (
                <Chip
                  key={o.value}
                  active={pattern.includes(o.value)}
                  onClick={() => toggle(pattern, setPattern, o.value)}
                >
                  {o.label}
                </Chip>
              ))}
            </Options>
          </Group>
        ) : null}

        {facets.colors.length ? (
          <Group title="Boja">
            <Options>
              {facets.colors.map((c) => (
                <Chip
                  key={c.name}
                  active={colors.includes(c.name)}
                  onClick={() => toggle(colors, setColors, c.name)}
                >
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{
                      background: c.hex,
                      boxShadow:
                        c.hex.toLowerCase() === '#ffffff' ? 'inset 0 0 0 1px #adadad' : undefined,
                    }}
                    aria-hidden
                  />
                  {c.name}
                </Chip>
              ))}
            </Options>
          </Group>
        ) : null}
      </div>

      {/* Dugmad zalepljena za dno panela */}
      <div
        className="flex shrink-0 flex-col gap-2 border-t border-transparent bg-white px-4 pt-4"
        style={{ paddingBottom: 'max(16px, var(--safe-bottom))' }}
      >
        <button
          type="button"
          onClick={clear}
          className="flex h-[38px] w-full items-center justify-center rounded-xs border border-ink text-[13px] leading-[normal] text-ink"
        >
          Obriši sve filtere
        </button>
        <button
          type="button"
          onClick={apply}
          className="group press flex h-12 lg:h-[42px] w-full items-center justify-center gap-3 rounded-[99px] bg-neutral-100 py-[7px] pr-[7px] pl-5 font-body text-[14px] leading-[normal] font-medium text-black"
        >
          Prikaži {plural(count)}
          <span
            className="flex size-7 items-center justify-center rounded-[14px] bg-black"
            aria-hidden
          >
            <img
              loading="lazy"
              src="/figma/filters-apply-icon.svg"
              alt=""
              width={14}
              height={14}
              className="icon-wiggle"
            />
          </span>
        </button>
      </div>
    </div>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details open className="group border-b border-sand-300 pb-4">
      <summary className="flex min-h-6 cursor-pointer list-none items-center justify-between text-[13px] leading-[normal] font-bold [&::-webkit-details-marker]:hidden">
        {title}
        <img
          loading="lazy"
          src="/figma/filters-chevron-up.svg"
          alt=""
          width={12}
          height={12}
          className="rotate-180 transition-transform group-open:rotate-0"
        />
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  )
}

function Options({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-start gap-2">{children}</div>
}

function Chip({
  active,
  onClick,
  children,
  role = 'checkbox',
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  role?: 'checkbox' | 'radio'
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={active}
      onClick={onClick}
      className={`hit flex h-8 items-center gap-1.5 overflow-hidden rounded-xs border px-2.5 text-[11px] leading-[normal] whitespace-nowrap text-ink ${
        active ? 'border-primary-dark bg-accent font-bold' : 'border-sand-300 bg-white'
      }`}
    >
      {children}
    </button>
  )
}

/** Dvostruki klizač cene (Figma "Price range"): plava linija, plave ručke 14px, oznake ispod. */
function PriceRange({
  min,
  max,
  value,
  onChange,
}: {
  min: number
  max: number
  value: [number, number]
  onChange: (v: [number, number]) => void
}) {
  const pct = (v: number) => ((v - min) / (max - min)) * 100
  const thumb =
    'pointer-events-none absolute inset-0 h-[18px] w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-[14px] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-[14px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary pointer-coarse:[&::-webkit-slider-thumb]:size-6'
  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-[18px]">
        <span
          className="absolute top-1/2 right-0 left-0 h-0.5 -translate-y-1/2 bg-sand-300"
          aria-hidden
        />
        <span
          className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-primary"
          style={{ left: `${pct(value[0])}%`, right: `${100 - pct(value[1])}%` }}
          aria-hidden
        />
        <input
          type="range"
          min={min}
          max={max}
          step={10}
          value={value[0]}
          aria-label="Najniža cena"
          onChange={(e) => onChange([Math.min(Number(e.target.value), value[1]), value[1]])}
          className={thumb}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={10}
          value={value[1]}
          aria-label="Najviša cena"
          onChange={(e) => onChange([value[0], Math.max(Number(e.target.value), value[0])])}
          className={thumb}
        />
      </div>
      <div className="flex justify-between text-[11px] leading-[normal] text-ink">
        <span>{value[0]} RSD</span>
        <span>{value[1]} RSD</span>
      </div>
    </div>
  )
}
