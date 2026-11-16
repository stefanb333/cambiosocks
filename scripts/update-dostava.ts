/**
 * Ispravlja rok isporuke i naziv kurirske službe u postojećoj bazi (D-096): "1 do 3 radna dana" ->
 * "1 do 5 radnih dana" i "AKS" -> "BEX". Menja samo te reči u tekstu stranica i dva polja u
 * Podešavanjima prodavnice; sve ostalo što je klijent menjao ostaje netaknuto.
 *
 * Provera bez upisa:  npm run payload -- run scripts/update-dostava.ts
 * Upis u bazu:        npm run payload -- run scripts/update-dostava.ts --upisi
 */
import { getPayload } from 'payload'
import config from '@payload-config'

const WRITE = process.argv.includes('--upisi')

const RULES: [RegExp, string][] = [
  [/1 do 3 radna dana/g, '1 do 5 radnih dana'],
  [/1 do 3 dana/g, '1 do 5 dana'],
  [/\bAKS\b/g, 'BEX'],
]

const fix = (s: string) => RULES.reduce((out, [from, to]) => out.replace(from, to), s)

/** Menja samo "text" čvorove u Lexical sadržaju; struktura dokumenta ostaje ista. */
function fixNodes(value: unknown): { value: unknown; changed: number } {
  let changed = 0
  const walk = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(walk)
    if (node && typeof node === 'object') {
      const out: Record<string, unknown> = { ...(node as Record<string, unknown>) }
      for (const [key, val] of Object.entries(out)) {
        if (key === 'text' && typeof val === 'string') {
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
const shop = (await payload.findGlobal({ slug: 'shop-settings', depth: 0 })) as Record<
  string,
  unknown
>
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

// 2) Stranice: zamena samo u tekstu, uz zadržavanje ostalog sadržaja.
const pages = await payload.find({ collection: 'pages', limit: 200, depth: 0, pagination: false })
for (const page of pages.docs) {
  const { value, changed } = fixNodes(page.layout)
  if (!changed) continue
  console.log(`\nStranica /${page.slug} — ${changed} ${changed === 1 ? 'izmena' : 'izmena'}`)
  if (WRITE) {
    await payload.update({
      collection: 'pages',
      id: page.id,
      data: { layout: value as never },
    })
    console.log('  -> sačuvano')
  }
}

// 3) Proizvodi: opis i kratak opis mogu pominjati rok ili kurira.
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
  if (!Object.keys(patch).length) continue
  console.log(`\nProizvod "${p.title}" — ${Object.keys(patch).join(', ')}`)
  if (WRITE) {
    await payload.update({ collection: 'products', id: p.id, data: patch as never })
    console.log('  -> sačuvano')
  }
}

console.log(WRITE ? '\nGotovo.' : '\nNijedna izmena nije upisana. Dodaj --upisi za upis.')
process.exit(0)
