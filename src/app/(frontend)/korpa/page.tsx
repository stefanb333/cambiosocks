import { CartContents } from '@/components/cart/CartContents'
import { Header } from '@/components/layout/Header'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Korpa',
  robots: { index: false, follow: true },
}

/** Stranica korpe: isti sadržaj kao drawer (Figma 124:1190), centriran u koloni od 460px. */
export default function CartPage() {
  return (
    <>
      <Header />
      <main id="sadrzaj" className="bg-white py-8 lg:py-16">
        <div className="mx-auto w-full max-w-[460px]">
          <CartContents variant="page" />
        </div>
      </main>
    </>
  )
}
