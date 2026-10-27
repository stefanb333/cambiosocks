import Link from 'next/link'

/**
 * Figma "pagination" (52:1566): sive strelice 8x12, brojevi 21x24 (radijus 4px),
 * aktivna strana plava, ostale sa obodom 0.4px #ADADAD.
 */
export function Pagination({
  page,
  pages,
  hrefFor,
}: {
  page: number
  pages: number
  hrefFor: (p: number) => string
}) {
  if (pages <= 1) return null
  const numbers = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - page) <= 1,
  )
  const arrow = (dir: 'prev' | 'next', target: number, disabled: boolean) => {
    const img = (
      <img
        src={dir === 'prev' ? '/figma/pagination-prev.svg' : '/figma/pagination-next.svg'}
        alt=""
        width={8}
        height={12}
        className={`h-3 w-2 ${dir === 'prev' ? 'rotate-180' : ''}`}
      />
    )
    const label = dir === 'prev' ? 'Prethodna strana' : 'Sledeća strana'
    return disabled ? (
      <span className="flex size-11 items-center justify-center opacity-40" aria-hidden>
        {img}
      </span>
    ) : (
      <Link
        href={hrefFor(target)}
        aria-label={label}
        className="flex size-11 items-center justify-center"
      >
        {img}
      </Link>
    )
  }

  return (
    <nav aria-label="Strane" className="flex items-center justify-center gap-[9px]">
      {arrow('prev', page - 1, page <= 1)}
      <ol className="flex items-center gap-[5px]">
        {numbers.map((n, i) => (
          <li key={n} className="flex items-center gap-[5px]">
            {i > 0 && n - numbers[i - 1] > 1 ? (
              <span className="text-[12px] text-neutral-400">…</span>
            ) : null}
            <Link
              href={hrefFor(n)}
              aria-current={n === page ? 'page' : undefined}
              aria-label={`Strana ${n}`}
              className={`hit flex h-6 min-w-[21px] items-center justify-center rounded-xs px-1.5 text-[12px] leading-4 ${
                n === page
                  ? 'bg-primary text-white'
                  : 'border-[0.4px] border-neutral-400 text-neutral-400 hover:text-black'
              }`}
            >
              {n}
            </Link>
          </li>
        ))}
      </ol>
      {arrow('next', page + 1, page >= pages)}
    </nav>
  )
}
