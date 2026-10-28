import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'
import { WordReveal } from '@/components/motion/WordReveal'
import { formatPrice } from '@/lib/money'
import type { Product } from '@/payload-types'
import type { ReactNode } from 'react'

type Props = {
  description: Product['description']
  material: string | null
  care: string | null
  shippingInfo: string
  shippingPrice: number
  freeShippingThreshold: number | null
  deliveryEstimate: string
  sizes: string[]
}

/**
 * Detalji ispod proizvoda (D-063): pun opis, materijal i održavanje, dostava, vraćanje i veličine.
 * Odgovara na pitanja pre kupovine (konverzija) i daje Google-u i AI pretraživačima pun tekst
 * stranice; sadržaj je u HTML-u i kada je harmonika zatvorena. Stil kao FAQ (motion.css .faq-item).
 */
export function ProductDetails(props: Props) {
  const sections: { title: string; body: ReactNode }[] = [
    ...(props.description
      ? [{ title: 'Opis proizvoda', body: <RichText data={props.description} /> }]
      : []),
    {
      title: 'Materijal i održavanje',
      body: (
        <>
          {props.material ? (
            <p>
              <strong>Sastav:</strong> {props.material}
            </p>
          ) : null}
          {props.care ? <p>{props.care}</p> : null}
          <p>
            Pravimo ih u sopstvenoj fabrici u Novom Pazaru i svaki par pregledamo pre pakovanja.
          </p>
        </>
      ),
    },
    {
      title: 'Kako da izaberem veličinu?',
      body: (
        <>
          <p>
            Veličina čarapa je označena brojem obuće.
            {props.sizes.length
              ? ` Ovaj model je dostupan u veličinama ${props.sizes.join(', ')}.`
              : ''}{' '}
            Izaberite raspon u koji upada broj vaših cipela; ako ste na granici dva raspona, uzmite
            veći za udobniji prst, a manji za čvršće prijanjanje.
          </p>
          <p>
            Detaljna tabela je u vodiču{' '}
            <Link href="/blog/tabela-velicina-carapa">Tabela veličina čarapa</Link>.
          </p>
        </>
      ),
    },
    {
      title: 'Dostava i plaćanje',
      body: (
        <>
          <p>
            Dostava na adresu širom Srbije košta {formatPrice(props.shippingPrice)}
            {props.freeShippingThreshold
              ? `, a za porudžbine od ${formatPrice(props.freeShippingThreshold)} je besplatna`
              : ''}
            {props.deliveryEstimate ? `. Pošiljka stiže za ${props.deliveryEstimate}` : ''}. Plaćate
            pouzećem, gotovinom kuriru, a fiskalni račun stiže uz pošiljku.
          </p>
          {props.shippingInfo ? <p>{props.shippingInfo}</p> : null}
          <p>
            Više na stranici <Link href="/dostava">Dostava i plaćanje</Link>.
          </p>
        </>
      ),
    },
    {
      title: 'Vraćanje i reklamacije',
      body: (
        <p>
          Imate 14 dana od prijema da odustanete od kupovine. Čarape stižu u zapečaćenom pakovanju i
          iz higijenskih razloga se ne mogu vratiti ako je pakovanje otvoreno, a proizvod sa
          nedostatkom uvek možete da reklamirate. Postupak i obrazac su na stranici{' '}
          <Link href="/reklamacije">Reklamacije i odustanak</Link>.
        </p>
      ),
    },
  ]

  // Dizajn kao tekst kolekcije (D-066): bež okvir, naslov levo, numerisane bele kartice desno.
  return (
    <section className="bg-white pb-12 lg:pb-20" aria-labelledby="detalji-naslov">
      <div className="container-page">
        <div className="grid gap-8 rounded-[24px] bg-beige p-5 sm:p-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14 lg:rounded-frame lg:p-14">
          <div className="flex flex-col items-start gap-5 lg:sticky lg:top-[calc(var(--header-h)+32px)] lg:self-start">
            <span className="rounded-full bg-black px-3.5 py-1.5 text-[12px] leading-none font-semibold tracking-[0.04em] text-yellow uppercase">
              Pre kupovine
            </span>
            <WordReveal
              id="detalji-naslov"
              text="Detalji o proizvodu"
              className="font-display text-[30px] leading-[1.05] font-extrabold tracking-[-0.05em] text-primary sm:text-[38px] lg:text-[46px]"
            />
            <p data-reveal="up" className="text-[16px] leading-7 text-neutral-700 lg:text-[17px]">
              Sve što treba da znate pre porudžbine: od čega su, kako da izaberete veličinu, kada
              stižu i kako ih vraćate.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:gap-4">
            {sections.map((s, i) => (
              <details
                key={s.title}
                open={i === 0}
                data-reveal="card"
                className="faq-item group rounded-[20px] bg-white p-5 shadow-[0_1px_1.5px_rgba(0,0,0,0.06)] sm:p-6"
              >
                <summary className="flex min-h-11 cursor-pointer list-none items-center gap-4 [&::-webkit-details-marker]:hidden">
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-yellow font-display text-[15px] font-extrabold tracking-[-0.04em] text-black sm:size-11 sm:text-[16px]"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="flex-1 font-display text-[18px] leading-6 font-bold tracking-[-0.03em] text-black sm:text-[20px]">
                    {s.title}
                  </h3>
                  <span
                    aria-hidden
                    className="faq-icon flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[20px] leading-none text-black transition-[rotate,background-color] group-open:rotate-45 group-open:bg-primary group-open:text-white"
                  >
                    +
                  </span>
                </summary>
                <div className="rich mt-4 text-[15px] leading-6 text-neutral-700 sm:pl-[60px]">
                  {s.body}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
