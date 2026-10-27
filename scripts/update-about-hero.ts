/**
 * Jednokratno: upisuje naslov i podnaslov hero sekcije stranice "O nama" iz Figme (60:766)
 * u postojeću bazu, bez ponovnog seed-a. Pokretanje: npm run payload -- run scripts/update-about-hero.ts
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import { about } from '../src/seed/content'

const payload = await getPayload({ config })
const { docs } = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'o-nama' } },
  limit: 1,
  depth: 0,
})
const page = docs[0]
if (!page) throw new Error('Stranica o-nama ne postoji.')
const layout = (page.layout ?? []).map((block) =>
  block.blockType === 'pageHero'
    ? { ...block, heading: about.hero.heading, subheading: about.hero.subheading }
    : block,
)
await payload.update({ collection: 'pages', id: page.id, data: { layout, _status: 'published' } })
console.log('O nama hero ažuriran:', about.hero.heading)
process.exit()
