import Image from 'next/image'
import Link from 'next/link'
import { ProductMorph } from '@/components/motion/ProductMorph'
import { sizeRangeLabel, type ListingProduct } from '@/lib/catalog/listing-shared'
import { mediaSrc } from '@/lib/media'
import { formatPrice } from '@/lib/money'
import { Swatches } from './Swatches'

/**
 * Figma "product listing" (52:1165), 325x551: bež okvir, bela podloga slike 287x367,
 * oznaka "Dostupne", naslov Inter Bold 32 plavo, raspon veličina, boje, cena Inter Medium 20.
 * Sve mere su u cqw (širina kartice = 100cqw), pa je kartica na 325px tačno kao u Figmi,
 * a u uskim kolonama se srazmerno smanjuje. Sitni tekstovi imaju čitljiv minimum: 11px ispod
 * 1024px, a od 1024px najmanje 8px (vrednost iz Figme na 1440px), D-055.
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
  const sizeLabel = sizeRangeLabel(product.sizes)
  const img = product.image
  const src = mediaSrc(img?.url)

  return (
    <article className="@container">
      <Link
        href={href}
        className={`group relative block aspect-[325/585] overflow-hidden bg-beige lg:aspect-[325/551] ${rounded ? 'rounded-[7.385cqw]' : ''}`}
      >
        {/* Slika je u cqw (isto što i 2.904% / 66.606% visine Figma kartice), pa viša kartica ispod 1024px dobija prostor za tekst. */}
        <div className="absolute top-[4.923cqw] left-[6.154%] h-[112.92cqw] w-[88.308%] overflow-hidden bg-white">
          {src ? (
            <ProductMorph slug={product.slug}>
              <Image
                src={src}
                alt={img?.alt ?? product.title}
                fill
                preload={priority}
                fetchPriority={priority ? 'high' : undefined}
                sizes="(min-width: 1440px) 287px, (min-width: 1024px) 22vw, (min-width: 768px) 30vw, 45vw"
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
            className={`absolute top-[5.846cqw] right-[4.308cqw] flex h-[max(20px,8cqw)] min-w-[20.923cqw] items-center justify-center rounded-full px-[max(8px,2cqw)] text-[max(11px,2.462cqw)] leading-none font-bold tracking-[-0.2px] text-white shadow-[0_1px_1.5px_rgba(0,0,0,0.08)] lg:h-[8cqw] lg:px-[2cqw] lg:text-[max(8px,2.462cqw)] lg:tracking-[-0.6px] ${
              product.available ? 'bg-primary' : 'bg-neutral-700'
            }`}
          >
            {product.available ? 'Dostupne' : 'Rasprodato'}
          </span>
        </div>

        {/* Tekst je vezan za vrh: jednoredni naziv je tačno na mestu iz Figme (dno 16.923cqw =
            vrh 126.65cqw), a dvoredni naziv raste naniže umesto preko slike. */}
        <div className="absolute top-[126.65cqw] left-[6.769cqw] flex max-w-[86cqw] flex-col gap-[1.231cqw]">
          <h3 className="line-clamp-2 font-display text-[9.846cqw] leading-[10.462cqw] font-bold tracking-[-0.0625em] text-primary capitalize">
            {product.title}
          </h3>
          {sizeLabel || product.colors.length ? (
            <div className="flex w-[31.385cqw] min-w-max items-center justify-between gap-[max(6px,2cqw)] lg:gap-[2cqw]">
              {sizeLabel ? (
                <span className="text-[max(11px,2.462cqw)] leading-[1.25] tracking-[-0.2px] whitespace-nowrap text-neutral-700 lg:text-[max(8px,2.462cqw)] lg:tracking-[-0.6px] lg:text-neutral-400">
                  {sizeLabel}
                </span>
              ) : null}
              <Swatches
                colors={product.colors}
                variant="listing"
                className="h-[max(12px,4.424cqw)] w-auto lg:h-[4.424cqw]"
              />
            </div>
          ) : null}
          <p className="font-display text-[max(15px,6.154cqw)] leading-[1.4] font-medium text-neutral-700 lg:text-[6.154cqw]">
            {formatPrice(product.minPrice)}
            {product.compareAtPrice ? (
              <s className="ml-2 text-[max(11px,0.7em)] text-neutral-400 lg:text-[0.7em]">
                {formatPrice(product.compareAtPrice)}
              </s>
            ) : null}
          </p>
        </div>
      </Link>
    </article>
  )
}
