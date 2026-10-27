'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { CartContents } from './CartContents'
import { useCart } from './CartProvider'

/**
 * Korpa kao drawer: desktop 426px uz desnu ivicu (Figma "cart page" 123:1021),
 * telefon preko celog ekrana. Zatvara se dugmetom, Esc, klikom na pozadinu ili prevlačenjem udesno.
 * Sadržaj se pravi pri prvom otvaranju i ostaje: animacija zatvaranja ne prikazuje prazan panel,
 * a ponovno otvaranje odmah ima obračunate cene (bez "Učitavam korpu").
 */
export function CartDrawer() {
  const { isOpen, close } = useCart()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(isOpen)
  if (isOpen && !mounted) setMounted(true)

  useEffect(() => {
    close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <Sheet
      open={isOpen}
      onClose={close}
      side="right"
      label="Korpa"
      className="sm:max-w-[426px]! max-sm:max-w-none!"
    >
      {mounted ? <CartContents variant="drawer" onClose={close} /> : null}
    </Sheet>
  )
}
