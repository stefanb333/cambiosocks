/**
 * Ponovo otprema slike čiji fajl ne postoji u skladištu (S3/Supabase), iz src/seed/images, D-069.
 * Pri prvom demo seed-u na Supabase su zapisi slika napravljeni, a 25 od 26 fajlova nije stiglo
 * u bucket (sajt je vraćao 400 za slike). Zapis slike ostaje isti (isti id), pa linkovi na sajtu
 * ne pucaju; menja se samo ime fajla. Posle pokretanja je potreban novi deploy ili revalidacija.
 * Pokretanje: cross-env NODE_ENV=production node --env-file=.env.demo.local node_modules/payload/bin.js run scripts/reupload-missing-media.ts
 */
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'
import { images } from '../src/seed/content'

const payload = await getPayload({ config })
const { docs } = await payload.find({ collection: 'media', pagination: false, depth: 0 })
const byAlt = new Map(Object.values(images).map((img) => [img.alt, img.file]))
let fixed = 0
for (const doc of docs) {
  const ok = doc.url ? (await fetch(doc.url, { method: 'HEAD' })).status === 200 : false
  if (ok) continue
  const file = byAlt.get(doc.alt ?? '')
  if (!file) {
    console.log(`Nema izvorne slike za ${doc.id} (${doc.filename})`)
    continue
  }
  try {
    const updated = await payload.update({
      collection: 'media',
      id: doc.id,
      data: {},
      filePath: path.resolve('src/seed/images', file),
      overrideAccess: true,
    })
    const status = (await fetch(updated.url as string, { method: 'HEAD' })).status
    console.log(`${doc.id} ${file} -> ${updated.filename} (${status})`)
    if (status === 200) fixed++
  } catch (e) {
    console.log(`GREŠKA ${doc.id} ${file}: ${(e as Error).message}`)
  }
}
console.log(`Ponovo otpremljeno: ${fixed}, ukupno slika: ${docs.length}`)
process.exit()
