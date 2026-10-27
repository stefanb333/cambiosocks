import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'
import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { Header } from '@/components/layout/Header'
import { JsonLd } from '@/components/seo/JsonLd'
import { getPayload } from '@/lib/payload'
import { breadcrumbSchema, jsonLdGraph, webPageSchema } from '@/lib/seo'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

/** Tip stranice za schema.org (ostale su WebPage); FAQ blok sam dodaje FAQPage. */
const PAGE_TYPES: Record<string, 'AboutPage' | 'ContactPage'> = {
  'o-nama': 'AboutPage',
  kontakt: 'ContactPage',
}

const getPage = unstable_cache(
  async (slug: string) => {
    const payload = await getPayload()
    const { docs } = await payload.find({
      collection: 'pages',
      where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
      depth: 2,
      limit: 1,
    })
    return docs[0] ?? null
  },
  ['page-by-slug'],
  { tags: ['pages', 'media'] },
)

export async function generateStaticParams() {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'pages',
    where: { _status: { equals: 'published' } },
    depth: 0,
    limit: 100,
    select: { slug: true },
  })
  return docs.map((d) => ({ slug: d.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return {}
  const og = page.seo?.image && typeof page.seo.image === 'object' ? page.seo.image.url : undefined
  return {
    title: page.seo?.title || page.title,
    description: page.seo?.description || undefined,
    alternates: { canonical: `/${page.slug}` },
    // openGraph zamenjuje onaj iz layout-a, pa bez sopstvene slike ide podrazumevana (/og.jpg).
    openGraph: {
      title: page.seo?.title || page.title,
      description: page.seo?.description || undefined,
      images: [{ url: og ?? '/og.jpg' }],
    },
  }
}

/** Statične stranice iz CMS-a: O nama, Kontakt, Česta pitanja, Dostava, Uslovi, Privatnost. */
export default async function CmsPage({ params }: Props) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) notFound()
  const blocks = page.layout ?? []
  const overlay = blocks[0]?.blockType === 'pageHero'
  const path = `/${page.slug}`
  const jsonLd = jsonLdGraph(
    webPageSchema({
      path,
      title: page.seo?.title || page.title,
      description: page.seo?.description || undefined,
      type: PAGE_TYPES[page.slug ?? ''],
    }),
    breadcrumbSchema([
      { name: 'Početna', path: '/' },
      { name: page.title, path },
    ]),
  )

  return (
    <>
      <Header variant={overlay ? 'overlay' : 'solid'} />
      <main id="sadrzaj">
        <JsonLd data={jsonLd} />
        <RenderBlocks blocks={blocks} pageTitle={page.title} />
      </main>
    </>
  )
}
