/**
 * D-080: Instagram i Facebook umesto TikTok-a, i popravka linkova u tekstovima, u postojećoj bazi.
 * - Podešavanja prodavnice: Instagram i Facebook URL.
 * - Footer: link "TikTok" postaje "Facebook" (URL se uzima iz Podešavanja prodavnice).
 * - Opisi kolekcija i proizvoda, članci i stranice: tekst oblika "[naziv](/putanja)" koji je
 *   ostao kao običan tekst (link unutar podebljanog teksta, stari seed) postaje pravi link.
 *   Ostatak teksta, uključujući izmene iz admina, ostaje netaknut.
 * Pokretanje: npm run payload -- run scripts/update-social-links.ts, pa node scripts/revalidate.mjs
 * (migracija 20261031_120000_facebook_instead_of_tiktok mora biti primenjena pre ovoga).
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import { contact, home as homeContent } from '../src/seed/content'

const payload = await getPayload({ config })
const log = (msg: string) => console.log(msg)

// --- Podešavanja prodavnice
await payload.updateGlobal({
  slug: 'shop-settings',
  data: { instagram: contact.instagram, facebook: contact.facebook },
})
log(`Podešavanja: Instagram ${contact.instagram}, Facebook ${contact.facebook}`)

// --- Footer
const footer = await payload.findGlobal({ slug: 'footer', depth: 0 })
await payload.updateGlobal({
  slug: 'footer',
  data: {
    groups: (footer.groups ?? []).map((g) => ({
      ...g,
      links: (g.links ?? []).map((l) =>
        /tiktok/i.test(l.label) ? { ...l, label: 'Facebook ↗', url: '', newTab: true } : l,
      ),
    })),
  },
})
log('Footer: TikTok zamenjen Facebook-om')

// --- Početna: oznake na karticama kategorija i tekst newslettera (ostalo radi update-seo-content.ts)
const home = await payload.findGlobal({ slug: 'home-page', depth: 0 })
await payload.updateGlobal({
  slug: 'home-page',
  data: {
    categories: {
      ...home.categories,
      subheading: homeContent.categories.subheading,
      cards: (home.categories?.cards ?? []).map((card, i) => ({
        ...card,
        tag1: homeContent.categories.cards[i]?.tag1 ?? card.tag1,
      })),
    },
    newsletter: { ...home.newsletter, note: homeContent.newsletter.note },
  },
})
log('Početna: oznake kartica i tekst newslettera')

// --- Linkovi u rich text poljima
type Node = { type?: string; text?: string; children?: Node[]; [key: string]: unknown }
const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g

const splitText = (node: Node): Node[] => {
  const text = node.text ?? ''
  if (!LINK.test(text)) return [node]
  LINK.lastIndex = 0
  const out: Node[] = []
  let last = 0
  for (const m of text.matchAll(LINK)) {
    if (m.index > last) out.push({ ...node, text: text.slice(last, m.index) })
    out.push({
      type: 'link',
      version: 3,
      direction: 'ltr',
      format: '',
      indent: 0,
      fields: { linkType: 'custom', url: m[2], newTab: false },
      children: [{ ...node, text: m[1] }],
    })
    last = m.index + m[0].length
  }
  if (last < text.length) out.push({ ...node, text: text.slice(last) })
  return out
}

let fixed = 0
const fix = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(fix)
  if (!value || typeof value !== 'object') return value
  const node = value as Node
  const copy: Node = {}
  for (const [k, v] of Object.entries(node)) copy[k] = fix(v)
  if (Array.isArray(copy.children)) {
    copy.children = copy.children.flatMap((child) => {
      if (child?.type !== 'text') return [child]
      const parts = splitText(child)
      if (parts.length > 1 || parts[0] !== child) fixed++
      return parts
    })
  }
  return copy
}

const targets = [
  { collection: 'shop-collections', field: 'description' },
  { collection: 'products', field: 'description' },
  { collection: 'posts', field: 'content' },
  { collection: 'pages', field: 'layout' },
] as const

for (const { collection, field } of targets) {
  const { docs } = await payload.find({ collection, pagination: false, depth: 0 })
  for (const doc of docs) {
    const before = fixed
    const current = (doc as unknown as Record<string, unknown>)[field]
    if (!current) continue
    const next = fix(current)
    if (fixed === before) continue
    await payload.update({ collection, id: doc.id, data: { [field]: next } as never })
    log(
      `${collection}: ${(doc as unknown as { slug?: string }).slug ?? doc.id}, linkova: ${fixed - before}`,
    )
  }
}

log(`Gotovo. Popravljeno linkova: ${fixed}`)
process.exit(0)
