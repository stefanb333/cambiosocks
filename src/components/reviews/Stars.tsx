/** Pet žutih zvezdica (Figma "reviews" 35:754); neispunjene su providne. */
export function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  const full = Math.round(rating)
  return (
    <span className="flex items-center gap-1" role="img" aria-label={`Ocena ${rating} od 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <img
          key={i}
          loading="lazy"
          src="/figma/star.svg"
          alt=""
          width={size}
          height={size}
          className={i < full ? '' : 'opacity-25 grayscale'}
        />
      ))}
    </span>
  )
}

/** Datum recenzije: "12. mart 2026." */
export const reviewDate = (iso: string) =>
  new Intl.DateTimeFormat('sr-Latn', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Belgrade',
  }).format(new Date(iso))
