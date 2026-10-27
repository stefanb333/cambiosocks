import 'server-only'
import { unstable_cache } from 'next/cache'
import type { Product, ShopCollection } from '@/payload-types'
import { getPayload } from './payload'

/**
 * Keširani upiti za storefront. Svaki ima tag koji Payload hookovi revalidiraju
 * pri izmeni u adminu (src/hooks/revalidate.ts), pa su stranice statične dok se
 * sadržaj ne promeni.
 */

export const getHeader = unstable_cache(
  async () => (await getPayload()).findGlobal({ slug: 'header', depth: 0 }),
  ['global-header'],
  { tags: ['global:header'] },
)

export const getFooter = unstable_cache(
  async () => (await getPayload()).findGlobal({ slug: 'footer', depth: 0 }),
  ['global-footer'],
  { tags: ['global:footer'] },
)

export const getPromoBar = unstable_cache(
  async () => (await getPayload()).findGlobal({ slug: 'promo-bar', depth: 0 }),
  ['global-promo-bar'],
  { tags: ['global:promo-bar'] },
)

export const getHomePage = unstable_cache(
  async () => (await getPayload()).findGlobal({ slug: 'home-page', depth: 2 }),
  ['global-home-page'],
  { tags: ['global:home-page', 'products', 'media'] },
)

/** Javni deo podešavanja (bez internih email adresa). */
export const getShopInfo = unstable_cache(
  async () => {
    const s = await (await getPayload()).findGlobal({ slug: 'shop-settings', depth: 0 })
    return {
      shippingPrice: s.shippingPrice ?? 0,
      freeShippingThreshold: s.freeShippingThreshold ?? null,
      deliveryEstimate: s.deliveryEstimate ?? '',
      email: s.email ?? '',
      phone: s.phone ?? '',
      address: s.address ?? '',
      hours: s.hours ?? '',
      instagram: s.instagram ?? '',
      tiktok: s.tiktok ?? '',
      defaultCare: s.defaultCare ?? '',
      shippingInfo: s.shippingInfo ?? '',
    }
  },
  ['global-shop-info'],
  { tags: ['global:shop-settings'] },
)

export const getMenuCollections = unstable_cache(
  async () => {
    const { docs } = await (
      await getPayload()
    ).find({
      collection: 'shop-collections',
      where: { showInMenu: { equals: true } },
      sort: 'menuOrder',
      depth: 0,
      limit: 20,
      select: { title: true, slug: true },
    })
    return docs as Pick<ShopCollection, 'id' | 'title' | 'slug'>[]
  },
  ['menu-collections'],
  { tags: ['navigation', 'collections'] },
)

export const isProduct = (value: unknown): value is Product =>
  Boolean(
    value &&
    typeof value === 'object' &&
    'slug' in (value as object) &&
    'title' in (value as object),
  )
