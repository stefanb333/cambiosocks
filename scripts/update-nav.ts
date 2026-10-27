/**
 * Jednokratno (D-065): dodaje "Blog" u glavnu navigaciju (posle "O Nama") u postojećoj bazi,
 * bez ponovnog seed-a. Ako stavka već postoji, ništa se ne menja.
 * Pokretanje: npm run payload -- run scripts/update-nav.ts, pa node scripts/revalidate.mjs
 */
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
const header = await payload.findGlobal({ slug: 'header', depth: 0 })
const items = header.navItems ?? []

if (items.some((item) => item.url === '/blog')) {
  console.log('Blog je već u navigaciji.')
} else {
  const at = items.findIndex((item) => item.url === '/o-nama')
  const next = [...items]
  next.splice(at >= 0 ? at + 1 : next.length, 0, {
    label: 'Blog',
    url: '/blog',
    showCollections: false,
    children: [],
  })
  await payload.updateGlobal({ slug: 'header', data: { navItems: next } })
  console.log('Navigacija:', next.map((item) => item.label).join(', '))
}
process.exit()
