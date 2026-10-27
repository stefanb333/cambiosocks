'use server'

import { z } from 'zod'
import { clientIp } from '@/lib/client-ip'
import { esc, notifyRecipients, sendEmail } from '@/lib/email/send'
import { getPayload } from '@/lib/payload'
import { rateLimit } from '@/lib/rate-limit'

export type ContactState = {
  status: 'idle' | 'success' | 'error'
  message: string
  errors?: Partial<Record<'name' | 'email' | 'topic' | 'message' | 'consent', string>>
}

const schema = z.object({
  name: z.string().trim().min(2, 'Unesite ime i prezime.').max(120),
  email: z.string().trim().email('Unesite ispravnu e-mail adresu.'),
  topic: z.string().trim().min(1, 'Izaberite temu.').max(80),
  message: z.string().trim().min(10, 'Poruka treba da ima bar 10 znakova.').max(4000),
  consent: z.literal('on', { message: 'Potrebna je saglasnost za obradu podataka.' }),
  company: z.string().max(0).optional(),
})

export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    const errors: ContactState['errors'] = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<ContactState['errors']>
      if (key && !errors[key]) errors[key] = issue.message
    }
    return { status: 'error', message: 'Proverite označena polja.', errors }
  }

  if (!rateLimit(`contact:${await clientIp()}`, 5, 60 * 60 * 1000)) {
    return { status: 'error', message: 'Poslali ste previše poruka. Pokušajte ponovo kasnije.' }
  }

  const { name, email, topic, message } = parsed.data
  const payload = await getPayload()
  const settings = await payload.findGlobal({ slug: 'shop-settings', depth: 0 })
  const to = await notifyRecipients(settings.notifyEmails)
  if (!to.length) {
    payload.logger.warn('Kontakt poruka nije poslata: nije podešena adresa za obaveštenja.')
  } else {
    const result = await sendEmail({
      to,
      replyTo: email,
      subject: `Kontakt forma: ${topic} (${name})`,
      text: `Ime: ${name}\nEmail: ${email}\nTema: ${topic}\n\n${message}`,
      html: `<p><strong>Ime:</strong> ${esc(name)}<br><strong>Email:</strong> ${esc(email)}<br><strong>Tema:</strong> ${esc(topic)}</p><p>${esc(message).replace(/\n/g, '<br>')}</p>`,
    })
    if (!result.ok) {
      payload.logger.error(`Kontakt email nije poslat: ${result.error}`)
      return {
        status: 'error',
        message: 'Poruka trenutno ne može da se pošalje. Pišite nam direktno na email.',
      }
    }
  }
  return { status: 'success', message: '' }
}
