/**
 * Strukturisani podaci (schema.org JSON-LD) i zajedničke SEO vrednosti (D-063).
 * Google ih koristi za bogate rezultate (cena, dostupnost, FAQ, putanja), a AI pretraživači
 * (ChatGPT, Perplexity, Gemini) kao proverene činjenice o prodavnici i proizvodima.
 * Sve činjenice moraju da se poklapaju sa vidljivim sadržajem stranice.
 */
import { COMPANY } from './company'

/** Pravi domen; koristi se samo ako NEXT_PUBLIC_SERVER_URL nije podešen na produkciji. */
export const PRODUCTION_URL = 'https://cambiosocks.com'

// Bez podešene promenljive produkcija ne sme da upiše localhost u canonical, sitemap i mejlove.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.NODE_ENV === 'production' ? PRODUCTION_URL : 'http://localhost:3000')
).replace(/\/$/, '')
export const SITE_NAME = 'Cambio'
export const absoluteUrl = (path: string) =>
  /^https?:\/\//.test(path) ? path : `${SITE_URL}${path}`

const ORG_ID = `${SITE_URL}/#organizacija`
const WEBSITE_ID = `${SITE_URL}/#sajt`

/** Uslovi koji važe za sve proizvode (Uslovi kupovine, Dostava, Reklamacije: D-061). */
export const SHOP_POLICY = {
  shippingPrice: 300,
  handlingDays: [0, 1],
  transitDays: [1, 2],
  returnDays: 14,
}

type Json = Record<string, unknown>

/** Prodavac: proizvođač čarapa iz Novog Pazara (Organization + OnlineStore). */
export function organizationSchema(sameAs: string[] = []): Json {
  return {
    '@type': ['Organization', 'OnlineStore'],
    '@id': ORG_ID,
    name: SITE_NAME,
    legalName: COMPANY.legalName,
    alternateName: ['Cambio čarape', 'Cambio Socks'],
    url: `${SITE_URL}/`,
    logo: { '@type': 'ImageObject', url: absoluteUrl('/logo.png'), width: 720, height: 401 },
    image: absoluteUrl('/og.jpg'),
    description:
      'Cambio je proizvođač čarapa iz Novog Pazara. Od 1995. pravimo pamučne muške, ženske i sportske čarape u sopstvenoj fabrici, a kroz online prodavnicu ih šaljemo na kućnu adresu širom Srbije.',
    email: COMPANY.email,
    telephone: COMPANY.phone,
    taxID: COMPANY.taxId,
    vatID: COMPANY.taxId,
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY.street,
      postalCode: '36300',
      addressLocality: 'Novi Pazar',
      addressCountry: 'RS',
    },
    areaServed: { '@type': 'Country', name: 'Srbija' },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: COMPANY.email,
      telephone: COMPANY.phone,
      availableLanguage: ['sr'],
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '17:00',
      },
    },
    hasMerchantReturnPolicy: returnPolicy(),
    knowsAbout: ['čarape', 'pamučne čarape', 'sportske čarape', 'proizvodnja čarapa'],
    ...(sameAs.length ? { sameAs } : {}),
  }
}

/** Sajt sa pretragom (Google može da prikaže polje za pretragu ispod rezultata). */
export function websiteSchema(): Json {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    inLanguage: 'sr-Latn-RS',
    publisher: { '@id': ORG_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/pretraga?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

/** Vraćanje u roku od 14 dana (zapečaćeno pakovanje, D-061); kupac plaća direktne troškove vraćanja. */
export function returnPolicy(): Json {
  return {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'RS',
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: SHOP_POLICY.returnDays,
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/ReturnShippingFees',
    merchantReturnLink: absoluteUrl('/reklamacije'),
  }
}

export function shippingDetails(): Json {
  return {
    '@type': 'OfferShippingDetails',
    shippingRate: { '@type': 'MonetaryAmount', value: SHOP_POLICY.shippingPrice, currency: 'RSD' },
    shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'RS' },
    deliveryTime: {
      '@type': 'ShippingDeliveryTime',
      handlingTime: {
        '@type': 'QuantitativeValue',
        minValue: SHOP_POLICY.handlingDays[0],
        maxValue: SHOP_POLICY.handlingDays[1],
        unitCode: 'DAY',
      },
      transitTime: {
        '@type': 'QuantitativeValue',
        minValue: SHOP_POLICY.transitDays[0],
        maxValue: SHOP_POLICY.transitDays[1],
        unitCode: 'DAY',
      },
    },
  }
}

export type Crumb = { name: string; path: string }

export function breadcrumbSchema(crumbs: Crumb[]): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  }
}

export function faqSchema(items: { question: string; answer: string }[]): Json {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.answer },
    })),
  }
}

type ProductInput = {
  slug: string
  title: string
  description: string
  images: string[]
  material?: string | null
  category?: string
  rating?: number | null
  ratingCount?: number | null
  /** Najnovije odobrene recenzije (D-068), uz ocenu iz istih recenzija. */
  reviews?: { name: string; rating: number; text: string; createdAt: string }[]
  variants: {
    id: number
    title: string
    sku?: string | null
    price: number
    available: boolean
    color?: string
    size?: string
    /** Slika boje varijante; bez nje se koristi glavna slika proizvoda. */
    image?: string
  }[]
}

/**
 * Proizvod sa varijantama (ProductGroup) i ponudom sa cenom, dostavom i politikom vraćanja.
 * Ocena i recenzije dolaze iz odobrenih recenzija kupaca (kolekcija Recenzije, D-068).
 */
export function productSchema(p: ProductInput): Json {
  const url = absoluteUrl(`/proizvodi/${p.slug}`)
  const priceValidUntil = `${new Date().getFullYear() + 1}-12-31`
  const offer = (v: ProductInput['variants'][number]) => ({
    '@type': 'Offer',
    url: `${url}?varijanta=${v.id}`,
    price: v.price,
    priceCurrency: 'RSD',
    priceValidUntil,
    availability: v.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@id': ORG_ID },
    shippingDetails: shippingDetails(),
    hasMerchantReturnPolicy: returnPolicy(),
  })
  return {
    '@type': 'ProductGroup',
    '@id': `${url}#proizvod`,
    name: p.title,
    url,
    description: p.description,
    image: p.images,
    brand: { '@type': 'Brand', name: SITE_NAME },
    manufacturer: { '@id': ORG_ID },
    productGroupID: p.slug,
    ...(p.category ? { category: p.category } : {}),
    ...(p.material ? { material: p.material } : {}),
    variesBy: ['https://schema.org/size', 'https://schema.org/color'],
    countryOfOrigin: { '@type': 'Country', name: 'Srbija' },
    ...(p.rating && p.ratingCount
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: p.rating,
            reviewCount: p.ratingCount,
            bestRating: 5,
          },
        }
      : {}),
    ...(p.reviews?.length
      ? {
          review: p.reviews.slice(0, 5).map((r) => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: r.name },
            datePublished: r.createdAt.slice(0, 10),
            reviewBody: r.text,
            reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
          })),
        }
      : {}),
    hasVariant: p.variants.map((v) => ({
      '@type': 'Product',
      name: `${p.title}, ${v.title}`,
      ...(v.sku ? { sku: v.sku } : {}),
      ...(v.color ? { color: v.color } : {}),
      ...(v.size ? { size: v.size } : {}),
      image: v.image ?? p.images[0],
      offers: offer(v),
    })),
  }
}

/** Kolekcija (kategorija) sa spiskom proizvoda redom kojim su prikazani. */
export function collectionSchema(c: {
  slug: string
  title: string
  description: string
  products: { slug: string; title: string }[]
}): Json {
  const url = absoluteUrl(`/kolekcije/${c.slug}`)
  return {
    '@type': 'CollectionPage',
    '@id': `${url}#stranica`,
    url,
    name: c.title,
    description: c.description,
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: c.products.length,
      itemListElement: c.products.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: absoluteUrl(`/proizvodi/${p.slug}`),
        name: p.title,
      })),
    },
  }
}

export function articleSchema(a: {
  slug: string
  title: string
  description: string
  image?: string
  publishedAt?: string | null
  updatedAt?: string | null
}): Json {
  const url = absoluteUrl(`/blog/${a.slug}`)
  return {
    '@type': 'BlogPosting',
    '@id': `${url}#clanak`,
    mainEntityOfPage: url,
    headline: a.title,
    description: a.description,
    ...(a.image ? { image: [a.image] } : {}),
    ...(a.publishedAt ? { datePublished: a.publishedAt } : {}),
    ...(a.updatedAt ? { dateModified: a.updatedAt } : {}),
    inLanguage: 'sr-Latn-RS',
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
  }
}

/** Obična stranica (O nama, Kontakt, pravne stranice) sa tipom iz schema.org. */
export function webPageSchema(p: {
  path: string
  title: string
  description?: string
  type?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'FAQPage'
}): Json {
  return {
    '@type': p.type ?? 'WebPage',
    '@id': `${absoluteUrl(p.path)}#stranica`,
    url: absoluteUrl(p.path),
    name: p.title,
    ...(p.description ? { description: p.description } : {}),
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID },
    inLanguage: 'sr-Latn-RS',
  }
}

/** Više šema u jednom JSON-LD bloku (@graph), sa jednim @context. */
export function jsonLdGraph(...items: (Json | null | undefined | false)[]) {
  return { '@context': 'https://schema.org', '@graph': items.filter(Boolean) }
}
