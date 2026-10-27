'use client'

import { useActionState } from 'react'
import { subscribe, type NewsletterState } from '@/app/(frontend)/actions/newsletter'

const initial: NewsletterState = { status: 'idle', message: '' }

/** Figma "Email form" u footer-u (51:493): okvir #444, žuto dugme "Prijavi se" sa strelicom. */
export function FooterNewsletter({
  placeholder,
  buttonLabel,
}: {
  placeholder: string
  buttonLabel: string
}) {
  const [state, action, pending] = useActionState(subscribe, initial)

  return (
    <form action={action} className="relative" noValidate>
      <div className="flex items-center justify-between gap-2 overflow-hidden rounded-[999px] border border-neutral-700 py-[7px] pr-[7px] pl-[18px] focus-within:border-neutral-400">
        <label htmlFor="footer-email" className="visually-hidden">
          E-mail adresa
        </label>
        <input
          id="footer-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder={placeholder}
          aria-invalid={state.status === 'error'}
          aria-describedby="footer-email-status"
          className="h-11 min-w-0 flex-1 bg-transparent font-display text-[16px] text-white outline-none placeholder:text-neutral-400 lg:h-auto lg:text-[15px]!"
        />
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="hidden"
        />
        <button
          type="submit"
          disabled={pending}
          className="group press flex min-h-11 shrink-0 items-center gap-3 overflow-hidden rounded-[999px] bg-yellow px-[18px] py-3 font-display text-[12px] leading-[normal] font-bold tracking-[0.6px] text-black uppercase disabled:opacity-70 lg:min-h-0"
        >
          {buttonLabel}
          <img
            loading="lazy"
            src="/figma/arrow-up-right.svg"
            alt=""
            width={16}
            height={16}
            aria-hidden
            className="icon-nudge-up"
          />
        </button>
      </div>
      <p
        id="footer-email-status"
        role="status"
        className={`absolute top-full left-0 mt-1.5 text-[13px] leading-4 ${state.status === 'error' ? 'text-[#ff8a80]' : 'text-yellow'}`}
      >
        {state.message}
      </p>
    </form>
  )
}
