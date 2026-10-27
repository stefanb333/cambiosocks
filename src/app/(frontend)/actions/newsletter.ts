'use server'

import { z } from 'zod'
import { clientIp } from '@/lib/client-ip'
import { sendEmail } from '@/lib/email/send'
import { newsletterWelcomeEmail } from '@/lib/email/templates'
import { getPayload } from '@/lib/payload'
import { rateLimit } from '@/lib/rate-limit'

export type NewsletterState = { status: 'idle' | 'success' | 'error'; message: string }

const schema = z.object({
  email: z.string().trim().toLowerCase().email('Unesite ispravnu e-mail adresu.'),
  source: z.enum(['newsletter', 'notify']).default('newsletter'),
  interest: z.string().trim().max(120).optional(),
  // Honeypot: popunjavaju ga samo botovi.
  company: z.string().max(0).optional(),
})

/**
 * Prijava na newsletter ili na "Obavesti me"; nova prijava na newsletter dobija email sa kodom
 * za popust. Limit po IP-u sprečava da neko masovno prijavljuje tuđe adrese (slanje emailova).
 */
export async function subscribe(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const parsed = schema.safeParse({
    email: formData.get('email'),
    source: formData.get('source') || undefined,
    interest: formData.get('interest') || undefined,
    company: formData.get('company') || undefined,
  })
  if (!parsed.success) {
    return {
      status: 'error',
      message: parsed.error.issues[0]?.message ?? 'Proverite unete podatke.',
    }
  }

  if (!rateLimit(`newsletter:${await clientIp()}`, 5, 60 * 60 * 1000)) {
    return { status: 'error', message: 'Previše pokušaja. Pokušajte ponovo kasnije.' }
  }

  const { email, source, interest } = parsed.data
  const payload = await getPayload()
  const existing = await payload.find({
    collection: 'subscribers',
    where: {
      and: [
        { email: { equals: email } },
        { source: { equals: source } },
        { interest: { equals: interest ?? null } },
      ],
    },
    limit: 1,
    depth: 0,
  })
  if (!existing.totalDocs) {
    await payload.create({ collection: 'subscribers', data: { email, source, interest } })
    if (source === 'newsletter') {
      const settings = await payload.findGlobal({ slug: 'shop-settings', depth: 0 })
      if (settings.newsletterDiscountCode) {
        const result = await sendEmail({
          to: email,
          ...newsletterWelcomeEmail(settings.newsletterDiscountCode),
        })
        if (!result.ok) payload.logger.error(`Newsletter email nije poslat: ${result.error}`)
      }
    }
  }

  return {
    status: 'success',
    message:
      source === 'notify'
        ? 'Hvala! Javićemo vam čim stigne.'
        : 'Hvala na prijavi! Kod za 10% popusta stiže vam na e-mail.',
  }
}
