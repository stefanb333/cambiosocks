import { WordReveal } from '@/components/motion/WordReveal'
import { FeaturedCard } from '@/components/product/FeaturedCard'
import { isProduct } from '@/lib/data'
import type { HomePage, Product } from '@/payload-types'

type Props = { data: HomePage['featured'] }

/**
 * Figma "featured" (25:509): traka 1439x128 sa gradijentom (radijus 16px), 4 kartice 325x501
 * sa razmakom 22px (širina reda 1366px), tekst ispod 18/28.
 * Telefon: kartice u horizontalnom nizu sa prevlačenjem, isti izgled kartice kao u Figmi.
 */
export function Featured({ data }: Props) {
  const products = (data?.products ?? [])
    .filter(isProduct)
    .filter((p) => (p as Product).status === 'active') as Product[]
  if (!products.length) return null

  return (
    <section
      className="flex flex-col items-center gap-10 bg-white pb-12 lg:min-h-[907px] lg:gap-[70px] lg:pb-[60px]"
      aria-labelledby="featured-naslov"
    >
      <div
        className="flex h-[104px] w-full max-w-[1439px] items-center justify-center rounded-xl p-2.5 lg:h-32"
        style={{ backgroundImage: 'linear-gradient(96.17deg, #0462cd 9.43%, #5478ff 57.85%)' }}
      >
        <WordReveal
          id="featured-naslov"
          text={data?.heading}
          className="t-heading max-w-[381px] px-4 text-center text-white"
        />
      </div>

      <ul className="snap-row w-full scroll-px-4 gap-3 px-4 xl:grid xl:w-[min(1366px,calc(100%-2*var(--gutter)+90px))] xl:grid-cols-4 xl:gap-[22px] xl:overflow-visible xl:px-0 lg:scroll-px-[var(--gutter)] lg:px-[var(--gutter)]">
        {products.map((product, i) => (
          <li
            key={product.id}
            data-reveal="card"
            className="card-lift"
            style={{ '--i': i } as React.CSSProperties}
          >
            <FeaturedCard
              product={product}
              buttonLabel={data?.buttonLabel || 'Dodaj u Korpu'}
              colorsLabel={data?.colorsLabel || 'Dostupne Boje'}
            />
          </li>
        ))}
      </ul>

      {data?.note ? (
        <p
          data-reveal="up"
          className="max-w-[379px] px-6 text-center text-[18px] leading-7 text-black lg:p-2.5"
        >
          {data.note}
        </p>
      ) : null}
    </section>
  )
}
