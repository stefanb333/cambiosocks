import 'server-only'
import { unstable_cache } from 'next/cache'
import { getPayload } from '@/lib/payload'
import { normalizeSearch } from '@/lib/slugify'
import type { Media, ShopCollection } from '@/payload-types'
import type { ListingProduct } from './listing-shared'

export * from './listing-shared'

/** Svi aktivni proizvodi (katalog je mali, filtriranje i sortiranje se rade u memoriji). */
export const getAllListingProducts = unstable_cache(
  async (): Promise<ListingProduct[]> => {
    const payload = await getPayload()
    const { docs } = await payload.find({
      collection: 'products',
      where: { status: { equals: 'active' } },
      depth: 1,
      limit: 2000,
      pagination: false,
      sort: '-createdAt',
      select: {
        slug: true,
        title: true,
        shortDescription: true,
        gallery: true,
        minPrice: true,
        compareAtPrice: true,
        available: true,
        sizeValues: true,
        colorValues: true,
        options: true,
        category: true,
        pattern: true,
        productType: true,
        tags: true,
        createdAt: true,
        searchText: true,
        collections: true,
      },
    })
    return docs.map((p) => {
      const first = p.gallery?.[0]?.image
      const media = first && typeof first === 'object' ? (first as Media) : null
      const colorOption = p.options?.find((o) => o.kind === 'color')
      const available = new Set(p.colorValues ?? [])
      return {
        id: p.id,
        slug: p.slug ?? String(p.id),
        title: p.title,
        shortDescription: p.shortDescription ?? null,
        image: media
          ? {
              url: media.url,
              alt: media.alt,
              width: media.width,
              height: media.height,
              focalX: media.focalX,
              focalY: media.focalY,
            }
          : null,
        minPrice: p.minPrice ?? 0,
        compareAtPrice: p.compareAtPrice ?? null,
        available: Boolean(p.available),
        sizes: p.sizeValues ?? [],
        colors: (colorOption?.values ?? [])
          .filter((v) => v.swatch && (available.size === 0 || available.has(v.value)))
          .map((v) => ({ name: v.value, hex: v.swatch as string })),
        category: (p.category ?? []) as string[],
        pattern: (p.pattern ?? []) as string[],
        productType: p.productType ?? null,
        tags: p.tags ?? [],
        createdAt: p.createdAt,
        searchText: p.searchText ?? '',
        collectionIds: (p.collections ?? []).map((c) => (typeof c === 'object' ? c.id : c)),
      }
    })
  },
  ['listing-products'],
  { tags: ['products', 'media'] },
)

export const getCollectionBySlug = unstable_cache(
  async (slug: string) => {
    const payload = await getPayload()
    const { docs } = await payload.find({
      collection: 'shop-collections',
      where: { slug: { equals: slug } },
      depth: 1,
      limit: 1,
    })
    return (docs[0] as ShopCollection | undefined) ?? null
  },
  ['collection-by-slug'],
  { tags: ['collections', 'media'] },
)

export const getAllCollectionSlugs = unstable_cache(
  async () => {
    const payload = await getPayload()
    const { docs } = await payload.find({
      collection: 'shop-collections',
      depth: 0,
      limit: 200,
      select: { slug: true },
    })
    return docs.map((d) => d.slug).filter(Boolean) as string[]
  },
  ['collection-slugs'],
  { tags: ['collections'] },
)

/** Proizvodi kolekcije po njenom tipu (ručna lista ili automatska pravila), u "izdvojenom" redosledu. */
export function productsInCollection(
  all: ListingProduct[],
  collection: ShopCollection,
): ListingProduct[] {
  if (collection.type === 'manual') {
    const ids = (collection.products ?? []).map((p) => (typeof p === 'object' ? p.id : p))
    const ordered = ids
      .map((id) => all.find((p) => p.id === id))
      .filter(Boolean) as ListingProduct[]
    const extra = all.filter((p) => !ids.includes(p.id) && p.collectionIds.includes(collection.id))
    return [...ordered, ...extra]
  }
  const rules = collection.rules ?? []
  if (!rules.length) return all
  const test = (p: ListingProduct, rule: { field: string; value: string }) => {
    const v = rule.value.trim().toLowerCase()
    switch (rule.field) {
      case 'tags':
        return p.tags.some((t) => t.toLowerCase() === v)
      case 'productType':
        return (p.productType ?? '').toLowerCase() === v
      case 'brand':
        return true // svi proizvodi u katalogu su Cambio; pravilo služi za kolekciju "Sve"
      case 'category':
        return p.category.includes(v)
      case 'pattern':
        return p.pattern.includes(v)
      default:
        return false
    }
  }
  return all.filter((p) =>
    collection.match === 'any' ? rules.some((r) => test(p, r)) : rules.every((r) => test(p, r)),
  )
}

export function searchProducts(all: ListingProduct[], query: string): ListingProduct[] {
  // Padeži i rod: "crne", "crna" i "crnih" traže isto (bez krajnjih samoglasnika i "ih/im"),
  // pa "crne carape" nalazi proizvod sa bojom "Crna". Kratke reči ostaju cele.
  const words = normalizeSearch(query)
    .split(' ')
    .filter(Boolean)
    .map((w) => (w.length >= 4 ? w.replace(/(ih|im|[aeiou])$/, '') : w))
  if (!words.length) return []
  return all.filter((p) => {
    const hay = `${normalizeSearch(p.title)} ${p.searchText}`
    return words.every((w) => hay.includes(w))
  })
}

// --- URL parametri <-> filteri ---
