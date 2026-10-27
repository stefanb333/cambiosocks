import Link from 'next/link'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { getShopInfo } from '@/lib/data'
import { availableProviders } from '@/lib/payments'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Poručivanje',
  robots: { index: false, follow: false },
}

/** Checkout: pojednostavljen header (logo + nazad u korpu), bez glavne navigacije. */
export default async function CheckoutPage() {
  const shop = await getShopInfo()
  const [payment] = availableProviders({ total: 0, currency: 'RSD', country: 'Srbija' })
  return (
    <>
      <header
        className="flex h-14 items-center justify-between bg-neutral-100 px-2 lg:h-24 lg:px-6"
        style={{ paddingTop: 'var(--safe-top)' }}
      >
        <Link
          href="/korpa"
          className="flex min-h-11 items-center gap-2 px-2 text-[14px] text-black"
        >
          <img
            src="/figma/nav-chevron-dark.svg"
            alt=""
            width={5}
            height={10}
            className="rotate-180"
          />
          Nazad u korpu
        </Link>
        <Link href="/" aria-label="Cambio, početna" className="hit">
          <img
            src="/figma/logo-dark.svg"
            alt=""
            width={94}
            height={44}
            className="h-9 w-[76px] lg:h-11 lg:w-[94px]"
          />
        </Link>
        <span className="w-[120px]" aria-hidden />
      </header>
      <main id="sadrzaj" className="bg-paper">
        <CheckoutForm
          deliveryEstimate={shop.deliveryEstimate || '2 do 4 radna dana'}
          paymentLabel={payment?.label ?? 'Plaćanje pouzećem'}
          paymentDescription={payment?.description ?? ''}
        />
      </main>
    </>
  )
}
