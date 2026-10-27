import { slugify } from '../slugify'

/** Delovi generatora varijanti koji rade i u admin UI-ju (bez Payload servera). */
export type OptionInput = { name?: string | null; values?: { value?: string | null }[] | null }

/** Sve kombinacije vrednosti opcija, redom kao u adminu (npr. [["36-40","Crna"], ...]). */
export function optionCombinations(options: OptionInput[]): string[][] {
  const lists = options
    .map((o) => (o.values ?? []).map((v) => v.value?.trim()).filter((v): v is string => Boolean(v)))
    .filter((l) => l.length)
  if (!lists.length) return []
  return lists.reduce<string[][]>(
    (acc, list) => acc.flatMap((combo) => list.map((v) => [...combo, v])),
    [[]],
  )
}

export const comboKey = (values: (string | null | undefined)[]) =>
  values
    .map((v) => (v ?? '').trim().toLowerCase())
    .filter(Boolean)
    .join(' / ')

/** SKU predlog: CAM-<proizvod>-<vrednosti>, npr. CAM-SPORT-CARAPE-CRNA-3640. */
export function suggestSku(productSlug: string, values: string[]) {
  const head = slugify(productSlug).toUpperCase().split('-').slice(0, 3).join('-')
  const tail = values.map((v) => slugify(v).toUpperCase().replace(/-/g, '')).join('-')
  return `CAM-${head}${tail ? `-${tail}` : ''}`.slice(0, 64)
}
