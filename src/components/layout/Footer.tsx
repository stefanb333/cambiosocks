import Link from 'next/link'
import { WordReveal } from '@/components/motion/WordReveal'
import { getFooter, getShopInfo } from '@/lib/data'
import { FooterNewsletter } from './FooterNewsletter'

type FooterLink = { label: string; url?: string | null; newTab?: boolean | null }

/** Figma "Brand footer" (50:604), 1:1 na 1440px. Na mobilnom grupe linkova su akordeoni. */
export async function Footer() {
  const [footer, shop] = await Promise.all([getFooter(), getShopInfo()])

  // Instagram i TikTok URL-ovi se uzimaju iz Podešavanja prodavnice ako u footer-u nisu uneti.
  const resolveUrl = (link: FooterLink) => {
    if (link.url) return link.url
    if (/instagram/i.test(link.label)) return shop.instagram || null
    if (/tiktok/i.test(link.label)) return shop.tiktok || null
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
        <div className="flex flex-col-reverse gap-4 font-display text-[12px] leading-[normal] text-neutral-400 lg:text-[11px] lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <p className="max-w-[560px]">{footer.copyright}</p>
          <div className="flex flex-wrap items-start gap-x-8 gap-y-2 lg:justify-end">
            {(footer.legalLinks ?? []).map((link) => (
              <FooterAnchor
                key={link.label}
                link={link}
                url={link.url ?? null}
                className="hit hover:text-white"
              />
            ))}
            {footer.location ? <span>{footer.location}</span> : null}
          </div>
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
    return (
      <a
        href={url}
        className={`hover:underline hover:underline-offset-4 ${className}`}
        {...(link.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
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
