import { NextResponse, type NextRequest } from 'next/server'
import { getAllListingProducts, searchProducts, type SearchHit } from '@/lib/catalog/listing'
import { clientIp } from '@/lib/client-ip'
import { mediaSrc } from '@/lib/media'
import { rateLimit } from '@/lib/rate-limit'

const LIMIT = 6

/** Predlozi proizvoda za pretragu u headeru (D-065): prvih 6 pogodaka i ukupan broj. */
export async function GET(request: NextRequest) {
  // Pretraga se šalje posle pauze u kucanju; 120 u minuti je daleko iznad normalnog korišćenja.
  if (!rateLimit(`search:${await clientIp()}`, 120, 60 * 1000)) {
    return NextResponse.json({ error: 'Previše zahteva.' }, { status: 429 })
  }
  const q = (request.nextUrl.searchParams.get('q') ?? '').trim().slice(0, 80)
  if (q.length < 2) return NextResponse.json({ hits: [], total: 0 })

  const found = searchProducts(await getAllListingProducts(), q)
  // Dostupni proizvodi prvi, redosled pretrage inače ostaje (najnoviji prvo).
  found.sort((a, b) => Number(b.available) - Number(a.available))
  const hits: SearchHit[] = found.slice(0, LIMIT).map((p) => ({
    slug: p.slug,
    title: p.title,
    price: p.minPrice,
    compareAtPrice: p.compareAtPrice,
    image: p.image?.url ? { src: mediaSrc(p.image.url)!, alt: p.image.alt ?? p.title } : null,
  }))
  return NextResponse.json(
    { hits, total: found.length },
    { headers: { 'Cache-Control': 'private, max-age=30' } },
  )
}
