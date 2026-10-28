import { syncProductAggregates } from '../lib/catalog/aggregates'
import { markdownToLexical } from '../lib/richtext'
import { slugify } from '../lib/slugify'
import type { ImageKey, SeedProduct } from './content'
import type { Payload } from 'payload'

/**
 * Demo proizvod sa varijantama (veličina x boja) iz src/seed/content.ts. Koriste ga seed i
 * skripte koje dodaju proizvode u postojeću bazu (scripts/add-bundles.ts).
 */
export async function createSeedProduct(
  payload: Payload,
  p: SeedProduct,
  media: Partial<Record<ImageKey, number>>,
  context: Record<string, unknown>,
): Promise<number> {
  const product = await payload.create({
    collection: 'products',
    context: { ...context, skipAggregateSync: true },
    data: {
      title: p.title,
      slug: p.slug,
      status: 'active',
      shortDescription: p.shortDescription,
      description: markdownToLexical(p.description),
      productType: p.productType,
      brand: 'Cambio',
      tags: p.tags,
      category: p.category as never,
      pattern: p.pattern as never,
      gallery: p.images.flatMap((k) => (media[k] ? [{ image: media[k] }] : [])),
      defaultPrice: p.price,
      defaultCompareAtPrice: p.compareAtPrice,
      // Redosled kao u Figmi (52:1603): prvo "Odaberi Veličinu", pa "Dostupne Boje".
      options: [
        { name: 'Veličina', kind: 'size', values: p.sizes.map((s) => ({ value: s })) },
        {
          name: 'Boja',
          kind: 'color',
          values: p.colors.map((c) => ({ value: c.value, swatch: c.swatch })),
        },
      ],
      seo: p.seo,
    },
  })

  let position = 0
  for (const color of p.colors) {
    for (const size of p.sizes) {
      const soldOut = p.soldOut?.includes(`${color.value}/${size}`)
      await payload.create({
        collection: 'variants',
        context: { ...context, skipAggregateSync: true },
        data: {
          product: product.id,
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
  await syncProductAggregates(payload, product.id)
  return product.id as number
}
