import { Parallax } from '@/components/motion/Parallax'
import { ViewButton } from '@/components/ui/Buttons'
import { CmsImage } from '@/components/ui/CmsImage'
import { coverSizes } from '@/lib/media'
import type { Media } from '@/payload-types'

type Props = {
  headingLine1?: string | null
  headingLine2?: string | null
  text?: string | null
  image?: Media | number | null
  pillImage?: Media | number | null
  cta?: { label?: string | null; url?: string | null } | null
  /** Pozicija pozadinske slike; podrazumevano fokus tačka slike iz CMS-a. */
  imagePosition?: string
  /** Početna (25:725): zatamnjenje 25%, dugme 38px. Kolekcija (52:1083): 10%, dugme 50px. */
  variant?: 'home' | 'collection'
}

/**
 * Figma "cta collection" (25:725), visina 570px: pozadinska slika sa zatamnjenjem 25%,
 * naslov Inter Black 96.35px verzal, žut, poravnat u bloku 641px; u prvom redu između reči
 * stoji mala slika (208.76x72.26, radijus 44px). Sve dimenzije naslova su u em jedinicama
 * da bi se na telefonu srazmerno smanjile.
 */
export function CtaBanner({
  headingLine1,
  headingLine2,
  text,
  image,
  pillImage,
  cta,
  imagePosition,
  variant = 'home',
}: Props) {
  const [first, ...restOfLine1] = (headingLine1 ?? '').split(' ')
  const second = restOfLine1.join(' ')

  return (
    <section
      // Prelazi 24px preko prethodne sekcije sa zaobljenim gornjim ivicama i senkom, kao
      // kategorije preko hero slike: u uglovima se vidi prethodna sekcija, ne bela pozadina (D-081).
      className="relative z-10 -mt-6 rounded-t-[24px] shadow-[0_-24px_48px_-20px_rgba(15,15,15,0.25)] isolate overflow-hidden"
      aria-label={`${headingLine1 ?? ''} ${headingLine2 ?? ''}`.trim()}
    >
      <Parallax speed={0.1} className="-z-10">
        <CmsImage
          media={image}
          alt=""
          fill
          sizes={coverSizes(image, [
            { media: '(min-width: 1024px)', width: '100vw', height: '570px' },
            { width: '100vw', height: '560px' },
          ])}
          className="object-cover"
          style={imagePosition ? { objectPosition: imagePosition } : undefined}
        />
      </Parallax>
      <div
        className={`absolute inset-0 -z-10 ${variant === 'home' ? 'bg-black/25' : 'bg-black/10'}`}
        aria-hidden
      />

      <div className="flex min-h-[460px] flex-col items-center justify-center gap-8 px-4 py-16 lg:h-[570.11px] lg:py-[105px]">
        <h2 data-reveal="up" className="t-cta scroll-grow w-[6.653em] text-yellow">
          <span className="flex items-center justify-between">
            <span>{first}</span>
            {pillImage ? (
              <span
                className="scroll-spin relative block h-[0.75em] w-[2.1667em] shrink-0 overflow-hidden rounded-[0.4583em]"
                aria-hidden
              >
                <CmsImage media={pillImage} alt="" fill sizes="210px" className="object-cover" />
              </span>
            ) : null}
            {second ? <span>{second}</span> : null}
          </span>
          {headingLine2 ? (
            <span className="block text-justify [text-align-last:justify]">{headingLine2}</span>
          ) : null}
        </h2>
        {text ? (
          <p
            data-reveal="up"
            style={{ '--i': 1 } as React.CSSProperties}
            className="max-w-[407px] text-center text-[16px] leading-6 font-semibold text-white"
          >
            {text}
          </p>
        ) : null}
        {cta?.label && cta.url ? (
          <div
            data-reveal="up"
            style={{ '--i': 2 } as React.CSSProperties}
            className="flex w-full justify-center"
          >
            <ViewButton
              href={cta.url}
              theme="yellow"
              size="lg"
              className={variant === 'collection' ? 'h-[50px]!' : ''}
            >
              {cta.label}
            </ViewButton>
          </div>
        ) : null}
      </div>
    </section>
  )
}
