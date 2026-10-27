/** Vrednosti za filtere na kolekciji (iz Figma panela filtera). */
export const CATEGORY_OPTIONS = [
  { label: 'Odrasli', value: 'odrasli' },
  { label: 'Višekomadni paketi', value: 'paketi' },
  { label: 'Extra tanke', value: 'extra-tanke' },
  { label: 'Deca', value: 'deca' },
] as const

export const PATTERN_OPTIONS = [
  { label: 'Životinje', value: 'zivotinje' },
  { label: 'Grafički dezeni', value: 'graficki' },
  { label: 'Hrana i pića', value: 'hrana-i-pica' },
  { label: 'Tačke i pruge', value: 'tacke-i-pruge' },
  { label: 'Jednobojni', value: 'jednobojni' },
  { label: 'Priroda', value: 'priroda' },
  { label: 'Sport i vozila', value: 'sport-i-vozila' },
] as const

export const PRODUCT_TYPE_OPTIONS = [
  { label: 'Muške čarape', value: 'muske' },
  { label: 'Ženske čarape', value: 'zenske' },
  { label: 'Sportske čarape', value: 'sport' },
  { label: 'Dečije čarape', value: 'decije' },
  { label: 'Donji veš', value: 'donji-ves' },
] as const

export type OptionKind = 'size' | 'color' | 'other'
