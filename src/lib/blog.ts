import 'server-only'
import { unstable_cache } from 'next/cache'
import type { Post } from '@/payload-types'
import { getPayload } from './payload'

const MONTHS = [
  'januara',
  'februara',
  'marta',
  'aprila',
  'maja',
  'juna',
  'jula',
  'avgusta',
  'septembra',
  'oktobra',
  'novembra',
  'decembra',
]

/** "12. marta 2026." */
export function formatDateSr(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}.`
}

export const getPosts = unstable_cache(
  async () => {
    const payload = await getPayload()
    const { docs } = await payload.find({
      collection: 'posts',
      where: { _status: { equals: 'published' } },
      sort: '-publishedAt',
      depth: 1,
      limit: 100,
    })
    return docs as Post[]
  },
  ['posts'],
  { tags: ['posts', 'media'] },
)

export const getPostBySlug = unstable_cache(
  async (slug: string) => {
    const payload = await getPayload()
    const { docs } = await payload.find({
      collection: 'posts',
      where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
      depth: 1,
      limit: 1,
    })
    return (docs[0] as Post | undefined) ?? null
  },
  ['post-by-slug'],
  { tags: ['posts', 'media'] },
)
