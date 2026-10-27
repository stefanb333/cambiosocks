import { sendEmail } from './send'
import type { EmailAdapter, SendEmailOptions } from 'payload'

type Address = string | { name?: string; address: string }
const toList = (value: SendEmailOptions['to']): string[] =>
  ([value].flat().filter(Boolean) as Address[]).map((a) => (typeof a === 'string' ? a : a.address))

/**
 * Payload email adapter (reset lozinke za admin, verifikacija) preko istog Resend REST
 * poziva kao i porudžbine. Bez RESEND_API_KEY poruka ide u log, kao i ostali emailovi.
 */
export const resendRestAdapter: EmailAdapter = () => {
  const from = process.env.EMAIL_FROM || 'Cambio <onboarding@resend.dev>'
  const match = from.match(/^(.*)<(.+)>$/)
  return {
    name: 'resend-rest',
    defaultFromAddress: match ? match[2].trim() : from,
    defaultFromName: match ? match[1].trim() : 'Cambio',
    sendEmail: async (message) => {
      const result = await sendEmail({
        to: toList(message.to),
        subject: String(message.subject ?? ''),
        html: String(message.html ?? ''),
        text: String(message.text ?? ''),
      })
      if (!result.ok) throw new Error(result.error)
      return { id: result.id }
    },
  }
}
