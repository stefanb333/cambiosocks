import { getImageProps } from 'next/image'
import { preload } from 'react-dom'
import { Parallax } from '@/components/motion/Parallax'
import { WordReveal } from '@/components/motion/WordReveal'
import { PrimaryPillButton, SoftPillButton } from '@/components/ui/Buttons'
import { coverSizes, mediaSrc } from '@/lib/media'
import type { HomePage, Media } from '@/payload-types'

type Props = { hero: HomePage['hero'] }

/** Nalepnice oko naslova: položaj u odnosu na naslov, boja i nagib (treća samo od 640px). */
const STICKERS = [
  // Položaji su na slobodnim mestima oko naslova (ne prekrivaju reči); na telefonu samo prva.
  {
    text: 'Od 1995.',
    rotate: '-9deg',
    className: 'sticker--black inline-flex -top-[30%] left-[6%] sm:-top-[6%] sm:-left-[8%]',
  },
  {
    text: 'Pravljeno u Novom Pazaru',
    rotate: '7deg',
    className: 'sticker--white hidden lg:inline-flex -top-[17%] -right-[7%]',
  },
  {
    text: 'Pamuk koji diše',
    rotate: '-5deg',
    className: 'sticker--blue hidden lg:inline-flex bottom-[6%] -left-[3%]',
  },
]

/**
 * Figma "hero" (17:3): okvir 1420x995 sa radijusom 33px i zatamnjenjem 12%, tekst centriran.
 * Na telefonu: uspravna slika (ako postoji u CMS-u), visina prema ekranu (svh), dugmad jedno ispod drugog.
 */
export function Hero({ hero }: Props) {
  const image = hero.image as Media | null
  const mobile = (hero.mobileImage as Media | null) ?? image
  if (!image?.url) return null

  const focal = (m: Media) =>
    typeof m.focalX === 'number' && typeof m.focalY === 'number'
      ? `${m.focalX}% ${m.focalY}%`
      : '50% 50%'

  // sizes prema okviru (D-072): telefon do 820px visine, desktop 995px; paralaksa 0.05
  const phoneSizes = coverSizes(
    mobile,
    [{ width: '100vw', height: 'min(820px, max(560px, 100vh))' }],
    1.12,
  )
  const desktopSizes = coverSizes(image, [{ width: '100vw', height: '995px' }], 1.12)
  const common = { alt: image.alt ?? '', priority: true as const, quality: 85 }
  const desktop = getImageProps({
    ...common,
    sizes: desktopSizes,
    src: mediaSrc(image.url)!,
    width: image.width ?? 2880,
    height: image.height ?? 1464,
  })
  const phone = getImageProps({
    ...common,
    sizes: phoneSizes,
    src: mediaSrc(mobile!.url)!,
    width: mobile!.width ?? 1600,
    height: mobile!.height ?? 1600,
  })

  // <picture> nema automatski preload: najavi tačnu sliku za telefon i za desktop (LCP).
  if (mobile === image) {
    preload(desktop.props.src, {
      as: 'image',
      imageSrcSet: desktop.props.srcSet,
      imageSizes: desktopSizes,
      fetchPriority: 'high',
    })
  } else {
    preload(phone.props.src, {
      as: 'image',
      imageSrcSet: phone.props.srcSet,
      imageSizes: phoneSizes,
      fetchPriority: 'high',
      media: '(max-width: 1023px)',
    })
    preload(desktop.props.src, {
      as: 'image',
      imageSrcSet: desktop.props.srcSet,
      imageSizes: desktopSizes,
      fetchPriority: 'high',
      media: '(min-width: 1024px)',
    })
  }

  return (
    // Sticky "zavesa" (D-057): hero ostaje na mestu dok sledeća sekcija klizi preko njega.
    // top je negativan za deo hero-a koji je viši od ekrana, pa se prvo vidi cela slika.
    <section
      className="hero-curtain sticky z-0 bg-white p-2 lg:px-2.5 lg:pt-[15px] lg:pb-[14px]"
      aria-label="Uvod"
    >
      <div className="relative h-[max(560px,calc(100svh-16px))] max-h-[820px] overflow-hidden rounded-[20px] lg:h-[995px] lg:max-h-none lg:rounded-frame">
        <Parallax speed={0.05}>
          <picture>
            <source
              media="(min-width: 1024px)"
              srcSet={desktop.props.srcSet}
              sizes={desktopSizes}
            />
            <img
              {...phone.props}
              alt={image.alt ?? ''}
              className="absolute inset-0 size-full object-cover"
              style={{ objectPosition: focal(mobile!) }}
            />
          </picture>
        </Parallax>
        <div className="absolute inset-0 bg-[rgba(15,15,15,0.12)]" aria-hidden />

        <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 flex-col items-center gap-10 pt-10 lg:inset-x-auto lg:left-1/2 lg:w-[878px] lg:-translate-x-1/2 lg:translate-y-[calc(-50%+13px)] lg:gap-14 lg:pt-0">
          <div className="flex w-full flex-col items-center gap-6 text-center [text-shadow:0_1px_3px_rgba(0,0,0,0.08)] lg:gap-[29px]">
            <div className="relative">
              <WordReveal
                as="h1"
                trigger="load"
                text={hero.heading}
                className="t-hero max-w-[658px] pr-[0.052em] text-yellow"
              />
              {/* Nalepnice preko naslova (D-064), dekorativne: iste činjenice su u tekstu sajta */}
              <div aria-hidden className="pointer-events-none absolute inset-0">
                {STICKERS.map((s, i) => (
                  <span
                    key={s.text}
                    className={`sticker ${s.className}`}
                    style={{ '--r': s.rotate, '--i': i } as React.CSSProperties}
                  >
                    {s.text}
                  </span>
                ))}
              </div>
            </div>
            {hero.subheading ? (
              <p
                data-reveal="fade-load"
                className="t-body-lg max-w-[411px] text-neutral-100"
                style={{ '--i': 2 } as React.CSSProperties}
              >
                {hero.subheading}
              </p>
            ) : null}
          </div>
          <div
            data-reveal="fade-load"
            className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:gap-4"
            style={{ '--i': 4 } as React.CSSProperties}
          >
            {hero.primaryCta?.label ? (
              <PrimaryPillButton
                href={hero.primaryCta.url}
                className="w-full max-w-[280px] sm:w-[193px]"
              >
                {hero.primaryCta.label}
              </PrimaryPillButton>
            ) : null}
            {hero.secondaryCta?.label ? (
              <SoftPillButton
                href={hero.secondaryCta.url}
                className="w-full max-w-[280px] sm:w-[193px]"
              >
                {hero.secondaryCta.label}
              </SoftPillButton>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
