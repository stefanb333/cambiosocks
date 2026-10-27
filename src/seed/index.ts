/**
 * Seed: popunjava bazu početnim sadržajem (slike, kolekcije, demo proizvodi sa varijantama,
 * stranice, blog, globals, popust za newsletter).
 *
 * Pokretanje: npm run seed            (preskače ako već postoje proizvodi)
 *             npm run seed:reset (briše sav sadržaj osim korisnika i puni ponovo)
 *
 * Admin nalog se pravi samo ako su postavljeni SEED_ADMIN_EMAIL i SEED_ADMIN_PASSWORD.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { sql } from '@payloadcms/db-postgres'
import { getPayload, type CollectionSlug, type Payload } from 'payload'
import config from '@payload-config'
import * as content from './content'
import { syncProductAggregates } from '../lib/catalog/aggregates'
import { markdownToLexical } from '../lib/richtext'
import { slugify } from '../lib/slugify'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const imagesDir = path.resolve(dirname, 'images')
const ctx = { disableRevalidate: true }

async function wipe(payload: Payload) {
  const order: CollectionSlug[] = [
    'orders',
    'customers',
    'discounts',
    'subscribers',
    'reviews',
    'variants',
    'products',
    'shop-collections',
    'pages',
    'posts',
    'media',
  ]
  for (const collection of order) {
    // Pojedinačno brisanje: jedan neuspeo dokument (npr. slika čiji fajl više ne postoji)
    // ne poništava brisanje ostalih, kao što bi se desilo u jednoj velikoj transakciji.
    const { docs } = await payload.find({
      collection,
      limit: 1000,
      depth: 0,
      pagination: false,
      select: {},
    })
    for (const doc of docs) {
      await payload
        .delete({ collection, id: doc.id, context: { ...ctx, skipAggregateSync: true } })
        .catch((error) =>
          payload.logger.warn(`Nije obrisano ${collection}/${doc.id}: ${(error as Error).message}`),
        )
    }
  }
  const db = payload.db as unknown as { drizzle: { execute: (q: unknown) => Promise<unknown> } }
  await db.drizzle.execute(sql`ALTER SEQUENCE IF EXISTS order_number_seq RESTART WITH 1001`)
}

async function seed() {
  const payload = await getPayload({ config })
  const reset = process.argv.includes('--reset') || process.env.SEED_RESET === '1'

  const existing = await payload.count({ collection: 'products' })
  if (existing.totalDocs > 0 && !reset) {
    payload.logger.info('Baza već ima proizvode. Za ponovno punjenje: npm run seed:reset')
    return
  }
  if (reset) {
    payload.logger.info('Brišem postojeći sadržaj (korisnici ostaju)...')
    await wipe(payload)
  }

  // --- Admin ---
  const { SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD } = process.env
  if (SEED_ADMIN_EMAIL && SEED_ADMIN_PASSWORD) {
    const found = await payload.find({
      collection: 'users',
      where: { email: { equals: SEED_ADMIN_EMAIL } },
      limit: 1,
    })
    if (!found.totalDocs) {
      await payload.create({
        collection: 'users',
        data: {
          email: SEED_ADMIN_EMAIL,
          password: SEED_ADMIN_PASSWORD,
          name: 'Administrator',
          role: 'admin',
        },
      })
      payload.logger.info(`Admin nalog napravljen: ${SEED_ADMIN_EMAIL}`)
    }
  }

  // --- Slike ---
  payload.logger.info('Otpremam slike...')
  const media = {} as Record<content.ImageKey, number>
  for (const [key, img] of Object.entries(content.images) as [
    content.ImageKey,
    content.SeedImage,
  ][]) {
    const doc = await payload.create({
      collection: 'media',
      data: { alt: img.alt, ...(img.focal ? { focalX: img.focal[0], focalY: img.focal[1] } : {}) },
      filePath: path.join(imagesDir, img.file),
      context: ctx,
    })
    media[key] = doc.id as number
  }

  // --- Kolekcije ---
  payload.logger.info('Pravim kolekcije...')
  const collectionIds: Record<string, number> = {}
  for (const c of content.collections) {
    const doc = await payload.create({
      collection: 'shop-collections',
      context: ctx,
      data: {
        title: c.title,
        slug: c.slug,
        heroHeading: c.heroHeading,
        heroText: c.heroText,
        description: markdownToLexical(c.description),
        image: media[c.image],
        type: 'automatic',
        match: 'all',
        rules: c.rules.map((r) => ({ field: r.field, value: r.value })),
        defaultSort: 'featured',
        showInMenu: c.showInMenu,
        menuOrder: c.menuOrder,
        seo: c.seo,
      },
    })
    collectionIds[c.key] = doc.id as number
  }
  const pills = ['sve', 'muske', 'zenske', 'sport'].map((k) => collectionIds[k])
  for (const id of Object.values(collectionIds)) {
    await payload.update({
      collection: 'shop-collections',
      id,
      data: { quickLinks: pills },
      context: ctx,
    })
  }

  // --- Proizvodi i varijante ---
  payload.logger.info('Pravim proizvode i varijante...')
  const productIds: number[] = []
  for (const p of content.products) {
    const product = await payload.create({
      collection: 'products',
      context: { ...ctx, skipAggregateSync: true },
      data: {
        title: p.title,
        slug: p.slug,
        status: 'active',
        shortDescription: p.shortDescription,
        description: markdownToLexical(p.description),
        productType: p.productType,
        brand: 'Cambio',
        tags: p.tags,
        category: p.category as never,
        pattern: p.pattern as never,
        gallery: p.images.map((k) => ({ image: media[k] })),
        defaultPrice: p.price,
        defaultCompareAtPrice: p.compareAtPrice,
        // Redosled kao u Figmi (52:1603): prvo "Odaberi Veličinu", pa "Dostupne Boje".
        options: [
          { name: 'Veličina', kind: 'size', values: p.sizes.map((s) => ({ value: s })) },
          {
            name: 'Boja',
            kind: 'color',
            values: p.colors.map((c) => ({ value: c.value, swatch: c.swatch })),
          },
        ],
        seo: p.seo,
      },
    })
    productIds.push(product.id as number)

    let position = 0
    for (const color of p.colors) {
      for (const size of p.sizes) {
        const soldOut = p.soldOut?.includes(`${color.value}/${size}`)
        await payload.create({
          collection: 'variants',
          context: { ...ctx, skipAggregateSync: true },
          data: {
            product: product.id,
            option1: size,
            option2: color.value,
            price: p.price,
            compareAtPrice: p.compareAtPrice,
            sku: `CAM-${p.skuCode}-${slugify(color.value).toUpperCase()}-${size.replace('-', '')}`,
            stock: soldOut ? 0 : 25,
            trackInventory: true,
            allowBackorder: false,
            image: color.image ? media[color.image] : undefined,
            position: position++,
          },
        })
      }
    }
    // Jednom preračunaj izvedena polja (cene, zaliha, filteri) posle svih varijanti.
    await syncProductAggregates(payload, product.id)
  }

  // --- Demo recenzije (odobrene, na početnoj); ocena proizvoda se računa iz njih (D-068) ---
  for (const r of content.demoReviews) {
    const index = content.products.findIndex((p) => p.slug === r.product)
    if (index < 0) continue
    await payload.create({
      collection: 'reviews',
      context: ctx,
      data: {
        product: productIds[index],
        name: r.name,
        text: r.text,
        rating: 5,
        status: 'approved',
        featured: true,
      },
    })
  }

  // --- Globals ---
  payload.logger.info('Popunjavam globals...')
  const h = content.home
  await payload.updateGlobal({
    slug: 'home-page',
    context: ctx,
    data: {
      hero: { ...h.hero, image: media.hero },
      categories: {
        heading: h.categories.heading,
        subheading: h.categories.subheading,
        cards: h.categories.cards.map((c) => ({ ...c, image: media[c.image] })),
      },
      featured: { ...h.featured, products: productIds.slice(0, 4) },
      ctaBanner: {
        ...h.ctaBanner,
        image: media.ctaBg,
        pillImage: media.ctaPill,
        collectionImage: media.ctaCollection,
      },
      reviews: h.reviews,
      newsletter: { ...h.newsletter, image: media.newsletter },
    },
  })

  // Header i footer: stavke i tekstovi 1:1 iz Figme (navbar 52:1066, Brand footer 50:604).
  await payload.updateGlobal({
    slug: 'header',
    context: ctx,
    data: {
      searchPlaceholder: 'Pretraži Proizvod',
      navItems: [
        { label: 'Početna', url: '/' },
        { label: 'Kategorije', url: '/kolekcije/sve', showCollections: true },
        { label: 'O Nama', url: '/o-nama' },
        { label: 'Blog', url: '/blog' },
        { label: 'Kontakt', url: '/kontakt' },
      ],
    },
  })

  await payload.updateGlobal({
    slug: 'footer',
    context: ctx,
    data: {
      heading: 'Dobrodošli u Cambio svet',
      emailPlaceholder: 'Vaša e-mail adresa',
      buttonLabel: 'Prijavi se',
      newsletterNote:
        'Uzmi 10% popusta na prvu porudžbinu i budi prvi koji saznaje za nove kolekcije.',
      groups: [
        {
          heading: 'O Nama',
          links: [
            { label: 'Naša Priča', url: '/o-nama' },
            { label: 'Česta Pitanja', url: '/cesta-pitanja' },
            { label: 'Cambio Blog', url: '/blog' },
          ],
        },
        {
          heading: 'Kolekcije',
          links: [
            { label: 'Muške čarape', url: '/kolekcije/muske-carape' },
            { label: 'Ženske čarape', url: '/kolekcije/zenske-carape' },
            { label: 'Sportske čarape', url: '/kolekcije/sport-i-aktivne' },
          ],
        },
        {
          heading: 'Kontakt',
          links: [
            // URL-ovi profila nisu poznati (D-021): dok se ne unesu, prikazuje se samo tekst.
            { label: 'Instagram ↗', url: '', newTab: true },
            { label: 'TikTok ↗', url: '', newTab: true },
            { label: 'Kontakt', url: '/kontakt' },
            { label: 'E-mail', url: 'mailto:cambio.carape@gmail.com' },
          ],
        },
      ],
      legalLinks: content.footerLegalLinks,
      copyright: content.footerCopyright,
      location: '',
    },
  })

  await payload.updateGlobal({
    slug: 'promo-bar',
    context: ctx,
    data: {
      enabled: false,
      text: 'Uzmi 10% popusta na prvu porudžbinu uz prijavu na newsletter',
      url: '/#newsletter',
      theme: 'blue',
    },
  })

  await payload.updateGlobal({
    slug: 'shop-settings',
    context: ctx,
    data: {
      shippingPrice: 499,
      freeShippingThreshold: null,
      deliveryEstimate: '2 do 4 radna dana',
      countries: ['Srbija'],
      newsletterDiscountCode: 'DOBRODOSLI10',
      email: content.contact.email,
      phone: content.contact.phone,
      address: content.contact.address,
      hours: content.contact.availability,
      defaultCare:
        'Pranje na 30 do 40°C sa sličnim bojama, naopačke. Bez izbeljivača i bez sušenja u mašini.',
      shippingInfo:
        'Šaljemo u roku od 1 do 2 radna dana, isporuka na teritoriji Srbije za 2 do 4 radna dana. Plaćanje pouzećem. Zamena veličine u roku od 14 dana.',
      lowStockThreshold: 5,
    },
  })

  // --- Popust za newsletter ---
  await payload.create({
    collection: 'discounts',
    context: ctx,
    data: {
      code: 'DOBRODOSLI10',
      type: 'percentage',
      value: 10,
      appliesTo: 'all',
      oncePerCustomer: true,
      active: true,
      note: 'Šalje se novim pretplatnicima na newsletter.',
    },
  })

  // --- Stranice ---
  payload.logger.info('Pravim stranice...')
  const a = content.about
  await payload.create({
    collection: 'pages',
    context: ctx,
    draft: false,
    data: {
      title: 'O nama',
      slug: 'o-nama',
      _status: 'published',
      layout: [
        {
          blockType: 'pageHero',
          heading: a.hero.heading || undefined,
          subheading: a.hero.subheading || undefined,
          image: media.aboutHero,
          overlay: 50,
        },
        {
          blockType: 'story',
          theme: 'light',
          heading: a.intro.heading,
          lead: a.intro.lead,
          text: a.intro.text,
          images: [{ image: media.aboutIntro1 }, { image: media.aboutIntro2 }],
        },
        {
          blockType: 'story',
          theme: 'blue',
          heading: a.brand.heading,
          text: a.brand.text,
          note: a.brand.note,
          images: [media.aboutBrand1, media.aboutBrand2, media.aboutBrand3, media.aboutBrand4].map(
            (image) => ({ image }),
          ),
        },
        {
          blockType: 'stats',
          heading: a.stats.heading,
          description: a.stats.description,
          items: a.stats.items.map((s) => ({ ...s, image: media[s.image] })),
          ctaText: a.stats.ctaText,
          cta: a.stats.cta,
        },
      ],
      seo: content.pageSeo['o-nama'],
    },
  })

  await payload.create({
    collection: 'pages',
    context: ctx,
    draft: false,
    data: {
      title: 'Kontakt',
      slug: 'kontakt',
      _status: 'published',
      layout: [{ blockType: 'contact', ...content.contact }],
      seo: content.pageSeo.kontakt,
    },
  })

  await payload.create({
    collection: 'pages',
    context: ctx,
    draft: false,
    data: {
      title: 'Česta pitanja',
      slug: 'cesta-pitanja',
      _status: 'published',
      layout: [{ blockType: 'faq', ...content.faq }],
      seo: content.pageSeo['cesta-pitanja'],
    },
  })

  for (const page of content.legalPages) {
    await payload.create({
      collection: 'pages',
      context: ctx,
      draft: false,
      data: {
        title: page.title,
        slug: page.slug,
        _status: 'published',
        layout: [{ blockType: 'richText', content: markdownToLexical(page.body) }],
        seo: content.pageSeo[page.slug],
      },
    })
  }

  // --- Blog ---
  payload.logger.info('Pravim članke...')
  for (const post of content.posts) {
    await payload.create({
      collection: 'posts',
      context: ctx,
      draft: false,
      data: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        subtitle: 'subtitle' in post ? post.subtitle : undefined,
        readTime: post.readTime,
        coverImage: media[post.image],
        content: markdownToLexical(post.body),
        tags: post.tags,
        featured: post.featured,
        publishedAt: post.publishedAt,
        _status: 'published',
        seo: { title: post.seoTitle, description: post.excerpt.slice(0, 160) },
      },
    })
  }

  const counts = await Promise.all(
    (
      ['media', 'shop-collections', 'products', 'variants', 'pages', 'posts'] as CollectionSlug[]
    ).map(async (c) => `${c}: ${(await payload.count({ collection: c })).totalDocs}`),
  )
  payload.logger.info(`Seed završen. ${counts.join(', ')}`)

  // Ako dev server radi, osveži keš storefront-a (seed radi van Next.js-a).
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  await fetch(`${base}/api/revalidate`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${process.env.REVALIDATE_SECRET}`,
      'content-type': 'application/json',
    },
    body: '{}',
  })
    .then((r) => payload.logger.info(`Keš storefront-a osvežen (${r.status}).`))
    .catch(() => payload.logger.info('Dev server ne radi, keš nije osvežen (nije potrebno).'))
}

await seed()
process.exit(0)
