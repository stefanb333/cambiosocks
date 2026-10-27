import { WordReveal } from '@/components/motion/WordReveal'
import { ReviewDialog } from '@/components/reviews/ReviewDialog'
import { Stars } from '@/components/reviews/Stars'
import { ViewButton } from '@/components/ui/Buttons'
import type { PublicReview } from '@/lib/reviews'
import type { HomePage } from '@/payload-types'

type Props = {
  data: HomePage['reviews']
  /** Odobrene recenzije kupaca (lib/reviews.ts, D-068). */
  reviews: PublicReview[]
  /** Proizvodi za izbor u formi "Ostavi recenziju". */
  products: { id: number; title: string }[]
}

/**
 * Figma "reviews" (35:754): plava pozadina, naslov levo, opis i dugme desno, mreža 3x2
 * belih kartica 412x320 (radijus 33px), 5 žutih zvezdica, dugme "Ostavi Recenziju".
 * Kartice su prave recenzije kupaca; dugme otvara formu (recenzija ide na odobrenje).
 * Telefon: kartice u horizontalnom nizu sa prevlačenjem.
 */
export function Reviews({ data, reviews, products }: Props) {
  if (!reviews.length && !products.length) return null

  return (
    <section
      className="bg-primary pt-14 pb-14 lg:pt-[86px] lg:pb-[82px]"
      aria-labelledby="recenzije-naslov"
    >
      <div className="container-page">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <WordReveal
            id="recenzije-naslov"
            text={data?.heading}
            className="t-heading max-w-[318px] text-white"
          />
          <div className="flex flex-col items-start gap-4 md:items-end md:gap-1.5">
            {data?.subheading ? (
              <p className="text-[16px] leading-6 text-white md:text-right">{data.subheading}</p>
            ) : null}
            {data?.topCta?.label ? (
              <ViewButton href={data.topCta.url} theme="yellow" size="md">
                {data.topCta.label}
              </ViewButton>
            ) : null}
          </div>
        </div>
      </div>

      {reviews.length ? (
        <div className="container-page mt-8 max-lg:px-0 lg:mt-14">
          <ul className="snap-row scroll-px-4 gap-3 px-4 lg:grid lg:grid-cols-3 lg:gap-[22px] lg:overflow-visible lg:px-0">
            {reviews.map((review, i) => (
              <li
                key={review.id}
                data-reveal="card"
                style={{ '--i': i } as React.CSSProperties}
                className="review-card flex min-h-[240px] w-[86%] max-w-[412px] flex-col gap-[18px] rounded-frame bg-white p-6 shadow-[0_1px_1.5px_rgba(0,0,0,0.08)] sm:w-[60%] lg:min-h-80 lg:w-auto lg:max-w-none"
              >
                <Stars rating={review.rating} />
                <p className="text-[16px] leading-6 text-black">{review.text}</p>
                <div className="mt-auto flex flex-col gap-2">
                  <p className="text-[16px] leading-6 font-bold text-black">
                    {review.name}
                    {review.city ? (
                      <span className="font-normal text-neutral-700">, {review.city}</span>
                    ) : null}
                  </p>
                  {review.product ? (
                    <a
                      href={`/proizvodi/${review.product.slug}#recenzije`}
                      className="w-fit text-[12px] leading-4 text-neutral-700 underline-offset-2 hover:text-primary hover:underline"
                    >
                      {review.product.title}
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {products.length ? (
        <div className="mt-10 flex justify-center lg:mt-14">
          <ReviewDialog
            products={products}
            label={data?.formButtonLabel || 'Ostavi Recenziju'}
            variant="review"
          />
        </div>
      ) : null}
    </section>
  )
}
