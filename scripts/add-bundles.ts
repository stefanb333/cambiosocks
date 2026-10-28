/**
 * Dodaje demo pakete od 12 pari (D-071) u postojeću bazu: slike iz src/seed/images i proizvode
 * sa varijantama iz src/seed/content.ts. Proizvod koji već postoji (isti slug) se preskače.
 * Pokretanje (lokalno):  npm run payload -- run scripts/add-bundles.ts
 * Demo (Supabase):       cross-env NODE_ENV=production node --env-file=.env.demo.local node_modules/payload/bin.js run scripts/add-bundles.ts
 * Posle toga revalidacija (node scripts/revalidate.mjs).
 */
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'
import { images, products, type ImageKey } from '../src/seed/content'
import { createSeedProduct } from '../src/seed/create-product'

const payload = await getPayload({ config })
const bundles = products.filter((p) => p.slug.startsWith('paket-12-pari-'))
const media: Partial<Record<ImageKey, number>> = {}

for (const p of bundles) {
  const exists = await payload.count({
    collection: 'products',
    where: { slug: { equals: p.slug } },
  })
  if (exists.totalDocs) {
    console.log(`Postoji, preskačem: ${p.slug}`)
    continue
  }
  for (const key of p.images) {
    if (media[key]) continue
    const img = images[key]
    const found = await payload.find({
      collection: 'media',
      where: { alt: { equals: img.alt } },
      limit: 1,
      depth: 0,
    })
    media[key] =
      found.docs[0]?.id ??
      (
        await payload.create({
          collection: 'media',
          data: {
            alt: img.alt,
            ...('focal' in img ? { focalX: img.focal[0], focalY: img.focal[1] } : {}),
          },
          filePath: path.resolve('src/seed/images', img.file),
        })
      ).id
  }
  const id = await createSeedProduct(payload, p, media, {})
  console.log(`Dodat: ${p.title} (id ${id})`)
}
process.exit()
