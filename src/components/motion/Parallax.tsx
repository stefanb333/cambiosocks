import type { CSSProperties, ReactNode } from 'react'

/**
 * Omot za sliku u okviru sa overflow-hidden: slika se pri skrolu pomera sporije od stranice.
 * `speed` je deo visine okvira (0.08 = najviše 8% gore/dole); uvećanje pokriva taj pomeraj,
 * pa se ivice slike nikad ne vide. Bez motion klase omot je statičan.
 */
export function Parallax({
  speed = 0.08,
  className = '',
  children,
}: {
  speed?: number
  className?: string
  children: ReactNode
}) {
  return (
    <div
      data-parallax={speed}
      className={`absolute inset-0 ${className}`}
      style={{ '--parallax-scale': (1 + 2 * speed + 0.02).toFixed(3) } as CSSProperties}
    >
      {children}
    </div>
  )
}
