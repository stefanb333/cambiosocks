import { timingSafeEqual } from 'node:crypto'
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'

/** Poređenje tajne u konstantnom vremenu (bez otkrivanja dužine poklapanja). */
function sameSecret(given: string, expected: string) {
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

const ALL_TAGS = [
  'products',
  'collections',
  'navigation',
  'pages',
  'posts',
  'media',
  'global:header',
  'global:footer',
  'global:promo-bar',
  'global:home-page',
  'global:shop-settings',
]

/**
 * Ručna revalidacija keša storefront-a (npr. posle seed-a ili uvoza).
 * Izmene u adminu revalidiraju se automatski preko Payload hookova.
 * POST /api/revalidate  sa zaglavljem  Authorization: Bearer <REVALIDATE_SECRET>
 * Telo (opciono): { "tags": ["products"], "paths": ["/"] }. Bez tela revalidira sve.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET
  const auth = request.headers.get('authorization')
  if (!secret || !auth || !sameSecret(auth, `Bearer ${secret}`)) {
    return NextResponse.json({ error: 'Nije dozvoljeno.' }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as { tags?: unknown; paths?: unknown }
  const strings = (value: unknown) =>
    Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []
  const requestedTags = strings(body.tags)
  const paths = strings(body.paths).filter((p) => p.startsWith('/'))
  const tags = requestedTags.length ? requestedTags : ALL_TAGS
  for (const tag of tags) revalidateTag(tag, 'max')
  for (const path of paths) revalidatePath(path)
  if (!requestedTags.length && !paths.length) revalidatePath('/', 'layout')

  return NextResponse.json({ revalidated: true, tags, paths })
}
