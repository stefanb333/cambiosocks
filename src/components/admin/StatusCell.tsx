import type { DefaultCellComponentProps } from 'payload'

/**
 * Obojene oznake statusa u listama (porudžbine, plaćanje, proizvodi). Boja zavisi od vrednosti
 * (custom.scss, `.cambio-status--<vrednost>`), naziv dolazi iz opcija polja.
 */
export function StatusCell({ cellData, field }: DefaultCellComponentProps) {
  if (typeof cellData !== 'string' || !cellData) return null
  const options = 'options' in field && Array.isArray(field.options) ? field.options : []
  const option = options.find((o) => (typeof o === 'string' ? o : o.value) === cellData)
  const label =
    option && typeof option === 'object' && typeof option.label === 'string'
      ? option.label
      : cellData
  return <span className={`cambio-status cambio-status--${cellData}`}>{label}</span>
}
