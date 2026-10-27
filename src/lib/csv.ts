/**
 * Minimalan CSV (RFC 4180) bez spoljne biblioteke (DECISIONS.md D-045): navodnici,
 * "" unutar navodnika, novi redovi u polju, CRLF, BOM. Separator se prepoznaje iz
 * zaglavlja (zarez kao u Shopify-ju ili tačka-zarez kao u Excel-u sa srpskim podešavanjima).
 */
export function parseCsv(input: string): Record<string, string>[] {
  const text = input.replace(/^﻿/, '')
  const firstLine = text.slice(0, text.search(/\r?\n/) === -1 ? text.length : text.search(/\r?\n/))
  const delimiter =
    (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ';' : ','

  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else quoted = false
      } else field += ch
    } else if (ch === '"' && field === '') quoted = true
    else if (ch === delimiter) {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else field += ch
  }
  if (field !== '' || row.length) {
    row.push(field)
    rows.push(row)
  }

  const [header, ...body] = rows.filter((r) => r.some((c) => c.trim() !== ''))
  if (!header) return []
  const keys = header.map((h) => h.trim())
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? '').trim()])))
}

/**
 * Tekst koji Excel čita kao formulu (=, @, ili +/- ispred nečega što nije broj, npr. ime kupca
 * "=HYPERLINK(...)" iz checkout-a) dobija apostrof ispred i prikazuje se kao običan tekst.
 * Brojevi i telefoni ("+381 63 ...") ostaju nepromenjeni.
 */
const neutralizeFormula = (s: string) =>
  /^[=@\t\r]/.test(s) || /^[+-](?![\d\s().,/-]*$)/.test(s) ? `'${s}` : s

const cell = (value: unknown) => {
  const raw = value === null || value === undefined ? '' : String(value)
  const s = typeof value === 'string' ? neutralizeFormula(raw) : raw
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** CSV sa BOM-om (Excel ispravno čita UTF-8 i slova č, ć, š, ž, đ). */
export function toCsv(headers: readonly string[], rows: Record<string, unknown>[]): string {
  const lines = [
    headers.map(cell).join(','),
    ...rows.map((r) => headers.map((h) => cell(r[h])).join(',')),
  ]
  return `﻿${lines.join('\r\n')}\r\n`
}
