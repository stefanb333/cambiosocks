'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { useCart } from '@/components/cart/CartProvider'
import { ProductMorph } from '@/components/motion/ProductMorph'
import { WordReveal } from '@/components/motion/WordReveal'
import { Sheet } from '@/components/ui/Sheet'
import type { GalleryImage, PdpOption, PdpVariant } from '@/lib/catalog/product'
import { formatPrice } from '@/lib/money'

type Props = {
  slug: string
  title: string
  description: string | null
  rating: number | null
  ratingCount: number | null
  material: string | null
  gallery: GalleryImage[]
  options: PdpOption[]
  variants: PdpVariant[]
  /** Kolekcija kojoj proizvod pripada (putanja iznad naziva na telefonu). */
  breadcrumb: { name: string; path: string }
}

// ?varijanta=ID se čita tek u pregledaču, pa stranica ostaje statična (ISR) za sve varijante.
const noopSubscribe = () => () => {}
const readUrlVariant = () =>
  Number(new URLSearchParams(window.location.search).get('varijanta')) || null

/** Kao Happy Socks: za svaku boju flat i jedna slika na modelu. */
const IMAGES_PER_COLOR = 2

/**
 * Figma "single product" (52:1603): galerija 642px (glavna slika + 3 sličice 144x188 sa
 * strelicama 57px) i informacije 560px (naslov 72px verzal, opis, ocena, materijal, cena,
 * veličine, boje, "Poruči Odmah" i "Dodaj u Korpu").
 * Telefon (D-083): slika preko cele širine na beloj podlozi sa tačkicama preko slike, ispod siva
 * traka sa putanjom, nazivom (obična slova), cenom i stanjem zalihe, pa izbor varijante, dugmad i
 * sticky traka "Dodaj u korpu" pri dnu ekrana.
 */
export function ProductView(props: Props) {
  const { options, variants } = props
  const router = useRouter()
  const cart = useCart()

  const urlVariantId = useSyncExternalStore(noopSubscribe, readUrlVariant, () => null)
  const initial =
    variants.find((v) => v.id === urlVariantId) ??
    variants.find((v) => v.available) ??
    variants[0] ??
    null
  // Dok kupac ne izabere, važi varijanta iz adrese ili prva dostupna.
  const [picked, setSelection] = useState<string[] | null>(null)
  const selection = picked ?? initial?.values ?? options.map((o) => o.values[0]?.value ?? '')
  const variant = useMemo(
    () => variants.find((v) => v.values.every((val, i) => val === selection[i])) ?? null,
    [variants, selection],
  )

  // Galerija po boji (D-085), kao Happy Socks: slika varijante je flat te boje, a galerija ide
  // redom flat, model, flat, model. Za izabranu boju prikazuju se njen flat i slika posle njega
  // (najviše IMAGES_PER_COLOR). Proizvod bez slika po boji prikazuje celu galeriju.
  const colorIndex = options.findIndex((o) => o.kind === 'color')
  const colorImage = (value: string) => {
    const id = variants.find((v) => v.values[colorIndex] === value && v.imageId)?.imageId
    return props.gallery.find((g) => g.id === id) ?? null
  }
  const selectedColor = colorIndex >= 0 ? selection[colorIndex] : null
  const shownImages = useMemo(() => {
    const all = props.gallery
    const flatIds = new Set(variants.map((v) => v.imageId).filter(Boolean))
    const firstId = variants.find(
      (v) => selectedColor != null && v.values[colorIndex] === selectedColor && v.imageId,
    )?.imageId
    const start = all.findIndex((g) => g.id === firstId)
    if (start < 0) return all
    let end = start + 1
    while (end < all.length && !flatIds.has(all[end].id)) end++
    return all.slice(start, Math.min(end, start + IMAGES_PER_COLOR))
  }, [props.gallery, variants, colorIndex, selectedColor])
  const [active, setActive] = useState(0)

  // ?varijanta=ID u adresi posle izbora kupca (deljenje linka na tačnu varijantu), bez skoka skrola.
  useEffect(() => {
    if (!variant || !picked) return
    const url = new URL(window.location.href)
    url.searchParams.set('varijanta', String(variant.id))
    window.history.replaceState(window.history.state, '', url)
  }, [variant, picked])

  const isAvailable = (optionIndex: number, value: string) =>
    variants.some(
      (v) =>
        v.available &&
        v.values[optionIndex] === value &&
        v.values.every((val, i) => i === optionIndex || val === selection[i]),
    )

  const select = (optionIndex: number, value: string) => {
    let next = [...selection]
    next[optionIndex] = value
    // Ako kombinacija ne postoji, uzmi prvu dostupnu varijantu sa izabranom vrednošću.
    if (!variants.some((v) => v.values.every((val, i) => val === next[i]))) {
      const fallback =
        variants.find((v) => v.available && v.values[optionIndex] === value) ??
        variants.find((v) => v.values[optionIndex] === value)
      if (fallback) next = fallback.values
    }
    setSelection(next)
    // Nova boja počinje od svoje prve slike (flat).
    if (next[colorIndex] !== selection[colorIndex]) setActive(0)
  }

  const [status, setStatus] = useState<string>('')
  const canBuy = Boolean(variant?.available)
  const addToCart = (goToCheckout: boolean) => {
    if (!variant) {
      setStatus('Izaberite veličinu i boju.')
      document
        .getElementById('izbor-varijante')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (!variant.available) {
      setStatus('Ova varijanta trenutno nije na stanju.')
      return
    }
    cart.add(variant.id, 1)
    setStatus('Dodato u korpu.')
    if (goToCheckout) router.push('/porucivanje')
    else cart.open()
  }

  // Sticky traka na telefonu se prikazuje kada glavna dugmad izađu iz ekrana.
  const ctaRef = useRef<HTMLDivElement>(null)
  const [showSticky, setShowSticky] = useState(false)
  useEffect(() => {
    const el = ctaRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      {
        threshold: 0,
      },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const price = variant?.price ?? Math.min(...variants.map((v) => v.price))
  const compareAt = variant?.compareAtPrice ?? null
  const inStock = variant ? variant.available : variants.some((v) => v.available)
  const primaryLabel = canBuy || !variant ? 'Poruči Odmah' : 'Rasprodato'

  return (
    <section className="bg-white pb-10 lg:pb-[104px]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 lg:flex-row lg:items-start lg:justify-center lg:gap-[clamp(40px,calc(40px+46*(100vw-1024px)/416),86px)] lg:pt-[60px] lg:pr-[clamp(32px,calc(32px+42*(100vw-1024px)/416),74px)] lg:pl-[clamp(32px,calc(32px+46*(100vw-1024px)/416),78px)]">
        <Gallery
          key={selectedColor ?? 'sve'}
          images={shownImages}
          active={Math.min(active, shownImages.length - 1)}
          onChange={setActive}
          title={props.title}
          slug={props.slug}
        />

        {/* Desktop: informacije prate skrol pored slika (sticky), kao na Happy Socks. */}
        <div className="flex w-full flex-col gap-7 px-[var(--gutter)] lg:sticky lg:top-[calc(var(--header-h,88px)+24px)] lg:w-[clamp(420px,calc(420px+140*(100vw-1024px)/416),560px)] lg:shrink-0 lg:gap-9 lg:px-0">
          {/* Telefon: siva traka preko cele širine (putanja, naziv, cena, zaliha); desktop: samo naslov. */}
          <div className="-mx-[var(--gutter)] -mt-6 flex flex-col gap-2 bg-neutral-100 px-[var(--gutter)] pt-5 pb-6 lg:m-0 lg:gap-0 lg:bg-transparent lg:p-0">
            <nav aria-label="Putanja" className="text-[14px] leading-5 text-neutral-500 lg:hidden">
              <Link href="/" className="hover:text-black hover:underline">
                Početna
              </Link>
              <span aria-hidden> / </span>
              <Link href={props.breadcrumb.path} className="hover:text-black hover:underline">
                {props.breadcrumb.name}
              </Link>
            </nav>
            <WordReveal
              as="h1"
              trigger="load"
              text={props.title}
              className="t-display w-full max-w-[544px] pr-[0.0694em] text-black uppercase max-lg:pr-0 max-lg:text-[26px] max-lg:leading-[1.25] max-lg:font-medium max-lg:tracking-[-0.01em] max-lg:normal-case"
            />
            <p className="flex items-baseline gap-3 lg:hidden">
              <span className="font-display text-[26px] leading-[1.25] font-medium text-black">
                {formatPrice(price)}
              </span>
              {compareAt ? (
                <s className="text-[16px] text-neutral-400">{formatPrice(compareAt)}</s>
              ) : null}
            </p>
            <p
              className={`text-[14px] leading-5 font-semibold tracking-[0.04em] uppercase lg:hidden ${inStock ? 'text-green-700' : 'text-red-700'}`}
            >
              {inStock ? 'Na stanju' : 'Nema na stanju'}
            </p>
          </div>
          {props.description ? (
            <p {...reveal(1)} className="max-w-[486px] text-[16px] leading-6 text-black">
              {props.description}
            </p>
          ) : null}

          {/* Ocena iz odobrenih recenzija (D-068); vodi na sekciju recenzija ispod. */}
          {props.rating && props.ratingCount ? (
            <a {...reveal(2)} href="#recenzije" className="group flex w-fit items-center gap-3">
              <Stars rating={props.rating} />
              <span className="text-[14px] leading-5 whitespace-nowrap text-neutral-700 underline-offset-2 group-hover:underline">
                {props.rating.toFixed(1)} · {props.ratingCount}{' '}
                {props.ratingCount === 1
                  ? 'recenzija'
                  : props.ratingCount < 5
                    ? 'recenzije'
                    : 'recenzija'}
              </span>
            </a>
          ) : (
            <a
              {...reveal(2)}
              href="#recenzije"
              className="w-fit text-[14px] leading-5 text-neutral-700 underline underline-offset-2 hover:text-primary"
            >
              Još nema recenzija · Napišite prvu
            </a>
          )}

          {props.material ? (
            <div {...reveal(3)} className="text-[16px] leading-6 text-black">
              <p>Materijal i Sastav:</p>
              <p>{props.material}</p>
            </div>
          ) : null}

          <div {...reveal(3)} className="hidden flex-col gap-[9px] lg:flex">
            <p className="text-[14px] leading-5 text-black">Cena</p>
            <p className="flex items-baseline gap-3">
              <span className="t-heading text-primary">{formatPrice(price)}</span>
              {compareAt ? (
                <s className="text-[18px] text-neutral-400">{formatPrice(compareAt)}</s>
              ) : null}
            </p>
          </div>

          <div id="izbor-varijante" {...reveal(4)} className="flex flex-col gap-7 lg:gap-9">
            {options.map((option, oi) => (
              <fieldset key={option.name} className="flex w-full max-w-[501px] flex-col gap-[22px]">
                <legend className="mb-[22px] text-[16px] leading-6 text-black">
                  {option.kind === 'color' ? (
                    <>
                      Boja: <span className="font-semibold">{selection[oi]}</span>
                    </>
                  ) : option.kind === 'size' ? (
                    'Odaberi Veličinu'
                  ) : (
                    `Odaberi ${option.name}`
                  )}
                </legend>
                {option.kind === 'color' && option.values.every((v) => colorImage(v.value)) ? (
                  // Izbor boje kao na Happy Socks: sličica flat fotografije, ispod izabrane naziv.
                  <div
                    className="flex flex-wrap items-start gap-2"
                    role="radiogroup"
                    aria-label={option.name}
                  >
                    {option.values.map((v) => {
                      const selected = selection[oi] === v.value
                      const available = isAvailable(oi, v.value)
                      const img = colorImage(v.value)!
                      return (
                        <button
                          key={v.value}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          aria-label={`${v.value}${available ? '' : ', nema na stanju'}`}
                          title={v.value}
                          onClick={() => select(oi, v.value)}
                          className="group flex w-[68px] flex-col items-center gap-1.5"
                        >
                          <span
                            className={`relative block h-[84px] w-[68px] overflow-hidden rounded-xl border bg-white transition-colors ${
                              selected
                                ? 'border-2 border-black'
                                : 'border-neutral-200 group-hover:border-neutral-500'
                            } ${available ? '' : 'opacity-40'}`}
                          >
                            <Image
                              src={img.src}
                              alt=""
                              fill
                              quality={75}
                              sizes="68px"
                              className="object-contain p-1"
                            />
                          </span>
                          <span
                            className={`text-[12px] leading-4 ${selected ? 'font-semibold text-black' : 'text-neutral-500'}`}
                          >
                            {v.value}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                ) : option.kind === 'color' ? (
                  <div
                    className="flex flex-wrap items-center gap-[15px]"
                    role="radiogroup"
                    aria-label={option.name}
                  >
                    {option.values.map((v) => {
                      const selected = selection[oi] === v.value
                      const available = isAvailable(oi, v.value)
                      return (
                        <button
                          key={v.value}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          aria-label={`${v.value}${available ? '' : ', nema na stanju'}`}
                          title={v.value}
                          onClick={() => select(oi, v.value)}
                          className={`hit flex size-10 items-center justify-center rounded-full bg-neutral-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-shadow ${
                            selected ? 'ring-2 ring-primary ring-offset-2' : ''
                          } ${available ? '' : 'opacity-40'}`}
                        >
                          <span
                            className="size-[26px] rounded-full"
                            style={{ background: v.swatch ?? '#ccc' }}
                          />
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div
                    className="flex flex-wrap gap-[14px]"
                    role="radiogroup"
                    aria-label={option.name}
                  >
                    {option.values.map((v) => {
                      const selected = selection[oi] === v.value
                      const available = isAvailable(oi, v.value)
                      return (
                        <button
                          key={v.value}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          aria-label={`${v.value}${available ? '' : ', nema na stanju'}`}
                          onClick={() => select(oi, v.value)}
                          className={`flex min-h-11 w-[89px] items-center justify-center rounded-full p-2.5 text-[14px] leading-5 whitespace-nowrap shadow-[0_1px_1.5px_rgba(0,0,0,0.08)] transition-colors lg:min-h-0 ${
                            selected
                              ? 'bg-primary text-white'
                              : 'bg-neutral-200 text-black hover:bg-neutral-100'
                          } ${available ? '' : 'text-neutral-400 line-through'}`}
                        >
                          {v.value}
                        </button>
                      )
                    })}
                  </div>
                )}
              </fieldset>
            ))}
          </div>

          <div
            ref={ctaRef}
            {...reveal(5)}
            className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6"
          >
            <button
              type="button"
              onClick={() => addToCart(true)}
              disabled={Boolean(variant) && !canBuy}
              className="group press flex h-[51px] w-full items-center justify-center gap-3 rounded-[99px] bg-primary py-[7px] pr-[7px] pl-5 text-[14px] leading-[normal] font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-neutral-400 sm:w-[267px]"
            >
              {primaryLabel}
              <span
                className="flex size-7 items-center justify-center rounded-[14px] bg-white"
                aria-hidden
              >
                <img
                  loading="lazy"
                  src="/figma/arrow-right-blue.svg"
                  alt=""
                  width={14}
                  height={14}
                  className="icon-nudge"
                />
              </span>
            </button>
            <button
              type="button"
              onClick={() => addToCart(false)}
              disabled={Boolean(variant) && !canBuy}
              className="flex h-[51px] w-full items-center justify-center gap-3 rounded-[99px] bg-neutral-200 py-[7px] pr-[7px] pl-5 text-[14px] leading-[normal] font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-[264px]"
            >
              Dodaj u Korpu
              <span
                className="flex size-7 items-center justify-center rounded-[14px] bg-neutral-400"
                aria-hidden
              >
                <img loading="lazy" src="/figma/cart-icon-grey.svg" alt="" width={14} height={14} />
              </span>
            </button>
          </div>
          <p
            role="status"
            className="-mt-4 min-h-5 text-[14px] leading-5 text-neutral-700 lg:-mt-6"
          >
            {status}
          </p>
        </div>
      </div>

      {/* Sticky traka na telefonu i tabletu */}
      <div
        className={`fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white/95 px-4 pt-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur transition-transform duration-200 lg:hidden ${
          showSticky ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'max(12px, var(--safe-bottom))' }}
        aria-hidden={!showSticky}
      >
        <div className="mx-auto flex max-w-[600px] items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-[20px] leading-6 font-bold text-primary">
              {formatPrice(price)}
            </p>
            <p className="truncate text-[12px] leading-4 text-neutral-700">
              {variant?.title ?? 'Izaberite varijantu'}
            </p>
          </div>
          <button
            type="button"
            tabIndex={showSticky ? 0 : -1}
            onClick={() => addToCart(false)}
            disabled={Boolean(variant) && !canBuy}
            className="group press flex h-12 shrink-0 items-center gap-3 rounded-[99px] bg-primary py-[7px] pr-[7px] pl-5 text-[14px] leading-[normal] font-medium text-white disabled:bg-neutral-400"
          >
            {canBuy || !variant ? 'Dodaj u Korpu' : 'Rasprodato'}
            <span
              className="flex size-[34px] items-center justify-center rounded-full bg-white"
              aria-hidden
            >
              <img
                loading="lazy"
                src="/figma/cart-button-icon.svg"
                alt=""
                width={14}
                height={14}
                className="icon-wiggle"
              />
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}

/** Blokovi informacija se pojavljuju redom posle naslova (motion.css, "fade-load"). */
const reveal = (i: number) => ({
  'data-reveal': 'fade-load',
  style: { '--i': i } as React.CSSProperties,
})

/** Figma "STARS" (52:1628), 133x24: oblik zvezdica iz Figme kao maska, popunjenost prema oceni. */
function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const fill = Math.min(133, full * 27.2283 + (rating - full) * 22.9)
  return (
    <span
      role="img"
      aria-label={`Ocena ${rating.toFixed(1)} od 5`}
      className="block h-[24.087px] w-[133px] shrink-0"
      style={{
        background: `linear-gradient(to right, #FFDE00 ${fill}px, #F3F3F3 ${fill}px)`,
        mask: 'url(/figma/rating-stars.svg) center / 100% 100% no-repeat',
        WebkitMask: 'url(/figma/rating-stars.svg) center / 100% 100% no-repeat',
      }}
    />
  )
}

function Gallery({
  images,
  active,
  onChange,
  title,
  slug,
}: {
  images: GalleryImage[]
  active: number
  onChange: (i: number) => void
  title: string
  slug: string
}) {
  const rowRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(false)

  // Uvećani prikaz se otvara na slici koja je trenutno aktivna, ne na prvoj.
  useEffect(() => {
    const row = zoomRef.current
    if (zoom && row) row.scrollTo({ left: active * row.clientWidth, behavior: 'instant' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom])

  // Telefon: prati koja je slika vidljiva u nizu (indikator i brojač).
  useEffect(() => {
    const row = rowRef.current
    if (!row) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) onChange(Number((e.target as HTMLElement).dataset.index))
      },
      { root: row, threshold: 0.6 },
    )
    row.querySelectorAll('[data-index]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [images, onChange])

  // Kad se aktivna slika promeni izborom varijante, pomeri telefonski niz na nju.
  useEffect(() => {
    const row = rowRef.current
    const el = row?.querySelector<HTMLElement>(`[data-index="${active}"]`)
    if (row && el && Math.abs(row.scrollLeft - el.offsetLeft) > 4)
      row.scrollTo({ left: el.offsetLeft, behavior: 'smooth' })
  }, [active])

  if (!images.length) {
    return (
      <div
        className="aspect-square w-full bg-[#d9d9d9] lg:max-w-[642px] lg:min-w-0 lg:flex-1 lg:rounded-2xl"
        aria-hidden
      />
    )
  }

  return (
    <div className="w-full lg:flex lg:max-w-[642px] lg:min-w-0 lg:flex-1 lg:flex-col lg:items-center lg:gap-[30px]">
      {/* Telefon i tablet: niz sa prevlačenjem */}
      <div className="relative lg:hidden">
        <div
          ref={rowRef}
          className="snap-row aspect-[4/5] w-full bg-white"
          aria-label={`Slike: ${title}`}
        >
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              data-index={i}
              onClick={() => setZoom(true)}
              className="relative h-full w-full"
              aria-label={`Uvećaj sliku ${i + 1} od ${images.length}`}
            >
              {i === 0 ? (
                <ProductMorph slug={slug}>
                  <Image
                    src={img.src}
                    alt={img.alt || title}
                    fill
                    preload
                    fetchPriority="high"
                    quality={85}
                    sizes="100vw"
                    className="object-cover"
                  />
                </ProductMorph>
              ) : (
                <Image
                  src={img.src}
                  alt={img.alt || title}
                  fill
                  quality={85}
                  sizes="100vw"
                  className="object-cover"
                />
              )}
            </button>
          ))}
        </div>
        {images.length > 1 ? (
          // Tačkice preko donjeg dela slike, kao indikator galerije
          <div
            className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-2"
            aria-hidden
          >
            {images.map((img, i) => (
              <span
                key={img.id}
                className={`size-2 rounded-full transition-colors ${i === active ? 'bg-black' : 'bg-neutral-300'}`}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Desktop: slike izabrane boje jedna ispod druge (flat pa model), kao na Happy Socks. */}
      <div className="hidden w-full flex-col gap-3 lg:flex">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => {
              onChange(i)
              setZoom(true)
            }}
            className="group relative aspect-[4/5] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-white"
            aria-label={`Uvećaj sliku ${i + 1} od ${images.length}`}
          >
            {i === 0 ? (
              <ProductMorph slug={slug}>
                <Image
                  src={img.src}
                  alt={img.alt || title}
                  fill
                  loading="eager"
                  fetchPriority="high"
                  quality={85}
                  sizes="(min-width: 1440px) 642px, 45vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </ProductMorph>
            ) : (
              <Image
                src={img.src}
                alt={img.alt || title}
                fill
                quality={85}
                sizes="(min-width: 1440px) 642px, 45vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            )}
          </button>
        ))}
      </div>


      <Sheet
        open={zoom}
        onClose={() => setZoom(false)}
        side="full"
        label="Uvećane slike"
        className="bg-black"
      >
        <div className="relative flex h-dvh flex-col">
          <button
            type="button"
            onClick={() => setZoom(false)}
            className="absolute top-[max(12px,var(--safe-top))] right-3 z-10 flex size-11 items-center justify-center rounded-full bg-white/90"
            aria-label="Zatvori"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="#0f0f0f"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <div ref={zoomRef} className="snap-row h-full w-full">
            {images.map((img) => (
              <div key={img.id} className="relative h-full w-full">
                <Image
                  src={img.src}
                  alt={img.alt || title}
                  fill
                  quality={85}
                  sizes="100vw"
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </Sheet>
    </div>
  )
}
