'use client'

import { useRowLabel } from '@payloadcms/ui'

/**
 * Nazivi redova u nizovima admina, umesto "Opcija 01", "Stavka 02"...
 * da se sadržaj vidi i kada je red sklopljen (posebno na telefonu).
 */

const num = (n?: number) => String((n ?? 0) + 1).padStart(2, '0')

export function OptionRowLabel() {
  const { data, rowNumber } = useRowLabel<{ name?: string; values?: { value?: string }[] }>()
  const values = (data?.values ?? []).map((v) => v.value).filter(Boolean)
  if (!data?.name) return <span>Opcija {num(rowNumber)}</span>
  return (
    <span>
      {data.name}
      {values.length ? `: ${values.join(', ')}` : ''}
    </span>
  )
}

export function OptionValueRowLabel() {
  const { data, rowNumber } = useRowLabel<{ value?: string; swatch?: string }>()
  return (
    <span className="cambio-rowlabel">
      {data?.swatch ? (
        <span className="cambio-rowlabel__swatch" style={{ background: data.swatch }} aria-hidden />
      ) : null}
      {data?.value || `Vrednost ${num(rowNumber)}`}
    </span>
  )
}

export function GalleryRowLabel() {
  const { rowNumber } = useRowLabel()
  return <span>{rowNumber === 0 ? 'Slika 01 (glavna)' : `Slika ${num(rowNumber)}`}</span>
}

export function LineItemRowLabel() {
  const { data, rowNumber } = useRowLabel<{
    title?: string
    variantTitle?: string
    quantity?: number
    lineTotal?: number
  }>()
  if (!data?.title) return <span>Stavka {num(rowNumber)}</span>
  return (
    <span>
      {data.quantity ?? 1} × {data.title}
      {data.variantTitle ? ` (${data.variantTitle})` : ''}
      {typeof data.lineTotal === 'number' ? ` · ${Math.round(data.lineTotal)} RSD` : ''}
    </span>
  )
}

const STATUS: Record<string, string> = {
  nova: 'Nova',
  potvrdjena: 'Potvrđena',
  poslata: 'Poslata',
  isporucena: 'Isporučena',
  otkazana: 'Otkazana',
}

export function StatusHistoryRowLabel() {
  const { data, rowNumber } = useRowLabel<{
    from?: string
    to?: string
    at?: string
    by?: string
  }>()
  if (!data?.to) return <span>Promena {num(rowNumber)}</span>
  const at = data.at
    ? new Date(data.at).toLocaleString('sr-Latn-RS', { dateStyle: 'medium', timeStyle: 'short' })
    : ''
  return (
    <span>
      {data.from ? `${STATUS[data.from] ?? data.from} → ` : ''}
      {STATUS[data.to] ?? data.to}
      {at ? ` · ${at}` : ''}
      {data.by ? ` · ${data.by}` : ''}
    </span>
  )
}
