import Image, { type ImageProps } from 'next/image'
import { mediaSrc } from '@/lib/media'
import type { Media } from '@/payload-types'

type Props = Omit<ImageProps, 'src' | 'alt' | 'width' | 'height' | 'preload'> & {
  media: Media | number | null | undefined
  alt?: string
}

/**
 * Slika iz Payload biblioteke preko next/image (AVIF/WebP, srcset po uređaju).
 * Alt tekst dolazi iz biblioteke (obavezno polje), osim ako je slika dekorativna (alt="").
 * Fokus tačka iz admina se poštuje kroz object-position.
 */
export function CmsImage({ media, alt, style, fill, priority, quality = 85, ...rest }: Props) {
  if (!media || typeof media === 'number' || !media.url) return null
  const src = mediaSrc(media.url)!
  const position =
    typeof media.focalX === 'number' && typeof media.focalY === 'number'
      ? `${media.focalX}% ${media.focalY}%`
      : undefined
  const common = {
    src,
    // 85 umesto podrazumevanih 75: fotografije su vidno oštrije uz malo veći fajl (D-072).
    quality,
    alt: alt ?? media.alt ?? '',
    style: { objectPosition: position, ...style },
    // Next 16: `priority` je zastareo i ne postavlja fetchpriority; glavna slika dobija preload visokog prioriteta.
    ...(priority ? { preload: true, fetchPriority: 'high' as const } : {}),
    ...rest,
  }
  if (fill) return <Image {...common} fill alt={common.alt} />
  return (
    <Image {...common} alt={common.alt} width={media.width ?? 1600} height={media.height ?? 1600} />
  )
}
