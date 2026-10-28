import type { Order } from '@/payload-types'

/**
 * Podaci za kurirsku službu (AKS) iz porudžbine (D-079): primalac, adresa, telefon, otkupnina,
 * sadržaj i procena mase. Koriste ih blok na porudžbini u adminu, adresnica za štampu i CSV
 * izvoz za uvoz pošiljki. Bez ručnog prepisivanja adrese.
 */
export type Shipment = {
  /** Broj porudžbine, referenca na pošiljci (npr. #1001). */
  reference: string
  recipient: string
  phone: string
  street: string
  postalCode: string
  city: string
  country: string
  email: string
  /** Iznos koji kurir naplaćuje (pouzećem i još nije plaćeno), inače 0. */
  cod: number
  /** Vrednost pošiljke (ukupno sa dostavom). */
  value: number
  pairs: number
  /** Procena mase u kg: oko 50 g po paru i 100 g pakovanje. */
  weightKg: number
  contents: string
  note: string
}

const PAIRS_PER_PACK = 12

/** Broj pari u stavci: paket od 12 pari ili pojedinačan par (prema nazivu proizvoda). */
const pairsOf = (title: string, quantity: number) =>
  quantity * (/\(12 pari\)|12 pari/i.test(title) ? PAIRS_PER_PACK : 1)

export function shipmentFromOrder(order: Order): Shipment {
  const a = order.shippingAddress ?? {}
  const lines = order.lineItems ?? []
  const pairs = lines.reduce((n, l) => n + pairsOf(l.title ?? '', l.quantity ?? 0), 0)
  const items = lines.reduce((n, l) => n + (l.quantity ?? 0), 0)
  const cod =
    order.paymentMethod === 'cod' && order.paymentStatus !== 'paid' ? (order.total ?? 0) : 0
  return {
    reference: order.name ?? String(order.id),
    recipient: a.name ?? '',
    phone: a.phone || order.phone || '',
    street: [a.address1, a.address2].filter(Boolean).join(', '),
    postalCode: a.postalCode ?? '',
    city: a.city ?? '',
    country: a.country || 'Srbija',
    email: order.email ?? '',
    cod,
    value: order.total ?? 0,
    pairs,
    weightKg: Math.round((pairs * 0.05 + 0.1) * 100) / 100,
    contents: `Čarape, ${pairs} ${pairs === 1 ? 'par' : 'pari'} (${items} ${items === 1 ? 'artikal' : 'artikla'})`,
    note: order.customerNote ?? '',
  }
}

/** Tekst za kopiranje u formu kurirske službe (jedan podatak po redu). */
export function shipmentText(s: Shipment): string {
  return [
    `Primalac: ${s.recipient}`,
    `Telefon: ${s.phone}`,
    `Adresa: ${s.street}`,
    `Mesto: ${s.postalCode} ${s.city}`,
    `Otkupnina: ${s.cod ? `${s.cod} RSD` : 'nema (plaćeno)'}`,
    `Sadržaj: ${s.contents}`,
    `Masa (procena): ${s.weightKg} kg`,
    `Referenca: ${s.reference}`,
    ...(s.note ? [`Napomena kupca: ${s.note}`] : []),
  ].join('\n')
}

/** Kolone CSV izvoza za kurira (uvoz pošiljki u AKS portal ili Excel). */
export const SHIPMENT_CSV_HEADERS = [
  'Referenca',
  'Primalac',
  'Telefon',
  'Adresa',
  'Poštanski broj',
  'Mesto',
  'Država',
  'Otkupnina (RSD)',
  'Vrednost (RSD)',
  'Broj paketa',
  'Masa (kg)',
  'Sadržaj',
  'Napomena',
  'Email',
] as const

export function shipmentCsvRow(
  s: Shipment,
): Record<(typeof SHIPMENT_CSV_HEADERS)[number], unknown> {
  return {
    Referenca: s.reference,
    Primalac: s.recipient,
    Telefon: s.phone,
    Adresa: s.street,
    'Poštanski broj': s.postalCode,
    Mesto: s.city,
    Država: s.country,
    'Otkupnina (RSD)': s.cod,
    'Vrednost (RSD)': s.value,
    'Broj paketa': 1,
    'Masa (kg)': s.weightKg,
    Sadržaj: s.contents,
    Napomena: s.note,
    Email: s.email,
  }
}
