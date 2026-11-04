'use client'

import { useSearchParams } from 'next/navigation'
import { CatalogToolbar, type Pill } from '@/components/collection/CatalogToolbar'
import { Pagination } from '@/components/collection/Pagination'
import { ListingCard } from '@/components/product/ListingCard'
import {
  PAGE_SIZE,
  SORTS,
  applyFilters,
  facetIndex,
  facetOptions,
  parseFilters,
  sortProducts,
  type ListingProduct,
  type SortKey,
} from '@/lib/catalog/listing-shared'

type Props = {
  slug: string
  heading: string
  pills: Pill[]
  defaultSort: SortKey
  products: ListingProduct[]
}

/**
 * Lista proizvoda kolekcije sa filterima, sortiranjem i stranicama iz adrese
 * (?velicina=..&sort=..&strana=2). Stranica kolekcije je statična (ISR): HTML sadrži
 * podrazumevani prikaz, a filteri iz adrese se primenjuju u pregledaču (D-051).
 */
export function CollectionCatalog({
  query = {},
  ...props
}: Props & { query?: Record<string, string> }) {
  const { slug, products } = props
  const { filters, sort, page } = parseFilters(query)
  const activeSort: SortKey = sort ?? props.defaultSort
  const filtered = sortProducts(applyFilters(products, filters), activeSort)
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pages)
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const hrefFor = (n: number) => {
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries(query)) if (k !== 'strana') p.set(k, v)
    if (n > 1) p.set('strana', String(n))
    const qs = p.toString()
    return `/kolekcije/${slug}${qs ? `?${qs}` : ''}`
  }

  return (
    <>
      <CatalogToolbar
        heading={props.heading}
        count={filtered.length}
        pills={props.pills}
        sortLabel="Sortiraj"
        sorts={Object.entries(SORTS).map(([value, label]) => ({ value, label }))}
        currentSort={activeSort}
        facets={facetOptions(products)}
        index={facetIndex(products)}
        selected={filters}
      >
        {visible.length ? (
          <ul className="mx-auto mt-4 grid max-w-[1306px] grid-cols-2 gap-x-3 gap-y-8 px-[var(--gutter)] md:gap-x-5 lg:gap-y-12 md:mt-8 md:grid-cols-3 md:px-[var(--gutter)] lg:mt-24 lg:grid-cols-4 xl:px-0">
            {visible.map((product, i) => (
              <li
                key={product.id}
                data-reveal="card"
                style={{ '--i': i % 4 } as React.CSSProperties}
              >
                <ListingCard product={product} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mx-auto mt-16 flex max-w-[480px] flex-col items-center gap-4 px-6 text-center">
            <p className="text-[16px] leading-6 text-neutral-700">
              Nema proizvoda za izabrane filtere.
            </p>
            <a
              href={`/kolekcije/${slug}`}
              className="rounded-[99px] border border-sand-200 px-[18px] py-[11px] text-[12px] leading-4"
            >
              Obriši filtere
            </a>
          </div>
        )}
      </CatalogToolbar>

      <div className="mt-10 lg:mt-[72px]">
        <Pagination page={current} pages={pages} hrefFor={hrefFor} />
      </div>
    </>
  )
}

/** Isto, sa parametrima iz adrese. Renderuje se u <Suspense>, čiji je fallback podrazumevani prikaz. */
export function CollectionCatalogFromUrl(props: Props) {
  const params = useSearchParams()
  return <CollectionCatalog {...props} query={Object.fromEntries(params.entries())} />
}
