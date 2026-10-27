import { Parallax } from '@/components/motion/Parallax'
import { WordReveal } from '@/components/motion/WordReveal'
import { CmsImage } from '@/components/ui/CmsImage'
import type { Media } from '@/payload-types'

/**
 * Figma "Collection hero" (54:974), 1440x837: pozadina #F6F4EE, naslov Inter Black 72/80
 * plavo verzal, opis 16/24 #444 (520px), slika 717px desno sa radijusom 28px.
 * Telefon: slika iznad teksta.
 */
export function CollectionHero({
  heading,
  text,
  image,
}: {
  heading: string
  text?: string | null
  image?: Media | number | null
}) {
  return (
    <section className="bg-sand-50 lg:h-[837px]">
      <div className="mx-auto flex max-w-[1440px] flex-col-reverse gap-6 px-[var(--gutter-footer)] pt-4 pb-10 lg:h-full lg:flex-row lg:items-center lg:gap-12 lg:py-12">
        <div className="flex flex-col lg:h-[497px] lg:min-w-px lg:flex-1">
          <div className="flex flex-col gap-[18px]">
            <WordReveal
              as="h1"
              trigger="load"
              text={heading}
              className="t-display text-primary uppercase"
            />
            {text ? (
              <p
                data-reveal="fade-load"
                style={{ '--i': 3 } as React.CSSProperties}
                className="max-w-[520px] text-[16px] leading-6 text-neutral-700"
              >
                {text}
              </p>
            ) : null}
          </div>
        </div>
        {image ? (
          <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-[20px] sm:aspect-[16/10] lg:aspect-auto lg:h-full lg:w-[min(717px,55%)] lg:rounded-[28px]">
            <Parallax speed={0.06}>
              <CmsImage
                media={image}
                fill
                priority
                sizes="(min-width: 1024px) 717px, 100vw"
                className="object-cover"
              />
            </Parallax>
          </div>
        ) : null}
      </div>
    </section>
  )
}
