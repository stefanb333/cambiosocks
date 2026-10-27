/**
 * Shopify CSV format proizvoda (zajedničko za admin UI i server). Jedan red po
 * varijanti; prvi red proizvoda nosi naziv, opis, tagove...; dodatne slike idu u
 * redove koji imaju samo Handle i Image Src.
 * https://help.shopify.com/en/manual/products/import-export/using-csv
 */
export const SHOPIFY_PRODUCT_HEADERS = [
  'Handle',
  'Title',
  'Body (HTML)',
  'Vendor',
  'Product Category',
  'Type',
  'Tags',
  'Published',
  'Option1 Name',
  'Option1 Value',
  'Option2 Name',
  'Option2 Value',
  'Option3 Name',
  'Option3 Value',
  'Variant SKU',
  'Variant Grams',
  'Variant Inventory Tracker',
  'Variant Inventory Qty',
  'Variant Inventory Policy',
  'Variant Fulfillment Service',
  'Variant Price',
  'Variant Compare At Price',
  'Variant Requires Shipping',
  'Variant Taxable',
  'Variant Barcode',
  'Image Src',
  'Image Position',
  'Image Alt Text',
  'Gift Card',
  'SEO Title',
  'SEO Description',
  'Variant Image',
  'Variant Weight Unit',
  'Status',
] as const

export type CsvRow = Record<string, string>
export type ProductGroup = { handle: string; line: number; rows: CsvRow[] }

/** Grupiše redove po Handle koloni (redosled iz fajla). `line` je broj reda u fajlu (zaglavlje je red 1). */
export function groupByHandle(rows: CsvRow[]): { groups: ProductGroup[]; errors: string[] } {
  const errors: string[] = []
  const map = new Map<string, ProductGroup>()
  rows.forEach((row, i) => {
    const line = i + 2
    const handle = (row['Handle'] ?? '').trim().toLowerCase()
    if (!handle) {
      errors.push(`Red ${line}: nedostaje Handle.`)
      return
    }
    const group = map.get(handle) ?? { handle, line, rows: [] }
    group.rows.push(row)
    map.set(handle, group)
  })
  return { groups: [...map.values()], errors }
}

export function missingHeaders(rows: CsvRow[]): string[] {
  const keys = new Set(Object.keys(rows[0] ?? {}))
  return ['Handle', 'Title', 'Variant Price'].filter((h) => !keys.has(h))
}
