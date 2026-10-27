/**
 * Payload vraća apsolutne URL-ove fajlova (serverURL). Slike sa sopstvenog domena se
 * prepisuju u relativnu putanju (/api/media/file/...) da ih next/image tretira kao lokalne;
 * slike sa R2 ostaju apsolutne (dozvoljene preko images.remotePatterns).
 */
export function mediaSrc(url: string | null | undefined): string | null {
  if (!url) return null
  const server = process.env.NEXT_PUBLIC_SERVER_URL
  if (server && url.startsWith(server)) return url.slice(server.length) || '/'
  return url
}

/** Dozvoljeni formati slika (upload u adminu i CSV uvoz). Bez SVG-a: može da sadrži skriptu. */
export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
] as const
