'use client'

import { Inter } from 'next/font/google'
import type { ReactNode } from 'react'

// Inter za sve u adminu: jedan čitljiv font bez dekoracije. next/font ga služi sa našeg domena.
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  display: 'swap',
})

/**
 * Cambio tema admina: font prosleđuje Payload temi kroz CSS promenljive,
 * a boje, oblici i raspored su u `app/(payload)/custom.scss`.
 */
export function AdminTheme({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`:root{--font-body:${inter.style.fontFamily};--font-display:${inter.style.fontFamily}}`}</style>
      {children}
    </>
  )
}
