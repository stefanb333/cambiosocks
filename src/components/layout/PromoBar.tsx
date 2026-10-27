import Link from 'next/link'
import { getPromoBar } from '@/lib/data'

const THEMES = {
  blue: 'bg-primary text-white',
  yellow: 'bg-yellow text-black',
  black: 'bg-black text-white',
} as const

/**
 * Promo traka iznad header-a (PLAN.md: 32px, jedan red, tekst se skraćuje). Uključuje se u adminu:
 * Sajt > Promo traka. Kada je prikazana, `--promo-h` (globals.css) spušta header preko hero slike.
 */
export async function PromoBar() {
  const promo = await getPromoBar()
  if (!promo.enabled || !promo.text) return null
  const theme = THEMES[promo.theme ?? 'blue'] ?? THEMES.blue
  const text = <span className="truncate">{promo.text}</span>

  return (
    <div
      role="region"
      aria-label="Obaveštenje"
      className={`promo-bar flex h-8 items-center justify-center px-4 text-center text-[12px] leading-none font-medium ${theme}`}
    >
      {promo.url ? (
        <Link
          href={promo.url}
          className="flex min-w-0 items-center gap-1.5 underline-offset-2 hover:underline"
        >
          {text}
          <span aria-hidden>→</span>
        </Link>
      ) : (
        text
      )}
    </div>
  )
}
