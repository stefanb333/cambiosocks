import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'
import { CtaBanner } from '@/components/home/CtaBanner'
import { Parallax } from '@/components/motion/Parallax'
import { WordReveal } from '@/components/motion/WordReveal'
import { JsonLd } from '@/components/seo/JsonLd'
import { CmsImage } from '@/components/ui/CmsImage'
import { coverSizes } from '@/lib/media'
import { faqSchema, jsonLdGraph } from '@/lib/seo'
import type { Media, Page } from '@/payload-types'
import { ContactForm } from './ContactForm'

type Block = NonNullable<Page['layout']>[number]
type Of<T extends Block['blockType']> = Extract<Block, { blockType: T }>

/** Sekcije statičnih stranica, 1:1 sa Figma frejmovima "O NAMA", "kontakt" i "FAQ page". */
export function RenderBlocks({ blocks, pageTitle }: { blocks: Block[]; pageTitle: string }) {
  return (
    <>
      {blocks.map((block, i) => {
        const first = i === 0
        switch (block.blockType) {
          case 'pageHero':
            return <PageHero key={block.id ?? i} block={block} pageTitle={pageTitle} />
          case 'story':
            return <Story key={block.id ?? i} block={block} />
          case 'stats':
            return <Stats key={block.id ?? i} block={block} />
          case 'faq':
            return <Faq key={block.id ?? i} block={block} first={first} />
          case 'contact':
            return <Contact key={block.id ?? i} block={block} first={first} />
          case 'richText':
            return (
              <RichTextSection key={block.id ?? i} block={block} title={first ? pageTitle : null} />
            )
          case 'ctaBanner':
            return (
              <CtaBanner
                key={block.id ?? i}
                headingLine1={block.headingLine1}
                headingLine2={block.headingLine2}
                text={block.text}
                image={block.image as Media | null}
                cta={block.cta}
              />
            )
          default:
            return null
        }
      })}
    </>
  )
}

/**
 * Figma "o nama HERO" (60:766), 1440x867: fotografija sa zatamnjenjem 50%, naslov "Naša priča"
 * (Inter Black 72/80, -5, žuto) i podnaslov (Jakarta 16/24, belo) od 420px, razmak 14px, pa
 * ikonica za skrol 201px ispod teksta. Telefon: tekst centriran, ikonica pri dnu slike.
 */
function PageHero({ block, pageTitle }: { block: Of<'pageHero'>; pageTitle: string }) {
  return (
    // overflow-hidden: paralaksa uvećava i pomera sliku, pa bez njega slika izlazi ispod sekcije
    // (van zatamnjenja) i prekriva tekst sledeće sekcije pri skrolu.
    <section className="relative isolate flex h-[min(82svh,620px)] flex-col items-center justify-center overflow-hidden px-[var(--gutter)] pt-14 md:h-[680px] lg:h-[867px] lg:justify-start lg:px-0 lg:pt-[420px]">
      <Parallax speed={0.08} className="-z-10">
        <CmsImage
          media={block.image}
          alt=""
          fill
          priority
          sizes={coverSizes(block.image, [
            { media: '(min-width: 1024px)', width: '100vw', height: '867px' },
            { media: '(min-width: 768px)', width: '100vw', height: '680px' },
            { width: '100vw', height: 'min(82vh, 620px)' },
          ])}
          className="object-cover"
        />
      </Parallax>
      <div
        className="absolute inset-0 -z-10 bg-black"
        style={{ opacity: (block.overlay ?? 50) / 100 }}
        aria-hidden
      />
      {block.heading ? (
        <div className="flex w-full max-w-[408px] flex-col items-center gap-3.5 text-center">
          <WordReveal
            as="h1"
            trigger="load"
            text={block.heading}
            className="t-display w-full pr-[0.0694em] text-yellow uppercase lg:whitespace-nowrap"
          />
          {block.subheading ? (
            <p
              data-reveal="fade-load"
              style={{ '--i': 2 } as React.CSSProperties}
              className="max-w-[380px] text-[16px] leading-6 text-white"
            >
              {block.subheading}
            </p>
          ) : null}
        </div>
      ) : (
        <h1 className="visually-hidden">{pageTitle}</h1>
      )}
      <a
        href="#nastavak"
        aria-label="Pređi na sadržaj ispod"
        className="absolute bottom-4 left-1/2 flex size-11 -translate-x-1/2 items-center justify-center lg:static lg:mt-[201px] lg:translate-x-0"
      >
        <img
          loading="lazy"
          src="/figma/scroll-mouse.svg"
          alt=""
          width={18}
          height={44}
          className="scroll-hint"
        />
      </a>
      <span id="nastavak" className="absolute bottom-0 scroll-mt-14 lg:scroll-mt-0" aria-hidden />
    </section>
  )
}

/** Figma "Naš početak" (62:1194, bela) i "Od fabrike do brenda" (62:1205, plava #075ED1). */
function Story({ block }: { block: Of<'story'> }) {
  const blue = block.theme === 'blue'
  const images = (block.images ?? []).map((i) => i.image)
  return (
    <section
      className={
        blue
          ? 'bg-[#075ed1] py-14 lg:pt-24 lg:pb-[88px]'
          : 'bg-white py-14 lg:pt-[104px] lg:pb-[112px]'
      }
    >
      <div
        className={`container-page flex flex-col ${blue ? 'gap-10 lg:gap-14' : 'gap-10 lg:gap-16'}`}
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <WordReveal
            text={block.heading}
            className={`t-heading ${blue ? 'max-w-[413px] text-white' : 'max-w-[331px] text-[#101010]'}`}
          />
          {blue ? (
            block.text ? (
              <p
                data-reveal="up"
                className="max-w-[580px] text-[16px] leading-6 text-white/80 md:text-right"
              >
                {block.text}
              </p>
            ) : null
          ) : block.lead ? (
            <p
              data-reveal="up"
              className="max-w-[470px] font-display text-[20px] leading-[28px] font-medium tracking-[-0.2px] text-[#101010] md:text-right lg:text-[24px] lg:leading-8"
            >
              {block.lead}
            </p>
          ) : null}
        </div>

        {images.length ? (
          <div
            className={`snap-row -mx-[var(--gutter)] scroll-px-[var(--gutter)] px-[var(--gutter)] md:mx-0 md:grid md:overflow-visible md:px-0 ${
              images.length >= 4
                ? 'gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4'
                : 'gap-3 md:grid-cols-2 md:gap-5'
            }`}
          >
            {images.map((image, i) => (
              <div
                key={i}
                data-reveal="image"
                style={{ '--i': i } as React.CSSProperties}
                className={`relative h-[360px] overflow-hidden rounded-2xl md:w-auto lg:h-[430px] ${images.length >= 4 ? 'w-[72%]' : 'w-[86%]'}`}
              >
                <Parallax speed={0.07}>
                  <CmsImage
                    media={image}
                    fill
                    sizes={coverSizes(image, [
                      {
                        media: '(min-width: 1024px)',
                        width: images.length >= 4 ? '25vw' : '50vw',
                        height: '430px',
                      },
                      { media: '(min-width: 768px)', width: '50vw', height: '360px' },
                      { width: images.length >= 4 ? '72vw' : '86vw', height: '360px' },
                    ])}
                    className="object-cover"
                  />
                </Parallax>
              </div>
            ))}
          </div>
        ) : null}

        {!blue && block.text ? (
          <p data-reveal="up" className="text-center text-[16px] leading-6 text-[#69717c]">
            {block.text}
          </p>
        ) : null}
        {blue && block.note ? (
          <p className="text-center text-[14px] leading-5 font-semibold text-white">{block.note}</p>
        ) : null}
      </div>
    </section>
  )
}

/** Figma "Cambio u brojkama" (62:1219): pozadina #F3F5F7, mreža 2x2 kartica 420px, završni poziv. */
function Stats({ block }: { block: Of<'stats'> }) {
  return (
    <section className="bg-[#f3f5f7] py-14 lg:pt-28 lg:pb-[120px]">
      <div className="container-page flex flex-col gap-10 lg:gap-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <WordReveal text={block.heading} className="t-heading max-w-[194px] text-[#101010]" />
          {block.description ? (
            <p
              data-reveal="up"
              className="max-w-[390px] text-[16px] leading-6 text-[#69717c] md:text-right"
            >
              {block.description}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:gap-5">
          {(block.items ?? []).map((item, i) => (
            // Sticky špil (D-057): svaka kartica se zalepi ispod header-a, a sledeća klizi preko nje.
            // Na telefonu je špil po kartici, od 768px po redu od dve kartice.
            <div
              key={item.id ?? i}
              style={{ '--stack-sm': i, '--stack-md': Math.floor(i / 2) } as React.CSSProperties}
              className="stack-card sticky top-[calc(var(--header-h)+16px+var(--stack-sm)*14px)] isolate flex h-[280px] flex-col justify-between overflow-hidden rounded-2xl p-6 md:top-[calc(var(--header-h)+24px+var(--stack-md)*18px)] md:h-[360px] lg:h-[420px] lg:p-10"
            >
              <Parallax speed={0.06} className="-z-10">
                <CmsImage
                  media={item.image}
                  alt=""
                  fill
                  sizes={coverSizes(item.image, [
                    { media: '(min-width: 1024px)', width: '50vw', height: '420px' },
                    { media: '(min-width: 768px)', width: '50vw', height: '360px' },
                    { width: '100vw', height: '280px' },
                  ])}
                  className="object-cover"
                />
              </Parallax>
              <div className="absolute inset-0 -z-10 bg-[rgba(7,16,27,0.5)]" aria-hidden />
              <p
                className={`font-display text-[48px] leading-[normal] font-extrabold tracking-[-0.04em] whitespace-nowrap lg:text-[68px] ${
                  item.highlight ? 'text-yellow' : 'text-white'
                }`}
              >
                {item.number}
              </p>
              <p className="max-w-[280px] font-display text-[20px] leading-7 font-medium tracking-[-0.2px] text-white lg:text-[24px] lg:leading-8">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {block.ctaText || block.cta?.label ? (
          <div className="flex flex-col gap-6 pt-6 md:flex-row md:items-center md:justify-between lg:pt-12 lg:pb-4">
            {block.ctaText ? (
              <WordReveal
                as="p"
                text={block.ctaText}
                className="t-heading max-w-[650px] text-[#101010]"
              />
            ) : null}
            {block.cta?.label ? (
              <Link
                href={block.cta.url}
                className="group press flex h-[49px] w-full max-w-[329px] shrink-0 items-center justify-center gap-2 overflow-hidden rounded-[99px] bg-yellow py-2 pr-2 pl-[18px] shadow-sm"
              >
                <span className="flex-1 text-center text-[16px] leading-[normal] font-medium tracking-[-0.16px] text-black">
                  {block.cta.label}
                </span>
                <span
                  className="flex size-[29px] items-center justify-center rounded-[15.8px] bg-black"
                  aria-hidden
                >
                  <img
                    loading="lazy"
                    src="/figma/arrow-right-stats.svg"
                    alt=""
                    width={15.8}
                    height={15.8}
                    className="icon-nudge"
                  />
                </span>
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}

/** Figma "FAQ content" (82:1078): uvod, kartica sa pitanjima (prvo otvoreno), kartica podrške 360px. */
function Faq({ block, first }: { block: Of<'faq'>; first: boolean }) {
  const H = first ? 'h1' : 'h2'
  // FAQPage šema: pitanja i odgovori kao činjenice za Google i AI pretraživače (AEO, D-063).
  const qa = (block.items ?? []).map((q) => ({ question: q.question, answer: q.answer }))
  return (
    <section className="bg-white pt-12 pb-16 lg:min-h-[1071px] lg:pt-[88px] lg:pb-[120px]">
      {qa.length ? <JsonLd data={jsonLdGraph(faqSchema(qa))} /> : null}
      <div className="container-page flex flex-col gap-10 lg:gap-16">
        <div className="flex flex-col items-center gap-5 text-center">
          <WordReveal
            as={H}
            trigger={first ? 'load' : 'view'}
            text={block.heading}
            className="max-w-[820px] font-display text-[clamp(34px,calc(34px+22*var(--vw-ratio)),56px)] leading-[1.143] font-bold tracking-[-1.2px] text-black"
          />
          {block.description ? (
            <p
              data-reveal={first ? 'fade-load' : 'up'}
              style={{ '--i': 2 } as React.CSSProperties}
              className="max-w-[542px] text-[16px] leading-6 text-neutral-700"
            >
              {block.description}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-[72px]">
          <div className="flex min-w-0 flex-1 flex-col gap-3 rounded-2xl bg-white p-5 shadow-[0_18px_50px_rgba(15,15,15,0.07)] sm:p-8">
            {(block.items ?? []).map((item, i) => (
              <details
                key={item.id ?? i}
                open={i === 0}
                className="faq-item group flex flex-col border-b border-neutral-100 pb-6 [&:not(:first-child)]:pt-0"
              >
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 lg:min-h-9 [&::-webkit-details-marker]:hidden">
                  <span className="max-w-[650px] text-[16px] leading-6 font-semibold text-black">
                    {item.question}
                  </span>
                  <img
                    loading="lazy"
                    src="/figma/faq-toggle-closed.svg"
                    alt=""
                    width={36}
                    height={36}
                    className="faq-icon shrink-0 group-open:hidden"
                  />
                  <img
                    loading="lazy"
                    src="/figma/faq-toggle-open.svg"
                    alt=""
                    width={36}
                    height={36}
                    className="faq-icon hidden shrink-0 group-open:block"
                  />
                </summary>
                <p className="mt-6 max-w-[650px] text-[14px] leading-5 text-neutral-700">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>

          {block.support?.show ? (
            <aside className="flex w-full flex-col gap-6 rounded-2xl bg-white p-8 shadow-[0_18px_50px_rgba(15,15,15,0.07)] lg:w-[360px] lg:shrink-0 lg:p-9">
              <span
                className="flex size-[52px] items-center justify-center rounded-[99px] bg-primary"
                aria-hidden
              >
                <img loading="lazy" src="/figma/faq-message.svg" alt="" width={22} height={22} />
              </span>
              <div className="flex flex-col gap-2.5">
                <h2 className="t-heading text-black">{block.support.title}</h2>
                {block.support.text ? (
                  <p className="text-[14px] leading-5 text-neutral-700">{block.support.text}</p>
                ) : null}
              </div>
              {block.support.buttonLabel ? (
                <Link
                  href={block.support.buttonUrl || '/kontakt'}
                  className="flex h-12 w-full items-center justify-between rounded-[99px] bg-primary px-5 text-white hover:bg-primary-dark"
                >
                  <span className="text-[14px] leading-5 font-semibold">
                    {block.support.buttonLabel}
                  </span>
                  <span className="font-display text-[20px] leading-[normal]" aria-hidden>
                    →
                  </span>
                </Link>
              ) : null}
              {block.support.availability ? (
                <p className="text-center text-[12px] leading-4 text-neutral-700">
                  {block.support.availability}
                </p>
              ) : null}
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/** Figma "Contact" (79:908): uvod i kontakt podaci levo, kartica sa formom desno. */
function Contact({ block, first }: { block: Of<'contact'>; first: boolean }) {
  const H = first ? 'h1' : 'h2'
  const tel = block.phone ? `tel:${block.phone.replace(/[^\d+]/g, '')}` : null
  const map = block.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(block.address)}`
    : null
  const details = [
    block.email
      ? {
          icon: '/figma/contact-mail.svg',
          label: 'Pišite nam',
          value: block.email,
          href: `mailto:${block.email}`,
        }
      : null,
    block.phone
      ? { icon: '/figma/contact-phone.svg', label: 'Pozovite nas', value: block.phone, href: tel }
      : null,
    block.address
      ? { icon: '/figma/contact-pin.svg', label: 'Posetite nas', value: block.address, href: map }
      : null,
  ].filter(Boolean) as { icon: string; label: string; value: string; href: string | null }[]

  return (
    <section className="bg-paper pt-10 pb-16 lg:min-h-[928px] lg:pt-[82px] lg:pb-[98px]">
      <div className="container-page flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-center lg:gap-20">
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <div className="flex flex-col gap-6">
            <WordReveal
              as={H}
              trigger={first ? 'load' : 'view'}
              text={block.heading}
              className="font-display text-[clamp(40px,calc(40px+16*var(--vw-ratio)),56px)] leading-[1.143] font-bold tracking-[-1.2px] text-black"
            />
            {block.description ? (
              <p className="max-w-[500px] text-[16px] leading-6 text-[#676767]">
                {block.description}
              </p>
            ) : null}
          </div>
          <div className="h-px w-full bg-[#d9d9d4]" />
          <ul className="flex flex-col gap-6">
            {details.map((d) => (
              <li key={d.label} className="flex items-center gap-4">
                {/* Telefon: blaga ivica i veća ikonica, da beli krug ne nestane na svetloj pozadini */}
                <span
                  className="flex size-11 shrink-0 items-center justify-center rounded-[99px] bg-white shadow-[0_1px_3px_rgba(15,15,15,0.08)] ring-1 ring-[#e3e0d8] lg:size-[42px] lg:shadow-none lg:ring-0"
                  aria-hidden
                >
                  <img
                    loading="lazy"
                    src={d.icon}
                    alt=""
                    width={18}
                    height={18}
                    className="size-5 lg:size-[18px]"
                  />
                </span>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[12px] leading-4 text-[#676767]">{d.label}</span>
                  {d.href ? (
                    <a
                      href={d.href}
                      className="inline-flex min-h-11 items-center self-start text-[16px] leading-6 font-semibold break-words text-black hover:text-primary lg:min-h-0"
                      {...(d.href.startsWith('http')
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      {d.value}
                    </a>
                  ) : (
                    <span className="text-[16px] leading-6 font-semibold text-black">
                      {d.value}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {block.availability ? (
            <p className="pl-[58px] text-[13px] leading-5 text-[#676767] lg:max-w-[128px] lg:pl-0 lg:text-[12px] lg:leading-4 lg:tracking-[0.2px]">
              {block.availability}
            </p>
          ) : null}
        </div>

        <ContactForm
          heading={block.formHeading}
          description={block.formDescription}
          topics={(block.topics ?? '')
            .split('\n')
            .map((t) => t.trim())
            .filter(Boolean)}
          consentText={block.consentText}
          responseNote={block.responseNote}
          successMessage={block.successMessage}
        />
      </div>
    </section>
  )
}

/** Tekstualne stranice (Dostava, Uslovi, Reklamacije, Privatnost): tipografija kao na FAQ stranici. */
function RichTextSection({ block, title }: { block: Of<'richText'>; title: string | null }) {
  return (
    <section className="bg-white pt-12 pb-16 lg:pt-[88px] lg:pb-[120px]">
      <div className="container-page flex flex-col items-center gap-10 lg:gap-16">
        {title ? (
          <WordReveal
            as="h1"
            trigger="load"
            text={title}
            className="max-w-[820px] text-center font-display text-[clamp(34px,calc(34px+22*var(--vw-ratio)),56px)] leading-[1.143] font-bold tracking-[-1.2px] text-black"
          />
        ) : null}
        <div className="w-full max-w-[760px] rounded-2xl bg-white p-6 shadow-[0_18px_50px_rgba(15,15,15,0.07)] sm:p-10 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-[22px] [&_h2]:leading-7 [&_h2]:font-bold [&_h2]:tracking-[-0.5px] [&_h2]:text-black [&_h2:first-child]:mt-0 [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-display [&_h3]:text-[18px] [&_h3]:leading-6 [&_h3]:font-bold [&_h3]:text-black [&_strong]:font-semibold [&_strong]:text-black [&_p]:mb-3 [&_p]:text-[16px] [&_p]:leading-6 [&_p]:text-neutral-700 [&_a]:text-primary [&_a]:underline [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:text-[16px] [&_li]:leading-6 [&_li]:text-neutral-700">
          <RichText data={block.content} />
        </div>
      </div>
    </section>
  )
}
