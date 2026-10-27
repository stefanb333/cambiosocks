import { Parallax } from '@/components/motion/Parallax'
import { WordReveal } from '@/components/motion/WordReveal'
import { ViewButton } from '@/components/ui/Buttons'
import { CmsImage } from '@/components/ui/CmsImage'
import type { HomePage } from '@/payload-types'

type Props = { data: HomePage['categories'] }

const CARD = {
  light: {
    card: 'bg-beige',
    title: 'text-black',
    text: 'text-neutral-700',
    button: 'beige' as const,
  },
  blue: { card: 'bg-primary', title: 'text-yellow', text: 'text-white', button: 'blue' as const },
}

const TAG = {
  blue: 'bg-primary text-neutral-50',
  yellow: 'bg-yellow text-black',
  'dark-blue': 'bg-primary-dark text-white',
}

/**
 * Figma "kategorije" (22:169): naslov levo, opis desno; 3 kartice 409x599 (radijus 33px),
 * slika 399px pri dnu (radijus 22px), oznake 8px, dugme "Pogledaj Kolekciju" u donjem desnom uglu.
 * Telefon: kartice u horizontalnom nizu sa prevlačenjem (scroll-snap).
 */
export function Categories({ data }: Props) {
  const cards = data?.cards ?? []
  if (!cards.length) return null
  return (
    <section
      className="curtain-over relative z-10 bg-white pt-12 pb-14 lg:min-h-[1024px] lg:pt-[70px] lg:pb-[82px]"
      aria-labelledby="kategorije-naslov"
    >
      <div className="container-page">
        <div className="flex flex-col gap-3 text-black md:flex-row md:items-start md:justify-between">
          <WordReveal
            id="kategorije-naslov"
            text={data?.heading}
            className="t-heading max-w-[283px]"
          />
          {data?.subheading ? (
            <p data-reveal="up" className="max-w-[487px] text-[16px] leading-6 md:text-right">
              {data.subheading}
            </p>
          ) : null}
        </div>
      </div>

      <div className="container-page mt-8 max-lg:px-0 lg:mt-[74px]">
        <ul className="snap-row scroll-px-4 gap-3 px-4 lg:ml-[-6px] lg:grid lg:w-[calc(100%-8px)] lg:grid-cols-3 lg:gap-[22px] lg:overflow-visible lg:px-0">
          {cards.map((card, i) => {
            const theme = CARD[card.theme ?? 'light']
            const tag = TAG[card.tagTheme ?? 'blue']
            return (
              <li
                key={card.id ?? i}
                data-reveal="card"
                style={{ '--i': i } as React.CSSProperties}
                className={`card-lift relative flex w-[84%] max-w-[409px] flex-col overflow-hidden rounded-frame pt-[27px] sm:w-[60%] lg:h-[599px] lg:w-auto lg:max-w-none ${theme.card}`}
              >
                <div className="flex flex-col gap-5 px-[27px] pt-2 pb-6 lg:px-[39px] lg:pb-0">
                  {card.tag1 || card.tag2 ? (
                    <div className="flex items-center gap-[7px]">
                      {[card.tag1, card.tag2].filter(Boolean).map((t) => (
                        <span
                          key={t}
                          className={`flex h-6 items-center justify-center rounded-frame px-3 text-[12px] leading-4 font-bold tracking-[-0.2px] whitespace-nowrap lg:h-5 lg:px-2.5 lg:text-[8px] lg:tracking-[-0.6px] ${tag}`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="flex flex-col gap-4">
                    <h3 className={`t-heading ${theme.title}`}>{card.title}</h3>
                    {card.text ? (
                      <p
                        className={`text-[14px] leading-5 lg:h-12 lg:text-[12px] lg:leading-4 ${theme.text}`}
                      >
                        {card.text}
                      </p>
                    ) : null}
                  </div>
                </div>
                {/* Telefon: slika uvek pri dnu kartice (mt-auto), pa je na svim karticama ista bez
                    obzira na dužinu teksta; od 1024px je apsolutno pozicionirana kao u Figmi. */}
                <div className="relative mt-auto aspect-[409/399] w-full overflow-hidden rounded-card lg:absolute lg:bottom-0 lg:left-0 lg:mt-0 lg:aspect-auto lg:h-[399px]">
                  <Parallax speed={0.06}>
                    <CmsImage
                      media={card.image}
                      fill
                      sizes="(min-width: 1024px) 410px, 84vw"
                      className="object-cover"
                    />
                  </Parallax>
                </div>
                {card.cta?.label ? (
                  <ViewButton
                    href={card.cta.url}
                    theme={theme.button}
                    size="card"
                    className="absolute right-4 bottom-4 lg:right-[27px] lg:bottom-[22px]"
                  >
                    {card.cta.label}
                  </ViewButton>
                ) : null}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
