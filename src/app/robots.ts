import { SITE_URL } from '@/lib/seo'
import type { MetadataRoute } from 'next'

/** Korpa, checkout i pretraga nemaju jedinstven sadržaj (noindex), admin i API nisu za indeks. */
const disallow = ['/admin', '/api/', '/korpa', '/porucivanje', '/pretraga']

/**
 * AI pretraživači i asistenti (GEO, D-063): eksplicitno dozvoljeni, da prodavnicu mogu da navedu i
 * preporuče u odgovorima (ChatGPT, Claude, Perplexity, Gemini, Apple). Robot sa sopstvenim pravilom
 * ne čita pravilo za "*", pa svaki dobija iste zabrane.
 */
const AI_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
]

export default function robots(): MetadataRoute.Robots {
  // Demo ili probni sajt (SITE_NOINDEX=1, D-069): ceo sajt je zatvoren za pretraživače.
  if (process.env.SITE_NOINDEX === '1') return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow },
      { userAgent: AI_BOTS, allow: '/', disallow },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
