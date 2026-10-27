'use client'

import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import type { ReactNode } from 'react'

// Isti fontovi kao na sajtu (layout prodavnice): Inter za naslove, Plus Jakarta Sans za tekst.
// next/font ih služi sa našeg domena, a fajlovi se dele sa prodavnicom (isti keš).
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['600', '700', '800'],
  display: 'swap',
})
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

/**
 * Cambio tema admina (D-059): fontove prosleđuje Payload temi kroz CSS promenljive,
 * a boje, oblici i raspored su u `app/(payload)/custom.scss`.
 */
export function AdminTheme({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`:root{--font-body:${jakarta.style.fontFamily};--font-display:${inter.style.fontFamily}}`}</style>
      {children}
    </>
  )
}
