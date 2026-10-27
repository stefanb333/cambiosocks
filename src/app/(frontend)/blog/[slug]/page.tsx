import { RichText } from '@payloadcms/richtext-lexical/react'
import { notFound } from 'next/navigation'
import { ArticleCard } from '@/components/blog/ArticleCard'
import { ArticleCarousel } from '@/components/blog/ArticleCarousel'
import { Header } from '@/components/layout/Header'
import { WordReveal } from '@/components/motion/WordReveal'
import { JsonLd } from '@/components/seo/JsonLd'
import { CmsImage } from '@/components/ui/CmsImage'
import { formatDateSr, getPostBySlug, getPosts } from '@/lib/blog'
import { absoluteUrl, articleSchema, breadcrumbSchema, jsonLdGraph } from '@/lib/seo'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  const og = typeof post.coverImage === 'object' ? post.coverImage.url : undefined
  return {
    title: post.seo?.title || post.title,
    description: post.seo?.description || post.excerpt || undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      publishedTime: post.publishedAt ?? undefined,
      images: og ? [{ url: og }] : undefined,
    },
  }
}

/** Članak (nema zaseban Figma frejm): tipografija i kartice iz blog stranice (84:1424). */
export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const [post, posts] = await Promise.all([getPostBySlug(slug), getPosts()])
  if (!post) notFound()
  const more = posts.filter((p) => p.id !== post.id).slice(0, 6)
  const date = formatDateSr(post.publishedAt)
  const cover =
    typeof post.coverImage === 'object' && post.coverImage?.url ? post.coverImage.url : null
  const jsonLd = jsonLdGraph(
    articleSchema({
      slug: post.slug ?? slug,
      title: post.title,
      description: post.seo?.description || post.excerpt || post.subtitle || post.title,
      image: cover ? absoluteUrl(cover) : undefined,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
    }),
    breadcrumbSchema([
      { name: 'Početna', path: '/' },
      { name: 'Blog', path: '/blog' },
      { name: post.title, path: `/blog/${post.slug ?? slug}` },
    ]),
  )

  return (
    <>
      <Header />
      <main id="sadrzaj" className="bg-neutral-50">
        <JsonLd data={jsonLd} />
        <article className="mx-auto flex max-w-[1440px] flex-col items-center gap-10 px-[var(--gutter)] pt-12 pb-16 lg:gap-14 lg:pt-[88px]">
          <header className="flex max-w-[820px] flex-col items-center gap-5 text-center">
            {post.tags?.length ? (
              <ul className="flex flex-wrap justify-center gap-2">
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
            <WordReveal
              as="h1"
              trigger="load"
              text={post.title}
              className="font-display text-[clamp(32px,calc(32px+16*var(--vw-ratio)),48px)] leading-[1.15] font-bold tracking-[-1.2px] text-black"
            />
            <p className="text-[14px] leading-5 text-neutral-700">
              {date ? `Objavljeno ${date} · ` : ''}
              {post.readTime ?? 1} min čitanja
            </p>
          </header>
          <div className="relative aspect-[16/9] w-full max-w-[1080px] overflow-hidden rounded-2xl">
            <CmsImage
              media={post.coverImage}
              fill
              priority
              sizes="(min-width: 1080px) 1080px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="rich w-full max-w-[760px] rounded-2xl bg-white p-6 shadow-[0_18px_50px_rgba(15,15,15,0.07)] sm:p-10 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-[22px] [&_h2]:leading-7 [&_h2]:font-bold [&_h2]:tracking-[-0.5px] [&_h2]:text-black [&_h2:first-child]:mt-0 [&_p]:text-[16px] [&_p]:leading-7 [&_p]:text-neutral-700">
            <RichText data={post.content} />
          </div>
        </article>
        {more.length ? (
          <div className="mx-auto max-w-[1440px] px-[var(--gutter)] pb-20 lg:pb-[120px]">
            <ArticleCarousel heading="Najnoviji članci">
              {more.map((p) => (
                <li key={p.id} className="flex">
                  <ArticleCard post={p} />
                </li>
              ))}
            </ArticleCarousel>
          </div>
        ) : null}
      </main>
    </>
  )
}
