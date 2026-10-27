import type { Media } from '@/payload-types'
import { CATEGORY_OPTIONS, PATTERN_OPTIONS } from './constants'

/** Tipovi i čiste funkcije kataloga (filteri, sortiranje): rade i na serveru i u pregledaču. */

/** Podaci jednog proizvoda potrebni za karticu i filtere (mali, keširani skup). */
export type ListingProduct = {
  id: number
  slug: string
  title: string
  shortDescription: string | null
  image: Pick<Media, 'url' | 'alt' | 'width' | 'height' | 'focalX' | 'focalY'> | null
  minPrice: number
  compareAtPrice: number | null
  available: boolean
  sizes: string[]
  colors: { name: string; hex: string }[]
  category: string[]
  pattern: string[]
  productType: string | null
  tags: string[]
  createdAt: string
  searchText: string
  /** Ručne kolekcije u kojima je proizvod označen. */
  collectionIds: number[]
}

/** Predlog u pretrazi headera (/api/search, D-065). */
export type SearchHit = {
  slug: string
  title: string
  price: number
  compareAtPrice: number | null
  image: { src: string; alt: string } | null
}

export type Filters = {
  sizes: string[]
  colors: string[]
  category: string[]
  pattern: string[]
  price: [number, number] | null
}

export const SORTS = {
  featured: 'Izdvojeno',
  newest: 'Najnovije',
  'price-asc': 'Cena: niža ka višoj',
  'price-desc': 'Cena: viša ka nižoj',
  'title-asc': 'Naziv: A-Ž',
} as const
export type SortKey = keyof typeof SORTS

export const PAGE_SIZE = 16

type Params = Record<string, string | string[] | undefined>
const list = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v : v ? v.split(',') : []).map((s) => s.trim()).filter(Boolean)

export function parseFilters(params: Params): {
  filters: Filters
  sort: SortKey | null
  page: number
} {
  const price = typeof params.cena === 'string' ? params.cena.split('-').map(Number) : null
  const sort =
    typeof params.sort === 'string' && params.sort in SORTS ? (params.sort as SortKey) : null
  const page = Math.max(1, Number(params.strana) || 1)
  return {
    filters: {
      sizes: list(params.velicina),
      colors: list(params.boja),
      category: list(params.kategorija),
      pattern: list(params.dezen),
      price:
        price && price.length === 2 && price.every(Number.isFinite) ? [price[0], price[1]] : null,
    },
    sort,
    page,
  }
}

export function applyFilters(products: ListingProduct[], f: Filters): ListingProduct[] {
  return products.filter(
    (p) =>
      (!f.sizes.length || p.sizes.some((s) => f.sizes.includes(s))) &&
      (!f.colors.length || p.colors.some((c) => f.colors.includes(c.name))) &&
      (!f.category.length || p.category.some((c) => f.category.includes(c))) &&
      (!f.pattern.length || p.pattern.some((c) => f.pattern.includes(c))) &&
      (!f.price || (p.minPrice >= f.price[0] && p.minPrice <= f.price[1])),
  )
}

export function sortProducts(products: ListingProduct[], sort: SortKey): ListingProduct[] {
  const copy = [...products]
  switch (sort) {
    case 'newest':
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    case 'price-asc':
      return copy.sort((a, b) => a.minPrice - b.minPrice)
    case 'price-desc':
      return copy.sort((a, b) => b.minPrice - a.minPrice)
    case 'title-asc':
      return copy.sort((a, b) => a.title.localeCompare(b.title, 'sr-Latn'))
    default:
      return copy
  }
}

/** Opcije filtera iz proizvoda u kolekciji (samo vrednosti koje postoje). */
export function facetOptions(products: ListingProduct[]) {
  const sizes = [...new Set(products.flatMap((p) => p.sizes))].sort(
    (a, b) => parseFloat(a) - parseFloat(b),
  )
  const colorMap = new Map<string, string>()
  products.forEach((p) => p.colors.forEach((c) => colorMap.set(c.name, c.hex)))
  const usedCategory = new Set(products.flatMap((p) => p.category))
  const usedPattern = new Set(products.flatMap((p) => p.pattern))
  const prices = products.map((p) => p.minPrice)
  return {
    sizes,
    colors: [...colorMap].map(([name, hex]) => ({ name, hex })),
    category: CATEGORY_OPTIONS.filter((o) => usedCategory.has(o.value)).map((o) => ({
      value: o.value,
      label: o.label,
    })),
    pattern: PATTERN_OPTIONS.filter((o) => usedPattern.has(o.value)).map((o) => ({
      value: o.value,
      label: o.label,
    })),
    price: prices.length
      ? ([Math.min(...prices), Math.max(...prices)] as [number, number])
      : ([0, 0] as [number, number]),
  }
}

/** "Veličine od 34-46": najmanji i najveći broj iz vrednosti veličina (npr. "34-36", "44-46"). */
export function sizeRangeLabel(sizes: string[]): string | null {
  const nums = sizes.flatMap((s) => (s.match(/\d+/g) ?? []).map(Number))
  if (!nums.length) return null
  const min = Math.min(...nums)
  const max = Math.max(...nums)
  return min === max ? `Veličina ${min}` : `Veličine od ${min}-${max}`
}

/** Lagani podaci za klijentski panel filtera (brojanje rezultata uživo). */
export function facetIndex(products: ListingProduct[]) {
  return products.map((p) => ({
    s: p.sizes,
    c: p.colors.map((c) => c.name),
    k: p.category,
    d: p.pattern,
    p: p.minPrice,
  }))
}
