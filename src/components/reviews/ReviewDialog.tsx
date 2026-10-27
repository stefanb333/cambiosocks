'use client'

import { useActionState, useState } from 'react'
import { submitReview, type ReviewField, type ReviewState } from '@/app/(frontend)/actions/review'
import { ReviewButton } from '@/components/ui/Buttons'
import { Sheet } from '@/components/ui/Sheet'

const initial: ReviewState = { status: 'idle', message: '' }

const inputClass =
  'w-full rounded-[14px] border border-[#d9d9d4] bg-white px-4 text-[16px] text-black outline-none placeholder:text-[#8a8a8a] focus:border-primary aria-invalid:border-danger'

const RATING_LABELS = ['', 'Loše', 'Može bolje', 'Dobro', 'Vrlo dobro', 'Odlično']

type Props = {
  /** Fiksan proizvod (stranica proizvoda); bez njega forma nudi izbor proizvoda. */
  product?: { id: number; title: string }
  products?: { id: number; title: string }[]
  /** Tekst dugmeta koje otvara formu. */
  label?: string
  /** review: žuto dugme sa ikonicom (Figma 42:773); pill: žuti pill sa zvezdicom. */
  variant?: 'review' | 'pill'
}

/**
 * Forma "Ostavi recenziju" u bočnom panelu (D-068). Recenzija ide na odobrenje, pa poruka
 * posle slanja to kaže. Ocena su radio dugmad (strelice na tastaturi rade same od sebe).
 */
export function ReviewDialog({
  product,
  products = [],
  label = 'Ostavi Recenziju',
  variant = 'review',
}: Props) {
  const [open, setOpen] = useState(false)
  // Novi ključ pri svakom otvaranju: posle uspešnog slanja forma kreće ispočetka.
  const [session, setSession] = useState(0)
  const show = () => {
    setSession((s) => s + 1)
    setOpen(true)
  }

  return (
    <>
      {variant === 'review' ? (
        <ReviewButton onClick={show}>{label}</ReviewButton>
      ) : (
        <button
          type="button"
          onClick={show}
          className="press flex h-12 items-center gap-2.5 rounded-full bg-yellow pr-6 pl-5 text-[15px] font-semibold text-black transition-transform hover:-translate-y-0.5"
        >
          <span aria-hidden>★</span>
          {label}
        </button>
      )}
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        side="right"
        label="Ostavi recenziju"
        className="sm:max-w-[480px]! max-sm:max-w-none!"
      >
        <div className="flex min-h-full flex-col" style={{ paddingTop: 'var(--safe-top)' }}>
          <div className="flex items-center justify-between gap-4 border-b border-neutral-100 px-5 py-4 sm:px-7">
            <p className="font-display text-[22px] leading-7 font-bold tracking-[-0.03em] text-black">
              Ostavi recenziju
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Zatvori"
              className="flex size-11 items-center justify-center rounded-full bg-neutral-100 text-[22px] leading-none text-black"
            >
              ×
            </button>
          </div>
          {open ? (
            <ReviewForm
              key={session}
              product={product}
              products={products}
              onClose={() => setOpen(false)}
            />
          ) : null}
        </div>
      </Sheet>
    </>
  )
}

function ReviewForm({
  product,
  products,
  onClose,
}: {
  product?: Props['product']
  products: NonNullable<Props['products']>
  onClose: () => void
}) {
  const [state, action, pending] = useActionState(submitReview, initial)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [length, setLength] = useState(0)
  const err = state.errors ?? {}
  const shown = hover || rating

  if (state.status === 'success') {
    return (
      <div className="flex flex-1 flex-col items-start gap-4 px-5 py-10 sm:px-7" role="status">
        <span className="flex size-14 items-center justify-center rounded-full bg-yellow text-[26px]">
          ★
        </span>
        <p className="font-display text-[28px] leading-8 font-extrabold tracking-[-0.04em] text-primary">
          Hvala na recenziji!
        </p>
        <p className="text-[16px] leading-6 text-neutral-700">
          Pregledaćemo je i objaviti na sajtu, obično u roku od jednog radnog dana.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 flex h-12 items-center justify-center rounded-full bg-primary px-8 text-[15px] font-medium text-white hover:bg-primary-dark"
        >
          Zatvori
        </button>
      </div>
    )
  }

  const error = (name: ReviewField) =>
    err[name] ? (
      <p id={`recenzija-${name}-greska`} className="text-[13px] leading-4 text-danger">
        {err[name]}
      </p>
    ) : null
  const describe = (name: ReviewField) => ({
    'aria-invalid': Boolean(err[name]),
    'aria-describedby': err[name] ? `recenzija-${name}-greska` : undefined,
  })

  return (
    <form action={action} noValidate className="flex flex-1 flex-col gap-6 px-5 py-6 sm:px-7">
      {product ? (
        <div className="flex flex-col gap-1">
          <p className="text-[13px] leading-4 text-neutral-700">Proizvod</p>
          <p className="text-[17px] leading-6 font-semibold text-black">{product.title}</p>
          <input type="hidden" name="productId" value={product.id} />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <label
            htmlFor="recenzija-proizvod"
            className="text-[14px] leading-5 font-semibold text-black"
          >
            Proizvod
          </label>
          <select
            id="recenzija-proizvod"
            name="productId"
            defaultValue=""
            className={`${inputClass} h-[52px] appearance-none`}
            {...describe('productId')}
          >
            <option value="" disabled>
              Izaberite proizvod
            </option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          {error('productId')}
        </div>
      )}

      <fieldset className="flex flex-col gap-2" {...describe('rating')}>
        <legend className="mb-2 text-[14px] leading-5 font-semibold text-black">Vaša ocena</legend>
        <div className="flex items-center gap-3">
          <div className="flex" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className="cursor-pointer p-1" onMouseEnter={() => setHover(n)}>
                <input
                  type="radio"
                  name="rating"
                  value={n}
                  checked={rating === n}
                  onChange={() => setRating(n)}
                  className="peer visually-hidden"
                />
                <span className="visually-hidden">
                  {n} {n === 1 ? 'zvezdica' : n < 5 ? 'zvezdice' : 'zvezdica'}
                </span>
                <svg
                  width="34"
                  height="34"
                  viewBox="0 0 24 24"
                  aria-hidden
                  className={`rounded-md transition-transform duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-primary ${n <= shown ? 'scale-110' : ''}`}
                >
                  <path
                    d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z"
                    fill={n <= shown ? '#FFDE00' : '#EDEDED'}
                    stroke={n <= shown ? '#0F0F0F' : '#D9D9D4'}
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                </svg>
              </label>
            ))}
          </div>
          <span className="text-[14px] font-medium text-neutral-700" aria-hidden>
            {RATING_LABELS[shown]}
          </span>
        </div>
        {error('rating')}
      </fieldset>

      <div className="flex flex-col gap-6 sm:flex-row sm:gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <label htmlFor="recenzija-ime" className="text-[14px] leading-5 font-semibold text-black">
            Ime
          </label>
          <input
            id="recenzija-ime"
            name="name"
            autoComplete="given-name"
            maxLength={60}
            placeholder="npr. Marko P."
            className={`${inputClass} h-[52px]`}
            {...describe('name')}
          />
          {error('name')}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <label
            htmlFor="recenzija-grad"
            className="text-[14px] leading-5 font-semibold text-black"
          >
            Grad <span className="font-normal text-neutral-700">(opciono)</span>
          </label>
          <input
            id="recenzija-grad"
            name="city"
            autoComplete="address-level2"
            maxLength={60}
            placeholder="npr. Novi Sad"
            className={`${inputClass} h-[52px]`}
            {...describe('city')}
          />
          {error('city')}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="recenzija-tekst" className="text-[14px] leading-5 font-semibold text-black">
          Vaše iskustvo
        </label>
        <textarea
          id="recenzija-tekst"
          name="text"
          maxLength={1500}
          onChange={(e) => setLength(e.target.value.length)}
          placeholder="Kako se nose, kako stoje posle pranja, za šta ih koristite…"
          className={`${inputClass} h-[140px] resize-none py-3.5 leading-6`}
          {...describe('text')}
        />
        <div className="flex justify-between gap-3">
          {error('text') ?? <span />}
          <span className="text-[12px] leading-4 text-neutral-700">{length}/1500</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="recenzija-email" className="text-[14px] leading-5 font-semibold text-black">
          Email <span className="font-normal text-neutral-700">(opciono, ne objavljuje se)</span>
        </label>
        <input
          id="recenzija-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="ime@email.com"
          className={`${inputClass} h-[52px]`}
          {...describe('email')}
        />
        {error('email') ?? (
          <p className="text-[13px] leading-4 text-neutral-700">
            Ako ste kupili kod nas sa ovom adresom, recenzija dobija oznaku &quot;Potvrđena
            kupovina&quot;.
          </p>
        )}
      </div>

      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      <div className="flex flex-col gap-1">
        <label className="flex min-h-11 cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="consent"
            className="mt-0.5 size-5 shrink-0 appearance-none rounded-[5px] border border-[#d9d9d4] bg-white checked:border-primary checked:bg-primary checked:bg-[url('data:image/svg+xml;utf8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2018%2018%22%3E%3Cpath%20d=%22M4.5%209.5l3%203%206-7%22%20fill=%22none%22%20stroke=%22white%22%20stroke-width=%222%22/%3E%3C/svg%3E')]"
            {...describe('consent')}
          />
          <span className="text-[13px] leading-5 text-neutral-700">
            Slažem se da se recenzija, ime i grad objave na sajtu. Email se koristi samo za proveru
            kupovine.
          </span>
        </label>
        {error('consent')}
      </div>

      {state.status === 'error' && state.message ? (
        <p className="text-[14px] leading-5 text-danger" role="alert">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="press mt-auto flex h-12 w-full items-center justify-center rounded-full bg-primary text-[15px] font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-70"
      >
        {pending ? 'Šaljem…' : 'Pošalji recenziju'}
      </button>
    </form>
  )
}
