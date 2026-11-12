import 'server-only'
import { unstable_cache } from 'next/cache'
import { mediaSrc } from '@/lib/media'
import { getPayload } from '@/lib/payload'
import type { Media, Product, Variant } from '@/payload-types'
import type { ListingProduct } from './listing'

export type GalleryImage = { id: number; src: string; alt: string; width: number; height: number }

export type PdpVariant = {
  id: number
  title: string
  values: string[]
  price: number
  compareAtPrice: number | null
  available: boolean
  stock: number | null
  imageId: number | null
  sku: string | null
}

export type PdpOption = {
  name: string
  kind: string
  values: { value: string; swatch: string | null }[]
}

const toImage = (m: Media | number | null | undefined): GalleryImage | null => {
  if (!m || typeof m === 'number' || !m.url) return null
  return {
    id: m.id,
    src: mediaSrc(m.url)!,
    alt: m.alt ?? '',
    width: m.width ?? 1600,
    height: m.height ?? 1600,
  }
}

export const getProductBySlug = unstable_cache(
  async (slug: string) => {
    const payload = await getPayload()
    const { docs } = await payload.find({
      collection: 'products',
      where: { and: [{ slug: { equals: slug } }, { status: { equals: 'active' } }] },
      depth: 1,
      limit: 1,
    })
    const product = docs[0] as Product | undefined
    if (!product) return null

    const { docs: variants } = await payload.find({
      collection: 'variants',
      where: { product: { equals: product.id } },
      depth: 1,
      limit: 500,
      pagination: false,
      sort: 'position',
    })

    // Galerija proizvoda + slike varijanti koje nisu već u galeriji.
    const gallery: GalleryImage[] = []
    for (const item of product.gallery ?? []) {
      const img = toImage(item.image)
      if (img && !gallery.some((g) => g.id === img.id)) gallery.push(img)
    }
    for (const v of variants as Variant[]) {
      const img = toImage(v.image)
      if (img && !gallery.some((g) => g.id === img.id)) gallery.push(img)
    }

    const options: PdpOption[] = (product.options ?? []).map((o) => ({
      name: o.name,
      kind: o.kind ?? 'other',
      values: (o.values ?? []).map((v) => ({ value: v.value, swatch: v.swatch ?? null })),
    }))

    const pdpVariants: PdpVariant[] = (variants as Variant[]).map((v) => ({
      id: v.id,
      title: v.title ?? '',
      values: [v.option1, v.option2, v.option3].slice(0, options.length).map((x) => x ?? ''),
      price: v.price,
      compareAtPrice: v.compareAtPrice && v.compareAtPrice > v.price ? v.compareAtPrice : null,
      available: v.trackInventory === false || Boolean(v.allowBackorder) || (v.stock ?? 0) > 0,
      stock: v.trackInventory === false ? null : (v.stock ?? 0),
      imageId:
        typeof v.image === 'object' && v.image
          ? v.image.id
          : typeof v.image === 'number'
            ? v.image
            : null,
      sku: v.sku ?? null,
    }))

    assignColorImagesByPosition(gallery, options, pdpVariants)

    return { product, gallery, options, variants: pdpVariants }
  },
  ['product-by-slug'],
  { tags: ['products', 'media'] },
)

/**
 * Slike po boji bez ručnog vezivanja slike za varijantu (D-085, kao Happy Socks).
 * Galerija se slaže redom boja iz opcije: za svaku boju flat pa model. Kada nijedna varijanta
 * nema svoju sliku, a galerija se ravnomerno deli na boje, boja i dobija slike od i*k do i*k+k-1;
 * prva (flat) postaje slika varijanti te boje. Izbor boje tada prikazuje sličice čarapa, a galerija
 * samo slike izabrane boje. Ako je bar jedna slika vezana ručno, važi samo ručno vezivanje.
 */
function assignColorImagesByPosition(
  gallery: GalleryImage[],
  options: PdpOption[],
  variants: PdpVariant[],
) {
  const colorIndex = options.findIndex((o) => o.kind === 'color')
  if (colorIndex < 0 || variants.some((v) => v.imageId)) return
  const colors = options[colorIndex].values.map((v) => v.value)
  if (!colors.length || !gallery.length || gallery.length % colors.length !== 0) return
  const perColor = gallery.length / colors.length
  for (const v of variants) {
    const i = colors.indexOf(v.values[colorIndex])
    if (i >= 0) v.imageId = gallery[i * perColor].id
  }
}

export const getAllProductSlugs = unstable_cache(
  async () => {
    const payload = await getPayload()
    const { docs } = await payload.find({
      collection: 'products',
      where: { status: { equals: 'active' } },
      depth: 0,
      limit: 2000,
      select: { slug: true },
    })
    return docs.map((d) => d.slug).filter(Boolean) as string[]
  },
  ['product-slugs'],
  { tags: ['products'] },
)

/** "Možda vam se svidi": isti tip proizvoda, pa ostali, bez trenutnog proizvoda. */
export function relatedProducts(
  all: ListingProduct[],
  current: { id: number; productType?: string | null },
  limit = 4,
) {
  const others = all.filter((p) => p.id !== current.id)
  const same = others.filter((p) => p.productType && p.productType === current.productType)
  const rest = others.filter((p) => !same.includes(p))
  return [...same, ...rest].slice(0, limit)
}
