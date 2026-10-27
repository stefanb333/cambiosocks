import { syncProductAggregates } from './aggregates'
import { comboKey, optionCombinations, suggestSku, type OptionInput } from './variants-shared'
import type { Payload, PayloadRequest } from 'payload'

export { comboKey, optionCombinations, suggestSku }

export type GenerateResult = { created: number; kept: number; removed: number; total: number }

/**
 * Pravi varijante koje nedostaju za sve kombinacije opcija proizvoda. Postojeće
 * varijante (sa cenom, zalihom, SKU-om) se ne menjaju. Uz `removeStale` briše
 * varijante čija kombinacija više ne postoji u opcijama.
 */
export async function generateVariants(
  payload: Payload,
  productId: number | string,
  { removeStale = false, req }: { removeStale?: boolean; req?: PayloadRequest } = {},
): Promise<GenerateResult> {
  const product = await payload.findByID({
    collection: 'products',
    id: productId,
    depth: 0,
    req,
    overrideAccess: true,
  })
  const combos = optionCombinations((product.options ?? []) as OptionInput[])
  const wanted = combos.length ? combos : [[]]

  const { docs: existing } = await payload.find({
    collection: 'variants',
    where: { product: { equals: productId } },
    depth: 0,
    limit: 0,
    pagination: false,
    req,
    overrideAccess: true,
  })
  const byKey = new Map(existing.map((v) => [comboKey([v.option1, v.option2, v.option3]), v]))
  const wantedKeys = new Set(wanted.map(comboKey))
  const usedSkus = new Set(existing.map((v) => v.sku).filter(Boolean))

  let created = 0
  for (const [index, values] of wanted.entries()) {
    if (byKey.has(comboKey(values))) continue
    let sku = suggestSku(product.slug ?? product.title, values)
    for (let n = 2; usedSkus.has(sku); n++)
      sku = `${suggestSku(product.slug ?? product.title, values)}-${n}`
    // SKU je jedinstven u celoj prodavnici: proveri i druge proizvode.
    const clash = await payload.count({
      collection: 'variants',
      where: { sku: { equals: sku } },
      req,
      overrideAccess: true,
    })
    if (clash.totalDocs) sku = `${sku}-${String(product.id).slice(-4)}`
    usedSkus.add(sku)
    await payload.create({
      collection: 'variants',
      data: {
        product: product.id,
        option1: values[0] ?? null,
        option2: values[1] ?? null,
        option3: values[2] ?? null,
        price: product.defaultPrice ?? 0,
        compareAtPrice: product.defaultCompareAtPrice ?? null,
        sku,
        stock: 0,
        position: index,
      },
      req,
      overrideAccess: true,
      context: { skipAggregateSync: true },
    })
    created++
  }

  let removed = 0
  if (removeStale) {
    for (const v of existing) {
      if (wantedKeys.has(comboKey([v.option1, v.option2, v.option3]))) continue
      await payload.delete({
        collection: 'variants',
        id: v.id,
        req,
        overrideAccess: true,
        context: { skipAggregateSync: true },
      })
      removed++
    }
  }

  // Redosled varijanti prati redosled opcija (36-40 Crna, 36-40 Bela, 41-46 Crna...).
  const order = new Map(wanted.map((values, i) => [comboKey(values), i]))
  const { docs: all } = await payload.find({
    collection: 'variants',
    where: { product: { equals: productId } },
    depth: 0,
    limit: 0,
    pagination: false,
    req,
    overrideAccess: true,
  })
  for (const v of all) {
    const target = order.get(comboKey([v.option1, v.option2, v.option3]))
    if (target === undefined || v.position === target) continue
    await payload.update({
      collection: 'variants',
      id: v.id,
      data: { position: target },
      req,
      overrideAccess: true,
      context: { skipAggregateSync: true },
    })
  }

  await syncProductAggregates(payload, product.id, req)
  return {
    created,
    kept: existing.length - removed,
    removed,
    total: existing.length - removed + created,
  }
}
