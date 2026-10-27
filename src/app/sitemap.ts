import { getAllListingProducts } from '@/lib/catalog/listing'
import { getPayload } from '@/lib/payload'
import { absoluteUrl, SITE_URL } from '@/lib/seo'
import type { MetadataRoute } from 'next'

export const revalidate = 3600

/**
 * Javne stranice prodavnice. Korpa, checkout i pretraga nisu u sitemap-u (noindex).
 * Proizvodi nose i sliku (Google Images je čest izvor kupaca odeće i obuće, D-063).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload()
  const [listing, products, collections, pages, posts] = await Promise.all([
    getAllListingProducts(),
    payload.find({
      collection: 'products',
      where: { status: { equals: 'active' } },
      depth: 0,
      limit: 0,
      pagination: false,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: 'shop-collections',
      depth: 0,
      limit: 0,
      pagination: false,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: 'pages',
      where: { _status: { equals: 'published' } },
      depth: 0,
      limit: 0,
      pagination: false,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: 'posts',
      where: { _status: { equals: 'published' } },
      depth: 0,
      limit: 0,
      pagination: false,
      select: { slug: true, updatedAt: true },
    }),
  ])

  const entry = (
    path: string,
    updatedAt?: string | null,
    priority = 0.6,
    images?: string[],
  ): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path}`,
    lastModified: updatedAt ? new Date(updatedAt) : undefined,
    priority,
    ...(images?.length ? { images } : {}),
  })
  const imageOf = (slug?: string | null) => {
    const url = listing.find((p) => p.slug === slug)?.image?.url
    return url ? [absoluteUrl(url)] : undefined
  }

  return [
    entry('/', null, 1),
    ...collections.docs.map((c) => entry(`/kolekcije/${c.slug}`, c.updatedAt, 0.8)),
    ...products.docs.map((p) => entry(`/proizvodi/${p.slug}`, p.updatedAt, 0.9, imageOf(p.slug))),
    entry('/blog', null, 0.5),
    ...posts.docs.map((p) => entry(`/blog/${p.slug}`, p.updatedAt, 0.6)),
    ...pages.docs.map((p) => entry(`/${p.slug}`, p.updatedAt, 0.4)),
  ]
}
