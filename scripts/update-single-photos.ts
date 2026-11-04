/**
 * D-084/D-085: nove fotografije pojedinačnih parova (flat pa model), nove boje i aktivacija parova
 * (nazuvice i sportske). Paketi od 12 pari se ne diraju. Ažurira samo proizvode sa slug-om "-par"
 * u postojećoj bazi: tekst ostaje isti, menjaju se slike, boje i varijante.
 * Pokretanje (lokalno):  npm run payload -- run scripts/update-single-photos.ts
 * Demo (Supabase):       cross-env NODE_ENV=production node --env-file=.env.demo.local node_modules/payload/bin.js run scripts/update-single-photos.ts
 * Posle toga:            node scripts/revalidate.mjs
 */
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'
import { images, products, type ImageKey } from '../src/seed/content'
import { updateSeedProduct } from '../src/seed/create-product'

const payload = await getPayload({ config })
const file = (key: ImageKey) => path.resolve('src/seed/images', images[key].file)
const focalOf = (key: ImageKey) => {
  const img = images[key]
  return 'focal' in img ? { focalX: img.focal[0], focalY: img.focal[1] } : {}
}

// Samo pojedinačni parovi (slug završava na "-par").
const singles = products.filter((p) => p.slug.endsWith('-par'))

// 1. Slike: postojeće po alt tekstu, nove se otpremaju.
const media: Partial<Record<ImageKey, number>> = {}
for (const key of new Set(singles.flatMap((p) => p.images))) {
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
        overrideAccess: true,
      })
    ).id
  console.log(`Slika ${key}: ${media[key]}`)
}

// 2. Ažuriranje parova (id ostaje, pa recenzije i porudžbine i dalje pokazuju na njega).
for (const p of singles) {
  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: p.slug } },
    limit: 1,
    depth: 0,
  })
  if (!docs[0]) {
    console.log(`Preskočeno (nema u bazi): ${p.slug}`)
    continue
  }
  await updateSeedProduct(payload, docs[0].id, p, media, {})
  console.log(`Ažuriran par: ${p.title} (${p.status ?? 'active'}, boje: ${p.colors.length})`)
}

console.log('Gotovo.')
process.exit(0)
