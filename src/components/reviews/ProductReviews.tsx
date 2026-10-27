import { WordReveal } from '@/components/motion/WordReveal'
import type { PublicReview } from '@/lib/reviews'
import { ReviewDialog } from './ReviewDialog'
import { reviewDate, Stars } from './Stars'

const VISIBLE = 4

/**
 * Recenzije na stranici proizvoda (D-068), u stilu sekcije recenzija na početnoj (plava
 * pozadina, bele kartice): levo prosek, raspodela ocena i dugme "Napiši recenziju", desno
 * najnovije recenzije; ostale se otvaraju bez JS-a (<details>).
 */
export function ProductReviews({
  product,
  reviews,
}: {
  product: { id: number; title: string }
  reviews: PublicReview[]
}) {
  const count = reviews.length
  const average = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0
  const bars = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: reviews.filter((r) => r.rating === n).length,
  }))
  const first = reviews.slice(0, VISIBLE)
  const more = reviews.slice(VISIBLE)

  return (
    <section
      id="recenzije"
      className="scroll-mt-[calc(var(--header-h)+16px)] bg-white pb-12 lg:pb-20"
      aria-labelledby="recenzije-proizvoda"
    >
      <div className="container-page">
        <div className="grid gap-8 rounded-[24px] bg-primary p-5 sm:p-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14 lg:rounded-frame lg:p-14">
          <div className="flex flex-col items-start gap-6 lg:sticky lg:top-[calc(var(--header-h)+32px)] lg:self-start">
            <span className="rounded-full bg-yellow px-3.5 py-1.5 text-[12px] leading-none font-semibold tracking-[0.04em] text-black uppercase">
              Recenzije
            </span>
            <WordReveal
              id="recenzije-proizvoda"
              text="Šta kažu kupci"
              className="font-display text-[30px] leading-[1.05] font-extrabold tracking-[-0.05em] text-white sm:text-[38px] lg:text-[46px]"
            />

            {count ? (
              <div className="flex w-full flex-col gap-5">
                <div className="flex items-end gap-4">
                  <p className="font-display text-[64px] leading-[0.85] font-black tracking-[-0.06em] text-yellow lg:text-[80px]">
                    {average.toFixed(1)}
                  </p>
                  <div className="flex flex-col gap-1.5 pb-1">
                    <Stars rating={average} size={18} />
                    <p className="text-[14px] leading-5 text-white/80">
                      {count} {count === 1 ? 'recenzija' : count < 5 ? 'recenzije' : 'recenzija'}
                    </p>
                  </div>
                </div>
                <ul
                  className="flex w-full max-w-[360px] flex-col gap-1.5"
                  aria-label="Raspodela ocena"
                >
                  {bars.map((b) => (
                    <li
                      key={b.n}
                      className="flex items-center gap-3 text-[13px] leading-4 text-white"
                    >
                      <span className="w-3 text-right font-semibold">{b.n}</span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/20">
                        <span
                          className="block h-full rounded-full bg-yellow"
                          style={{ width: `${(b.count / count) * 100}%` }}
                        />
                      </span>
                      <span className="w-6 text-white/70">{b.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-[16px] leading-6 text-white/85 lg:text-[17px] lg:leading-7">
                Još nema recenzija za ovaj model. Nosili ste ih? Podelite utisak i pomozite drugima
                da izaberu.
              </p>
            )}

            <ReviewDialog product={product} label="Napiši recenziju" variant="pill" />
          </div>

          <div className="flex flex-col gap-3 lg:gap-4">
            {count ? (
              <>
                <ul className="flex flex-col gap-3 lg:gap-4">
                  {first.map((r) => (
                    <ReviewCard key={r.id} review={r} />
                  ))}
                </ul>
                {more.length ? (
                  <details className="group flex flex-col">
                    <summary className="press flex h-12 cursor-pointer list-none items-center justify-center rounded-full bg-white/10 text-[15px] font-medium text-white transition-colors hover:bg-white/20 group-open:hidden [&::-webkit-details-marker]:hidden">
                      Prikaži još {more.length}{' '}
                      {more.length === 1
                        ? 'recenziju'
                        : more.length < 5
                          ? 'recenzije'
                          : 'recenzija'}
                    </summary>
                    <ul className="flex flex-col gap-3 lg:gap-4">
                      {more.map((r) => (
                        <ReviewCard key={r.id} review={r} />
                      ))}
                    </ul>
                  </details>
                ) : null}
              </>
            ) : (
              <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-[20px] border-2 border-dashed border-white/30 p-8 text-center">
                <Stars rating={0} size={22} />
                <p className="text-[16px] leading-6 text-white">
                  Budite prvi koji će oceniti ovaj model.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function ReviewCard({ review }: { review: PublicReview }) {
  return (
    <li
      data-reveal="card"
      className="flex flex-col gap-4 rounded-[20px] bg-white p-5 shadow-[0_1px_1.5px_rgba(0,0,0,0.08)] sm:p-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Stars rating={review.rating} />
        {review.verified ? (
          <span className="flex items-center gap-1.5 rounded-full bg-[#e8f1fc] px-2.5 py-1 text-[12px] leading-4 font-medium text-primary">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
              <path
                d="M2.5 6.2l2.2 2.2 4.8-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Potvrđena kupovina
          </span>
        ) : null}
      </div>
      <p className="text-[16px] leading-6 text-black">{review.text}</p>
      <p className="text-[14px] leading-5 text-neutral-700">
        <span className="font-bold text-black">{review.name}</span>
        {review.city ? `, ${review.city}` : ''} · {reviewDate(review.createdAt)}
      </p>
    </li>
  )
}
