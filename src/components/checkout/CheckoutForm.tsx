'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { startTransition, useActionState, useEffect, useRef, useState } from 'react'
import {
  placeOrder,
  type CheckoutField,
  type CheckoutState,
} from '@/app/(frontend)/actions/checkout'
import { useCart } from '@/components/cart/CartProvider'
import { useCartPricing } from '@/components/cart/useCartPricing'
import { formatPrice } from '@/lib/money'

const initial: CheckoutState = { status: 'idle', message: '' }

/** Provera polja pri napuštanju (iste poruke kao na serveru, server ostaje izvor istine). */
const validators: Partial<Record<CheckoutField, (v: string) => string | null>> = {
  email: (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : 'Unesite ispravnu e-mail adresu.',
  phone: (v) =>
    /^(\+3816\d{7,8}|06\d{7,8}|\+381[1-5]\d{6,8}|0[1-5]\d{6,8})$/.test(v.replace(/[\s\-/()]/g, ''))
      ? null
      : 'Unesite ispravan broj telefona, npr. 064 123 4567.',
  name: (v) => (v.trim().length >= 3 && v.trim().includes(' ') ? null : 'Unesite ime i prezime.'),
  address1: (v) => (v.trim().length >= 3 ? null : 'Unesite ulicu i broj.'),
  postalCode: (v) => (/^\d{5}$/.test(v.trim()) ? null : 'Poštanski broj ima 5 cifara.'),
  city: (v) => (v.trim().length >= 2 ? null : 'Unesite grad.'),
}

const inputClass =
  'h-[52px] w-full rounded-lg border border-[#d9d9d4] bg-paper px-4 text-[16px] text-black outline-none placeholder:text-[#676767] focus:border-primary aria-invalid:border-danger'

/**
 * Checkout (nema Figma frejm, D-036): polja i dugmad iz kontakt forme i korpe.
 * Telefon: jedna kolona, sklopiv pregled porudžbine na vrhu, dugme "Poruči" pri dnu ekrana.
 * Desktop: forma levo, pregled porudžbine desno.
 */
export function CheckoutForm({
  deliveryEstimate,
  paymentLabel,
  paymentDescription,
}: {
  deliveryEstimate: string
  paymentLabel: string
  paymentDescription: string
}) {
  const router = useRouter()
  const cart = useCart()
  const { data, loading } = useCartPricing(true)
  const [state, action, pending] = useActionState(placeOrder, initial)
  const [clientErrors, setClientErrors] = useState<Partial<Record<CheckoutField, string>>>({})
  const [showAddress2, setShowAddress2] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const errors = { ...clientErrors, ...(state.status === 'error' ? state.errors : {}) }

  // Posle uspeha: isprazni korpu i idi na potvrdu (ili na stranicu za plaćanje karticom).
  useEffect(() => {
    if (state.status !== 'success' || !state.token) return
    cart.clear()
    cart.setDiscountCode('')
    if (state.redirectUrl) window.location.assign(state.redirectUrl)
    else router.replace(`/porucivanje/potvrda/${state.token}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  // Prvo neispravno polje dobija fokus.
  useEffect(() => {
    if (state.status !== 'error' || !state.errors) return
    const first = Object.keys(state.errors)[0]
    const el = first ? formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`) : null
    el?.focus()
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [state])

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const name = e.target.name as CheckoutField
    const check = validators[name]
    if (!check || !e.target.value) return
    setClientErrors((prev) => ({ ...prev, [name]: check(e.target.value) ?? undefined }))
  }
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as CheckoutField
    if (clientErrors[name] && validators[name] && !validators[name]!(e.target.value)) {
      setClientErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  if (cart.ready && !cart.lines.length && state.status !== 'success') {
    return (
      <div className="flex flex-col items-center gap-5 px-6 py-24 text-center">
        <h1 className="t-heading text-black">Korpa je prazna</h1>
        <p className="text-[16px] leading-6 text-neutral-700">
          Dodajte proizvode u korpu pre poručivanja.
        </p>
        <Link
          href="/kolekcije/sve"
          className="flex h-12 lg:h-[42px] items-center rounded-[99px] bg-primary px-6 text-[14px] font-medium text-white"
        >
          Pogledaj Kolekciju
        </Link>
      </div>
    )
  }

  const total = data?.total ?? 0
  const field = (name: CheckoutField) =>
    errors[name] ? (
      <p id={`${name}-greska`} className="text-[13px] leading-4 text-danger">
        {errors[name]}
      </p>
    ) : null
  const aria = (name: CheckoutField) => ({
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${name}-greska` : undefined,
    onBlur,
    onChange,
  })

  const summary = (
    <div className="flex flex-col gap-5">
      <ul className="flex flex-col gap-4" aria-busy={loading}>
        {(data?.lines ?? []).map((l) => (
          <li key={l.variantId} className="flex items-center gap-4">
            <span className="relative h-[64px] w-[72px] shrink-0 overflow-hidden rounded-[3.3px] bg-white ring-1 ring-black/5">
              {l.image ? (
                <Image
                  src={l.image.src}
                  alt={l.image.alt}
                  fill
                  sizes="144px"
                  className="object-contain p-1"
                />
              ) : null}
              <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-black text-[11px] font-bold text-white">
                {l.quantity}
              </span>
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="font-display text-[15px] leading-4 font-bold tracking-[-0.5px] text-primary capitalize">
                {l.title}
              </span>
              <span className="text-[12px] leading-4 text-neutral-700">{l.variantLabel}</span>
            </span>
            <span className="text-[14px] font-medium text-neutral-700">
              {formatPrice(l.lineTotal)}
            </span>
          </li>
        ))}
      </ul>
      <div className="h-px w-full bg-neutral-400" />
      <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-[13px] leading-4 text-neutral-700">
        <dt>Ukupno Proizvodi</dt>
        <dd className="text-right">{formatPrice(data?.subtotal ?? 0)}</dd>
        {data?.discount ? (
          <>
            <dt>Popust ({data.discount.code})</dt>
            <dd className="text-right">
              {data.discount.freeShipping
                ? 'Besplatna dostava'
                : `-${formatPrice(data.discount.amount)}`}
            </dd>
          </>
        ) : null}
        <dt>Troškovi Dostave</dt>
        <dd className="text-right">
          {data?.subtotal && !data.shipping ? 'Besplatna' : formatPrice(data?.shipping ?? 0)}
        </dd>
      </dl>
      <div className="h-px w-full bg-neutral-400" />
      <div className="flex items-center justify-between text-[15px] leading-5 font-semibold text-black">
        <span>Ukupno</span>
        <span>{formatPrice(total)}</span>
      </div>
      <Link href="/korpa" className="text-[13px] text-primary underline underline-offset-2">
        Izmeni korpu ili kupon
      </Link>
    </div>
  )

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col lg:flex-row lg:items-start lg:gap-16 lg:px-[var(--gutter)] lg:py-14">
      {/* Telefon: sklopiv pregled porudžbine */}
      <div className="border-b border-neutral-200 bg-neutral-50 lg:hidden">
        <button
          type="button"
          onClick={() => setSummaryOpen((v) => !v)}
          aria-expanded={summaryOpen}
          aria-controls="pregled-porudzbine"
          className="flex min-h-14 w-full items-center justify-between px-4 text-[14px] font-medium text-primary"
        >
          <span className="flex items-center gap-2">
            {summaryOpen ? 'Sakrij porudžbinu' : 'Prikaži porudžbinu'}
            <img
              loading="lazy"
              src="/figma/nav-chevron-dark.svg"
              alt=""
              width={5}
              height={10}
              className={`transition-transform ${summaryOpen ? '-rotate-90' : 'rotate-90'}`}
            />
          </span>
          <span className="text-[16px] font-semibold text-black">{formatPrice(total)}</span>
        </button>
        <div id="pregled-porudzbine" hidden={!summaryOpen} className="px-4 pb-5">
          {summary}
        </div>
      </div>

      <form
        ref={formRef}
        // onSubmit umesto action={...}: React posle action-a resetuje formu, a kupac
        // ne sme da izgubi unete podatke kada server vrati grešku.
        onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          startTransition(() => action(formData))
        }}
        noValidate
        className="flex w-full flex-col gap-8 px-4 pt-6 pb-32 lg:max-w-[560px] lg:flex-1 lg:px-0 lg:pt-0 lg:pb-0"
      >
        <h1 className="font-display text-[32px] leading-[1.15] font-bold tracking-[-1.2px] text-black lg:text-[44px]">
          Poručivanje
        </h1>

        <input type="hidden" name="lines" value={JSON.stringify(cart.lines)} />
        <input type="hidden" name="discountCode" value={cart.discountCode} />
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="hidden"
        />

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-4 font-display text-[20px] leading-7 font-bold tracking-[-0.5px] text-black">
            Kontakt
          </legend>
          <div className="flex flex-col gap-2.5">
            <label htmlFor="co-email" className="text-[14px] leading-5 font-semibold text-black">
              Email adresa
            </label>
            <input
              id="co-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="ime@email.com"
              className={inputClass}
              {...aria('email')}
            />
            {field('email')}
          </div>
          <div className="flex flex-col gap-2.5">
            <label htmlFor="co-telefon" className="text-[14px] leading-5 font-semibold text-black">
              Telefon
            </label>
            <input
              id="co-telefon"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="064 123 4567"
              className={inputClass}
              {...aria('phone')}
            />
            <p className="text-[12px] leading-4 text-[#676767]">Kurir vas zove pre isporuke.</p>
            {field('phone')}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-4 font-display text-[20px] leading-7 font-bold tracking-[-0.5px] text-black">
            Dostava
          </legend>
          <div className="flex flex-col gap-2.5">
            <label htmlFor="co-ime" className="text-[14px] leading-5 font-semibold text-black">
              Ime i prezime
            </label>
            <input
              id="co-ime"
              name="name"
              autoComplete="name"
              placeholder="Vaše ime i prezime"
              className={inputClass}
              {...aria('name')}
            />
            {field('name')}
          </div>
          <div className="flex flex-col gap-2.5">
            <label htmlFor="co-adresa" className="text-[14px] leading-5 font-semibold text-black">
              Ulica i broj
            </label>
            <input
              id="co-adresa"
              name="address1"
              autoComplete="address-line1"
              placeholder="npr. Pante Gajića 22"
              className={inputClass}
              {...aria('address1')}
            />
            {field('address1')}
          </div>
          {showAddress2 ? (
            <div className="flex flex-col gap-2.5">
              <label
                htmlFor="co-adresa2"
                className="text-[14px] leading-5 font-semibold text-black"
              >
                Stan, sprat, ulaz (opciono)
              </label>
              <input
                id="co-adresa2"
                name="address2"
                autoComplete="address-line2"
                className={inputClass}
                autoFocus
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddress2(true)}
              className="-mt-1 min-h-11 self-start text-[14px] text-primary underline underline-offset-2"
            >
              + Dodaj stan ili sprat
            </button>
          )}
          <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3 max-[359px]:grid-cols-1">
            <div className="flex flex-col gap-2.5">
              <label htmlFor="co-pb" className="text-[14px] leading-5 font-semibold text-black">
                Poštanski broj
              </label>
              <input
                id="co-pb"
                name="postalCode"
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={5}
                placeholder="36300"
                className={inputClass}
                {...aria('postalCode')}
              />
              {field('postalCode')}
            </div>
            <div className="flex flex-col gap-2.5">
              <label htmlFor="co-grad" className="text-[14px] leading-5 font-semibold text-black">
                Grad
              </label>
              <input
                id="co-grad"
                name="city"
                autoComplete="address-level2"
                placeholder="Novi Pazar"
                className={inputClass}
                {...aria('city')}
              />
              {field('city')}
            </div>
          </div>
          <p className="text-[13px] leading-5 text-neutral-700">
            Država: <strong>Srbija</strong> · Rok isporuke: {deliveryEstimate}
          </p>
          <details className="group">
            <summary className="min-h-11 cursor-pointer list-none py-3 text-[14px] text-primary underline underline-offset-2 [&::-webkit-details-marker]:hidden">
              + Napomena za porudžbinu (opciono)
            </summary>
            <textarea
              name="note"
              maxLength={500}
              rows={3}
              className={`${inputClass} h-auto py-3`}
              placeholder="Npr. pozovite pre dolaska"
            />
            {field('note')}
          </details>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-4 font-display text-[20px] leading-7 font-bold tracking-[-0.5px] text-black">
            Plaćanje
          </legend>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-primary bg-white p-4">
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              defaultChecked
              className="mt-1 size-5 accent-primary"
            />
            <span className="flex flex-col gap-1">
              <span className="text-[15px] leading-5 font-semibold text-black">{paymentLabel}</span>
              <span className="text-[13px] leading-5 text-neutral-700">{paymentDescription}</span>
            </span>
          </label>
        </fieldset>

        <div className="flex flex-col gap-1">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 py-1">
            <input
              type="checkbox"
              name="terms"
              className="size-5 shrink-0 accent-primary pointer-coarse:size-6"
              {...aria('terms')}
            />
            <span className="text-[14px] leading-5 text-neutral-700">
              Prihvatam{' '}
              <Link href="/uslovi-koriscenja" target="_blank" className="text-primary underline">
                uslove kupovine
              </Link>{' '}
              i{' '}
              <Link href="/privatnost" target="_blank" className="text-primary underline">
                politiku privatnosti
              </Link>
              .
            </span>
          </label>
          {field('terms')}
        </div>

        {state.status === 'error' && state.message ? (
          <div
            className="rounded-xl bg-[#fdecea] p-4 text-[14px] leading-5 text-danger"
            role="alert"
          >
            {state.message}{' '}
            {state.cartChanged ? (
              <Link href="/korpa" className="font-semibold underline">
                Pogledaj korpu
              </Link>
            ) : null}
          </div>
        ) : null}

        {/* Dugme: na telefonu zalepljeno za dno ekrana */}
        <div
          className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white/95 px-4 pt-3 backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0"
          style={{ paddingBottom: 'max(12px, var(--safe-bottom))' }}
        >
          <button
            type="submit"
            disabled={pending || !data?.lines.length}
            className="group press flex h-[52px] w-full items-center gap-3 rounded-[99px] bg-primary py-[7px] pr-[7px] pl-5 text-[15px] leading-[normal] font-semibold text-white hover:bg-primary-dark disabled:opacity-70"
          >
            <span className="flex-1 text-left">
              {pending ? 'Šaljem porudžbinu…' : `Poruči · ${formatPrice(total)}`}
            </span>
            <span
              className="flex size-[38px] items-center justify-center rounded-full bg-white"
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
        </div>
      </form>

      {/* Desktop: pregled porudžbine desno */}
      <aside
        className="sticky top-8 hidden w-[420px] shrink-0 rounded-2xl bg-white p-8 shadow-[0_18px_50px_rgba(15,15,15,0.07)] lg:block"
        aria-label="Pregled porudžbine"
      >
        <h2 className="mb-6 font-display text-[24px] leading-8 font-semibold tracking-[-0.5px] text-black">
          Vaša korpa
        </h2>
        {summary}
      </aside>
    </div>
  )
}
