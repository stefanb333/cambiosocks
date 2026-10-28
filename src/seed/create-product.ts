import { syncProductAggregates } from '../lib/catalog/aggregates'
import { markdownToLexical } from '../lib/richtext'
import { slugify } from '../lib/slugify'
import type { ImageKey, SeedProduct } from './content'
import type { Payload } from 'payload'

type MediaIds = Partial<Record<ImageKey, number>>

/** Podaci proizvoda iz seed opisa (isti za novi i za postojeći proizvod). */
function productData(p: SeedProduct, media: MediaIds) {
  return {
    title: p.title,
    slug: p.slug,
    status: p.status ?? 'active',
    shortDescription: p.shortDescription,
    description: markdownToLexical(p.description),
    productType: p.productType,
    brand: 'Cambio',
    tags: p.tags,
    category: p.category as never,
    pattern: p.pattern as never,
    gallery: p.images.flatMap((k) => (media[k] ? [{ image: media[k] }] : [])),
    defaultPrice: p.price,
    defaultCompareAtPrice: p.compareAtPrice ?? null,
    // Redosled kao u Figmi (52:1603): prvo "Odaberi Veličinu", pa "Dostupne Boje".
    options: [
      { name: 'Veličina', kind: 'size' as const, values: p.sizes.map((s) => ({ value: s })) },
      {
        name: 'Boja',
        kind: 'color' as const,
        values: p.colors.map((c) => ({ value: c.value, swatch: c.swatch })),
      },
    ],
    seo: p.seo,
  }
}

/** Varijante veličina x boja (zaliha 25 po varijanti, osim rasprodatih). */
async function createVariants(
  payload: Payload,
  productId: number,
  p: SeedProduct,
  media: MediaIds,
  context: Record<string, unknown>,
) {
  let position = 0
  for (const color of p.colors) {
    for (const size of p.sizes) {
      const soldOut = p.soldOut?.includes(`${color.value}/${size}`)
      await payload.create({
        collection: 'variants',
        context: { ...context, skipAggregateSync: true },
        data: {
          product: productId,
          option1: size,
          option2: color.value,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          sku: `CAM-${p.skuCode}-${slugify(color.value).toUpperCase()}-${size.replace('-', '')}`,
          stock: soldOut ? 0 : 25,
          trackInventory: true,
          allowBackorder: false,
          image: color.image ? media[color.image] : undefined,
          position: position++,
        },
      })
    }
  }
  // Jednom preračunaj izvedena polja (cene, zaliha, filteri) posle svih varijanti.
  await syncProductAggregates(payload, productId)
}

/**
 * Demo proizvod sa varijantama (veličina x boja) iz src/seed/content.ts. Koriste ga seed i
 * skripta koja menja katalog u postojećoj bazi (scripts/replace-catalog.ts).
 */
export async function createSeedProduct(
  payload: Payload,
  p: SeedProduct,
  media: MediaIds,
  context: Record<string, unknown>,
): Promise<number> {
  const product = await payload.create({
    collection: 'products',
    context: { ...context, skipAggregateSync: true },
    data: productData(p, media),
  })
  await createVariants(payload, product.id as number, p, media, context)
  return product.id as number
}

/**
 * Postojeći proizvod dobija podatke iz seed opisa (naziv, tekst, slike, status, opcije) i nove
 * varijante; id ostaje isti, pa recenzije i porudžbine i dalje pokazuju na njega (D-077).
 */
export async function updateSeedProduct(
  payload: Payload,
  id: number,
  p: SeedProduct,
  media: MediaIds,
  context: Record<string, unknown>,
): Promise<void> {
  await payload.delete({
    collection: 'variants',
    where: { product: { equals: id } },
    context: { ...context, skipAggregateSync: true },
  })
  await payload.update({
    collection: 'products',
    id,
    context: { ...context, skipAggregateSync: true },
    data: productData(p, media),
  })
  await createVariants(payload, id, p, media, context)
}
