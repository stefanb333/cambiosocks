/**
 * Jednokratno (D-075): katalog klijenta u postojećoj bazi. Pravi proizvode iz
 * src/seed/content.ts (paketi od 12 pari), premešta recenzije sa starih demo proizvoda na nove,
 * briše stare proizvode i njihove varijante, postavlja izdvojene proizvode na početnoj i menja
 * fotografije na mestima koja nisu proizvodi (newsletter, CTA kolekcije, O nama, blog).
 * Tekstovi kolekcija, FAQ i bloga idu posle kroz update-seo-content.ts.
 * Pokretanje (lokalno):  npm run payload -- run scripts/replace-catalog.ts
 * Demo (Supabase):       cross-env NODE_ENV=production node --env-file=.env.demo.local node_modules/payload/bin.js run scripts/replace-catalog.ts
 */
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'
import { demoReviews, images, products, type ImageKey } from '../src/seed/content'
import { createSeedProduct } from '../src/seed/create-product'

const payload = await getPayload({ config })
const file = (key: ImageKey) => path.resolve('src/seed/images', images[key].file)
const focalOf = (key: ImageKey) => {
  const img = images[key]
  return 'focal' in img ? { focalX: img.focal[0], focalY: img.focal[1] } : {}
}

// --- 1. Nove fotografije na mestima koja nisu proizvodi (stari alt -> novi fajl, alt i fokus)
const swaps: [ImageKey, string][] = [
  ['newsletter', 'Stopalo u žutoj čarapi pored bundeve i limuna'],
  ['ctaCollection', 'Noge u šarenim prugastim i tačkastim čarapama'],
  ['stat5', 'Stopala u tamnim čarapama na tepihu'],
  ['blogOutfit', 'Bele i sive čarape poređane pored belih patika'],
  ['blogTraining', 'Sportska oprema i čarape složene na podu'],
]
for (const [key, oldAlt] of swaps) {
  const { docs } = await payload.find({
    collection: 'media',
    where: { or: [{ alt: { equals: oldAlt } }, { alt: { equals: images[key].alt } }] },
    limit: 1,
    depth: 0,
  })
  if (!docs[0]) {
    console.log(`Slika ${key}: nije pronađena, preskačem`)
    continue
  }
  const doc = await payload.update({
    collection: 'media',
    id: docs[0].id,
    data: { alt: images[key].alt, ...focalOf(key) },
    filePath: file(key),
    overrideAccess: true,
  })
  console.log(`Slika ${key}: ${doc.filename} (${doc.width}x${doc.height})`)
}

// --- 2. Fotografije proizvoda (postojeće po alt tekstu ili nove)
const media: Partial<Record<ImageKey, number>> = {}
for (const key of new Set(products.flatMap((p) => p.images))) {
  const found = await payload.find({
    collection: 'media',
    where: { alt: { equals: images[key].alt } },
    limit: 1,
    depth: 0,
  })
  media[key] =
    found.docs[0]?.id ??
    (
      await payload.create({
        collection: 'media',
        data: { alt: images[key].alt, ...focalOf(key) },
        filePath: file(key),
      })
    ).id
}

// --- 3. Novi proizvodi
const ids: Record<string, number> = {}
for (const p of products) {
  const existing = await payload.find({
    collection: 'products',
    where: { slug: { equals: p.slug } },
    limit: 1,
    depth: 0,
  })
  ids[p.slug] = existing.docs[0]?.id ?? (await createSeedProduct(payload, p, media, {}))
  console.log(`${existing.docs[0] ? 'Postoji' : 'Dodat'}: ${p.title} (${p.status ?? 'active'})`)
}

// --- 4. Recenzije sa starih proizvoda na nove (po imenu iz demo recenzija)
const keep = new Set(Object.values(ids))
const fallback = ids[products[0].slug]
const reviews = await payload.find({ collection: 'reviews', pagination: false, depth: 0 })
for (const r of reviews.docs) {
  const productId = typeof r.product === 'object' ? r.product.id : r.product
  if (keep.has(productId)) continue
  const target = ids[demoReviews.find((d) => d.name === r.name)?.product ?? ''] ?? fallback
  await payload.update({ collection: 'reviews', id: r.id, data: { product: target } })
  console.log(`Recenzija ${r.name} -> proizvod ${target}`)
}

// --- 5. Brisanje starih proizvoda i varijanti
const old = await payload.find({
  collection: 'products',
  where: { id: { not_in: [...keep] } },
  pagination: false,
  depth: 0,
})
for (const p of old.docs) {
  await payload.delete({ collection: 'variants', where: { product: { equals: p.id } } })
  await payload.delete({ collection: 'products', id: p.id })
  console.log(`Obrisan stari proizvod: ${p.title}`)
}

// --- 6. Izdvojeni proizvodi na početnoj: prva četiri aktivna
const featured = products
  .filter((p) => (p.status ?? 'active') === 'active')
  .slice(0, 4)
  .map((p) => ids[p.slug])
const home = await payload.findGlobal({ slug: 'home-page', depth: 0 })
await payload.updateGlobal({
  slug: 'home-page',
  data: { featured: { ...home.featured, products: featured } },
})
console.log(`Početna, izdvojeni proizvodi: ${featured.join(', ')}`)
process.exit()
