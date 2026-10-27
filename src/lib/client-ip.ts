import 'server-only'

import { headers } from 'next/headers'

/**
 * IP adresa posetioca za limit zahteva. Netlify postavlja `x-nf-client-connection-ip` i klijent
 * ga ne može podmetnuti; prvi deo `x-forwarded-for` šalje sam klijent, pa je samo rezerva
 * (lokalno i van Netlify-a).
 */
export async function clientIp(): Promise<string> {
  const h = await headers()
  return (
    h.get('x-nf-client-connection-ip') ||
    h.get('x-real-ip') ||
    h.get('x-forwarded-for')?.split(',').pop()?.trim() ||
    'local'
  )
}
