/**
 * Jednokratno (D-067): uklanja link "Uskoro" (/blog#uskoro) iz footera u postojećoj bazi, jer
 * sekcija "Uskoro u prodaji" više ne postoji. Bezbedno više puta.
 * Pokretanje: npm run payload -- run scripts/remove-upcoming.ts, pa node scripts/revalidate.mjs
 */
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
const footer = await payload.findGlobal({ slug: 'footer', depth: 0 })
const groups = (footer.groups ?? []).map((group) => ({
  ...group,
  links: (group.links ?? []).filter((link) => !link.url?.startsWith('/blog#uskoro')),
}))
const removed =
  (footer.groups ?? []).reduce((n, g) => n + (g.links?.length ?? 0), 0) -
  groups.reduce((n, g) => n + g.links.length, 0)

if (removed) {
  await payload.updateGlobal({ slug: 'footer', data: { groups } })
  console.log(`Uklonjeno linkova: ${removed}`)
} else {
  console.log('Link "Uskoro" nije u footeru.')
}
process.exit()
