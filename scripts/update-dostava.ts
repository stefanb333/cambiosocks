/**
 * Ispravlja rok isporuke i naziv kurirske službe u postojećoj bazi (D-096): "1 do 3 radna dana" ->
 * "1 do 5 radnih dana" i "AKS" -> "BEX". Menja samo te reči u tekstu stranica i dva polja u
 * Podešavanjima prodavnice; sve ostalo što je klijent menjao ostaje netaknuto.
 *
 * Provera bez upisa:  npm run payload -- run scripts/update-dostava.ts
 * Upis u bazu:        UPISI=1 npm run payload -- run scripts/update-dostava.ts
 */
import { getPayload } from 'payload'
import config from '@payload-config'

// Zastavica ide kroz okruženje: payload CLI ne prosleđuje dodatne argumente skripti.
const WRITE = process.env.UPISI === '1' || process.argv.includes('--upisi')

const RULES: [RegExp, string][] = [
  [/1 do 3 radna dana/g, '1 do 5 radnih dana'],
  [/1 do 3 dana/g, '1 do 5 dana'],
  [/\bAKS\b/g, 'BEX'],
  // Dostava je besplatna za sve porudžbine (cena u podešavanjima je 0), a tekstovi su pominjali
  // 300 RSD i prag od 2.000 RSD. Duža pravila idu prva, da kraća ne pokvare rečenicu.
  [
    /Cena dostave je 300 RSD po porudžbini\. Za porudžbine od 2\.000 RSD dostava je besplatna\./g,
    'Dostava je besplatna za sve porudžbine.',
  ],
  [
    /Dostava košta 300 RSD po porudžbini, a za porudžbine od 2\.000 RSD je besplatna\./g,
    'Dostava je besplatna za sve porudžbine.',
  ],
  [
    /Dostava 300 RSD, besplatna za porudžbine od 2\.000 RSD\./g,
    'Dostava je besplatna za sve porudžbine.',
  ],
  [/ za 300 RSD, besplatno od 2\.000 RSD/g, ', besplatno za sve porudžbine'],
  [/300 RSD za dostavu, besplatno od 2\.000 RSD/g, 'besplatna dostava'],
]

const fix = (s: string) => RULES.reduce((out, [from, to]) => out.replace(from, to), s)

/**
 * Polja koja nose tekst za čitanje. Namerno nije "svaki string": slug, blockType, url i slično
 * ne smeju da se diraju. Pored Lexical čvorova ("text"), ovde su i blokovi tipa česta pitanja.
 */
const TEXT_KEYS = new Set([
  'text',
  'question',
  'answer',
  'heading',
  'subheading',
  'subtitle',
  'intro',
  'body',
  'caption',
  'note',
  'description',
])

/** Menja samo tekstualna polja; struktura dokumenta ostaje ista. */
function fixNodes(value: unknown): { value: unknown; changed: number } {
  let changed = 0
  const walk = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(walk)
    if (node && typeof node === 'object') {
      const out: Record<string, unknown> = { ...(node as Record<string, unknown>) }
      for (const [key, val] of Object.entries(out)) {
        if (TEXT_KEYS.has(key) && typeof val === 'string') {
          const next = fix(val)
          if (next !== val) changed++
          out[key] = next
        } else out[key] = walk(val)
      }
      return out
    }
    return node
  }
  return { value: walk(value), changed }
}

const payload = await getPayload({ config })
console.log(WRITE ? '=== UPIS U BAZU ===' : '=== PROVERA (bez upisa) ===')

// 1) Podešavanja prodavnice: rok isporuke i tekst "Dostava i zamena" na stranici proizvoda.
const shop = (await payload.findGlobal({
  slug: 'shop-settings',
  depth: 0,
})) as unknown as Record<string, unknown>
const settingsPatch: Record<string, string> = {}
for (const field of ['deliveryEstimate', 'shippingInfo'] as const) {
  const before = typeof shop[field] === 'string' ? (shop[field] as string) : ''
  const after = fix(before)
  if (after !== before) {
    settingsPatch[field] = after
    console.log(`\nPodešavanja > ${field}\n  pre:  ${before}\n  posle:${after}`)
  }
}
if (Object.keys(settingsPatch).length && WRITE) {
  await payload.updateGlobal({ slug: 'shop-settings', data: settingsPatch })
  console.log('  -> sačuvano')
}

/** SEO naslov i opis (meta description, og, JSON-LD) čuvaju se odvojeno od sadržaja. */
function fixSeo(seo: unknown): { value: Record<string, unknown>; changed: number } | null {
  if (!seo || typeof seo !== 'object') return null
  const out = { ...(seo as Record<string, unknown>) }
  let changed = 0
  for (const key of ['title', 'description'] as const) {
    const val = out[key]
    if (typeof val !== 'string') continue
    const next = fix(val)
    if (next !== val) {
      out[key] = next
      changed++
    }
  }
  return changed ? { value: out, changed } : null
}

// 2) Stranice: zamena u tekstu sadržaja i u SEO opisu, uz zadržavanje ostalog.
const pages = await payload.find({ collection: 'pages', limit: 200, depth: 0, pagination: false })
for (const page of pages.docs) {
  const body = fixNodes(page.layout)
  const seo = fixSeo((page as { seo?: unknown }).seo)
  const total = body.changed + (seo?.changed ?? 0)
  if (!total) continue
  console.log(`\nStranica /${page.slug} — sadržaj: ${body.changed}, SEO: ${seo?.changed ?? 0}`)
  if (WRITE) {
    const data: Record<string, unknown> = {}
    if (body.changed) data.layout = body.value
    if (seo) data.seo = seo.value
    await payload.update({ collection: 'pages', id: page.id, data: data as never })
    console.log('  -> sačuvano')
  }
}

// 3) Objave na blogu: isti tekst može stajati u uvodu i SEO opisu.
const posts = await payload.find({ collection: 'posts', limit: 200, depth: 0, pagination: false })
for (const post of posts.docs) {
  const body = fixNodes((post as { content?: unknown }).content)
  const seo = fixSeo((post as { seo?: unknown }).seo)
  const excerptRaw = (post as { excerpt?: unknown }).excerpt
  const excerpt = typeof excerptRaw === 'string' ? fix(excerptRaw) : null
  const excerptChanged = excerpt !== null && excerpt !== excerptRaw
  const total = body.changed + (seo?.changed ?? 0) + (excerptChanged ? 1 : 0)
  if (!total) continue
  console.log(`\nObjava /${post.slug} — ${total} izmena`)
  if (WRITE) {
    const data: Record<string, unknown> = {}
    if (body.changed) data.content = body.value
    if (seo) data.seo = seo.value
    if (excerptChanged) data.excerpt = excerpt
    await payload.update({ collection: 'posts', id: post.id, data: data as never })
    console.log('  -> sačuvano')
  }
}

// 4) Proizvodi: opis, kratak opis i SEO mogu pominjati rok ili kurira.
const products = await payload.find({
  collection: 'products',
  limit: 200,
  depth: 0,
  pagination: false,
})
for (const p of products.docs) {
  const patch: Record<string, unknown> = {}
  const short = typeof p.shortDescription === 'string' ? p.shortDescription : ''
  if (fix(short) !== short) patch.shortDescription = fix(short)
  const desc = fixNodes(p.description)
  if (desc.changed) patch.description = desc.value
  const seo = fixSeo((p as { seo?: unknown }).seo)
  if (seo) patch.seo = seo.value
  if (!Object.keys(patch).length) continue
  console.log(`\nProizvod "${p.title}" — ${Object.keys(patch).join(', ')}`)
  if (WRITE) {
    await payload.update({ collection: 'products', id: p.id, data: patch as never })
    console.log('  -> sačuvano')
  }
}

console.log(WRITE ? '\nGotovo.' : '\nNijedna izmena nije upisana. Pokreni sa UPISI=1 za upis.')
process.exit(0)
