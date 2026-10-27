import 'server-only'
import { mediaSrc } from '@/lib/media'
import type { Discount, Media, Product, Variant } from '@/payload-types'
import type { Payload } from 'payload'

/**
 * Obračun korpe na serveru: jedini izvor istine za cene, zalihu, popust i dostavu.
 * Koristi ga /api/cart/validate (prikaz korpe) i checkout (kreiranje porudžbine).
 */

export type CartInputLine = { variantId: number; quantity: number }

export type PricedLine = {
  variantId: number
  productId: number
  slug: string
  title: string
  variantTitle: string
  /** "Boja: Bela, Veličina 42-44" (format iz Figme 123:1085) */
  variantLabel: string
  sku: string | null
  image: { src: string; alt: string } | null
  imageId: number | null
  unitPrice: number
  compareAtPrice: number | null
  quantity: number
  requestedQuantity: number
  lineTotal: number
  available: boolean
  maxQuantity: number | null
  notice: string | null
}

export type PricedCart = {
  lines: PricedLine[]
  removed: { variantId: number; reason: string }[]
  subtotal: number
  discount: { code: string; amount: number; freeShipping: boolean } | null
  discountError: string | null
  shipping: number
  total: number
  itemCount: number
}

const MAX_QTY = 99

function variantLabel(product: Product, variant: Variant) {
  const values = [variant.option1, variant.option2, variant.option3]
  const options = product.options ?? []
  // Prvo boja, pa veličina, kao u Figmi ("Boja: Bela, Veličina 42-44").
  const parts = options
    .map((o, i) => ({ kind: o.kind, name: o.name, value: values[i] }))
    .filter((p) => p.value)
    .sort((a, b) => (a.kind === 'color' ? -1 : b.kind === 'color' ? 1 : 0))
    .map((p) =>
      p.kind === 'color'
        ? `Boja: ${p.value}`
        : p.kind === 'size'
          ? `Veličina ${p.value}`
          : `${p.name}: ${p.value}`,
    )
  return parts.join(', ')
}

export async function priceCart(
  payload: Payload,
  input: CartInputLine[],
  opts: { discountCode?: string | null; email?: string | null } = {},
): Promise<PricedCart> {
  const merged = new Map<number, number>()
  for (const l of input) {
    if (!Number.isInteger(l.variantId) || !Number.isInteger(l.quantity) || l.quantity <= 0) continue
    merged.set(l.variantId, Math.min(MAX_QTY, (merged.get(l.variantId) ?? 0) + l.quantity))
  }
  const ids = [...merged.keys()]
  const removed: PricedCart['removed'] = []
  const lines: PricedLine[] = []

  if (ids.length) {
    const { docs } = await payload.find({
      collection: 'variants',
      where: { id: { in: ids } },
      depth: 2,
      limit: ids.length,
      pagination: false,
      overrideAccess: true,
    })
    const byId = new Map((docs as Variant[]).map((v) => [v.id, v]))

    for (const [variantId, requested] of merged) {
      const variant = byId.get(variantId)
      const product =
        variant && typeof variant.product === 'object' ? (variant.product as Product) : null
      if (!variant || !product || product.status !== 'active') {
        removed.push({ variantId, reason: 'Proizvod više nije dostupan i uklonjen je iz korpe.' })
        continue
      }
      const tracked = variant.trackInventory !== false && !variant.allowBackorder
      const stock = Math.max(0, variant.stock ?? 0)
      if (tracked && stock === 0) {
        removed.push({
          variantId,
          reason: `${product.title} (${variant.title}) je rasprodat i uklonjen je iz korpe.`,
        })
        continue
      }
      const quantity = tracked ? Math.min(requested, stock) : requested
      const media =
        (typeof variant.image === 'object' && variant.image ? (variant.image as Media) : null) ??
        (typeof product.gallery?.[0]?.image === 'object'
          ? (product.gallery?.[0]?.image as Media)
          : null)
      lines.push({
        variantId,
        productId: product.id,
        slug: product.slug ?? '',
        title: product.title,
        variantTitle: variant.title ?? '',
        variantLabel: variantLabel(product, variant),
        sku: variant.sku ?? null,
        image: media?.url ? { src: mediaSrc(media.url)!, alt: media.alt ?? product.title } : null,
        imageId: media?.id ?? null,
        unitPrice: variant.price,
        compareAtPrice:
          variant.compareAtPrice && variant.compareAtPrice > variant.price
            ? variant.compareAtPrice
            : null,
        quantity,
        requestedQuantity: requested,
        lineTotal: variant.price * quantity,
        available: true,
        maxQuantity: tracked ? stock : null,
        notice:
          quantity < requested ? `Na stanju je samo ${stock} kom, količina je smanjena.` : null,
      })
    }
  }

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0)
  const settings = await payload.findGlobal({
    slug: 'shop-settings',
    depth: 0,
    overrideAccess: true,
  })
  const threshold = settings.freeShippingThreshold
  let shipping = lines.length ? (settings.shippingPrice ?? 0) : 0
  if (threshold && subtotal >= threshold) shipping = 0

  let discount: PricedCart['discount'] = null
  let discountError: string | null = null
  if (opts.discountCode?.trim() && lines.length) {
    const result = await evaluateDiscount(
      payload,
      opts.discountCode,
      lines,
      subtotal,
      opts.email ?? null,
    )
    if ('error' in result) discountError = result.error
    else {
      discount = result
      if (result.freeShipping) shipping = 0
    }
  }

  const discountAmount = discount?.amount ?? 0
  return {
    lines,
    removed,
    subtotal,
    discount,
    discountError,
    shipping,
    total: Math.max(0, subtotal - discountAmount + shipping),
    itemCount: lines.reduce((s, l) => s + l.quantity, 0),
  }
}

async function evaluateDiscount(
  payload: Payload,
  rawCode: string,
  lines: PricedLine[],
  subtotal: number,
  email: string | null,
): Promise<{ code: string; amount: number; freeShipping: boolean } | { error: string }> {
  const code = rawCode.trim().toUpperCase().replace(/\s+/g, '')
  const { docs } = await payload.find({
    collection: 'discounts',
    where: { code: { equals: code } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  const d = docs[0] as Discount | undefined
  const now = Date.now()
  if (!d || !d.active) return { error: 'Kod za popust ne postoji.' }
  if (d.startsAt && new Date(d.startsAt).getTime() > now)
    return { error: 'Kod za popust još nije aktivan.' }
  if (d.endsAt && new Date(d.endsAt).getTime() < now) return { error: 'Kod za popust je istekao.' }
  if (d.usageLimit && (d.usageCount ?? 0) >= d.usageLimit)
    return { error: 'Kod za popust je iskorišćen.' }
  if (d.minSubtotal && subtotal < d.minSubtotal) {
    return { error: `Kod važi za korpu od najmanje ${d.minSubtotal} RSD.` }
  }
  if (d.oncePerCustomer && email) {
    const used = await payload.count({
      collection: 'orders',
      where: {
        and: [
          { email: { equals: email.toLowerCase() } },
          { discountCode: { equals: code } },
          { status: { not_equals: 'otkazana' } },
        ],
      },
      overrideAccess: true,
    })
    if (used.totalDocs) return { error: 'Ovaj kod ste već iskoristili.' }
  }

  // Osnovica: cela korpa ili samo stavke iz izabranih proizvoda/kolekcija.
  let base = subtotal
  if (d.appliesTo === 'products') {
    const ids = (d.products ?? []).map((p) => (typeof p === 'object' ? p.id : p))
    base = lines.filter((l) => ids.includes(l.productId)).reduce((s, l) => s + l.lineTotal, 0)
  } else if (d.appliesTo === 'collections') {
    const colIds = (d.collections ?? []).map((c) => (typeof c === 'object' ? c.id : c))
    const { docs: products } = await payload.find({
      collection: 'products',
      where: { id: { in: lines.map((l) => l.productId) } },
      depth: 0,
      limit: lines.length,
      overrideAccess: true,
      select: { collections: true },
    })
    const eligible = new Set(
      products
        .filter((p) =>
          (p.collections ?? []).some((c) => colIds.includes(typeof c === 'object' ? c.id : c)),
        )
        .map((p) => p.id),
    )
    base = lines.filter((l) => eligible.has(l.productId)).reduce((s, l) => s + l.lineTotal, 0)
  }
  if (base <= 0 && d.type !== 'free_shipping') return { error: 'Kod ne važi za proizvode u korpi.' }

  if (d.type === 'free_shipping') return { code, amount: 0, freeShipping: true }
  const amount =
    d.type === 'percentage'
      ? Math.round((base * (d.value ?? 0)) / 100)
      : Math.min(base, d.value ?? 0)
  return { code, amount, freeShipping: false }
}
