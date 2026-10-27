import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

/**
 * Dugmad iz Figma biblioteke (stranica "web shop", frame "buttons" i instance po stranicama).
 * Od 1024px vrednosti su 1:1 iz Figme. Ispod toga važi jedinstvena skala za dodir (D-055):
 * glavna dugmad 48px visine i tekst 15px, mala "Pogledaj" dugmad 40px (površina za dodir 44px
 * preko klase .hit) i tekst 12px.
 */

type LinkOrButton = {
  href?: string
  children: ReactNode
  className?: string
  /** Dugme blago prati kursor (MotionProvider, samo miš; D-064). */
  magnetic?: boolean
} & Omit<ComponentProps<'button'>, 'children' | 'className'>

function Base({ href, children, className: extra = '', magnetic, ...rest }: LinkOrButton) {
  // group + press: mikroanimacije ikonica na hover i utiskivanje na dodir (motion.css, D-057)
  const className = `group press ${extra}`
  const magnet = magnetic ? { 'data-magnetic': '' } : {}
  if (href) {
    const external = /^(https?:|mailto:|tel:)/.test(href)
    return external ? (
      <a href={href} className={className} {...magnet}>
        {children}
      </a>
    ) : (
      <Link href={href} className={className} {...magnet}>
        {children}
      </Link>
    )
  }
  return (
    <button type="button" className={className} {...magnet} {...rest}>
      {children}
    </button>
  )
}

/** Figma "Poruči Button Large / Primary" (17:357): 193x42, plavo, beli krug sa strelicom. */
export function PrimaryPillButton({ children, className = '', ...rest }: LinkOrButton) {
  return (
    <Base
      magnetic
      {...rest}
      className={`hit inline-flex h-12 w-[193px] items-center gap-3 rounded-[99px] bg-primary py-[7px] pr-2 pl-5 shadow-lg transition-colors hover:bg-primary-dark lg:h-[42px] lg:pr-[7px] ${className}`}
    >
      <span className="min-w-0 flex-1 text-center text-[15px] leading-[normal] font-medium text-white lg:text-[14px]">
        {children}
      </span>
      <span
        className="icon-circle flex size-8 shrink-0 items-center justify-center rounded-full bg-white lg:size-7"
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
    </Base>
  )
}

/**
 * Figma "Korpa Button" (17:642): 193x42, svetlo sivo, sivi tekst. Tekst je #6B6B6B umesto
 * Figma #ADADAD: kontrast 4.8:1 na #F5F5F5 (WCAG AA), uz odobrenje klijenta (D-053).
 */
export function SoftPillButton({ children, className = '', ...rest }: LinkOrButton) {
  return (
    <Base
      {...rest}
      className={`hit inline-flex h-12 w-[193px] items-center justify-center rounded-[99px] bg-neutral-100 px-2.5 py-2 text-[15px] leading-[normal] font-medium text-[#6b6b6b] lg:h-[42px] lg:text-[14px] shadow-[0_1px_1.5px_rgba(0,0,0,0.08)] transition-colors hover:text-neutral-700 ${className}`}
    >
      {children}
    </Base>
  )
}

const VIEW_THEMES = {
  beige: { bg: 'bg-beige text-black', circle: 'bg-black', arrow: '/figma/arrow-right-card1.svg' },
  'beige-white-arrow': {
    bg: 'bg-beige text-black',
    circle: 'bg-black',
    arrow: '/figma/arrow-right-white.svg',
  },
  blue: {
    bg: 'bg-primary text-white',
    circle: 'bg-primary-dark',
    arrow: '/figma/arrow-right-white.svg',
  },
  yellow: {
    bg: 'bg-yellow text-black',
    circle: 'bg-black',
    arrow: '/figma/arrow-right-reviews.svg',
  },
} as const

const VIEW_SIZES = {
  // Kartica kategorije (25:392): 127x32, tekst desno poravnat
  card: {
    box: 'h-10 gap-2 py-[5px] pr-[5px] pl-4 lg:h-8 lg:w-[127px] lg:justify-end lg:gap-1.5 lg:pl-3.5',
    text: 'text-[12px] lg:w-[88px] lg:text-[10px] lg:tracking-[-0.1px]',
    circle: 'size-[30px] rounded-full lg:size-[18px] lg:rounded-[10px]',
  },
  // Recenzije (42:777): 155x32, centrirano
  md: {
    box: 'h-10 justify-center gap-3 py-[5px] pr-[5px] pl-4 lg:h-8 lg:w-[155px] lg:pl-3.5',
    text: 'text-[12px] lg:w-[88px] lg:text-[10px] lg:tracking-[-0.1px]',
    circle: 'size-[30px] rounded-full lg:size-[18px] lg:rounded-[10px]',
  },
  // CTA baner (33:303): 255x38
  lg: {
    box: 'h-12 w-[min(100%,280px)] justify-between gap-2 py-2 pr-2 pl-6 lg:h-[38px] lg:w-[255px] lg:justify-center lg:pl-[18px]',
    text: 'text-[15px] lg:w-[200px] lg:text-center lg:text-[13px] lg:tracking-[-0.13px]',
    circle: 'size-8 rounded-full lg:size-[22px] lg:rounded-[12px]',
  },
} as const

/** Figma "Pogledaj Button" (33:327): mali pill sa krugom i strelicom. */
export function ViewButton({
  children,
  theme = 'beige',
  size = 'card',
  className = '',
  ...rest
}: LinkOrButton & { theme?: keyof typeof VIEW_THEMES; size?: keyof typeof VIEW_SIZES }) {
  const t = VIEW_THEMES[theme]
  const s = VIEW_SIZES[size]
  return (
    <Base
      magnetic={size === 'lg'}
      {...rest}
      className={`hit inline-flex items-center overflow-hidden rounded-[99px] ${t.bg} ${s.box} ${className}`}
    >
      <span className={`shrink-0 leading-[14px] font-medium ${s.text}`}>{children}</span>
      <span
        className={`icon-circle flex shrink-0 items-center justify-center ${t.circle} ${s.circle}`}
        aria-hidden
      >
        <img loading="lazy" src={t.arrow} alt="" width={12} height={12} className="icon-nudge" />
      </span>
    </Base>
  )
}

/** Figma "Korpa Button / Primary" na kartici (5:76): 160x42, "Dodaj u Korpu" + ikonica korpe. */
export function AddToCartPill({ children, className = '', ...rest }: LinkOrButton) {
  return (
    <Base
      magnetic
      {...rest}
      className={`hit inline-flex h-12 shrink-0 items-center gap-3 rounded-[99px] bg-primary py-[7px] pr-2 pl-5 lg:h-[42px] lg:w-[160px] lg:pr-[7px] transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <span className="text-[15px] leading-[normal] font-medium whitespace-nowrap text-white lg:text-[14px]">
        {children}
      </span>
      <span
        className="icon-circle flex size-8 shrink-0 items-center justify-center rounded-full bg-white lg:size-7"
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
    </Base>
  )
}

/** Figma "recenzija" (42:773): žuto dugme 226x54 sa ikonicom. */
export function ReviewButton({ children, className = '', ...rest }: LinkOrButton) {
  return (
    <Base
      {...rest}
      className={`inline-flex h-[54px] w-[226px] items-center justify-center gap-2.5 rounded-full bg-yellow px-3 py-1.5 ${className}`}
    >
      <img
        loading="lazy"
        src="/figma/review-icon.svg"
        alt=""
        width={26}
        height={23}
        aria-hidden
        className="icon-wiggle"
      />
      <span className="text-[16px] leading-6 font-semibold text-black">{children}</span>
    </Base>
  )
}
