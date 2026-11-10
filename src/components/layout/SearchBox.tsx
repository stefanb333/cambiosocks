'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'
import type { SearchHit } from '@/lib/catalog/listing-shared'
import { formatPrice } from '@/lib/money'

type Props = {
  placeholder: string
  /** Providna varijanta preko hero slike (desktop overlay header). */
  light?: boolean
  /** Pretraga u padajućem panelu mobilnog headera: rezultati su ispod polja, ne u plutajućem panelu. */
  mobile?: boolean
  autoFocus?: boolean
  /** Poziva se pre odlaska na rezultat (mobilni panel se zatvara). */
  onDone?: () => void
}

type Result = { q: string; hits: SearchHit[]; total: number }

const DEBOUNCE_MS = 180

/**
 * Pretraga u headeru sa predlozima uživo (D-065): posle kratke pauze u kucanju stižu prvih 6
 * proizvoda (/api/search), strelice biraju predlog, Enter otvara izabrani proizvod ili celu
 * stranicu rezultata (/pretraga). Bez JS-a forma i dalje vodi na /pretraga?q=.
 * ARIA combobox: polje najavljuje listu, izabrani predlog i broj pogodaka.
 */
export function SearchBox({
  placeholder,
  light = false,
  mobile = false,
  autoFocus,
  onDone,
}: Props) {
  const router = useRouter()
  const id = useId()
  const listId = `${id}-lista`
  const rootRef = useRef<HTMLDivElement>(null)
  const [q, setQ] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)

  const term = q.trim()
  const ready = term.length >= 2

  // Upit se šalje posle pauze u kucanju; stariji odgovor se odbacuje (AbortController).
  useEffect(() => {
    if (!ready) return
    const ctrl = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
          signal: ctrl.signal,
        })
        if (!res.ok) throw new Error(String(res.status))
        const data = (await res.json()) as Omit<Result, 'q'>
        setResult({ q: term, ...data })
        setActive(-1)
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setResult({ q: term, hits: [], total: 0 })
      } finally {
        if (!ctrl.signal.aborted) setLoading(false)
      }
    }, DEBOUNCE_MS)
    return () => {
      clearTimeout(timer)
      ctrl.abort()
    }
  }, [term, ready])

  // Klik van pretrage zatvara predloge.
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const hits = ready && result ? result.hits : []
  const showPanel = open && ready && (result !== null || loading)
  const allHref = `/pretraga?q=${encodeURIComponent(term)}`

  const go = (href: string) => {
    setOpen(false)
    onDone?.()
    router.push(href)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (open) setOpen(false)
      else setQ('')
      return
    }
    if (!hits.length || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return
    e.preventDefault()
    setOpen(true)
    const step = e.key === 'ArrowDown' ? 1 : -1
    // -1 = polje (bez izbora), pa kruži kroz predloge
    setActive((i) => ((i + 1 + step + hits.length + 1) % (hits.length + 1)) - 1)
  }

  return (
    <div
      ref={rootRef}
      className={mobile ? 'flex flex-col gap-2' : 'relative'}
      onFocus={() => setOpen(true)}
    >
      <form
        role="search"
        action="/pretraga"
        onSubmit={(e) => {
          e.preventDefault()
          if (!term) return
          go(active >= 0 && hits[active] ? `/proizvodi/${hits[active].slug}` : allHref)
        }}
        className={
          mobile
            ? 'flex h-11 items-center gap-3 rounded-[33px] bg-white px-4'
            : `flex h-[30px] w-[164px] items-center gap-3 rounded-[33px] pl-4 transition-[width,background-color] duration-300 ease-[var(--ease-out-expo)] focus-within:w-[240px] xl:w-[208px] xl:pl-[22px] xl:focus-within:w-[280px] ${light ? 'bg-white/40 focus-within:bg-white' : 'bg-white'}`
        }
      >
        <img
          src={light ? '/figma/nav-search-overlay.svg' : '/figma/nav-search.svg'}
          alt=""
          width={17}
          height={17.68}
          className="h-[17.68px] w-[17px] shrink-0"
        />
        <label className="visually-hidden" htmlFor={`${id}-polje`}>
          Pretraga proizvoda
        </label>
        <input
          id={`${id}-polje`}
          name="q"
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          enterKeyHint="search"
          autoComplete="off"
          autoFocus={autoFocus}
          maxLength={80}
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={
            mobile
              ? 'h-full min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-neutral-400'
              : `h-full min-w-0 flex-1 bg-transparent pr-3 text-[12px]! leading-4 outline-none ${
                  light
                    ? 'text-neutral-700 placeholder:text-neutral-700'
                    : 'text-black placeholder:text-neutral-400'
                }`
          }
        />
      </form>

      <p className="visually-hidden" aria-live="polite">
        {showPanel && result && !loading
          ? result.total
            ? `${result.total} ${result.total === 1 ? 'proizvod' : 'proizvoda'}, strelicama birajte predlog`
            : 'Nema proizvoda za ovaj pojam'
          : ''}
      </p>

      {showPanel ? (
        <div
          data-lenis-prevent
          className={
            mobile
              ? 'drop-in max-h-[min(60svh,460px)] overflow-y-auto overscroll-contain rounded-[20px] bg-white p-2'
              : 'drop-in absolute top-[calc(100%+12px)] right-0 z-50 w-[380px] rounded-[20px] bg-white p-2 text-left shadow-[0_18px_50px_rgba(15,15,15,0.16)] ring-1 ring-black/5'
          }
        >
          {hits.length ? (
            <ul
              id={listId}
              role="listbox"
              aria-label="Predlozi proizvoda"
              className="flex flex-col"
            >
              {hits.map((hit, i) => (
                <li key={hit.slug} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                  <Link
                    href={`/proizvodi/${hit.slug}`}
                    tabIndex={-1}
                    onClick={() => {
                      setOpen(false)
                      onDone?.()
                    }}
                    onMouseEnter={() => setActive(i)}
                    className={`flex items-center gap-3 rounded-[14px] p-2 transition-colors ${i === active ? 'bg-neutral-100' : ''}`}
                  >
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-[10px] bg-white ring-1 ring-black/5">
                      {hit.image ? (
                        <Image
                          src={hit.image.src}
                          alt=""
                          fill
                          sizes="112px"
                          className="object-contain p-0.5"
                        />
                      ) : null}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-[15px] leading-5 font-semibold text-black">
                        {hit.title}
                      </span>
                      <span className="flex items-baseline gap-2 text-[13px] leading-4">
                        <span className="font-medium text-primary">{formatPrice(hit.price)}</span>
                        {hit.compareAtPrice && hit.compareAtPrice > hit.price ? (
                          <s className="text-neutral-400">{formatPrice(hit.compareAtPrice)}</s>
                        ) : null}
                      </span>
                    </span>
                    <img
                      src="/figma/arrow-right-blue.svg"
                      alt=""
                      width={14}
                      height={14}
                      className={`mr-1 shrink-0 transition-[opacity,translate] duration-200 ${i === active ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0'}`}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div id={listId} className="px-3 py-4 text-[14px] leading-5 text-neutral-700">
              {loading && !result ? (
                'Tražimo…'
              ) : (
                <>
                  Nema proizvoda za „{result?.q ?? term}“.{' '}
                  <Link
                    href="/kolekcije/sve"
                    onClick={() => {
                      setOpen(false)
                      onDone?.()
                    }}
                    className="font-medium text-primary underline underline-offset-2"
                  >
                    Pogledajte sve čarape
                  </Link>
                </>
              )}
            </div>
          )}
          {result && result.total > hits.length ? (
            <Link
              href={allHref}
              onClick={() => {
                setOpen(false)
                onDone?.()
              }}
              className="mt-1 flex h-11 items-center justify-center rounded-[14px] bg-primary text-[14px] font-medium text-white transition-colors hover:bg-primary-dark"
            >
              Prikaži sve rezultate ({result.total})
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
