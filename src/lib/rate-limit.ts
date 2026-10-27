import 'server-only'

/**
 * Jednostavan limit zahteva u memoriji procesa (po IP-u i ključu). Na Netlify funkcijama
 * memorija nije deljena između instanci, pa je ovo osnovna zaštita od zloupotrebe forme,
 * a ne strogi limit (uz honeypot polje i serversku validaciju).
 */
const hits = new Map<string, number[]>()

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  if (recent.length >= max) {
    hits.set(key, recent)
    return false
  }
  recent.push(now)
  hits.set(key, recent)
  if (hits.size > 5000) hits.clear()
  return true
}
