import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { CartProvider } from '@/components/cart/CartProvider'
import { Footer } from '@/components/layout/Footer'
import { MotionProvider, motionBootScript } from '@/components/motion/MotionProvider'
import { JsonLd } from '@/components/seo/JsonLd'
import { RowImageLoader } from '@/components/ui/RowImageLoader'
import { getShopInfo } from '@/lib/data'
import { jsonLdGraph, organizationSchema, SITE_URL, websiteSchema } from '@/lib/seo'
import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import 'lenis/dist/lenis.css'
import './globals.css'
import './motion.css'

// Inter za naslove, Plus Jakarta Sans za tekst. latin-ext pokriva č, ć, š, ž, đ.
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-inter',
  // Bez preload-a: 130 KB fonta za naslove ne sme da se takmiči sa glavnom slikom (LCP).
  // Zamenski font ima podešene metrike (size-adjust), pa zamena ne pomera sadržaj (D-052).
  preload: false,
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-jakarta',
})

const description =
  'Pamučne muške, ženske i sportske čarape iz naše fabrike u Novom Pazaru, od 1995. Poručite online: dostava za 1 do 3 radna dana, plaćanje pouzećem.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Cambio čarape | Muške, ženske i sportske čarape iz Novog Pazara',
    template: '%s | Cambio čarape',
  },
  description,
  applicationName: 'Cambio',
  category: 'shopping',
  icons: { icon: '/favicon.svg' },
  // Podrazumevana slika i kartica za deljenje; stranice proizvoda i članaka imaju svoju.
  openGraph: {
    type: 'website',
    siteName: 'Cambio čarape',
    locale: 'sr_RS',
    description,
    images: [
      { url: '/og.jpg', width: 1200, height: 630, alt: 'Bele Cambio čarape na plavom nebu' },
    ],
  },
  twitter: { card: 'summary_large_image' },
  // Veliki pregled slike i pun isečak teksta u Google rezultatima (i AI pregledima).
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0462cd',
}

export default async function FrontendLayout({ children }: { children: ReactNode }) {
  const shop = await getShopInfo()
  // Profili na mrežama (Podešavanja prodavnice) povezuju sajt sa brendom u Google Knowledge Graph-u.
  const sameAs = [shop.instagram, shop.tiktok].filter((u) => u.startsWith('http'))
  return (
    // suppressHydrationWarning: skripta u <head> dodaje klasu "motion" pre hidratacije.
    <html
      lang="sr-Latn"
      className={`${inter.variable} ${jakarta.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionBootScript }} />
        {/* Firma i sajt (schema.org) na svakoj stranici: osnova za Google i AI pretraživače. */}
        <JsonLd data={jsonLdGraph(organizationSchema(sameAs), websiteSchema())} />
      </head>
      <body>
        <a
          href="#sadrzaj"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-[8px] focus:bg-white focus:px-4 focus:py-3 focus:shadow-lg"
        >
          Preskoči na sadržaj
        </a>
        <CartProvider>
          {children}
          <Footer />
          <CartDrawer />
        </CartProvider>
        <MotionProvider />
        <RowImageLoader />
      </body>
    </html>
  )
}
