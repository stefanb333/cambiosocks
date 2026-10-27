/**
 * Upisuje SEO tekstove (D-063) u postojeću bazu, bez ponovnog seed-a: početna, kolekcije,
 * proizvodi (po slug-u), SEO naslovi i opisi stranica, FAQ i blog (postojeći članci se ažuriraju,
 * novi se prave). Slike, cene, varijante i ostala podešavanja ostaju netaknuti.
 * Pokretanje: npm run payload -- run scripts/update-seo-content.ts, pa node scripts/revalidate.mjs
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import { markdownToLexical } from '../src/lib/richtext'
import * as content from '../src/seed/content'

const payload = await getPayload({ config })
const log = (msg: string) => console.log(msg)

// --- Početna
const home = await payload.findGlobal({ slug: 'home-page', depth: 0 })
const h = content.home
await payload.updateGlobal({
  slug: 'home-page',
  data: {
    hero: { ...home.hero, heading: h.hero.heading, subheading: h.hero.subheading },
    categories: {
      ...home.categories,
      heading: h.categories.heading,
      subheading: h.categories.subheading,
      cards: (home.categories?.cards ?? []).map((card, i) => ({
        ...card,
        title: h.categories.cards[i]?.title ?? card.title,
        text: h.categories.cards[i]?.text ?? card.text,
      })),
    },
    ctaBanner: { ...home.ctaBanner, text: h.ctaBanner.text },
  },
})
log('Početna: naslov, podnaslov i tekstovi kartica')

// --- Footer: naziv sportske kolekcije prati novi naziv ("Sportske čarape")
const footer = await payload.findGlobal({ slug: 'footer', depth: 0 })
await payload.updateGlobal({
  slug: 'footer',
  data: {
    groups: (footer.groups ?? []).map((g) => ({
      ...g,
      links: (g.links ?? []).map((l) =>
        l.url === '/kolekcije/sport-i-aktivne' ? { ...l, label: 'Sportske čarape' } : l,
      ),
    })),
  },
})
log('Footer: link na sportske čarape')

// --- Kolekcije
for (const c of content.collections) {
  const { docs } = await payload.find({
    collection: 'shop-collections',
    where: { slug: { equals: c.slug } },
    limit: 1,
    depth: 0,
  })
  if (!docs[0]) continue
  await payload.update({
    collection: 'shop-collections',
    id: docs[0].id,
    data: {
      title: c.title,
      heroHeading: c.heroHeading,
      heroText: c.heroText,
      description: markdownToLexical(c.description) as never,
      seo: { ...docs[0].seo, ...c.seo },
    },
  })
  log(`Kolekcija: /kolekcije/${c.slug}`)
}

// --- Proizvodi (samo tekstovi; cene, varijante i slike ostaju)
for (const p of content.products) {
  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: p.slug } },
    limit: 1,
    depth: 0,
  })
  if (!docs[0]) continue
  await payload.update({
    collection: 'products',
    id: docs[0].id,
    data: {
      title: p.title,
      shortDescription: p.shortDescription,
      description: markdownToLexical(p.description) as never,
      seo: { ...docs[0].seo, ...p.seo },
    },
  })
  log(`Proizvod: /proizvodi/${p.slug}`)
}

// --- Stranice: SEO naslov i opis; FAQ dobija nova pitanja
for (const [slug, seo] of Object.entries(content.pageSeo)) {
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  const page = docs[0]
  if (!page) continue
  const layout =
    slug === 'cesta-pitanja'
      ? (page.layout ?? []).map((block) =>
          block.blockType === 'faq'
            ? {
                ...block,
                description: content.faq.description,
                items: content.faq.items.map((q) => ({ ...q })),
              }
            : block,
        )
      : page.layout
  await payload.update({
    collection: 'pages',
    id: page.id,
    data: { seo: { ...page.seo, ...seo }, layout, _status: 'published' },
  })
  log(`Stranica: /${slug}`)
}

// --- Blog: postojeći članci po slug-u, novi (npr. tabela veličina) se prave
const mediaId = async (key: content.ImageKey) => {
  const { docs } = await payload.find({
    collection: 'media',
    where: { filename: { equals: content.images[key].file } },
    limit: 1,
    depth: 0,
  })
  return docs[0]?.id
}
for (const post of content.posts) {
  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: post.slug } },
    limit: 1,
    depth: 0,
  })
  const data = {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    subtitle: 'subtitle' in post ? post.subtitle : undefined,
    readTime: post.readTime,
    content: markdownToLexical(post.body) as never,
    tags: post.tags,
    seo: { title: post.seoTitle, description: post.excerpt.slice(0, 160) },
    _status: 'published' as const,
  }
  if (docs[0]) {
    await payload.update({ collection: 'posts', id: docs[0].id, data })
    log(`Članak ažuriran: /blog/${post.slug}`)
  } else {
    await payload.create({
      collection: 'posts',
      data: {
        ...data,
        coverImage: await mediaId(post.image),
        featured: post.featured,
        publishedAt: post.publishedAt,
      },
    })
    log(`Članak napravljen: /blog/${post.slug}`)
  }
}

process.exit()
