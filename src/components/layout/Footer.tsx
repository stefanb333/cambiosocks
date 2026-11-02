import Link from 'next/link'
import { WordReveal } from '@/components/motion/WordReveal'
import { getFooter, getShopInfo } from '@/lib/data'
import { FooterNewsletter } from './FooterNewsletter'

type FooterLink = { label: string; url?: string | null; newTab?: boolean | null }

/** Figma "Brand footer" (50:604), 1:1 na 1440px. Na mobilnom grupe linkova su akordeoni. */
export async function Footer() {
  const [footer, shop] = await Promise.all([getFooter(), getShopInfo()])

  // Instagram i Facebook URL-ovi se uzimaju iz Podešavanja prodavnice ako u footer-u nisu uneti.
  const resolveUrl = (link: FooterLink) => {
    if (link.url) return link.url
    if (/instagram/i.test(link.label)) return shop.instagram || null
    if (/facebook/i.test(link.label)) return shop.facebook || null
    return null
  }

  const groups = footer.groups ?? []

  return (
    <footer
      className="bg-black text-white"
      style={{ paddingBottom: 'max(32px, var(--safe-bottom))' }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-[var(--gutter-footer)] pt-12 lg:gap-12 lg:pt-[72px]">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex w-full flex-col gap-8 lg:w-[540px]">
            <img
              loading="lazy"
              src="/figma/logo-mark-white.svg"
              alt="Cambio"
              width={99}
              height={36.2}
              className="h-[36.2px] w-[99px]"
            />
            <WordReveal
              text={footer.heading}
              className="font-display text-[length:var(--fs-footer-heading)] leading-[1.1] font-bold tracking-[-0.02em] text-white"
            />
            <FooterNewsletter
              placeholder={footer.emailPlaceholder || 'Vaša e-mail adresa'}
              buttonLabel={footer.buttonLabel || 'Prijavi se'}
            />
            {footer.newsletterNote ? (
              <p className="font-display text-[12px] leading-[1.45] text-neutral-400 lg:text-[11px] lg:leading-[1.4]">
                {footer.newsletterNote}
              </p>
            ) : null}
          </div>

          {/* Desktop: kolone kao u Figmi */}
          <nav aria-label="Linkovi u podnožju" className="hidden gap-12 lg:flex">
            {groups.map((group) => (
              <div key={group.heading} className="flex w-[170px] flex-col gap-5">
                <h3 className="font-display text-[12px] leading-[normal] font-bold tracking-[0.96px] text-neutral-400 uppercase">
                  {group.heading}
                </h3>
                <ul className="flex flex-col gap-3 font-display text-[15px] leading-[normal] font-medium">
                  {(group.links ?? []).map((link) => (
                    <li key={link.label}>
                      <FooterAnchor link={link} url={resolveUrl(link)} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* Mobilni i tablet: akordeoni */}
          <nav
            aria-label="Linkovi u podnožju"
            className="flex flex-col border-t border-neutral-700 lg:hidden"
          >
            {groups.map((group) => (
              <details key={group.heading} className="group border-b border-neutral-700">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between font-display text-[12px] font-bold tracking-[0.96px] text-neutral-400 uppercase [&::-webkit-details-marker]:hidden">
                  {group.heading}
                  <span
                    aria-hidden
                    className="text-[18px] leading-none text-white transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <ul className="flex flex-col pb-3 font-display text-[15px] font-medium">
                  {(group.links ?? []).map((link) => (
                    <li key={link.label}>
                      <FooterAnchor
                        link={link}
                        url={resolveUrl(link)}
                        className="flex min-h-11 items-center"
                      />
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </nav>
        </div>

        <img
          loading="lazy"
          src="/figma/footer-divider.svg"
          alt=""
          aria-hidden
          width={1312}
          height={1}
          className="hidden h-px w-full lg:block"
        />

        <p
          aria-hidden
          data-reveal="letters"
          className="letters text-center font-display leading-[0.82] font-bold tracking-[-0.06em] text-neutral-700 select-none"
          style={{
            fontSize: 'calc(min(100vw - 2 * var(--gutter-footer), 1312px) * 0.26047)',
            paddingRight: '0.06em',
          }}
        >
          {/* Slova izlaze jedno po jedno kada footer uđe u ekran (D-064) */}
          {'CAMBIO'.split('').map((letter, i) => (
            <span key={i} style={{ '--i': i } as React.CSSProperties}>
              {letter}
            </span>
          ))}
        </p>

        {/* Pravni linkovi u redu, ispod njih podaci o trgovcu (naziv, MB, PIB, adresa; D-061) */}
        {/* Telefon: linkovi u dve kolone, svaki sa zonom dodira 44px bez preklapanja sa susednim
            (D-081); potpis autora je u posebnom redu ispod linije, daleko od pravnih linkova. */}
        <div className="flex flex-col gap-6 font-display leading-[normal] text-neutral-400 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <nav
            aria-label="Pravne informacije"
            className="grid grid-cols-2 gap-x-6 text-[14px] lg:order-2 lg:flex lg:flex-wrap lg:justify-end lg:gap-x-8 lg:gap-y-2 lg:text-[11px]"
          >
            {(footer.legalLinks ?? []).map((link) => (
              <FooterAnchor
                key={link.label}
                link={link}
                url={link.url ?? null}
                className="flex min-h-11 items-center hover:text-white lg:min-h-0"
              />
            ))}
          </nav>
          <p className="max-w-[560px] text-[12px] lg:order-1 lg:text-[11px]">{footer.copyright}</p>
        </div>

        <div className="-mt-4 flex flex-col gap-1 border-t border-neutral-800 pt-3 font-display text-[12px] leading-[normal] text-neutral-500 sm:flex-row sm:items-center sm:justify-between lg:mt-0 lg:text-[11px]">
          {footer.location ? <span>{footer.location}</span> : <span />}
          {/* Potpis autora sajta (D-078): u kodu, ne u adminu */}
          <a
            href="https://sbgrafix.com/"
            target="_blank"
            rel="noopener"
            className="flex min-h-11 items-center hover:text-white lg:min-h-0"
          >
            Dizajn i razvoj SB Grafix
          </a>
        </div>
      </div>
    </footer>
  )
}

function FooterAnchor({
  link,
  url,
  className = '',
}: {
  link: FooterLink
  url: string | null
  className?: string
}) {
  if (!url) return <span className={className}>{link.label}</span>
  const external = /^(https?:|mailto:|tel:)/.test(url)
  if (external) {
    const icon = socialIcon(url)
    return (
      <a
        href={url}
        className={`hover:underline hover:underline-offset-4 ${icon ? 'inline-flex items-center gap-2' : ''} ${className}`}
        {...(link.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {icon}
        {link.label}
      </a>
    )
  }
  return (
    <Link href={url} className={`hover:underline hover:underline-offset-4 ${className}`}>
      {link.label}
    </Link>
  )
}

/** Ikonica mreže ispred linka (D-081), prepoznaje se po adresi profila. Boja prati tekst. */
function socialIcon(url: string) {
  const props = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    'aria-hidden': true,
    className: 'shrink-0',
  } as const
  if (/instagram\.com/i.test(url))
    return (
      <svg {...props}>
        <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.13 1.38A5.88 5.88 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.13.67.66 1.34 1.08 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.88 5.88 0 0 0 2.13-1.38 5.88 5.88 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.88 5.88 0 0 0-1.38-2.13A5.88 5.88 0 0 0 19.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88Z" />
      </svg>
    )
  if (/facebook\.com/i.test(url))
    return (
      <svg {...props}>
        <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07Z" />
      </svg>
    )
  return null
}
