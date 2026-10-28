/**
 * Menja fajl postojećih slika novim fajlom iz src/seed/images (isto ime, nova verzija), D-070.
 * Zapis slike u bazi ostaje isti (isti id, alt, fokus), pa sve stranice i proizvodi i dalje
 * pokazuju na nju; Payload pravi nove veličine i otprema ih (lokalno u media/ ili na S3).
 * Slika se nalazi po alt tekstu iz src/seed/content.ts (images).
 * Pokretanje (lokalno):  npm run payload -- run scripts/update-media-files.ts
 * Demo (Supabase):       cross-env NODE_ENV=production node --env-file=.env.demo.local node_modules/payload/bin.js run scripts/update-media-files.ts
 * Posle toga revalidacija (node scripts/revalidate.mjs) ili novi deploy.
 */
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'
import { images, type ImageKey } from '../src/seed/content'

// Poslednja zamena (28.10.2026., D-074): fotografije veće rezolucije iz D:/WEB/cambio/new.
// Ranija zamena (D-070): hero, catMen, catWomen, ctaBg, aboutBrand4, ctaCollection, plpCampaign,
// aboutHero, aboutBrand3.
const KEYS: ImageKey[] = [
  'hero',
  'plpCampaign',
  'catSport',
  'aboutBrand1',
  'aboutBrand2',
  'blogFeatured',
  'blogCotton',
]

const payload = await getPayload({ config })
let updated = 0
for (const key of KEYS) {
  const img = images[key]
  const { docs } = await payload.find({
    collection: 'media',
    where: { alt: { equals: img.alt } },
    limit: 2,
    depth: 0,
  })
  if (docs.length !== 1) {
    console.log(`${key}: pronađeno ${docs.length} slika sa tim alt tekstom, preskačem`)
    continue
  }
  try {
    const doc = await payload.update({
      collection: 'media',
      id: docs[0].id,
      data: {},
      filePath: path.resolve('src/seed/images', img.file),
      overrideAccess: true,
    })
    console.log(`${key}: ${img.file} -> ${doc.filename} (${doc.width}x${doc.height})`)
    updated++
  } catch (e) {
    console.log(`GREŠKA ${key}: ${(e as Error).message}`)
  }
}
console.log(`Zamenjeno slika: ${updated} od ${KEYS.length}`)
process.exit()
