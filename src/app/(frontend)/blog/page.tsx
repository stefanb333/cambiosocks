import Link from 'next/link'
import { ArticleCard } from '@/components/blog/ArticleCard'
import { ArticleCarousel } from '@/components/blog/ArticleCarousel'
import { Header } from '@/components/layout/Header'
import { WordReveal } from '@/components/motion/WordReveal'
import { CmsImage } from '@/components/ui/CmsImage'
import { formatDateSr, getPosts } from '@/lib/blog'
import type { Metadata } from 'next'

// Tekstovi zaglavlja su 1:1 iz Figme (86:969).
const HEADING = 'Cambio Blog'
const INTRO =
  'Saveti o izboru, održavanju i kombinovanju čarapa, vodič za veličine i novosti iz naše fabrike u Novom Pazaru.'

export const metadata: Metadata = {
  title: 'Blog o čarapama: saveti, vodiči i tabela veličina',
  description:
    'Kako izabrati veličinu čarapa, koje čarape za trčanje, kako ih prati da duže traju i kako ih kombinovati: saveti iz fabrike čarapa u Novom Pazaru.',
  alternates: { canonical: '/blog' },
}

/**
 * Figma "Blog" (84:1424): izdvojeni članak i najnoviji članci. Sekcija "Uskoro u prodaji" iz
 * Figme je uklonjena na zahtev klijenta (D-067).
 */
export default async function BlogPage() {
  const posts = await getPosts()
  const featured = posts.find((p) => p.featured) ?? posts[0]
  const latest = posts.filter((p) => p.id !== featured?.id)

  return (
    <>
      <Header />
      <main id="sadrzaj" className="bg-neutral-50">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-12 px-[var(--gutter)] pt-12 pb-20 lg:gap-16 lg:pt-[88px] lg:pb-[120px]">
          <div className="flex flex-col items-center gap-5 text-center">
            <WordReveal
              as="h1"
              trigger="load"
              text={HEADING}
              className="max-w-[820px] font-display text-[clamp(40px,calc(40px+16*var(--vw-ratio)),56px)] leading-[1.143] font-bold tracking-[-1.2px] text-black"
            />
            <p
              data-reveal="fade-load"
              style={{ '--i': 2 } as React.CSSProperties}
              className="max-w-[542px] text-[16px] leading-6 text-neutral-700"
            >
              {INTRO}
            </p>
          </div>

          {featured ? <FeaturedPost post={featured} /> : null}

          {latest.length ? (
            <ArticleCarousel heading="Najnoviji članci">
              {latest.map((post) => (
                <li key={post.id} className="flex" data-reveal="card">
                  <ArticleCard post={post} />
                </li>
              ))}
            </ArticleCarousel>
          ) : null}
        </div>
      </main>
    </>
  )
}

/** Figma "Featured section" (86:972): plava kartica 1287x691, slika 760x442, bočna kolona 346px. */
function FeaturedPost({ post }: { post: import('@/payload-types').Post }) {
  const date = formatDateSr(post.publishedAt)
  const href = `/blog/${post.slug}`
  return (
    <section
      aria-label="Izdvojeni članak"
      className="flex w-full max-w-[1287px] flex-col gap-6 overflow-hidden rounded-2xl bg-primary px-5 py-8 lg:h-[691px] lg:items-center lg:justify-center lg:px-0 lg:py-0"
    >
      <div className="flex w-full max-w-[1143px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex max-w-[620px] flex-col gap-2.5">
          <p className="text-[14px] leading-5 font-semibold text-primary">Izdvojeno</p>
          <h2 className="t-heading text-white">
            <Link href={href}>{post.title}</Link>
          </h2>
          {post.subtitle || post.excerpt ? (
            <p className="max-w-[404px] text-[14px] leading-5 text-white">
              {post.subtitle || post.excerpt}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5 text-[12px] leading-4 whitespace-nowrap text-white lg:items-end">
          {date ? <p>Objavljeno {date}</p> : null}
          <p>{post.readTime ?? 1} min čitanja</p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-end lg:justify-center lg:gap-[58px] lg:px-11">
        <Link
          href={href}
          className="relative isolate flex aspect-[760/442] w-full flex-col justify-between overflow-hidden rounded-2xl p-4 lg:h-[442px] lg:w-[760px] lg:shrink-0 lg:p-6"
        >
          <CmsImage
            media={post.coverImage}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 760px, 100vw"
            className="-z-10 object-cover"
          />
          <span className="absolute inset-0 -z-10 bg-black/[0.18]" aria-hidden />
          <span className="flex items-start justify-between">
            {post.tags?.[0] ? (
              <span className="rounded-[99px] bg-yellow px-3.5 py-2 text-[12px] leading-4 text-black">
                {post.tags[0]}
              </span>
            ) : (
              <span />
            )}
            <img
              loading="lazy"
              src="/figma/blog-image-arrow.svg"
              alt=""
              width={41.5}
              height={41.5}
            />
          </span>
          <span className="hidden items-end justify-between py-5 lg:flex">
            <span className="flex w-[420px] flex-col gap-2">
              <span className="t-heading text-white">{post.title}</span>
              {post.excerpt ? (
                <span className="text-[14px] leading-5 text-white">{post.excerpt}</span>
              ) : null}
            </span>
            <span className="flex flex-col items-end gap-1.5 rounded-[20px] p-4 text-[12px] leading-4 whitespace-nowrap text-white">
              {date ? <span>Objavljeno {date}</span> : null}
              <span>{post.readTime ?? 1} min čitanja</span>
            </span>
          </span>
        </Link>

        <div className="flex w-full flex-col gap-4 lg:w-[346px] lg:items-end">
          {post.tags?.length ? (
            <ul className="flex flex-wrap gap-2 lg:justify-end">
              {post.tags.map((t) => (
                <li
                  key={t}
                  className="rounded-[99px] bg-yellow px-3.5 py-2 text-[12px] leading-4 text-black"
                >
                  {t}
                </li>
              ))}
            </ul>
          ) : null}
          {post.excerpt ? (
            <p className="text-[14px] leading-5 text-white lg:text-right">{post.excerpt}</p>
          ) : null}
          <Link
            href={href}
            className="flex h-12 w-full items-center justify-center rounded-[99px] bg-yellow py-[7px] pr-[7px] pl-5 text-[15px] leading-[normal] font-medium text-black sm:w-[206px] lg:h-[42px] lg:text-[14px]"
          >
            Pročitaj članak
          </Link>
        </div>
      </div>
    </section>
  )
}
