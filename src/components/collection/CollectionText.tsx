import { RichText } from '@payloadcms/richtext-lexical/react'
import { WordReveal } from '@/components/motion/WordReveal'
import { BRAND_FACTS } from '@/lib/brand'
import type { ShopCollection } from '@/payload-types'

type Content = NonNullable<ShopCollection['description']>
type Node = Content['root']['children'][number]
type Part = { title: string; nodes: Node[] }

/** Činjenice ispod uvoda (iste kao na trakama, lib/brand.ts). */
const FACTS = [BRAND_FACTS[1], BRAND_FACTS[3], BRAND_FACTS[4]]

/** Tekst čvora (naslov iz Lexical-a): spaja tekst svih potomaka. */
function textOf(node: Node): string {
  const children = (node as { children?: Node[] }).children
  if (children?.length) return children.map(textOf).join('')
  return String((node as { text?: string }).text ?? '')
}

/** Deli opis po naslovima H2: svaki naslov sa tekstom ispod njega je jedan deo. */
function splitByHeadings(content: Content): Part[] {
  const parts: Part[] = []
  for (const node of content.root.children) {
    const isHeading = node.type === 'heading' && (node as { tag?: string }).tag === 'h2'
    if (isHeading || !parts.length) parts.push({ title: isHeading ? textOf(node) : '', nodes: [] })
    if (!isHeading) parts[parts.length - 1].nodes.push(node)
  }
  return parts
}

const body = (content: Content, nodes: Node[]) => (
  <RichText data={{ ...content, root: { ...content.root, children: nodes } }} />
)

/**
 * Tekst o kolekciji ispod proizvoda (polje "Opis" kolekcije u adminu, D-063). Stranice kategorija
 * se rangiraju na opšte pretrage ("muške čarape", "sportske čarape"), pa im je potreban
 * opisni tekst sa odgovorima na česta pitanja; ispod proizvoda ne odvlači pažnju od kupovine.
 * Dizajn (D-066): bež okvir kao ostale sekcije; prvi deo je uvod levo (lepi se pri skrolu na
 * desktopu), ostali delovi su numerisane bele kartice desno.
 */
export function CollectionText({ content }: { content: ShopCollection['description'] }) {
  if (!content?.root?.children?.length) return null
  const [intro, ...rest] = splitByHeadings(content)

  return (
    <section className="bg-white pb-12 lg:pb-20" aria-labelledby="o-kolekciji">
      <div className="container-page">
        <div className="grid gap-8 rounded-[24px] bg-beige p-5 sm:p-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14 lg:rounded-frame lg:p-14">
          <div className="flex flex-col items-start gap-5 lg:sticky lg:top-[calc(var(--header-h)+32px)] lg:self-start">
            <span className="rounded-full bg-black px-3.5 py-1.5 text-[12px] leading-none font-semibold tracking-[0.04em] text-yellow uppercase">
              O kolekciji
            </span>
            <WordReveal
              id="o-kolekciji"
              text={intro.title || 'O kolekciji'}
              className="font-display text-[30px] leading-[1.05] font-extrabold tracking-[-0.05em] text-primary sm:text-[38px] lg:text-[46px]"
            />
            {intro.nodes.length ? (
              <div
                data-reveal="up"
                className="rich text-[16px] leading-7 text-neutral-700 lg:text-[17px]"
              >
                {body(content, intro.nodes)}
              </div>
            ) : null}
            <ul data-reveal="stagger" className="flex flex-wrap gap-2" aria-label="Ukratko">
              {FACTS.map((fact) => (
                <li
                  key={fact}
                  className="flex h-9 items-center gap-2 rounded-full bg-white px-3.5 text-[13px] font-medium text-black shadow-[0_1px_1.5px_rgba(0,0,0,0.08)]"
                >
                  <span
                    className="size-2 rounded-full bg-yellow ring-[1.5px] ring-black"
                    aria-hidden
                  />
                  {fact}
                </li>
              ))}
            </ul>
          </div>

          {rest.length ? (
            <ol className="flex flex-col gap-3 lg:gap-4">
              {rest.map((part, i) => (
                <li
                  key={part.title || i}
                  data-reveal="card"
                  className="card-lift flex flex-col gap-3 rounded-[20px] bg-white p-5 shadow-[0_1px_1.5px_rgba(0,0,0,0.06)] sm:p-7"
                >
                  {/* Na telefonu broj stoji uz naslov, a tekst koristi punu širinu kartice. */}
                  <div className="flex items-center gap-4 sm:gap-5">
                    <span
                      aria-hidden
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-yellow font-display text-[15px] font-extrabold tracking-[-0.04em] text-black sm:size-12 sm:text-[17px]"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {part.title ? (
                      <h3 className="font-display text-[19px] leading-6 font-bold tracking-[-0.03em] text-black sm:text-[22px] sm:leading-7">
                        {part.title}
                      </h3>
                    ) : null}
                  </div>
                  <div className="rich text-[15px] leading-6 text-neutral-700 sm:pl-[68px]">
                    {body(content, part.nodes)}
                  </div>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      </div>
    </section>
  )
}
