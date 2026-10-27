import Link from 'next/link'
import { ProductMorph } from '@/components/motion/ProductMorph'
import { AddToCartPill } from '@/components/ui/Buttons'
import { CmsImage } from '@/components/ui/CmsImage'
import type { Product } from '@/payload-types'
import { Swatches, colorsOf } from './Swatches'

/**
 * Figma "product cards" (25:551), 325x501: bež kartica (radijus 22px), plava podloga slike
 * (radijus 12px), naslov Inter Bold 32 plavo, opis 12/16, "Dodaj u Korpu" i boje.
 */
export function FeaturedCard({
  product,
  buttonLabel,
  colorsLabel,
  priority = false,
}: {
  product: Product
  buttonLabel: string
  colorsLabel: string
  priority?: boolean
}) {
  const image = product.gallery?.[0]?.image
  const colors = colorsOf(product.options)
  const href = `/proizvodi/${product.slug}`

  return (
    <article className="relative flex aspect-[325/501] w-[min(82vw,325px)] flex-col rounded-card bg-beige xl:w-auto">
      <Link
        href={href}
        className="group absolute top-[2.4%] right-[3.79%] bottom-[41.92%] left-[3.5%] overflow-hidden rounded-lg bg-primary"
        aria-label={product.title}
      >
        <ProductMorph slug={product.slug}>
          <CmsImage
            media={image}
            alt=""
            fill
            sizes="(min-width: 1024px) 300px, 75vw"
            priority={priority}
            className="object-cover transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
          />
        </ProductMorph>
      </Link>
      <div className="absolute top-[61.28%] right-[4.37%] bottom-[4.99%] left-[4.08%] flex flex-col justify-center gap-[clamp(14px,5.2%,26px)]">
        <div className="flex max-w-[261px] flex-col gap-[clamp(8px,3.8%,19px)]">
          <h3 className="t-heading text-primary">
            <Link href={href} className="hit">
              {product.title}
            </Link>
          </h3>
          {product.shortDescription ? (
            <p className="line-clamp-3 text-[13px] leading-[18px] text-black lg:h-12 lg:text-[12px] lg:leading-4">
              {product.shortDescription}
            </p>
          ) : null}
        </div>
        <div className="flex items-end justify-between gap-2">
          <AddToCartPill href={href}>{buttonLabel}</AddToCartPill>
          {colors.length ? (
            <div className="flex flex-col items-end justify-end gap-1 lg:w-[60px]">
              <Swatches colors={colors} variant="card" />
              <p className="text-right text-[11px] leading-[14px] whitespace-nowrap text-neutral-700 lg:w-full lg:text-[8px] lg:leading-3 lg:tracking-[0.2px]">
                {colorsLabel}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}
