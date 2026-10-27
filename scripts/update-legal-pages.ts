/**
 * Upisuje pravne stranice (Uslovi, Privatnost, Dostava, Reklamacije i odustanak) i pravne linkove
 * u footer-u u postojeću bazu, bez ponovnog seed-a (D-061). Postojeće stranice se ažuriraju po
 * slug-u, a one koje ne postoje se prave. Pokretanje: npm run payload -- run scripts/update-legal-pages.ts
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import { markdownToLexical } from '../src/lib/richtext'
import { footerCopyright, footerLegalLinks, legalPages } from '../src/seed/legal'

const payload = await getPayload({ config })

for (const page of legalPages) {
  const data = {
    title: page.title,
    slug: page.slug,
    _status: 'published' as const,
    layout: [{ blockType: 'richText' as const, content: markdownToLexical(page.body) }],
  }
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: page.slug } },
    limit: 1,
    depth: 0,
  })
  if (docs[0]) await payload.update({ collection: 'pages', id: docs[0].id, data })
  else await payload.create({ collection: 'pages', data })
  console.log(`${docs[0] ? 'Ažurirano' : 'Napravljeno'}: /${page.slug}`)
}

// location: adresa je sada u copyright redu, pa se "Novi Pazar · Srbija" ne ponavlja
await payload.updateGlobal({
  slug: 'footer',
  data: { legalLinks: footerLegalLinks, copyright: footerCopyright, location: '' },
})
console.log('Footer: pravni linkovi i podaci o firmi upisani.')
process.exit()
