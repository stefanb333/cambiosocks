type Mail = { to: string | string[]; subject: string; html: string; text: string; replyTo?: string }

/**
 * Slanje emaila preko Resend REST API-ja (bez dodatnog SDK paketa, vidi DECISIONS.md D-029).
 * Bez RESEND_API_KEY (lokalni razvoj) poruka se samo ispisuje u log.
 */
export async function sendEmail(mail: Mail): Promise<{ ok: boolean; id?: string; error?: string }> {
  const key = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM || 'Cambio <onboarding@resend.dev>'
  if (!key) {
    console.info(`[email:dev] Za: ${[mail.to].flat().join(', ')} | ${mail.subject}\n${mail.text}`)
    return { ok: true, id: 'dev' }
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [mail.to].flat(),
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
      }),
    })
    const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string }
    if (!res.ok) return { ok: false, error: body.message ?? `Resend ${res.status}` }
    return { ok: true, id: body.id }
  } catch (error) {
    return { ok: false, error: (error as Error).message }
  }
}

/** Escape za umetanje korisničkog teksta u HTML email. */
export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Adrese za interna obaveštenja: Podešavanja prodavnice ili EMAIL_NOTIFY_TO. */
export async function notifyRecipients(fromSettings?: string[] | null): Promise<string[]> {
  const list = (fromSettings ?? []).filter(Boolean)
  if (list.length) return list
  return (process.env.EMAIL_NOTIFY_TO || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}
