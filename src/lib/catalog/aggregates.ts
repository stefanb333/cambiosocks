import type { OptionKind } from './constants'
import type { Payload, PayloadRequest } from 'payload'

type ProductOption = { name: string; kind?: OptionKind | null; values?: { value: string }[] | null }

/**
 * Preračunava izvedena polja proizvoda (raspon cena, zaliha, dostupnost, vrednosti
 * za filtere) iz njegovih varijanti. Poziva se iz hookova Variants i Products.
 */
export async function syncProductAggregates(
  payload: Payload,
  productId: number | string,
  req?: PayloadRequest,
) {
  const product = await payload
    .findByID({
      collection: 'products',
      id: productId,
      depth: 0,
      req,
      overrideAccess: true,
    })
    .catch(() => null)
  if (!product) return

  const { docs: variants } = await payload.find({
    collection: 'variants',
    where: { product: { equals: productId } },
    depth: 0,
    limit: 1000,
    pagination: false,
    req,
    overrideAccess: true,
  })

  const options = (product.options ?? []) as ProductOption[]
  const optionKey = (index: number) => (['option1', 'option2', 'option3'] as const)[index]

  const prices = variants.map((v) => v.price).filter((p): p is number => typeof p === 'number')
  const compareAt = variants
    .filter((v) => typeof v.compareAtPrice === 'number' && v.compareAtPrice > (v.price ?? 0))
    .map((v) => v.compareAtPrice as number)

  const isAvailable = (v: (typeof variants)[number]) =>
    v.trackInventory === false || v.allowBackorder === true || (v.stock ?? 0) > 0

  const valuesOfKind = (kind: OptionKind) => {
    const index = options.findIndex((o) => o.kind === kind)
    if (index < 0) return []
    const key = optionKey(index)
    const set = new Set<string>()
    for (const v of variants) {
      const value = v[key]
      if (value && isAvailable(v)) set.add(value)
    }
    return [...set]
  }

  await payload.update({
    collection: 'products',
    id: productId,
    depth: 0,
    req,
    overrideAccess: true,
    context: { ...(req?.context ?? {}), skipAggregateSync: true },
    data: {
      minPrice: prices.length ? Math.min(...prices) : null,
      maxPrice: prices.length ? Math.max(...prices) : null,
      compareAtPrice: compareAt.length ? Math.max(...compareAt) : null,
      totalStock: variants.reduce(
        (sum, v) => sum + (v.trackInventory === false ? 0 : Math.max(0, v.stock ?? 0)),
        0,
      ),
      available: variants.some(isAvailable),
      variantCount: variants.length,
      sizeValues: valuesOfKind('size'),
      colorValues: valuesOfKind('color'),
    },
  })
}
