import { ViewTransition, type ReactNode } from 'react'

/**
 * Slika proizvoda "preleti" sa kartice na stranicu proizvoda i nazad (View Transitions, D-058).
 * Ime je isto na kartici i na glavnoj slici proizvoda, pa pregledač animira položaj i veličinu.
 * default="none": ostale navigacije ne pokreću pretapanje ove slike. Bez podrške pregledača
 * (ili uz "smanji pokrete", motion.css) navigacija je obična.
 */
export function ProductMorph({
  slug,
  children,
}: {
  slug: string | null | undefined
  children: ReactNode
}) {
  if (!slug) return children
  return (
    <ViewTransition name={`proizvod-${slug}`} share="morph" default="none">
      {children}
    </ViewTransition>
  )
}
