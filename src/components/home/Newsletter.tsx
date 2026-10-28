import { Parallax } from '@/components/motion/Parallax'
import { WordReveal } from '@/components/motion/WordReveal'
import { CmsImage } from '@/components/ui/CmsImage'
import { coverSizes } from '@/lib/media'
import type { HomePage } from '@/payload-types'
import { NewsletterForm } from './NewsletterForm'

type Props = { data: HomePage['newsletter'] }

/** Deo teksta između ** ** prikazuje se žutom bojom (Figma 50:558). */
function highlight(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 ? (
      <span key={i} className="text-yellow">
        {part}
      </span>
    ) : (
      part
    ),
  )
}

/**
 * Figma "newsletter" (50:546), visina 623px: pozadinska slika sa zatamnjenjem 15%,
 * "NE OKLEVAJ" Inter Black 72/80 žuto verzal, polje sa belim obodom 1.5px, tekst ispod.
 */
export function Newsletter({ data }: Props) {
  if (!data?.heading) return null
  return (
    <section
      id="newsletter"
      className="relative isolate overflow-hidden"
      aria-labelledby="newsletter-naslov"
    >
      <Parallax speed={0.1} className="-z-10">
        <CmsImage
          media={data.image}
          alt=""
          fill
          sizes={coverSizes(data.image, [
            { media: '(min-width: 1024px)', width: '100vw', height: '623px' },
            { width: '100vw', height: '560px' },
          ])}
          className="object-cover"
        />
      </Parallax>
      {/* Telefon: tekst je preko svetlog dela fotografije, pa je zatamnjenje jače radi čitljivosti (D-055). */}
      <div
        className="absolute inset-0 -z-10 bg-[rgba(15,15,15,0.45)] lg:bg-[rgba(15,15,15,0.15)]"
        aria-hidden
      />

      <div className="mx-auto flex min-h-[480px] w-full max-w-[496px] flex-col items-center justify-center gap-8 px-4 py-16 lg:h-[623px] lg:min-h-0 lg:max-w-[464px] lg:px-0 lg:py-[131px]">
        <div className="flex w-full max-w-[410px] flex-col items-center gap-2 text-center">
          <WordReveal
            id="newsletter-naslov"
            text={data.heading}
            className="t-display w-full pr-[0.0694em] text-yellow uppercase lg:whitespace-nowrap"
          />
          {data.subheading ? (
            <p className="t-body-lg w-full text-white">{data.subheading}</p>
          ) : null}
        </div>
        <div
          data-reveal="up"
          style={{ '--i': 2 } as React.CSSProperties}
          className="flex w-full flex-col items-center gap-[26px]"
        >
          <NewsletterForm placeholder={data.placeholder || 'Prijavi se na Newsletter'} />
          {data.note ? (
            <p className="max-w-[428px] text-center text-[16px] leading-6 text-white">
              {highlight(data.note)}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
