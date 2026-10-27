import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import {
  CollectionCatalog,
  CollectionCatalogFromUrl,
} from '@/components/collection/CollectionCatalog'
import { CollectionHero } from '@/components/collection/CollectionHero'
import { CollectionText } from '@/components/collection/CollectionText'
import { CtaBanner } from '@/components/home/CtaBanner'
import { Header } from '@/components/layout/Header'
import { Marquee } from '@/components/motion/Marquee'
import { JsonLd } from '@/components/seo/JsonLd'
import { BRAND_FACTS } from '@/lib/brand'
import {
  getAllCollectionSlugs,
  getAllListingProducts,
  getCollectionBySlug,
  productsInCollection,
  type SortKey,
} from '@/lib/catalog/listing'
import { getHomePage } from '@/lib/data'
import { lexicalToPlainText } from '@/lib/richtext'
import { breadcrumbSchema, collectionSchema, jsonLdGraph } from '@/lib/seo'
import type { Media } from '@/payload-types'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getAllCollectionSlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const collection = await getCollectionBySlug(slug)
  if (!collection) return {}
  const description =
    collection.seo?.description ||
    collection.heroText ||
    lexicalToPlainText(collection.description).slice(0, 160)
  const og = collection.seo?.image ?? collection.image
  return {
    title: collection.seo?.title || collection.title,
    description,
    alternates: { canonical: `/kolekcije/${collection.slug}` },
    openGraph: {
      title: collection.seo?.title || collection.title,
      description,
      images:
        og && typeof og === 'object' && og.url ? [{ url: og.sizes?.og?.url ?? og.url }] : undefined,
    },
  }
}

/** Figma "product collection" (54:774). Statična stranica (ISR), filteri iz adrese se primenjuju u pregledaču. */
export default async function CollectionPage({ params }: Props) {
  const { slug } = await params
  const [collection, all, home] = await Promise.all([
    getCollectionBySlug(slug),
    getAllListingProducts(),
    getHomePage(),
  ])
  if (!collection) notFound()

  // searchText služi samo za pretragu na serveru; ne šalje se pregledaču.
  const products = productsInCollection(all, collection).map((p) => ({ ...p, searchText: '' }))

  const pills = (collection.quickLinks ?? [])
    .filter((c) => typeof c === 'object')
    .map((c) => {
      const col = c as { slug?: string | null; title: string }
      return {
        label: col.slug === 'sve' ? 'Sve' : col.title,
        href: `/kolekcije/${col.slug}`,
        active: col.slug === collection.slug,
      }
    })

  const catalog = {
    slug: collection.slug ?? slug,
    heading: collection.listHeading || 'Najnovije u kolekciji',
    pills,
    defaultSort: ((collection.defaultSort as SortKey) || 'featured') as SortKey,
    products,
  }
  const cta = home.ctaBanner
  const jsonLd = jsonLdGraph(
    collectionSchema({
      slug: catalog.slug,
      title: collection.seo?.title || collection.title,
      description:
        collection.seo?.description ||
        collection.heroText ||
        lexicalToPlainText(collection.description).slice(0, 300),
      products: products.map((p) => ({ slug: p.slug, title: p.title })),
    }),
    breadcrumbSchema([
      { name: 'Početna', path: '/' },
      ...(catalog.slug === 'sve' ? [] : [{ name: 'Sve čarape', path: '/kolekcije/sve' }]),
      { name: collection.title, path: `/kolekcije/${catalog.slug}` },
    ]),
  )

  return (
    <>
      <Header />
      <main id="sadrzaj">
        <JsonLd data={jsonLd} />
        <CollectionHero
          heading={collection.heroHeading || collection.title}
          text={collection.heroText}
          image={collection.image as Media | null}
        />

        <section className="bg-white pt-8 pb-14 lg:pt-[72px] lg:pb-[59px]" aria-label="Proizvodi">
          <Suspense fallback={<CollectionCatalog {...catalog} />}>
            <CollectionCatalogFromUrl {...catalog} />
          </Suspense>
        </section>

        <CollectionText content={collection.description} />

        <div className="overflow-clip bg-white py-6 lg:py-10">
          <Marquee items={BRAND_FACTS} tilt={-1.5} />
        </div>

        <CtaBanner
          variant="collection"
          headingLine1={cta?.headingLine1}
          headingLine2={cta?.headingLine2}
          text={cta?.text}
          image={(cta?.collectionImage ?? cta?.image) as Media | null}
          pillImage={cta?.pillImage as Media | null}
          cta={cta?.cta}
        />
      </main>
    </>
  )
}
