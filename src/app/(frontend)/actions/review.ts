'use server'

import { z } from 'zod'
import { clientIp } from '@/lib/client-ip'
import { esc, notifyRecipients, sendEmail } from '@/lib/email/send'
import { getPayload } from '@/lib/payload'
import { rateLimit } from '@/lib/rate-limit'

export type ReviewField = 'productId' | 'rating' | 'name' | 'city' | 'text' | 'email' | 'consent'

export type ReviewState = {
  status: 'idle' | 'success' | 'error'
  message: string
  errors?: Partial<Record<ReviewField, string>>
}

const schema = z.object({
  productId: z.coerce
    .number({ message: 'Izaberite proizvod.' })
    .int()
    .positive('Izaberite proizvod.'),
  rating: z.coerce
    .number({ message: 'Izaberite ocenu.' })
    .int()
    .min(1, 'Izaberite ocenu.')
    .max(5, 'Izaberite ocenu.'),
  name: z.string().trim().min(2, 'Unesite ime.').max(60, 'Ime može imati najviše 60 znakova.'),
  city: z.string().trim().max(60, 'Grad može imati najviše 60 znakova.').optional(),
  text: z
    .string()
    .trim()
    .min(10, 'Recenzija treba da ima bar 10 znakova.')
    .max(1500, 'Recenzija može imati najviše 1500 znakova.'),
  email: z
    .union([z.literal(''), z.string().trim().email('Unesite ispravnu e-mail adresu.')])
    .optional(),
  consent: z.literal('on', { message: 'Potrebna je saglasnost za objavu.' }),
  // Honeypot: ljudi ga ne vide, botovi ga popune
  company: z.string().max(0).optional(),
})

/**
 * Nova recenzija sa sajta (D-068): validacija, limit po IP-u, provera proizvoda, upis sa
 * statusom "Na čekanju" i email osoblju. Ako email odgovara porudžbini sa ovim proizvodom,
 * recenzija se označava kao potvrđena kupovina.
 */
export async function submitReview(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    const errors: ReviewState['errors'] = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as ReviewField
      if (key && !errors[key]) errors[key] = issue.message
    }
    // Popunjen honeypot: tiho "uspešno", bez upisa
    if (formData.get('company')) return { status: 'success', message: '' }
    return { status: 'error', message: 'Proverite označena polja.', errors }
  }

  if (!rateLimit(`review:${await clientIp()}`, 5, 60 * 60 * 1000)) {
    return { status: 'error', message: 'Poslali ste previše recenzija. Pokušajte ponovo kasnije.' }
  }

  const { productId, rating, name, city, text } = parsed.data
  const email = parsed.data.email?.toLowerCase() || undefined
  const payload = await getPayload()
  const product = await payload
    .findByID({
      collection: 'products',
      id: productId,
      depth: 0,
      select: { title: true, status: true },
    })
    .catch(() => null)
  if (!product || product.status !== 'active') {
    return {
      status: 'error',
      message: 'Proizvod nije pronađen.',
      errors: { productId: 'Izaberite proizvod.' },
    }
  }

  const verified = email
    ? (
        await payload.count({
          collection: 'orders',
          where: {
            and: [
              { email: { equals: email } },
              { 'lineItems.product': { equals: productId } },
              { status: { not_equals: 'otkazana' } },
            ],
          },
        })
      ).totalDocs > 0
    : false

  const review = await payload.create({
    collection: 'reviews',
    data: {
      product: productId,
      rating,
      name,
      city: city || undefined,
      text,
      email,
      verified,
      status: 'pending',
    },
    overrideAccess: true,
  })

  const settings = await payload.findGlobal({ slug: 'shop-settings', depth: 0 })
  const to = await notifyRecipients(settings.notifyEmails)
  if (to.length) {
    const link = `${process.env.NEXT_PUBLIC_SERVER_URL ?? ''}/admin/collections/reviews/${review.id}`
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)
    const result = await sendEmail({
      to,
      ...(email ? { replyTo: email } : {}),
      subject: `Nova recenzija čeka odobrenje: ${product.title} (${rating}/5)`,
      text: `${name}${city ? `, ${city}` : ''} | ${stars}${verified ? ' | potvrđena kupovina' : ''}\n\n${text}\n\nOdobrite ili odbijte: ${link}`,
      html: `<p><strong>${esc(product.title)}</strong> ${stars}</p><p><strong>${esc(name)}</strong>${city ? `, ${esc(city)}` : ''}${verified ? ' (potvrđena kupovina)' : ''}</p><p>${esc(text).replace(/\n/g, '<br>')}</p><p><a href="${esc(link)}">Odobrite ili odbijte recenziju</a></p>`,
    })
    if (!result.ok) payload.logger.error(`Email o recenziji nije poslat: ${result.error}`)
  }
  return { status: 'success', message: '' }
}
