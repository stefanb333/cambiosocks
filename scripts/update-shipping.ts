/**
 * Jednokratno (D-073): nova dostava u postojećoj bazi (Podešavanja prodavnice): AKS, 300 RSD,
 * besplatno od 2.000 RSD, isporuka 1 do 3 radna dana. Katalog (cene paketa) ide kroz
 * replace-catalog.ts (D-075).
 * Tekstovi stranica (Dostava, FAQ, kolekcije) idu kroz update-legal-pages.ts i update-seo-content.ts.
 * Pokretanje (lokalno):  npm run payload -- run scripts/update-shipping.ts
 * Demo (Supabase):       cross-env NODE_ENV=production node --env-file=.env.demo.local node_modules/payload/bin.js run scripts/update-shipping.ts
 */
import { getPayload } from 'payload'
import config from '@payload-config'

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

process.exit()
