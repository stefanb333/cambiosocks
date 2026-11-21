import { WordReveal } from '@/components/motion/WordReveal'
import { ListingCard } from '@/components/product/ListingCard'
import type { ListingProduct } from '@/lib/catalog/listing-shared'
import type { HomePage } from '@/payload-types'

type Props = { data: HomePage['featured']; listing: ListingProduct[] }

/**
 * Izdvojeni proizvodi: ista kartica kao u prodavnici (ListingCard), u mreži 2/3/4 kolone.
 * Redosled i izbor određuje polje "Izdvojeni proizvodi" na početnoj strani u adminu (do 8);
 * neaktivni proizvodi nisu u listi, pa se ne prikazuju.
 */
export function Featured({ data, listing }: Props) {
  const byId = new Map(listing.map((p) => [p.id, p]))
  const products = (data?.products ?? [])
    .map((p) => byId.get(typeof p === 'object' ? p.id : p))
    .filter((p): p is ListingProduct => Boolean(p))
  if (!products.length) return null

  return (
    <section
      className="flex flex-col items-center gap-10 bg-white pb-12 lg:gap-[70px] lg:pb-[60px]"
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

      <ul className="grid w-full max-w-[1306px] grid-cols-2 gap-x-3 gap-y-8 px-[var(--gutter)] md:grid-cols-3 md:gap-x-5 lg:grid-cols-4 lg:gap-y-12 xl:px-0">
        {products.map((product, i) => (
          <li
            key={product.id}
            data-reveal="card"
            className="card-lift"
            style={{ '--i': i % 4 } as React.CSSProperties}
          >
            <ListingCard product={product} priority={i < 2} />
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
