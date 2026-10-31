import { getAllListingProducts, sizeRangeLabel } from '@/lib/catalog/listing'
import { COMPANY } from '@/lib/company'
import { getShopInfo } from '@/lib/data'
import { formatPrice } from '@/lib/money'
import { getPayload } from '@/lib/payload'
import { absoluteUrl, SITE_URL } from '@/lib/seo'

export const revalidate = 3600

/**
 * /llms.txt (llmstxt.org): sažetak prodavnice za AI asistente i pretraživače (GEO, D-063).
 * Kratke, proverljive činjenice i linkovi na stranice sa detaljima, generisano iz baze.
 */
export async function GET() {
  const payload = await getPayload()
  const [products, shop, collections] = await Promise.all([
    getAllListingProducts(),
    getShopInfo(),
    payload.find({
      collection: 'shop-collections',
      depth: 0,
      limit: 0,
      pagination: false,
      sort: 'menuOrder',
      select: { title: true, slug: true, heroText: true },
    }),
  ])

  const lines = [
    '# Cambio čarape',
    '',
    '> Cambio je proizvođač čarapa iz Novog Pazara, Srbija. Od 1995. pravimo pamučne muške, ženske i sportske čarape u sopstvenoj fabrici i prodajemo ih online, sa dostavom na kućnu adresu širom Srbije i plaćanjem pouzećem.',
    '',
    '## Činjenice',
    `- Prodavac: ${COMPANY.legalName}, ${COMPANY.street}, ${COMPANY.city}, Srbija (MB ${COMPANY.registrationNumber}, PIB ${COMPANY.taxId})`,
    '- Proizvodnja: sopstvena fabrika u Novom Pazaru, 32 mašine za pletenje, više od 200.000 pari mesečno; godinama proizvodimo i za partnere u 5 zemalja regiona',
    '- Svaki par se pregleda pre pakovanja; čarape se isporučuju u zapečaćenom pakovanju',
    `- Dostava: ${formatPrice(shop.shippingPrice)} na teritoriji Srbije${shop.freeShippingThreshold ? `, besplatna za porudžbine od ${formatPrice(shop.freeShippingThreshold)}` : ''}, isporuka za ${shop.deliveryEstimate || '1 do 3 radna dana'}`,
    '- Plaćanje: pouzećem (gotovina kuriru), fiskalni račun uz pošiljku; cene su u dinarima sa PDV-om',
    '- Vraćanje: odustanak u roku od 14 dana od prijema (osim otvorenog zapečaćenog pakovanja, iz higijenskih razloga); reklamacija za nedostatke 2 godine',
    `- Kontakt: ${COMPANY.email}, ${COMPANY.phone} (${COMPANY.hours})`,
    '',
    '## Kolekcije',
    ...collections.docs.map(
      (c) =>
        `- [${c.title}](${absoluteUrl(`/kolekcije/${c.slug}`)})${c.heroText ? `: ${c.heroText}` : ''}`,
    ),
    '',
    '## Proizvodi',
    ...products.map((p) => {
      const sizes = sizeRangeLabel(p.sizes)
      const colors = p.colors.map((c) => c.name).join(', ')
      const facts = [
        `od ${formatPrice(p.minPrice)}`,
        // sizeRangeLabel vraća "Veličine 38-46"; ovde je usred rečenice, malim slovom
        sizes ? sizes.charAt(0).toLowerCase() + sizes.slice(1) : '',
        colors ? `boje: ${colors}` : '',
        p.available ? 'na stanju' : 'trenutno rasprodato',
      ].filter(Boolean)
      return `- [${p.title}](${absoluteUrl(`/proizvodi/${p.slug}`)}): ${facts.join(', ')}`
    }),
    '',
    '## Pomoć pri kupovini',
    `- [Česta pitanja](${absoluteUrl('/cesta-pitanja')}): poručivanje, dostava, veličine, plaćanje, zamena`,
    `- [Tabela veličina čarapa](${absoluteUrl('/blog/tabela-velicina-carapa')}): kako izabrati veličinu prema broju obuće`,
    `- [Dostava i plaćanje](${absoluteUrl('/dostava')})`,
    `- [Reklamacije i odustanak](${absoluteUrl('/reklamacije')})`,
    `- [Uslovi korišćenja i kupovine](${absoluteUrl('/uslovi-koriscenja')})`,
    `- [O nama](${absoluteUrl('/o-nama')}): priča o fabrici od 1995.`,
    `- [Blog](${absoluteUrl('/blog')}): saveti o održavanju, izboru i kombinovanju čarapa`,
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ]

  return new Response(lines.join('\n'), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
