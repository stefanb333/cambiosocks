import { APIError, type PayloadRequest } from 'payload'

type LineItem = {
  variant?: number | { id: number } | null
  quantity?: number | null
  sku?: string | null
  title?: string | null
}

const variantId = (item: LineItem) =>
  typeof item.variant === 'object' ? item.variant?.id : item.variant

/**
 * Skida (direction = -1) ili vraća (direction = 1) zalihu za stavke porudžbine.
 * Pri skidanju prvo proverava sve stavke, pa tek onda menja, da porudžbina ne ostane
 * delimično obrađena.
 */
export async function adjustStock(req: PayloadRequest, items: LineItem[], direction: -1 | 1) {
  const rows = []
  for (const item of items) {
    const id = variantId(item)
    if (!id || !item.quantity) continue
    const variant = await req.payload
      .findByID({ collection: 'variants', id, depth: 0, req, overrideAccess: true })
      .catch(() => null)
    if (!variant) continue // varijanta obrisana posle porudžbine: nema šta da se menja
    rows.push({ variant, quantity: item.quantity, item })
  }

  if (direction === -1) {
    const short = rows.filter(
      ({ variant, quantity }) =>
        variant.trackInventory !== false &&
        !variant.allowBackorder &&
        (variant.stock ?? 0) < quantity,
    )
    if (short.length) {
      const list = short
        .map(
          ({ variant, quantity, item }) =>
            `${item.title ?? variant.label} (${variant.sku ?? 'bez SKU'}): traženo ${quantity}, na stanju ${variant.stock ?? 0}`,
        )
        .join('; ')
      throw new APIError(
        `Nema dovoljno zalihe za potvrdu porudžbine: ${list}`,
        400,
        undefined,
        true,
      )
    }
  }

  for (const { variant, quantity } of rows) {
    if (variant.trackInventory === false) continue
    await req.payload.update({
      collection: 'variants',
      id: variant.id,
      data: { stock: (variant.stock ?? 0) + direction * quantity },
      depth: 0,
      req,
      overrideAccess: true,
    })
  }
}
