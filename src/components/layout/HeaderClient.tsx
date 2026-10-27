'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'
import { useCart } from '@/components/cart/CartProvider'
import { Sheet } from '@/components/ui/Sheet'
import { SearchBox } from './SearchBox'

export type NavItem = { label: string; url: string; children: { label: string; url: string }[] }

type Props = {
  variant: 'overlay' | 'solid'
  items: NavItem[]
  searchPlaceholder: string
}

/**
 * Desktop (>=1024px): 1:1 Figma navbar. Overlay (17:611): 1280px, beli tekst, logo 131x62,
 * pretraga sa providnom belom pozadinom. Solid (52:1066): pozadina #F5F5F5, visina 96px,
 * logo 94x44, bela pretraga.
 * Header je uvek vidljiv (D-065): solid je sticky, a overlay je fiksan i posle skrola postaje
 * puna traka 72px sa tamnim logom (kao solid), da navigacija i pretraga budu uvek pri ruci.
 * Mobilni (<1024px, izvedeno): kompaktan sticky header 56px, hamburger, logo, pretraga, korpa.
 */
export function HeaderClient({ variant, items, searchPlaceholder }: Props) {
  const overlay = variant === 'overlay'
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    const frame = requestAnimationFrame(onScroll)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // Zatvori meni i pretragu pri promeni stranice (ažuriranje tokom rendera, bez efekta).
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setMenuOpen(false)
    setSearchOpen(false)
  }

  const light = overlay && !scrolled && !searchOpen // beli elementi preko slike (mobilni)
  const overHero = overlay && !scrolled // desktop: providan header preko hero slike

  return (
    <>
      {/* ---------- Mobilni i tablet ---------- */}
      <div
        className={`sticky top-0 z-40 lg:hidden ${overlay ? '-mb-[calc(56px+var(--safe-top))]' : ''} transition-colors duration-200 ${
          light ? 'bg-transparent' : 'bg-neutral-100 shadow-[0_1px_0_rgba(0,0,0,0.06)]'
        }`}
        style={{ paddingTop: 'var(--safe-top)' }}
      >
        <div className="grid h-14 grid-cols-[1fr_auto_1fr] items-center px-2">
          <button
            type="button"
            className="flex size-11 items-center justify-center justify-self-start"
            aria-label="Otvori meni"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon color={light ? '#fff' : '#0f0f0f'} />
          </button>
          <Link href="/" aria-label="Cambio, početna" className="flex h-11 items-center">
            <img
              src={light ? '/figma/logo-white.svg' : '/figma/logo-dark.svg'}
              alt=""
              width={light ? 80 : 76}
              height={light ? 38 : 36}
              className={light ? 'h-[38px] w-[80px]' : 'h-9 w-[76px]'}
            />
          </Link>
          <div className="flex items-center justify-self-end">
            <button
              type="button"
              className="flex size-11 items-center justify-center"
              aria-label={searchOpen ? 'Zatvori pretragu' : 'Pretraga'}
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((v) => !v)}
            >
              <img
                src="/figma/nav-search-overlay.svg"
                alt=""
                width={20}
                height={21}
                className={light ? 'brightness-0 invert' : ''}
              />
            </button>
            <CartLink light={light} size="mobile" />
          </div>
        </div>
        {searchOpen ? (
          <div className="drop-in bg-neutral-100 px-4 pb-3">
            <SearchBox
              placeholder={searchPlaceholder}
              autoFocus
              mobile
              onDone={() => setSearchOpen(false)}
            />
          </div>
        ) : null}
      </div>

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} side="full" label="Glavni meni">
        <MobileMenu items={items} onClose={() => setMenuOpen(false)} />
      </Sheet>

      {/* ---------- Desktop ---------- */}
      {overlay ? (
        <header
          className={`fixed inset-x-0 z-40 hidden justify-center transition-[top,background-color,box-shadow] duration-300 ease-[var(--ease-out-expo)] lg:flex ${
            overHero
              ? 'top-[calc(37px+var(--promo-h,0px))] bg-transparent'
              : 'top-0 bg-neutral-100/95 shadow-[0_1px_0_rgba(0,0,0,0.06),0_8px_24px_rgba(15,15,15,0.06)] backdrop-blur-md'
          }`}
        >
          <div
            className={`flex w-[min(1280px,calc(100%-2*var(--gutter)))] items-center justify-center px-3.5 transition-[height] duration-300 ease-[var(--ease-out-expo)] ${overHero ? 'h-[74px]' : 'h-[72px]'}`}
          >
            <DesktopNav items={items} light={overHero} />
            <Link href="/" aria-label="Cambio, početna" className="shrink-0">
              <img
                src={overHero ? '/figma/logo-white.svg' : '/figma/logo-dark.svg'}
                alt=""
                width={131}
                height={62}
                className={`transition-[width,height] duration-300 ease-[var(--ease-out-expo)] ${overHero ? 'h-[62px] w-[131px]' : 'h-11 w-[94px]'}`}
              />
            </Link>
            <DesktopTools light={overHero} placeholder={searchPlaceholder} />
          </div>
        </header>
      ) : (
        <header
          className={`sticky top-0 z-40 hidden h-24 items-center justify-center bg-neutral-100 px-6 transition-shadow duration-300 lg:flex ${
            scrolled ? 'shadow-[0_1px_0_rgba(0,0,0,0.06),0_8px_24px_rgba(15,15,15,0.06)]' : ''
          }`}
        >
          <DesktopNav items={items} />
          <Link href="/" aria-label="Cambio, početna" className="shrink-0">
            <img
              src="/figma/logo-dark.svg"
              alt=""
              width={94}
              height={44}
              className="h-11 w-[94px]"
            />
          </Link>
          <DesktopTools placeholder={searchPlaceholder} />
        </header>
      )}
    </>
  )
}

function DesktopNav({ items, light = false }: { items: NavItem[]; light?: boolean }) {
  return (
    <nav
      aria-label="Glavna navigacija"
      className="flex min-w-px flex-1 items-center gap-5 xl:gap-9"
    >
      {items.map((item) =>
        item.children.length ? (
          <Dropdown key={item.label} item={item} light={light} />
        ) : (
          <Link
            key={item.label}
            href={item.url}
            className={`nav-link text-center text-[16px] leading-6 whitespace-nowrap ${light ? 'text-white' : 'text-black'}`}
          >
            {item.label}
          </Link>
        ),
      )}
    </nav>
  )
}

function Dropdown({ item, light }: { item: NavItem; light: boolean }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (
        e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)
      )
        setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 text-center text-[16px] leading-6 whitespace-nowrap ${light ? 'text-white' : 'text-black'}`}
      >
        {item.label}
        <span className="flex h-[5px] w-[10px] items-center justify-center" aria-hidden>
          <img
            src={light ? '/figma/nav-chevron-white.svg' : '/figma/nav-chevron-dark.svg'}
            alt=""
            width={5}
            height={10}
            className={`h-[10px] w-[5px] transition-transform ${open ? '-rotate-90' : 'rotate-90'}`}
          />
        </span>
      </button>
      {/* invisible (ne hidden): zatvoren meni nije dostupan ni fokusu ni čitaču, a ulazak i izlazak se animiraju */}
      <div
        id={id}
        className={`absolute top-full left-0 z-40 min-w-[220px] origin-top-left pt-3 transition-[opacity,translate,scale,visibility] duration-300 ease-[var(--ease-out-expo)] ${
          open
            ? 'visible translate-y-0 scale-100 opacity-100'
            : 'invisible -translate-y-1.5 scale-[0.98] opacity-0'
        }`}
      >
        <ul className="rounded-[16px] bg-white p-2 shadow-xl">
          <li>
            <Link
              href={item.url}
              className="block rounded-[8px] px-3 py-2 text-[15px] hover:bg-neutral-100"
              onClick={() => setOpen(false)}
            >
              Sve čarape
            </Link>
          </li>
          {item.children.map((child) => (
            <li key={child.url}>
              <Link
                href={child.url}
                className="block rounded-[8px] px-3 py-2 text-[15px] hover:bg-neutral-100"
                onClick={() => setOpen(false)}
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function DesktopTools({ light = false, placeholder }: { light?: boolean; placeholder: string }) {
  return (
    <div className="flex min-w-px flex-1 items-center justify-end gap-4 xl:gap-[23px]">
      <SearchBox placeholder={placeholder} light={light} />
      {/* Bez ikonice naloga iz Figme: prodavnica nema naloge kupaca (D-026, odluka klijenta). */}
      <CartLink light={light} size="desktop" />
    </div>
  )
}

function CartLink({ light, size }: { light: boolean; size: 'mobile' | 'desktop' }) {
  const { count, open } = useCart()
  return (
    <Link
      href="/korpa"
      aria-label={count ? `Korpa, ${count} ${count === 1 ? 'artikal' : 'artikla'}` : 'Korpa'}
      onClick={(e) => {
        // Korpa se otvara kao drawer; /korpa ostaje kao zasebna stranica (bez JS-a ili novi tab).
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        e.preventDefault()
        open()
      }}
      className={`group relative ${size === 'mobile' ? 'flex size-11 items-center justify-center' : 'hit flex items-center'}`}
    >
      {count ? (
        // key={count}: svaka promena broja ponovo pokreće animaciju "iskakanja"
        <span
          key={count}
          className="badge-pop absolute -top-1 -right-1.5 z-10 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-yellow px-1 text-[11px] leading-none font-bold text-black"
        >
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
      <img
        src={light ? '/figma/nav-cart-white.svg' : '/figma/nav-cart-dark.svg'}
        alt=""
        width={33}
        height={28}
        className={`icon-pop ${size === 'mobile' ? 'h-[22px] w-[26px]' : 'h-7 w-[33px]'}`}
      />
    </Link>
  )
}

function MobileMenu({ items, onClose }: { items: NavItem[]; onClose: () => void }) {
  return (
    <div
      className="flex min-h-full flex-col"
      style={{ paddingTop: 'var(--safe-top)', paddingBottom: 'var(--safe-bottom)' }}
    >
      <div className="flex h-14 items-center justify-between px-2">
        <span className="w-11" />
        <img
          src="/figma/logo-dark.svg"
          alt="Cambio"
          width={76}
          height={36}
          className="h-9 w-[76px]"
        />
        <button
          type="button"
          className="flex size-11 items-center justify-center"
          aria-label="Zatvori meni"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </div>
      <nav aria-label="Mobilna navigacija" className="flex-1 px-4 pt-6">
        <ul className="menu-stagger flex flex-col gap-2">
          {items.map((item, i) => (
            <li key={item.label} style={{ '--i': i } as React.CSSProperties}>
              <Link
                href={item.url}
                onClick={onClose}
                className="flex min-h-14 items-center font-display text-[28px] leading-[34px] font-bold tracking-[-1.5px] text-black"
              >
                {item.label}
              </Link>
              {item.children.length ? (
                <ul className="mb-2 flex flex-col">
                  {item.children.map((child) => (
                    <li key={child.url}>
                      <Link
                        href={child.url}
                        onClick={onClose}
                        className="flex min-h-12 items-center pl-4 text-[18px] leading-7 text-neutral-700"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

function MenuIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 6h18M3 12h18M3 18h18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="#0f0f0f" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
