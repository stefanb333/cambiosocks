/**
 * Provera dozvola za uloge admin i urednik nad lokalnom bazom (posle seed-a).
 * Pokretanje: npm run payload -- run scripts/smoke-roles.ts
 * Pravi privremenog urednika, proverava šta sme a šta ne, pa ga briše.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
const results: string[] = []
const check = (name: string, ok: boolean, detail = '') => {
  results.push(`${ok ? 'OK  ' : 'FAIL'} ${name}${detail ? ` (${detail})` : ''}`)
  if (!ok) process.exitCode = 1
}
const denied = async (fn: () => Promise<unknown>) => {
  try {
    await fn()
    return false
  } catch (error) {
    return (
      (error as { status?: number }).status === 403 ||
      /not allowed|forbidden|nije dozvoljen/i.test((error as Error).message)
    )
  }
}

const email = `urednik-${Date.now()}@cambio.test`
const editor = await payload.create({
  collection: 'users',
  data: { email, password: `Test-${Date.now()}-x`, role: 'editor', name: 'Test urednik' },
})
const user = { ...editor, collection: 'users' as const }
const as = { user, overrideAccess: false }

try {
  const product = (await payload.find({ collection: 'products', limit: 1, depth: 0 })).docs[0]

  check(
    'urednik vidi i menja proizvode',
    !(await denied(() =>
      payload.update({
        collection: 'products',
        id: product.id,
        data: { ratingCount: product.ratingCount ?? 0 },
        ...as,
      }),
    )),
  )
  check(
    'urednik vidi porudžbine',
    !(await denied(() => payload.find({ collection: 'orders', limit: 1, ...as }))),
  )
  check(
    'urednik ne može da pravi porudžbine ručno',
    await denied(() =>
      payload.create({
        collection: 'orders',
        data: {
          email: 'x@cambio.test',
          phone: '0601234567',
          lineItems: [{ title: 'x', unitPrice: 1, quantity: 1 }],
        } as never,
        ...as,
      }),
    ),
  )

  const order = (await payload.find({ collection: 'orders', limit: 1, depth: 0 })).docs[0]
  if (order)
    check(
      'urednik ne može da briše porudžbine',
      await denied(() => payload.delete({ collection: 'orders', id: order.id, ...as })),
    )

  check(
    'urednik ne vidi podešavanja prodavnice',
    await denied(() => payload.findGlobal({ slug: 'shop-settings', ...as })),
  )
  check(
    'urednik ne menja podešavanja prodavnice',
    await denied(() =>
      payload.updateGlobal({ slug: 'shop-settings', data: { shippingPrice: 1 }, ...as }),
    ),
  )
  check(
    'urednik menja početnu stranicu',
    !(await denied(() => payload.updateGlobal({ slug: 'home-page', data: {}, ...as }))),
  )

  const others = await payload.find({ collection: 'users', ...as })
  check(
    'urednik vidi samo svoj nalog',
    others.docs.every((u) => u.id === editor.id),
    `vidi ${others.totalDocs}`,
  )
  check(
    'urednik ne pravi nove korisnike',
    await denied(() =>
      payload.create({
        collection: 'users',
        data: { email: `x-${Date.now()}@cambio.test`, password: 'Test-12345-x', role: 'editor' },
        ...as,
      }),
    ),
  )
  await payload
    .update({ collection: 'users', id: editor.id, data: { role: 'admin' }, ...as })
    .catch(() => null)
  const after = await payload.findByID({ collection: 'users', id: editor.id })
  check('urednik ne može sebi da da ulogu administratora', after.role === 'editor')

  check(
    'gost ne vidi nacrte proizvoda',
    (
      await payload.find({
        collection: 'products',
        where: { status: { not_equals: 'active' } },
        overrideAccess: false,
      })
    ).totalDocs === 0,
  )
  check(
    'gost ne vidi porudžbine',
    await denied(() => payload.find({ collection: 'orders', overrideAccess: false })),
  )
  check(
    'gost ne vidi kupce',
    await denied(() => payload.find({ collection: 'customers', overrideAccess: false })),
  )
} finally {
  await payload.delete({ collection: 'users', id: editor.id })
}

console.log(results.join('\n'))
process.exit()
