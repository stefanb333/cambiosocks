'use client'

import { useActionState } from 'react'
import { subscribe, type NewsletterState } from '@/app/(frontend)/actions/newsletter'

const initial: NewsletterState = { status: 'idle', message: '' }

/** Figma "Newsletter Button / Outlined" (50:551): beli obod 1.5px, beli krug 36px sa ikonicom pisma. */
export function NewsletterForm({ placeholder }: { placeholder: string }) {
  const [state, action, pending] = useActionState(subscribe, initial)
  return (
    <form action={action} className="relative w-full" noValidate>
      <div className="flex w-full items-center gap-3 rounded-[99px] border-[1.5px] border-white py-1 pr-1.5 pl-5 focus-within:border-yellow lg:py-1.5">
        <label htmlFor="newsletter-email" className="visually-hidden">
          E-mail adresa
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder={placeholder}
          aria-invalid={state.status === 'error'}
          aria-describedby="newsletter-status"
          className="h-11 min-w-0 flex-1 bg-transparent text-[16px] leading-[normal] text-white outline-none placeholder:text-white lg:h-auto lg:text-[14px]!"
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
          aria-label="Prijavi se na newsletter"
          className="group press hit flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-white disabled:opacity-70"
        >
          <img
            loading="lazy"
            src="/figma/mail-icon.svg"
            alt=""
            width={18}
            height={18}
            className="icon-nudge-up"
          />
        </button>
      </div>
      <p
        id="newsletter-status"
        role="status"
        className={`absolute top-full left-0 mt-1.5 w-full text-center text-[13px] leading-4 font-semibold ${
          state.status === 'error' ? 'text-[#ffd0cc]' : 'text-yellow'
        }`}
      >
        {state.message}
      </p>
    </form>
  )
}
