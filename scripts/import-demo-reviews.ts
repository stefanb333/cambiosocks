/**
 * Jednokratno (D-068): prebacuje dosadašnje recenzije sa početne (tekstovi iz Figme) u kolekciju
 * Recenzije, kao odobrene i označene za početnu. Preskače se ako recenzije već postoje.
 * Ocena proizvoda se preračunava sama (hook u collections/Reviews.ts); proizvodima bez odobrenih
 * recenzija briše se ranije ručno uneta (demo) ocena.
 * Pokretanje: npm run payload -- run scripts/import-demo-reviews.ts, pa node scripts/revalidate.mjs
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import { demoReviews } from '../src/seed/content'

const payload = await getPayload({ config })
const existing = await payload.count({ collection: 'reviews' })

if (existing.totalDocs) {
  console.log(`Recenzije već postoje (${existing.totalDocs}), ništa nije dodato.`)
} else {
  let added = 0
  for (const r of demoReviews) {
    const { docs } = await payload.find({
      collection: 'products',
      where: { slug: { equals: r.product } },
      limit: 1,
      depth: 0,
    })
    if (!docs[0]) {
      console.log(`Proizvod ${r.product} ne postoji, preskačem: ${r.name}`)
      continue
    }
    await payload.create({
      collection: 'reviews',
      data: {
        product: docs[0].id,
        name: r.name,
        text: r.text,
        rating: 5,
        status: 'approved',
        featured: true,
      },
    })
    added++
  }
  console.log(`Dodato recenzija: ${added}`)
}
// Proizvodi bez odobrenih recenzija: bez ocene (ranije demo vrednosti, npr. 4.8 / 32)
const approved = await payload.find({
  collection: 'reviews',
  where: { status: { equals: 'approved' } },
  select: { product: true },
  pagination: false,
  depth: 0,
})
const withReviews = new Set(approved.docs.map((r) => r.product))
const products = await payload.find({
  collection: 'products',
  select: { ratingCount: true, rating: true },
  pagination: false,
  depth: 0,
})
for (const product of products.docs) {
  if (withReviews.has(product.id) || (!product.rating && !product.ratingCount)) continue
  await payload.update({
    collection: 'products',
    id: product.id,
    data: { rating: null, ratingCount: 0 },
    depth: 0,
  })
  console.log(`Ocena obrisana: proizvod ${product.id}`)
}
process.exit()
