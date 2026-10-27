import { Fragment, type ElementType, type ReactNode } from 'react'

type Props = {
  as?: ElementType
  text: string | null | undefined
  className?: string
  id?: string
  /** "load": animacija odmah (hero iznad pregiba), "view": kada naslov uđe u ekran. */
  trigger?: 'load' | 'view'
  /** Kašnjenje cele animacije u ms (npr. podnaslov posle naslova). */
  delay?: number
  children?: ReactNode
}

/**
 * Naslov koji se otkriva reč po reč (reč izlazi odozdo iz maske). Tekst ostaje jedan čvor za
 * čitače ekrana (aria-label), a reči su dekorativni span-ovi. Bez motion klase (bez JS-a ili
 * uz "smanji pokrete") reči su odmah vidljive.
 */
export function WordReveal({
  as: Tag = 'h2',
  text,
  className = '',
  id,
  trigger = 'view',
  delay = 0,
}: Props) {
  if (!text) return null
  const words = text.split(/\s+/).filter(Boolean)
  return (
    <Tag
      id={id}
      className={className}
      aria-label={text}
      data-reveal={trigger === 'load' ? 'load' : 'words'}
      style={delay ? ({ '--wr-delay': `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {/* .wr-m je "maska" (overflow) iz koje reč izlazi odozdo (D-064, motion.css) */}
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="wr-m" aria-hidden>
            <span className="wr" style={{ '--i': i } as React.CSSProperties}>
              {word}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  )
}
