/**
 * Smoke test poslovne logike porudžbina nad lokalnom bazom (posle seed-a).
 * Pokretanje: npm run payload -- run scripts/smoke-orders.ts
 * Pravi test porudžbinu, proverava broj porudžbine, istoriju statusa, skidanje i vraćanje
 * zalihe i izvedena polja proizvoda, pa sve vraća u početno stanje.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
const ctx = { disableRevalidate: true }
const results: string[] = []
const check = (name: string, ok: boolean, detail = '') => {
  results.push(`${ok ? 'OK  ' : 'FAIL'} ${name}${detail ? ` (${detail})` : ''}`)
  if (!ok) process.exitCode = 1
}

const { docs } = await payload.find({
  collection: 'variants',
  where: { stock: { greater_than: 2 } },
  limit: 1,
  depth: 0,
})
const variant = docs[0]
const productId = variant.product as number
const before = await payload.findByID({ collection: 'products', id: productId, depth: 0 })

const order = await payload.create({
  collection: 'orders',
  context: ctx,
  data: {
    status: 'nova',
    email: 'kupac@cambio.test',
    phone: '0601234567',
    shippingAddress: {
      name: 'Test Kupac',
      address1: 'Test 1',
      postalCode: '11000',
      city: 'Beograd',
      country: 'Srbija',
    },
    lineItems: [
      {
        product: productId,
        variant: variant.id,
        title: before.title,
        variantTitle: variant.title,
        sku: variant.sku,
        unitPrice: variant.price,
        quantity: 2,
      },
    ],
    shippingTotal: 499,
  },
})
check(
  'broj porudžbine',
  typeof order.orderNumber === 'number' && order.orderNumber >= 1001,
  order.name ?? '',
)
check('ukupno = 2 x cena + dostava', order.total === variant.price * 2 + 499, String(order.total))
check('status nova, zaliha nije skinuta', order.status === 'nova' && order.stockDeducted === false)
check('token za potvrdu', typeof order.accessToken === 'string' && order.accessToken.length > 20)

const confirmed = await payload.update({
  collection: 'orders',
  id: order.id,
  data: { status: 'potvrdjena' },
  context: ctx,
})
const vAfter = await payload.findByID({ collection: 'variants', id: variant.id, depth: 0 })
check(
  'potvrda skida zalihu',
  vAfter.stock === (variant.stock ?? 0) - 2,
  `${variant.stock} -> ${vAfter.stock}`,
)
check('istorija ima 2 unosa', confirmed.statusHistory?.length === 2)
const pAfter = await payload.findByID({ collection: 'products', id: productId, depth: 0 })
check(
  'ukupna zaliha proizvoda ažurirana',
  pAfter.totalStock === (before.totalStock ?? 0) - 2,
  `${before.totalStock} -> ${pAfter.totalStock}`,
)

await payload.update({
  collection: 'orders',
  id: order.id,
  data: { status: 'poslata' },
  context: ctx,
})
const vShipped = await payload.findByID({ collection: 'variants', id: variant.id, depth: 0 })
check('slanje ne skida zalihu ponovo', vShipped.stock === vAfter.stock)

await payload.update({
  collection: 'orders',
  id: order.id,
  data: { status: 'otkazana' },
  context: ctx,
})
const vCancelled = await payload.findByID({ collection: 'variants', id: variant.id, depth: 0 })
check('otkazivanje vraća zalihu', vCancelled.stock === variant.stock, String(vCancelled.stock))

// Nedovoljna zaliha: potvrda mora da padne sa porukom na srpskom.
const big = await payload.create({
  collection: 'orders',
  context: ctx,
  data: {
    status: 'nova',
    email: 'kupac@cambio.test',
    phone: '0601234567',
    lineItems: [
      { variant: variant.id, title: before.title, unitPrice: variant.price, quantity: 9999 },
    ],
  },
})
let blocked = false
try {
  await payload.update({
    collection: 'orders',
    id: big.id,
    data: { status: 'potvrdjena' },
    context: ctx,
  })
} catch (error) {
  blocked = String((error as Error).message).includes('Nema dovoljno zalihe')
}
check('potvrda bez dovoljno zalihe je blokirana', blocked)

// Čišćenje
await payload.delete({
  collection: 'orders',
  where: { id: { in: [order.id, big.id] } },
  context: ctx,
})
const customerCount = await payload.count({ collection: 'customers' })
check('nema zaostalih kupaca iz testa', customerCount.totalDocs === 0)

console.log(results.join('\n'))
process.exit()
