import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { clientIp } from '@/lib/client-ip'
import { getPayload } from '@/lib/payload'
import { priceCart } from '@/lib/pricing/cart'
import { rateLimit } from '@/lib/rate-limit'

const schema = z.object({
  lines: z
    .array(
      z.object({
        variantId: z.number().int().positive(),
        quantity: z.number().int().positive().max(99),
      }),
    )
    .max(100),
  discountCode: z.string().trim().max(40).optional().nullable(),
  email: z.string().trim().email().optional().nullable(),
})

/** Sveže cene, zaliha i popust za sadržaj korpe iz localStorage-a. */
export async function POST(request: NextRequest) {
  // Korpa se proverava pri svakoj izmeni; 120 u minuti je daleko iznad normalnog korišćenja.
  if (!rateLimit(`cart:${await clientIp()}`, 120, 60 * 1000)) {
    return NextResponse.json({ error: 'Previše zahteva.' }, { status: 429 })
  }
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Neispravan zahtev.' }, { status: 400 })
  const payload = await getPayload()
  const cart = await priceCart(payload, parsed.data.lines, {
    discountCode: parsed.data.discountCode,
    email: parsed.data.email,
  })
  return NextResponse.json(cart, { headers: { 'Cache-Control': 'no-store' } })
}
