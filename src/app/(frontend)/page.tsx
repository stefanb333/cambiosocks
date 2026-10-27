import { Categories } from '@/components/home/Categories'
import { CtaBanner } from '@/components/home/CtaBanner'
import { Featured } from '@/components/home/Featured'
import { Hero } from '@/components/home/Hero'
import { Newsletter } from '@/components/home/Newsletter'
import { Reviews } from '@/components/home/Reviews'
import { Header } from '@/components/layout/Header'
import { MarqueeCross } from '@/components/motion/Marquee'
import { BRAND_FACTS, BRAND_RANGE } from '@/lib/brand'
import { getAllListingProducts } from '@/lib/catalog/listing'
import { getHomePage } from '@/lib/data'
import { getHomeReviews } from '@/lib/reviews'
import type { Media } from '@/payload-types'
import type { Metadata } from 'next'

export const metadata: Metadata = { alternates: { canonical: '/' } }

/** Početna: redosled sekcija 1:1 sa Figma frejmom "pocetna" (50:640). */
export default async function HomePage() {
  const [home, reviews, products] = await Promise.all([
    getHomePage(),
    getHomeReviews(),
    getAllListingProducts(),
  ])

  return (
    <>
      <Header variant="overlay" />
      <main id="sadrzaj" className="relative">
        {/* Hero je sticky samo unutar ovog omota: kategorije ga prekriju, pa oba odlaze zajedno (D-057). */}
        <div className="relative">
          <Hero hero={home.hero} />
          <Categories data={home.categories} />
        </div>
        {/* Ukrštene trake sa tekstom koji teče (D-064) */}
        <div className="bg-white">
          <MarqueeCross first={BRAND_FACTS} second={BRAND_RANGE} />
        </div>
        <Featured data={home.featured} />
        <CtaBanner
          headingLine1={home.ctaBanner?.headingLine1}
          headingLine2={home.ctaBanner?.headingLine2}
          text={home.ctaBanner?.text}
          image={home.ctaBanner?.image as Media | null}
          pillImage={home.ctaBanner?.pillImage as Media | null}
          cta={home.ctaBanner?.cta}
        />
        <Reviews
          data={home.reviews}
          reviews={reviews}
          products={products.map((p) => ({ id: p.id, title: p.title }))}
        />
        <Newsletter data={home.newsletter} />
      </main>
    </>
  )
}
