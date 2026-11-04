import Link from 'next/link'
import { CatalogToolbar } from '@/components/collection/CatalogToolbar'
import { Pagination } from '@/components/collection/Pagination'
import { Header } from '@/components/layout/Header'
import { WordReveal } from '@/components/motion/WordReveal'
import { ListingCard } from '@/components/product/ListingCard'
import {
  PAGE_SIZE,
  SORTS,
  applyFilters,
  facetIndex,
  facetOptions,
  getAllListingProducts,
  parseFilters,
  searchProducts,
  sortProducts,
} from '@/lib/catalog/listing'
import { getMenuCollections } from '@/lib/data'
import type { Metadata } from 'next'

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = (await searchParams).q
  return {
    title: typeof q === 'string' && q ? `Pretraga: ${q}` : 'Pretraga',
    robots: { index: false, follow: true },
  }
}

/** Pretraga (nema Figma frejm): zaglavlje i mreža kao na stranici kolekcije (54:774). */
export default async function SearchPage({ searchParams }: Props) {
  const query = await searchParams
  const q = typeof query.q === 'string' ? query.q.trim().slice(0, 80) : ''
  const [all, collections] = await Promise.all([getAllListingProducts(), getMenuCollections()])
  const found = q ? searchProducts(all, q) : []
  const { filters, sort, page } = parseFilters(query)
  const activeSort = sort ?? 'featured'
  const filtered = sortProducts(applyFilters(found, filters), activeSort)
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pages)
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const hrefFor = (n: number) => {
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries(query))
      if (typeof v === 'string' && k !== 'strana') p.set(k, v)
    if (n > 1) p.set('strana', String(n))
    return `/pretraga?${p.toString()}`
  }

  return (
    <>
      <Header />
      <main id="sadrzaj" className="bg-white">
        <section className="bg-sand-50">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-[var(--gutter)] py-10 lg:px-16 lg:py-16">
            <WordReveal
              as="h1"
              trigger="load"
              text="Pretraga"
              className="t-display text-primary uppercase"
            />
            <form
              action="/pretraga"
              role="search"
              className="flex w-full max-w-[640px] items-center gap-3 rounded-[99px] border border-sand-200 bg-white py-1.5 pr-1.5 pl-5"
            >
              <label htmlFor="pretraga-q" className="visually-hidden">
                Pojam za pretragu
              </label>
              <input
                id="pretraga-q"
                name="q"
                type="search"
                enterKeyHint="search"
                defaultValue={q}
                placeholder="Pretraži Proizvod"
                className="h-11 min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-neutral-400"
              />
              <button
                type="submit"
                className="flex h-11 items-center rounded-[99px] bg-primary px-5 text-[14px] font-medium text-white"
              >
                Traži
              </button>
            </form>
          </div>
        </section>

        <section className="pt-8 pb-14 lg:pt-[72px] lg:pb-[59px]" aria-label="Rezultati">
          {q ? (
            <CatalogToolbar
              heading={`Rezultati za "${q}"`}
              count={filtered.length}
              pills={[]}
              sortLabel="Sortiraj"
              sorts={Object.entries(SORTS).map(([value, label]) => ({ value, label }))}
              currentSort={activeSort}
              facets={facetOptions(found)}
              index={facetIndex(found)}
              selected={filters}
            >
              {visible.length ? (
                <ul className="mx-auto mt-4 grid max-w-[1306px] grid-cols-2 gap-x-3 gap-y-8 px-[var(--gutter)] md:gap-x-5 lg:gap-y-12 md:mt-8 md:grid-cols-3 md:px-[var(--gutter)] lg:mt-24 lg:grid-cols-4 xl:px-0">
                  {visible.map((product, i) => (
                    <li key={product.id}>
                      <ListingCard product={product} priority={i < 2} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </CatalogToolbar>
          ) : null}

          {!q || !filtered.length ? (
            <div className="mx-auto flex max-w-[560px] flex-col items-center gap-5 px-6 text-center">
              <p className="text-[16px] leading-6 text-neutral-700">
                {q
                  ? `Nema proizvoda za "${q}". Pogledajte naše kolekcije:`
                  : 'Unesite naziv proizvoda, boju ili tip čarapa.'}
              </p>
              <ul className="flex flex-wrap justify-center gap-2.5">
                <li>
                  <Link
                    href="/kolekcije/sve"
                    className="flex min-h-11 items-center rounded-[99px] bg-primary px-5 text-[14px] leading-4 text-white"
                  >
                    Sve
                  </Link>
                </li>
                {collections.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/kolekcije/${c.slug}`}
                      className="flex rounded-[99px] border border-sand-200 px-[18px] py-[11px] text-[12px] leading-4"
                    >
                      {c.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-10 lg:mt-[72px]">
            <Pagination page={current} pages={pages} hrefFor={hrefFor} />
          </div>
        </section>
      </main>
    </>
  )
}
