import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { Media, Product, Variant } from '@/payload-types'
import { toCsv } from '../csv'
import { IMAGE_MIME_TYPES } from '../media'
import { plainTextToLexical } from '../richtext'
import { slugify } from '../slugify'
import { syncProductAggregates } from './aggregates'
import { PRODUCT_TYPE_OPTIONS, type OptionKind } from './constants'
import { SHOPIFY_PRODUCT_HEADERS, type CsvRow, type ProductGroup } from './shopify-csv-shared'
import { comboKey } from './variants'
import type { Payload, PayloadRequest } from 'payload'

const siteUrl = () => (process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, '')
const absolute = (url?: string | null) =>
  !url ? '' : /^https?:\/\//.test(url) ? url : `${siteUrl()}${url}`
const MAX_IMAGE_BYTES = 15 * 1024 * 1024
const idOf = (v: unknown) =>
  v && typeof v === 'object' ? (v as { id: number }).id : (v as number | undefined)

// ---------------------------------------------------------------- izvoz

/** Ceo katalog u Shopify CSV formatu (jedan red po varijanti, dodatne slike u posebnim redovima). */
export async function exportProductsCsv(payload: Payload, req?: PayloadRequest): Promise<string> {
  const { docs: products } = await payload.find({
    collection: 'products',
    depth: 1,
    limit: 0,
    pagination: false,
    sort: 'title',
    req,
    overrideAccess: true,
  })
  const { docs: variants } = await payload.find({
    collection: 'variants',
    depth: 1,
    limit: 0,
    pagination: false,
    sort: 'position',
    req,
    overrideAccess: true,
  })
  const byProduct = new Map<number, Variant[]>()
  for (const v of variants) {
    const pid = idOf(v.product) as number
    byProduct.set(pid, [...(byProduct.get(pid) ?? []), v])
  }

  const rows: Record<string, unknown>[] = []
  for (const p of products) {
    const options = p.options ?? []
    const vs = byProduct.get(p.id) ?? []
    const images = (p.gallery ?? [])
      .map((g) => g.image)
      .filter((m): m is Media => Boolean(m && typeof m === 'object'))
    const count = Math.max(vs.length, images.length, 1)
    for (let i = 0; i < count; i++) {
      const v = vs[i]
      const img = images[i]
      const row: Record<string, unknown> = { Handle: p.slug }
      if (i === 0) {
        Object.assign(row, {
          Title: p.title,
          'Body (HTML)': p.description
            ? convertLexicalToHTML({ data: p.description as never, disableContainer: true })
            : '',
          Vendor: p.brand ?? 'Cambio',
          Type: PRODUCT_TYPE_OPTIONS.find((o) => o.value === p.productType)?.label ?? '',
          Tags: (p.tags ?? []).join(', '),
          Published: p.status === 'active' ? 'TRUE' : 'FALSE',
          'Gift Card': 'FALSE',
          'SEO Title': p.seo?.title ?? '',
          'SEO Description': p.seo?.description ?? '',
          Status: p.status,
        })
        options.forEach((o, n) => (row[`Option${n + 1} Name`] = o.name))
        if (!options.length) row['Option1 Name'] = 'Title'
      }
      if (v) {
        const values = [v.option1, v.option2, v.option3]
        options.forEach((_, n) => (row[`Option${n + 1} Value`] = values[n] ?? ''))
        if (!options.length) row['Option1 Value'] = 'Default Title'
        Object.assign(row, {
          'Variant SKU': v.sku ?? '',
          'Variant Grams': v.weight ?? '',
          'Variant Inventory Tracker': v.trackInventory === false ? '' : 'shopify',
          'Variant Inventory Qty': v.stock ?? 0,
          'Variant Inventory Policy': v.allowBackorder ? 'continue' : 'deny',
          'Variant Fulfillment Service': 'manual',
          'Variant Price': v.price,
          'Variant Compare At Price': v.compareAtPrice ?? '',
          'Variant Requires Shipping': 'TRUE',
          'Variant Taxable': 'TRUE',
          'Variant Barcode': v.barcode ?? '',
          'Variant Image': v.image && typeof v.image === 'object' ? absolute(v.image.url) : '',
          'Variant Weight Unit': 'g',
        })
      }
      if (img)
        Object.assign(row, {
          'Image Src': absolute(img.url),
          'Image Position': i + 1,
          'Image Alt Text': img.alt,
        })
      rows.push(row)
    }
  }
  return toCsv(SHOPIFY_PRODUCT_HEADERS, rows)
}

// ---------------------------------------------------------------- uvoz

export type ImportOptions = { dryRun: boolean; importImages: boolean }
export type GroupResult = {
  handle: string
  line: number
  action: 'created' | 'updated' | 'skipped'
  variantsCreated: number
  variantsUpdated: number
  images: number
  errors: string[]
  warnings: string[]
}

const truthy = (s?: string) => /^(true|da|yes|1)$/i.test((s ?? '').trim())
const num = (s?: string) => {
  const t = (s ?? '').replace(/\s/g, '').replace(',', '.')
  if (!t) return undefined
  const n = Number(t)
  return Number.isFinite(n) ? n : NaN
}

function kindFor(name: string): OptionKind {
  const n = slugify(name)
  if (/(velicin|size|broj)/.test(n)) return 'size'
  if (/(boj|color|colour)/.test(n)) return 'color'
  return 'other'
}

/** Body (HTML) u pasuse za Lexical: zadržava tekst, ne i formatiranje (D-045). */
export function htmlToParagraphs(html: string): string {
  return html
    .replace(/<\s*(br|\/p|\/div|\/li|\/h[1-6])\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/[ \t]+/g, ' ')
}

/** Lokalne, privatne i rezervisane adrese (IPv4 i IPv6) na koje server ne sme da šalje zahteve. */
function isPrivateAddress(ip: string): boolean {
  if (isIP(ip) === 6) {
    const v = ip.toLowerCase()
    if (v.startsWith('::ffff:')) return isPrivateAddress(v.slice(7))
    return (
      v === '::' || v === '::1' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80')
    )
  }
  const [a, b] = ip.split('.').map(Number)
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  )
}

/**
 * Slike se preuzimaju sa servera, pa adresa mora da vodi na javni internet (SSRF zaštita):
 * proveravaju se i IP adrese iz DNS-a, ne samo ime (npr. "127.0.0.1.nip.io").
 */
async function publicUrl(raw: string): Promise<URL> {
  const url = new URL(raw)
  if (!/^https?:$/.test(url.protocol)) throw new Error(`adresa slike nije dozvoljena (${raw})`)
  const host = url.hostname.replace(/^\[|\]$/g, '')
  const addresses = isIP(host) ? [host] : (await lookup(host, { all: true })).map((a) => a.address)
  if (!addresses.length || addresses.some(isPrivateAddress))
    throw new Error(`adresa slike nije dozvoljena (${raw})`)
  return url
}

/** Preuzimanje uz ručno praćenje preusmerenja (najviše 3): svaka nova adresa se ponovo proverava. */
async function fetchPublic(src: string): Promise<Response> {
  let url = await publicUrl(src)
  for (let hop = 0; hop <= 3; hop++) {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000), redirect: 'manual' })
    const location = res.headers.get('location')
    if (res.status < 300 || res.status >= 400 || !location) return res
    url = await publicUrl(new URL(location, url).toString())
  }
  throw new Error(`previše preusmerenja: ${src}`)
}

async function importImage(
  payload: Payload,
  req: PayloadRequest,
  src: string,
  alt: string,
): Promise<number> {
  const existing = await payload.find({
    collection: 'media',
    where: { sourceUrl: { equals: src } },
    limit: 1,
    depth: 0,
    req,
    overrideAccess: true,
  })
  if (existing.docs[0]) return existing.docs[0].id
  // Slika iz našeg izvoza (lokalni /api/media/file/ ili R2 adresa): poveži postojeću, ne preuzimaj ponovo.
  const own = [
    `${siteUrl()}/api/media/file/`,
    '/api/media/file/',
    process.env.S3_PUBLIC_URL ? `${process.env.S3_PUBLIC_URL.replace(/\/$/, '')}/` : '',
  ]
    .filter(Boolean)
    .find((prefix) => src.startsWith(prefix))
  if (own) {
    const filename = decodeURIComponent(src.slice(own.length).split('?')[0])
    const match = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
      depth: 0,
      req,
      overrideAccess: true,
    })
    if (match.docs[0]) return match.docs[0].id
  }
  const res = await fetchPublic(src)
  if (!res.ok) throw new Error(`slika nije preuzeta (${res.status}): ${src}`)
  const type = res.headers.get('content-type')?.split(';')[0].trim().toLowerCase() ?? ''
  if (!(IMAGE_MIME_TYPES as readonly string[]).includes(type))
    throw new Error(`fajl nije podržana slika (${type || 'nepoznat tip'}): ${src}`)
  if (Number(res.headers.get('content-length')) > MAX_IMAGE_BYTES)
    throw new Error(`slika je veća od 15 MB: ${src}`)
  const data = Buffer.from(await res.arrayBuffer())
  if (data.length > MAX_IMAGE_BYTES) throw new Error(`slika je veća od 15 MB: ${src}`)
  const name = decodeURIComponent(
    new URL(res.url || src).pathname.split('/').pop() || 'slika',
  ).replace(/[^\w.-]+/g, '-')
  const media = await payload.create({
    collection: 'media',
    data: { alt: alt || name, sourceUrl: src },
    file: { data, mimetype: type, name, size: data.length },
    req,
    overrideAccess: true,
  })
  return media.id
}

/**
 * Uvozi jedan proizvod (sve redove jednog Handle-a): pravi ga ili ažurira po slug-u,
 * a varijante uparuje po SKU-u, pa po kombinaciji opcija. Prazna polja u CSV-u ne
 * brišu postojeće vrednosti. U `dryRun` režimu samo proverava i vraća izveštaj.
 */
export async function importProductGroup(
  payload: Payload,
  req: PayloadRequest,
  group: ProductGroup,
  opts: ImportOptions,
): Promise<GroupResult> {
  const result: GroupResult = {
    handle: group.handle,
    line: group.line,
    action: 'skipped',
    variantsCreated: 0,
    variantsUpdated: 0,
    images: 0,
    errors: [],
    warnings: [],
  }
  const slug = slugify(group.handle)
  const first = group.rows.find((r) => r['Title']) ?? group.rows[0]
  const lineOf = (r: CsvRow) => group.line + group.rows.indexOf(r)

  const existing = (
    await payload.find({
      collection: 'products',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      req,
      overrideAccess: true,
    })
  ).docs[0] as Product | undefined
  const title = first['Title'] || existing?.title
  if (!title) {
    result.errors.push(`Red ${group.line}: proizvod "${group.handle}" nema naziv (Title).`)
    return result
  }

  // Opcije: nazivi iz prvog reda, vrednosti redom iz varijanti.
  const optionNames = [1, 2, 3]
    .map((n) => first[`Option${n} Name`]?.trim())
    .filter((n): n is string => Boolean(n) && n !== 'Title')
  const variantRows = group.rows.filter(
    (r) => r['Variant Price'] || r['Variant SKU'] || r['Option1 Value'],
  )
  const options = optionNames.map((name, n) => {
    const previous = existing?.options?.find((o) => o.name.toLowerCase() === name.toLowerCase())
    const values = [
      ...new Set(
        variantRows.map((r) => r[`Option${n + 1} Value`]?.trim()).filter(Boolean) as string[],
      ),
    ]
    return {
      name,
      kind: previous?.kind ?? kindFor(name),
      values: values.map((value) => ({
        value,
        swatch:
          previous?.values?.find((v) => v.value.toLowerCase() === value.toLowerCase())?.swatch ??
          null,
      })),
    }
  })

  // Provera redova varijanti.
  const parsed = variantRows.map((r) => {
    const price = num(r['Variant Price'])
    const compareAt = num(r['Variant Compare At Price'])
    const qty = num(r['Variant Inventory Qty'])
    const grams = num(r['Variant Grams'])
    const values = optionNames.map((_, n) => r[`Option${n + 1} Value`]?.trim() ?? '')
    if (price === undefined || Number.isNaN(price) || price < 0)
      result.errors.push(`Red ${lineOf(r)}: neispravna cena "${r['Variant Price'] ?? ''}".`)
    if (Number.isNaN(compareAt))
      result.errors.push(
        `Red ${lineOf(r)}: neispravna stara cena "${r['Variant Compare At Price']}".`,
      )
    if (Number.isNaN(qty))
      result.errors.push(`Red ${lineOf(r)}: neispravna zaliha "${r['Variant Inventory Qty']}".`)
    if (optionNames.length && values.some((v) => !v))
      result.errors.push(`Red ${lineOf(r)}: nedostaje vrednost opcije.`)
    return { row: r, values, price, compareAt, qty, grams }
  })
  const seen = new Set<string>()
  for (const p of parsed) {
    const key = comboKey(p.values)
    if (seen.has(key))
      result.errors.push(
        `Red ${lineOf(p.row)}: kombinacija "${p.values.join(' / ') || 'Osnovna'}" se ponavlja.`,
      )
    seen.add(key)
  }
  if (!parsed.length && !existing)
    result.errors.push(
      `Red ${group.line}: proizvod "${group.handle}" nema nijednu varijantu sa cenom.`,
    )

  const typeLabel = first['Type']?.trim()
  const productType = typeLabel
    ? PRODUCT_TYPE_OPTIONS.find(
        (o) => o.label.toLowerCase() === typeLabel.toLowerCase() || o.value === slugify(typeLabel),
      )?.value
    : undefined
  if (typeLabel && !productType)
    result.warnings.push(
      `Red ${group.line}: tip "${typeLabel}" ne postoji u prodavnici, preskočen.`,
    )
  const statusRaw = first['Status']?.trim().toLowerCase()
  const status =
    statusRaw === 'active' || statusRaw === 'draft' || statusRaw === 'archived'
      ? statusRaw
      : first['Published']
        ? truthy(first['Published'])
          ? 'active'
          : 'draft'
        : undefined

  result.action = existing ? 'updated' : 'created'
  if (result.errors.length || opts.dryRun) {
    if (opts.dryRun && !result.errors.length) {
      const existingVariants = existing
        ? (
            await payload.find({
              collection: 'variants',
              where: { product: { equals: existing.id } },
              limit: 0,
              pagination: false,
              depth: 0,
              req,
              overrideAccess: true,
            })
          ).docs
        : []
      for (const p of parsed) {
        const match = existingVariants.find(
          (v) =>
            (p.row['Variant SKU'] && v.sku === p.row['Variant SKU']) ||
            comboKey([v.option1, v.option2, v.option3]) === comboKey(p.values),
        )
        if (match) result.variantsUpdated++
        else result.variantsCreated++
      }
      result.images = opts.importImages
        ? new Set(group.rows.map((r) => r['Image Src']).filter(Boolean)).size
        : 0
    }
    if (result.errors.length) result.action = 'skipped'
    return result
  }

  // Slike (pre proizvoda, da bi galerija mogla odmah da se upiše).
  const imageIds = new Map<string, number>()
  if (opts.importImages) {
    const sources = group.rows
      .filter((r) => r['Image Src'])
      .sort((a, b) => (num(a['Image Position']) ?? 999) - (num(b['Image Position']) ?? 999))
    for (const src of [
      ...new Set([
        ...sources.map((r) => r['Image Src']),
        ...group.rows.map((r) => r['Variant Image']).filter(Boolean),
      ]),
    ]) {
      try {
        const alt = group.rows.find((r) => r['Image Src'] === src)?.['Image Alt Text'] || title
        imageIds.set(src, await importImage(payload, req, src, alt))
        result.images++
      } catch (error) {
        result.warnings.push(`Slika preskočena: ${(error as Error).message}`)
      }
    }
  }
  const gallery = [
    ...new Set(group.rows.map((r) => r['Image Src']).filter((s) => s && imageIds.has(s))),
  ].map((s) => ({ image: imageIds.get(s)! }))

  const data: Partial<Product> = {
    title,
    ...(first['Body (HTML)']
      ? {
          description: plainTextToLexical(
            htmlToParagraphs(first['Body (HTML)']),
          ) as Product['description'],
        }
      : {}),
    ...(first['Vendor'] ? { brand: first['Vendor'] } : {}),
    ...(productType ? { productType: productType as Product['productType'] } : {}),
    ...(first['Tags']
      ? {
          tags: first['Tags']
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        }
      : {}),
    ...(status ? { status: status as Product['status'] } : {}),
    ...(options.length ? { options: options as Product['options'] } : {}),
    ...(gallery.length ? { gallery } : {}),
    ...(first['SEO Title'] || first['SEO Description']
      ? {
          seo: {
            ...existing?.seo,
            title: first['SEO Title'] || existing?.seo?.title,
            description: first['SEO Description'] || existing?.seo?.description,
          },
        }
      : {}),
  }
  if (parsed[0]?.price !== undefined) data.defaultPrice = parsed[0].price

  const product = existing
    ? await payload.update({
        collection: 'products',
        id: existing.id,
        data,
        req,
        overrideAccess: true,
        context: { skipAggregateSync: true },
      })
    : await payload.create({
        collection: 'products',
        data: { ...data, slug, status: data.status ?? 'draft' } as Product,
        req,
        overrideAccess: true,
        context: { skipAggregateSync: true },
      })

  const { docs: current } = await payload.find({
    collection: 'variants',
    where: { product: { equals: product.id } },
    limit: 0,
    pagination: false,
    depth: 0,
    req,
    overrideAccess: true,
  })
  let position = 0
  for (const p of parsed) {
    const sku = p.row['Variant SKU']?.trim()
    const match = current.find(
      (v) =>
        (sku && v.sku === sku) ||
        comboKey([v.option1, v.option2, v.option3]) === comboKey(p.values),
    )
    const variantImage = p.row['Variant Image'] ? imageIds.get(p.row['Variant Image']) : undefined
    const variantData: Partial<Variant> = {
      option1: p.values[0] || null,
      option2: p.values[1] || null,
      option3: p.values[2] || null,
      price: p.price!,
      ...(p.compareAt !== undefined ? { compareAtPrice: p.compareAt } : {}),
      ...(p.qty !== undefined ? { stock: p.qty } : {}),
      ...(p.grams !== undefined && !Number.isNaN(p.grams) ? { weight: p.grams } : {}),
      ...(sku ? { sku } : {}),
      ...(p.row['Variant Barcode'] ? { barcode: p.row['Variant Barcode'] } : {}),
      ...(p.row['Variant Inventory Policy']
        ? { allowBackorder: p.row['Variant Inventory Policy'].toLowerCase() === 'continue' }
        : {}),
      ...('Variant Inventory Tracker' in p.row
        ? { trackInventory: Boolean(p.row['Variant Inventory Tracker']) }
        : {}),
      ...(variantImage ? { image: variantImage } : {}),
      position: position++,
    }
    try {
      if (match) {
        await payload.update({
          collection: 'variants',
          id: match.id,
          data: variantData,
          req,
          overrideAccess: true,
          context: { skipAggregateSync: true },
        })
        result.variantsUpdated++
      } else {
        await payload.create({
          collection: 'variants',
          data: { ...variantData, product: product.id } as Variant,
          req,
          overrideAccess: true,
          context: { skipAggregateSync: true },
        })
        result.variantsCreated++
      }
    } catch (error) {
      result.errors.push(
        `Red ${lineOf(p.row)}: varijanta nije sačuvana (${(error as Error).message}).`,
      )
    }
  }
  await syncProductAggregates(payload, product.id, req)
  return result
}
