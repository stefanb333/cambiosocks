import Image from 'next/image'
import Link from 'next/link'
import { ProductMorph } from '@/components/motion/ProductMorph'
import type { ListingProduct } from '@/lib/catalog/listing-shared'
import { coverSizes, mediaSrc } from '@/lib/media'
import { formatPrice } from '@/lib/money'

/**
 * Kartica proizvoda (D-082, D-086). Bela kao na Happy Socks (bez bež okvira); osnova je Figma "product listing" (52:1165): bela podloga
 * slike 287x367, oznaka "Dostupne", plavi naslov. Ispod slike je tekst u toku (ne fiksne pozicije):
 * naslov, kratak opis u dva reda, veličine kao oznake, boje kao krugovi sa nazivom i cena na dnu,
 * a kod paketa i cena po paru. Mere su u cqw (širina kartice = 100cqw) sa čitljivim minimumom u px,
 * pa je kartica ista na 325px kao u Figmi, a u uskoj koloni na telefonu tekst ostaje čitljiv.
 */
export function ListingCard({
  product,
  priority = false,
  rounded = false,
}: {
  product: ListingProduct
  priority?: boolean
  /** Kartica u sekciji "Možda vam se svidi" (52:1720) ima radijus 24px. */
  rounded?: boolean
}) {
  const href = `/proizvodi/${product.slug}`
  const img = product.image
  const src = mediaSrc(img?.url)
  const colors = product.colors.slice(0, 4)
  const isPack = product.tags.includes('12-pari')

  return (
    <article className="@container h-full">
      <Link href={href} className="group flex h-full flex-col bg-white pb-[4.923cqw]">
        <div
          className={`relative aspect-[287/367] w-full overflow-hidden bg-white ${rounded ? 'rounded-[5cqw]' : ''}`}
        >
          {src ? (
            <ProductMorph slug={product.slug}>
              <Image
                src={src}
                alt={img?.alt ?? product.title}
                fill
                quality={85}
                preload={priority}
                fetchPriority={priority ? 'high' : undefined}
                // Okvir slike je viši od širine (287x367), pa kvadratna fotografija treba više piksela (D-072)
                sizes={coverSizes(
                  img,
                  [
                    { media: '(min-width: 1440px)', width: '287px', height: '367px' },
                    { media: '(min-width: 1024px)', width: '22vw', height: 'calc(22vw * 1.279)' },
                    { media: '(min-width: 768px)', width: '30vw', height: 'calc(30vw * 1.279)' },
                    { width: '45vw', height: 'calc(45vw * 1.279)' },
                  ],
                  1.03,
                )}
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                style={
                  typeof img?.focalX === 'number' && typeof img?.focalY === 'number'
                    ? { objectPosition: `${img.focalX}% ${img.focalY}%` }
                    : undefined
                }
              />
            </ProductMorph>
          ) : null}
          <span
            className={`absolute top-[5.846cqw] right-[4.308cqw] flex h-[max(20px,8cqw)] min-w-[20.923cqw] items-center justify-center rounded-full px-[max(8px,2cqw)] text-[max(11px,2.8cqw)] leading-none font-bold tracking-[-0.2px] text-white shadow-[0_1px_1.5px_rgba(0,0,0,0.08)] ${
              product.available ? 'bg-primary' : 'bg-neutral-700'
            }`}
          >
            {product.available ? 'Dostupne' : 'Rasprodato'}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-[max(8px,2.769cqw)] pt-[max(12px,4.615cqw)]">
          <h3 className="line-clamp-2 font-display text-[max(18px,8cqw)] leading-[1.08] font-bold tracking-[-0.04em] text-primary">
            {product.title}
          </h3>

          {product.sizes.length ? (
            <div className="flex flex-col gap-[max(4px,1.231cqw)]">
              <span className="text-[max(10px,3.077cqw)] leading-none font-semibold tracking-[0.06em] text-neutral-500 uppercase">
                Veličine
              </span>
              <ul className="flex flex-wrap gap-[max(4px,1.538cqw)]" aria-label="Veličine">
                {product.sizes.map((size) => (
                  <li
                    key={size}
                    className="flex h-[max(24px,7.385cqw)] items-center rounded-full border border-neutral-300 bg-white px-[max(8px,2.769cqw)] text-[max(11px,3.692cqw)] leading-none font-medium text-neutral-800"
                  >
                    {size}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {colors.length ? (
            <div className="flex items-center gap-[max(6px,2.154cqw)]">
              <span className="flex" aria-hidden>
                {colors.map((c, i) => (
                  <span
                    key={c.name}
                    className="block size-[max(16px,5.538cqw)] rounded-full border-2 border-white ring-1 ring-black/20 first:ml-0"
                    style={{ backgroundColor: c.hex, marginLeft: i ? '-0.35em' : 0 }}
                  />
                ))}
              </span>
              <span className="text-[max(11px,3.692cqw)] leading-tight text-neutral-700">
                {colors.length === 1
                  ? colors[0].name
                  : `${product.colors.length} ${product.colors.length < 5 ? 'boje' : 'boja'}`}
              </span>
              {product.colors.length > 1 ? (
                <span className="sr-only">: {product.colors.map((c) => c.name).join(', ')}</span>
              ) : null}
            </div>
          ) : null}

          <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-[max(4px,1.538cqw)]">
            <p className="font-display text-[max(16px,6.154cqw)] leading-[1.3] font-semibold text-neutral-900">
              {formatPrice(product.minPrice)}
              {product.compareAtPrice ? (
                <s className="ml-2 text-[0.7em] font-medium text-neutral-400">
                  {formatPrice(product.compareAtPrice)}
                </s>
              ) : null}
            </p>
            {isPack ? (
              <span className="text-[max(11px,3.385cqw)] text-neutral-500">
                oko {formatPrice(Math.round(product.minPrice / 12))} po paru
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  )
}
