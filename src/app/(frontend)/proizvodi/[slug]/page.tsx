import { notFound } from 'next/navigation'
import { Newsletter } from '@/components/home/Newsletter'
import { Header } from '@/components/layout/Header'
import { WordReveal } from '@/components/motion/WordReveal'
import { ListingCard } from '@/components/product/ListingCard'
import { ProductDetails } from '@/components/product/ProductDetails'
import { ProductView } from '@/components/product/ProductView'
import { ProductReviews } from '@/components/reviews/ProductReviews'
import { JsonLd } from '@/components/seo/JsonLd'
import { getAllListingProducts } from '@/lib/catalog/listing'
import { getAllProductSlugs, getProductBySlug, relatedProducts } from '@/lib/catalog/product'
import { getHomePage, getShopInfo } from '@/lib/data'
import { getProductReviews } from '@/lib/reviews'
import { lexicalToPlainText } from '@/lib/richtext'
import { breadcrumbSchema, jsonLdGraph, productSchema } from '@/lib/seo'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/** Putanja (breadcrumb) i kategorija proizvoda prema tipu: vodi na odgovarajuću kolekciju. */
const TYPE_COLLECTION: Record<string, { name: string; path: string }> = {
  muske: { name: 'Muške čarape', path: '/kolekcije/muske-carape' },
  zenske: { name: 'Ženske čarape', path: '/kolekcije/zenske-carape' },
  sport: { name: 'Sportske čarape', path: '/kolekcije/sport-i-aktivne' },
}

export async function generateStaticParams() {
  return (await getAllProductSlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getProductBySlug(slug)
  if (!data) return {}
  const { product, gallery } = data
  const description =
    product.seo?.description ||
    product.shortDescription ||
    lexicalToPlainText(product.description).slice(0, 160)
  const og =
    product.seo?.image && typeof product.seo.image === 'object'
      ? product.seo.image.url
      : gallery[0]?.src
  return {
    title: product.seo?.title || product.title,
    description,
    alternates: { canonical: `/proizvodi/${product.slug}` },
    openGraph: {
      type: 'website',
      title: product.seo?.title || product.title,
      description,
      images: og ? [{ url: og }] : undefined,
    },
  }
}

/** Figma "single product page" (52:1835): proizvod, "Možda vam se svidi", newsletter. */
export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const [data, all, home] = await Promise.all([
    getProductBySlug(slug),
    getAllListingProducts(),
    getHomePage(),
  ])
  if (!data) notFound()
  const { product, gallery, options, variants } = data
  const related = relatedProducts(all, product)

  const [shop, reviews] = await Promise.all([getShopInfo(), getProductReviews(product.id)])
  const parent = TYPE_COLLECTION[product.productType ?? ''] ?? {
    name: 'Sve čarape',
    path: '/kolekcije/sve',
  }
  const kindIndex = (kind: string) => options.findIndex((o) => o.kind === kind)
  const [colorAt, sizeAt] = [kindIndex('color'), kindIndex('size')]
  const sizes = sizeAt >= 0 ? options[sizeAt].values.map((v) => v.value) : []
  const description =
    lexicalToPlainText(product.description) || product.shortDescription || product.title
  const jsonLd = jsonLdGraph(
    productSchema({
      slug,
      title: product.title,
      description: description.slice(0, 500),
      images: gallery
        .slice(0, 6)
        .map((g) => (g.src.startsWith('http') ? g.src : `${siteUrl}${g.src}`)),
      material: product.material,
      category: parent.name,
      rating: product.rating,
      ratingCount: product.ratingCount,
      reviews,
      variants: variants.map((v) => ({
        id: v.id,
        title: v.title,
        sku: v.sku,
        price: v.price,
        available: v.available,
        color: colorAt >= 0 ? v.values[colorAt] : undefined,
        size: sizeAt >= 0 ? v.values[sizeAt] : undefined,
      })),
    }),
    breadcrumbSchema([
      { name: 'Početna', path: '/' },
      parent,
      { name: product.title, path: `/proizvodi/${slug}` },
    ]),
  )

  return (
    <>
      <Header />
      <main id="sadrzaj">
        <JsonLd data={jsonLd} />
        <ProductView
          slug={slug}
          title={product.title}
          description={product.shortDescription ?? null}
          rating={product.rating ?? null}
          ratingCount={product.ratingCount ?? null}
          material={product.material ?? null}
          gallery={gallery}
          options={options}
          variants={variants}
          breadcrumb={parent}
        />
        <ProductDetails
          description={product.description}
          material={product.material ?? null}
          care={product.care || shop.defaultCare || null}
          shippingInfo={shop.shippingInfo}
          shippingPrice={shop.shippingPrice}
          freeShippingThreshold={shop.freeShippingThreshold}
          deliveryEstimate={shop.deliveryEstimate}
          sizes={sizes}
        />
        <ProductReviews product={{ id: product.id, title: product.title }} reviews={reviews} />

        {related.length ? (
          <section
            className="flex flex-col items-center gap-8 bg-white pt-6 pb-16 lg:min-h-[882px] lg:gap-[70px] lg:pt-[65px]"
            aria-labelledby="slicni-naslov"
          >
            <WordReveal
              id="slicni-naslov"
              text="Možda vam se svidi"
              className="p-2.5 text-center font-display text-[28px] leading-[28px] font-black tracking-[-2px] text-black uppercase lg:text-[36px]"
            />
            <ul className="snap-row w-full scroll-px-4 gap-3 px-4 lg:scroll-px-[var(--gutter)] lg:px-[var(--gutter)] xl:grid xl:w-[min(1366px,calc(100%-2*var(--gutter)+90px))] xl:grid-cols-4 xl:gap-[22px] xl:overflow-visible xl:px-0">
              {related.map((p, i) => (
                <li
                  key={p.id}
                  data-reveal="card"
                  style={{ '--i': i } as React.CSSProperties}
                  className="w-[min(70vw,325px)] xl:w-auto"
                >
                  <ListingCard product={p} rounded />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <Newsletter data={home.newsletter} />
      </main>
    </>
  )
}
