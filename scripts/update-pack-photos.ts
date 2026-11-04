/**
 * D-089: paketi od 12 pari koriste iste nove flat fotografije kao pojedinačni proizvodi
 * (deljene po alt tekstu), bez zasebnih "bundle" slika i žute pozadine. Ova skripta re-sinhronizuje
 * sve aktivne pakete iz seed opisa: slike, boje i varijante (id proizvoda ostaje isti).
 * Preduslov: parovi su već ažurirani (scripts/update-single-photos.ts), pa flat slike postoje.
 * Lokalno:  npm run payload -- run scripts/update-pack-photos.ts
 * Demo:     NODE_ENV=production node --env-file=.env.demo.local node_modules/payload/bin.js run scripts/update-pack-photos.ts
 * Posle:    node scripts/revalidate.mjs
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

// Paketi: slug ne završava na "-par", imaju bar jednu sliku (sportski paket je prazan nacrt).
const packs = products.filter((p) => !p.slug.endsWith('-par') && p.images.length)

// Slike: postojeće po alt tekstu (dele se sa parovima), nove se otpremaju.
const media: Partial<Record<ImageKey, number>> = {}
for (const key of new Set(packs.flatMap((p) => p.images))) {
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

for (const p of packs) {
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
  console.log(`Ažuriran paket: ${p.title} (boje: ${p.colors.length})`)
}

console.log('Gotovo.')
process.exit(0)
