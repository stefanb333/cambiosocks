/**
 * Jednokratno (D-073): nova dostava i cene paketa od 12 pari u postojećoj bazi.
 * - Podešavanja prodavnice: AKS, 300 RSD, besplatno od 2.000 RSD, isporuka 1 do 3 radna dana.
 * - Paketi od 12 pari: brišu se i prave ponovo iz src/seed/content.ts (nove cene, nazivi,
 *   veličine); slike se ne otpremaju ponovo, koriste se postojeće (po alt tekstu).
 * Tekstovi stranica (Dostava, FAQ, kolekcije) idu kroz update-legal-pages.ts i update-seo-content.ts.
 * Pokretanje (lokalno):  npm run payload -- run scripts/update-shipping-bundles.ts
 * Demo (Supabase):       cross-env NODE_ENV=production node --env-file=.env.demo.local node_modules/payload/bin.js run scripts/update-shipping-bundles.ts
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import { images, products, type ImageKey } from '../src/seed/content'
import { createSeedProduct } from '../src/seed/create-product'

const payload = await getPayload({ config })

await payload.updateGlobal({
  slug: 'shop-settings',
  data: {
    shippingPrice: 300,
    freeShippingThreshold: 2000,
    deliveryEstimate: '1 do 3 radna dana',
    shippingInfo:
      'Šaljemo kurirskom službom AKS, isporuka na teritoriji Srbije za 1 do 3 radna dana. Dostava 300 RSD, besplatna za porudžbine od 2.000 RSD. Plaćanje pouzećem. Zamena veličine u roku od 14 dana.',
  },
})
console.log('Podešavanja prodavnice: dostava 300 RSD, besplatno od 2.000 RSD, 1 do 3 radna dana')

for (const p of products.filter((x) => x.slug.startsWith('paket-12-pari-'))) {
  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: p.slug } },
    limit: 1,
    depth: 0,
  })
  if (docs[0]) {
    await payload.delete({ collection: 'variants', where: { product: { equals: docs[0].id } } })
    await payload.delete({ collection: 'products', id: docs[0].id })
  }
  const media: Partial<Record<ImageKey, number>> = {}
  for (const key of p.images) {
    const found = await payload.find({
      collection: 'media',
      where: { alt: { equals: images[key].alt } },
      limit: 1,
      depth: 0,
    })
    if (found.docs[0]) media[key] = found.docs[0].id
  }
  const id = await createSeedProduct(payload, p, media, {})
  console.log(`${p.title}: ${p.price} RSD (id ${id})`)
}
process.exit()
