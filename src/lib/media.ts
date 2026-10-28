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

type CoverFrame = {
  /** Media upit za ovaj okvir (npr. "(min-width: 1024px)"); poslednji okvir je bez upita. */
  media?: string
  width: string
  height: string
}

/**
 * `sizes` za sliku koja popunjava okvir (object-cover, D-072). Širok kadar u visokom okviru
 * (hero, baneri na telefonu) prikazuje se šire od ekrana, pa potrebna širina nije širina okvira
 * nego veće od (širina okvira, visina okvira x odnos slike). Sa `sizes="100vw"` pregledač bi
 * preuzeo sliku širine ekrana i razvukao je 2-3 puta (mutna slika). `overscan` je uvećanje
 * paralakse (Parallax: 1 + 2 x speed).
 */
export function coverSizes(
  media: { width?: number | null; height?: number | null } | number | null | undefined,
  frames: CoverFrame[],
  overscan = 1.2,
): string {
  const m = typeof media === 'object' && media ? media : null
  const ratio = m?.width && m?.height ? m.width / m.height : 1.5
  const factor = (ratio * overscan).toFixed(3)
  return frames
    .map((f) => `${f.media ? `${f.media} ` : ''}max(${f.width}, calc(${f.height} * ${factor}))`)
    .join(', ')
}

/** Dozvoljeni formati slika (upload u adminu i CSV uvoz). Bez SVG-a: može da sadrži skriptu. */
export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
] as const
