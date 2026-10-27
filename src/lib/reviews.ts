import 'server-only'
import { unstable_cache } from 'next/cache'
import type { Review } from '@/payload-types'
import { getPayload } from './payload'

/** Recenzija kakva ide na sajt (bez emaila i internih polja). */
export type PublicReview = {
  id: number
  name: string
  city: string | null
  rating: number
  text: string
  verified: boolean
  createdAt: string
  product: { title: string; slug: string } | null
}

const SELECT = {
  name: true,
  city: true,
  rating: true,
  text: true,
  verified: true,
  createdAt: true,
  product: true,
} as const

type Row = Omit<Pick<Review, keyof typeof SELECT | 'id'>, 'product'> & {
  product?: Review['product'] | null
}

const toPublic = (r: Row): PublicReview => ({
  id: r.id,
  name: r.name,
  city: r.city ?? null,
  rating: r.rating,
  text: r.text,
  verified: Boolean(r.verified),
  createdAt: r.createdAt,
  product:
    typeof r.product === 'object' && r.product
      ? { title: r.product.title, slug: r.product.slug ?? String(r.product.id) }
      : null,
})

/** Odobrene recenzije jednog proizvoda, najnovije prve (D-068). */
export const getProductReviews = unstable_cache(
  async (productId: number): Promise<PublicReview[]> => {
    const { docs } = await (
      await getPayload()
    ).find({
      collection: 'reviews',
      where: { and: [{ product: { equals: productId } }, { status: { equals: 'approved' } }] },
      sort: '-createdAt',
      limit: 100,
      depth: 0,
      select: SELECT,
    })
    return docs.map((r) => toPublic({ ...r, product: null }))
  },
  ['product-reviews'],
  { tags: ['reviews'] },
)

/**
 * Recenzije za početnu: označene "Prikaži na početnoj", a ako ih je manje od 6, dopunjuju se
 * najnovijim odobrenim sa ocenom 4 ili 5.
 */
export const getHomeReviews = unstable_cache(
  async (): Promise<PublicReview[]> => {
    const payload = await getPayload()
    const query = (featured: boolean, limit: number) =>
      payload.find({
        collection: 'reviews',
        where: {
          and: [
            { status: { equals: 'approved' } },
            featured ? { featured: { equals: true } } : { rating: { greater_than_equal: 4 } },
          ],
        },
        sort: '-createdAt',
        limit,
        depth: 1,
        select: SELECT,
        populate: { products: { title: true, slug: true } },
      })
    const featured = (await query(true, 6)).docs
    const rest =
      featured.length < 6
        ? (await query(false, 12)).docs.filter((r) => !featured.some((f) => f.id === r.id))
        : []
    return [...featured, ...rest].slice(0, 6).map(toPublic)
  },
  ['home-reviews'],
  { tags: ['reviews', 'products'] },
)
