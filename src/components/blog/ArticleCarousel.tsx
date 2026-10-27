'use client'

import { useRef, type ReactNode } from 'react'

/** Figma "Latest articles section" (86:992): naslov i crne strelice 39px, kartice u nizu. */
export function ArticleCarousel({ heading, children }: { heading: string; children: ReactNode }) {
  const row = useRef<HTMLUListElement>(null)
  const scroll = (dir: 1 | -1) => {
    const el = row.current
    if (!el) return
    el.scrollBy({ left: dir * Math.min(el.clientWidth, 444), behavior: 'smooth' })
  }
  return (
    <section className="flex w-full flex-col gap-6" aria-labelledby="najnoviji-naslov">
      <div className="flex items-center justify-between">
        <h2 id="najnoviji-naslov" className="t-heading whitespace-nowrap text-black">
          {heading}
        </h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Prethodni članci"
            className="hit"
          >
            <img
              loading="lazy"
              src="/figma/blog-arrow-left.svg"
              alt=""
              width={39}
              height={39}
              className="rotate-180"
            />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Sledeći članci"
            className="hit"
          >
            <img loading="lazy" src="/figma/blog-arrow-right.svg" alt="" width={39} height={39} />
          </button>
        </div>
      </div>
      <ul
        ref={row}
        className="snap-row -mx-[var(--gutter)] scroll-px-[var(--gutter)] gap-6 px-[var(--gutter)] pb-2 lg:mx-0 lg:px-0"
      >
        {children}
      </ul>
    </section>
  )
}
