'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { formatPrice } from '@/lib/money'
import { useCart } from './CartProvider'
import { useCartPricing } from './useCartPricing'

const rsd = formatPrice

/**
 * Sadržaj korpe po Figmi "dropdown cart" (124:1190): naslov "Vaša korpa", stavke, kupon,
 * troškovi, ukupno, "Poruči Odmah" i "Pogledaj Još". Koristi se u drawer-u i na /korpa.
 * Na telefonu deo sa ukupnim iznosom i dugmadima je uvek vidljiv pri dnu.
 */
export function CartContents({
  variant,
  onClose,
}: {
  variant: 'drawer' | 'page'
  onClose?: () => void
}) {
  const cart = useCart()
  const { data, loading, error, notices } = useCartPricing(true)
  const [code, setCode] = useState('')

  const lines = data?.lines ?? []
  const empty = cart.ready && cart.lines.length === 0

  return (
    <div className={`flex flex-col ${variant === 'drawer' ? 'h-dvh' : 'min-h-[60vh]'}`}>
      {/* Zaglavlje */}
      <div
        className={`flex shrink-0 flex-col items-center gap-5 px-[22px] pr-[29px] lg:gap-8 ${variant === 'drawer' ? 'pt-[max(20px,var(--safe-top))] lg:pt-11' : 'pt-0'}`}
      >
        <div className="relative flex w-full items-center justify-center">
          <h2 className="text-center font-display text-[28px] leading-[44px] font-semibold tracking-[-0.5px] text-black lg:text-[36px]">
            Vaša korpa
          </h2>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Zatvori korpu"
              className="absolute -right-3 flex size-11 items-center justify-center rounded-full hover:bg-neutral-100"
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
          ) : null}
        </div>
        <div className="h-px w-full bg-neutral-400" />
      </div>

      {empty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
          <p className="text-[16px] leading-6 text-neutral-700">Vaša korpa je prazna.</p>
          <Link
            href="/kolekcije/sve"
            onClick={onClose}
            className="group press flex h-12 lg:h-[42px] items-center gap-3 rounded-[99px] bg-primary py-[7px] pr-[7px] pl-5 text-[14px] font-medium text-white"
          >
            Pogledaj Kolekciju
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
          </Link>
        </div>
      ) : (
        <>
          {/* Stavke (skroluju se) */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-[22px] pr-[29px]">
            {notices.length ? (
              <ul
                className="mt-4 flex flex-col gap-1 rounded-[12px] bg-yellow/30 p-3 text-[13px] leading-5 text-black"
                role="status"
              >
                {notices.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            ) : null}
            <ul
              className={`flex flex-col gap-6 lg:gap-8 ${lines.length ? 'py-6 lg:py-8' : ''}`}
              aria-busy={loading}
            >
              {lines.map((line) => (
                <li
                  key={line.variantId}
                  className="cart-line flex items-start gap-3 lg:items-center lg:gap-[34px]"
                >
                  <div className="flex min-w-0 items-center gap-[15px]">
                    <Link
                      href={`/proizvodi/${line.slug}`}
                      onClick={onClose}
                      className="relative h-[77px] w-[87.76px] shrink-0 overflow-hidden rounded-[3.3px] bg-primary"
                    >
                      {line.image ? (
                        <Image
                          src={line.image.src}
                          alt={line.image.alt}
                          fill
                          sizes="88px"
                          className="object-cover"
                        />
                      ) : null}
                    </Link>
                    <div className="flex min-w-0 flex-col gap-2.5 lg:w-[113px]">
                      <Link
                        href={`/proizvodi/${line.slug}`}
                        onClick={onClose}
                        className="hit self-start font-display text-[15px] leading-[16px] font-bold tracking-[-0.87px] text-primary capitalize lg:text-[14px] lg:leading-[14.7px]"
                      >
                        {line.title}
                      </Link>
                      <p className="text-[12px] leading-4 text-black lg:text-[11px] lg:leading-[14px]">
                        {line.variantLabel}
                      </p>
                      <p className="font-display text-[15px] leading-[14.7px] font-bold tracking-[-0.87px] text-primary lg:text-[14px]">
                        {rsd(line.unitPrice)}
                      </p>
                      <div className="-ml-3 flex items-center gap-1 lg:hidden">
                        <Stepper
                          quantity={line.quantity}
                          max={line.maxQuantity}
                          onChange={(q) => cart.setQuantity(line.variantId, q)}
                          label={`${line.title}, ${line.variantLabel}`}
                        />
                        <button
                          type="button"
                          onClick={() => cart.remove(line.variantId)}
                          aria-label={`Ukloni ${line.title} iz korpe`}
                          className="flex size-11 items-center justify-center"
                        >
                          <img
                            loading="lazy"
                            src="/figma/cart-bin.svg"
                            alt=""
                            width={18}
                            height={22}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="hidden shrink-0 items-center gap-[34px] lg:flex">
                    <Stepper
                      quantity={line.quantity}
                      max={line.maxQuantity}
                      onChange={(q) => cart.setQuantity(line.variantId, q)}
                      label={`${line.title}, ${line.variantLabel}`}
                    />
                    <button
                      type="button"
                      onClick={() => cart.remove(line.variantId)}
                      aria-label={`Ukloni ${line.title} iz korpe`}
                      className="hit flex items-center justify-center"
                    >
                      <img
                        loading="lazy"
                        src="/figma/cart-bin.svg"
                        alt=""
                        width={21.64}
                        height={26.45}
                      />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {!data && !error ? (
              <div
                className="flex flex-col gap-6 py-6 lg:gap-8 lg:py-8"
                role="status"
                aria-label="Učitavam korpu"
              >
                {cart.lines.map((l) => (
                  <div key={l.variantId} className="flex items-center gap-[15px]" aria-hidden>
                    <span className="skeleton h-[77px] w-[88px] shrink-0 rounded-[3.3px]" />
                    <span className="flex flex-1 flex-col gap-2.5">
                      <span className="skeleton h-4 w-2/3 rounded-full" />
                      <span className="skeleton h-3 w-1/2 rounded-full" />
                      <span className="skeleton h-4 w-1/4 rounded-full" />
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
            {error ? <p className="pb-4 text-[14px] text-danger">{error}</p> : null}
          </div>

          {/* Kupon, troškovi i dugmad: uvek vidljivo pri dnu */}
          <div
            className="flex shrink-0 flex-col gap-5 border-t border-neutral-400 bg-white px-[22px] pt-5 pr-[29px] lg:gap-8 lg:pt-8"
            style={{ paddingBottom: 'max(20px, var(--safe-bottom))' }}
          >
            <form
              className="relative flex h-12 w-full items-center rounded-xl bg-neutral-200 lg:h-9"
              onSubmit={(e) => {
                e.preventDefault()
                cart.setDiscountCode(code)
              }}
            >
              <label htmlFor={`kupon-${variant}`} className="visually-hidden">
                Kupon za popust
              </label>
              <input
                id={`kupon-${variant}`}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={cart.discountCode ? `Kupon: ${cart.discountCode}` : 'Kupon za popust'}
                autoCapitalize="characters"
                autoComplete="off"
                enterKeyHint="done"
                className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-[16px] tracking-[-0.5px] uppercase outline-none placeholder:normal-case placeholder:text-neutral-400 lg:text-[13px]!"
              />
              <button
                type="submit"
                className="hit mr-1 flex h-10 w-[92px] shrink-0 items-center justify-center rounded-[10px] bg-primary text-[14px] font-medium tracking-[-0.3px] text-white lg:h-[30px] lg:w-[76px] lg:text-[12px]"
              >
                Primeni
              </button>
            </form>
            {data?.discountError ? (
              <p className="-mt-3 text-[13px] text-danger" role="alert">
                {data.discountError}{' '}
                <button
                  type="button"
                  className="underline"
                  onClick={() => cart.setDiscountCode('')}
                >
                  Ukloni kupon
                </button>
              </p>
            ) : null}

            <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-[13px] leading-4 tracking-[0.2px] text-neutral-700 lg:px-[3px] lg:text-[12px]">
              <dt>Ukupno Proizvodi</dt>
              <dd className="text-right">{rsd(data?.subtotal ?? 0)}</dd>
              <dt>Troškovi Dostave</dt>
              <dd className="text-right">{rsd(data?.shipping ?? 0)}</dd>
              {data?.discount ? (
                <>
                  <dt>
                    Popust ({data.discount.code}){' '}
                    <button
                      type="button"
                      className="underline"
                      onClick={() => cart.setDiscountCode('')}
                    >
                      ukloni
                    </button>
                  </dt>
                  <dd className="text-right">
                    {data.discount.freeShipping
                      ? 'Besplatna dostava'
                      : `-${rsd(data.discount.amount)}`}
                  </dd>
                </>
              ) : null}
            </dl>

            <div className="h-px w-full bg-neutral-400" />

            <div className="flex items-center justify-between text-[15px] leading-5 font-medium text-neutral-700 lg:text-[14px]">
              <span>Ukupno</span>
              <span className="font-semibold text-black lg:font-medium lg:text-neutral-700">
                {rsd(data?.total ?? 0)}
              </span>
            </div>

            <div className="flex flex-col gap-[11px]">
              <Link
                href="/porucivanje"
                onClick={onClose}
                aria-disabled={!lines.length}
                className="group press flex h-[52px] w-full items-center gap-3 rounded-[99px] bg-primary py-[7px] pr-[7px] pl-5 text-[14px] leading-[normal] font-medium text-white hover:bg-primary-dark lg:h-[42px]"
              >
                <span className="flex-1">Poruči Odmah</span>
                <span
                  className="flex size-[38px] items-center justify-center rounded-full bg-white lg:size-7"
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
              </Link>
              <Link
                href="/kolekcije/sve"
                onClick={onClose}
                className="group press flex h-[52px] w-full items-center justify-between rounded-[99px] bg-neutral-100 py-[7px] pr-[7px] pl-5 text-[14px] leading-[normal] font-medium text-black lg:h-[42px]"
              >
                Pogledaj Još
                <span
                  className="flex size-[38px] items-center justify-center rounded-full bg-black lg:size-7"
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
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/** Figma "QUANITITY" (123:1105): 45x16 na desktopu; na telefonu dugmad 44x44. */
function Stepper({
  quantity,
  max,
  onChange,
  label,
}: {
  quantity: number
  max: number | null
  onChange: (q: number) => void
  label: string
}) {
  const atMax = max !== null && quantity >= max
  return (
    <div
      className="flex h-11 items-center rounded-lg border border-neutral-400 bg-neutral-100 font-display font-bold lg:rounded-md tracking-[-0.3px] text-neutral-700 lg:h-7 lg:w-[76px] lg:justify-between lg:gap-0 lg:border lg:border-neutral-400 lg:bg-neutral-100 lg:text-neutral-700 lg:shadow-[0_0_0.55px_rgba(0,0,0,0.08)]"
      role="group"
      aria-label={`Količina: ${label}`}
    >
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        aria-label="Smanji količinu"
        className="flex size-11 items-center justify-center text-[18px] lg:h-7 lg:w-6 lg:text-[14px]"
      >
        -
      </button>
      <span
        className="min-w-6 text-center text-[15px] lg:min-w-0 lg:text-[12px]"
        aria-live="polite"
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        disabled={atMax}
        aria-label="Povećaj količinu"
        className="flex size-11 items-center justify-center text-[18px] disabled:opacity-40 lg:h-7 lg:w-6 lg:text-[14px]"
      >
        +
      </button>
    </div>
  )
}
