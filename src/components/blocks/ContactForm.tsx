'use client'

import { useActionState } from 'react'
import { sendContact, type ContactState } from '@/app/(frontend)/actions/contact'

const initial: ContactState = { status: 'idle', message: '' }

const inputClass =
  'w-full rounded-lg border border-[#d9d9d4] bg-paper p-4 text-[16px] leading-4 tracking-[0.2px] text-black outline-none placeholder:text-[#676767] focus:border-primary aria-invalid:border-danger lg:text-[12px]!'

/** Figma "Contact form card" (79:937): kartica 590px, polja 52px, poruka 132px, dugme "Pošalji poruku". */
export function ContactForm(props: {
  heading?: string | null
  description?: string | null
  topics: string[]
  consentText?: string | null
  responseNote?: string | null
  successMessage?: string | null
  defaultTopic?: string
}) {
  const [state, action, pending] = useActionState(sendContact, initial)
  const err = state.errors ?? {}

  if (state.status === 'success') {
    return (
      <div
        className="flex w-full flex-col gap-3 rounded-2xl bg-white p-8 shadow-[0_18px_50px_rgba(15,15,15,0.07)] lg:w-[590px] lg:shrink-0 lg:p-12"
        role="status"
      >
        <h2 className="t-heading text-black">Hvala!</h2>
        <p className="text-[16px] leading-6 text-[#676767]">
          {props.successMessage || 'Poruka je poslata, javićemo vam se uskoro.'}
        </p>
      </div>
    )
  }

  const field = (name: keyof NonNullable<ContactState['errors']>) =>
    err[name] ? (
      <p id={`${name}-error`} className="text-[13px] leading-4 text-danger">
        {err[name]}
      </p>
    ) : null

  return (
    <form
      action={action}
      noValidate
      className="flex w-full flex-col gap-6 rounded-2xl bg-white p-6 shadow-[0_18px_50px_rgba(15,15,15,0.07)] sm:p-8 lg:w-[590px] lg:shrink-0 lg:p-12"
    >
      <div className="flex flex-col gap-2.5">
        <h2 className="t-heading text-black">{props.heading}</h2>
        {props.description ? (
          <p className="text-[14px] leading-5 text-[#676767]">{props.description}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <label htmlFor="kontakt-ime" className="text-[14px] leading-5 font-semibold text-black">
            Ime i prezime
          </label>
          <input
            id="kontakt-ime"
            name="name"
            autoComplete="name"
            placeholder="Vaše ime"
            className={`${inputClass} h-[52px]`}
            aria-invalid={Boolean(err.name)}
            aria-describedby={err.name ? 'name-error' : undefined}
          />
          {field('name')}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <label htmlFor="kontakt-email" className="text-[14px] leading-5 font-semibold text-black">
            Email adresa
          </label>
          <input
            id="kontakt-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="ime@email.com"
            className={`${inputClass} h-[52px]`}
            aria-invalid={Boolean(err.email)}
            aria-describedby={err.email ? 'email-error' : undefined}
          />
          {field('email')}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <label htmlFor="kontakt-tema" className="text-[14px] leading-5 font-semibold text-black">
          Tema
        </label>
        <select
          id="kontakt-tema"
          name="topic"
          defaultValue={props.defaultTopic ?? ''}
          className={`${inputClass} h-[52px] appearance-none py-0 invalid:text-[#676767] [&>option]:text-black`}
          required
          aria-invalid={Boolean(err.topic)}
          aria-describedby={err.topic ? 'topic-error' : undefined}
        >
          <option value="" disabled>
            Izaberite temu
          </option>
          {props.topics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {field('topic')}
      </div>

      <div className="flex flex-col gap-2.5">
        <label htmlFor="kontakt-poruka" className="text-[14px] leading-5 font-semibold text-black">
          Poruka
        </label>
        <textarea
          id="kontakt-poruka"
          name="message"
          placeholder="Kako možemo da pomognemo?"
          className={`${inputClass} h-[132px] resize-none leading-5 lg:leading-4`}
          aria-invalid={Boolean(err.message)}
          aria-describedby={err.message ? 'message-error' : undefined}
        />
        {field('message')}
      </div>

      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      {props.consentText ? (
        <div className="flex flex-col gap-1">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 lg:min-h-0 lg:gap-2.5">
            <input
              type="checkbox"
              name="consent"
              className="size-[18px] shrink-0 appearance-none rounded-xs border border-[#d9d9d4] bg-white checked:border-primary checked:bg-primary checked:bg-[url('data:image/svg+xml;utf8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2018%2018%22%3E%3Cpath%20d=%22M4.5%209.5l3%203%206-7%22%20fill=%22none%22%20stroke=%22white%22%20stroke-width=%222%22/%3E%3C/svg%3E')] pointer-coarse:size-6"
              aria-invalid={Boolean(err.consent)}
              aria-describedby={err.consent ? 'consent-error' : undefined}
            />
            <span className="text-[13px] leading-[18px] text-[#676767] lg:max-w-[200px] lg:text-[12px] lg:leading-4">
              {props.consentText}
            </span>
          </label>
          {field('consent')}
        </div>
      ) : null}

      {state.status === 'error' && state.message ? (
        <p className="text-[14px] leading-5 text-danger" role="alert">
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        {props.responseNote ? (
          <p className="text-[12px] leading-4 text-[#676767]">{props.responseNote}</p>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={pending}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-[99px] bg-primary py-1.5 pr-2 pl-5 text-[14px] leading-5 font-semibold text-white hover:bg-primary-dark disabled:opacity-70 sm:w-[192px]"
        >
          <span className="w-[120px]">{pending ? 'Šaljem…' : 'Pošalji poruku'}</span>
          <span
            className="flex size-9 items-center justify-center rounded-[18px] bg-white"
            aria-hidden
          >
            <img loading="lazy" src="/figma/contact-send-icon.svg" alt="" width={18} height={18} />
          </span>
        </button>
      </div>
    </form>
  )
}
