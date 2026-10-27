import { isStaff } from '@/access'
import { toCsv } from './csv'
import type { Endpoint, Payload, PayloadRequest } from 'payload'

/** Izvoz porudžbina i kupaca sa kolonama iz Shopify izvoza (knjigovodstvo, kurirske službe, Excel). */

const ORDER_HEADERS = [
  'Name',
  'Email',
  'Financial Status',
  'Fulfillment Status',
  'Currency',
  'Subtotal',
  'Shipping',
  'Total',
  'Discount Code',
  'Discount Amount',
  'Created at',
  'Lineitem quantity',
  'Lineitem name',
  'Lineitem price',
  'Lineitem sku',
  'Shipping Name',
  'Shipping Address1',
  'Shipping Address2',
  'Shipping City',
  'Shipping Zip',
  'Shipping Country',
  'Shipping Phone',
  'Notes',
  'Payment Method',
  'Status',
] as const

const FINANCIAL: Record<string, string> = { pending: 'pending', paid: 'paid', refunded: 'refunded' }
const FULFILLMENT: Record<string, string> = {
  nova: 'unfulfilled',
  potvrdjena: 'unfulfilled',
  poslata: 'fulfilled',
  isporucena: 'fulfilled',
  otkazana: 'restocked',
}
const STATUS: Record<string, string> = {
  nova: 'Nova',
  potvrdjena: 'Potvrđena',
  poslata: 'Poslata',
  isporucena: 'Isporučena',
  otkazana: 'Otkazana',
}

export async function exportOrdersCsv(payload: Payload, req: PayloadRequest) {
  const { docs } = await payload.find({
    collection: 'orders',
    depth: 0,
    limit: 0,
    pagination: false,
    sort: '-createdAt',
    req,
    overrideAccess: true,
  })
  const rows: Record<string, unknown>[] = []
  for (const o of docs) {
    const a = o.shippingAddress ?? {}
    ;(o.lineItems ?? []).forEach((item, i) => {
      const row: Record<string, unknown> = {
        Name: o.name,
        Email: o.email,
        'Lineitem quantity': item.quantity,
        'Lineitem name': [item.title, item.variantTitle].filter(Boolean).join(' - '),
        'Lineitem price': item.unitPrice,
        'Lineitem sku': item.sku ?? '',
      }
      if (i === 0) {
        Object.assign(row, {
          'Financial Status': FINANCIAL[o.paymentStatus ?? 'pending'] ?? o.paymentStatus,
          'Fulfillment Status': FULFILLMENT[o.status] ?? '',
          Currency: 'RSD',
          Subtotal: o.subtotal ?? 0,
          Shipping: o.shippingTotal ?? 0,
          Total: o.total ?? 0,
          'Discount Code': o.discountCode ?? '',
          'Discount Amount': o.discountTotal ?? 0,
          'Created at': o.createdAt,
          'Shipping Name': a.name ?? '',
          'Shipping Address1': a.address1 ?? '',
          'Shipping Address2': a.address2 ?? '',
          'Shipping City': a.city ?? '',
          'Shipping Zip': a.postalCode ?? '',
          'Shipping Country': a.country ?? '',
          'Shipping Phone': o.phone ?? a.phone ?? '',
          Notes: o.customerNote ?? '',
          'Payment Method': o.paymentMethod === 'cod' ? 'Pouzećem' : (o.paymentMethod ?? ''),
          Status: STATUS[o.status] ?? o.status,
        })
      }
      rows.push(row)
    })
  }
  return toCsv(ORDER_HEADERS, rows)
}

const CUSTOMER_HEADERS = [
  'First Name',
  'Last Name',
  'Email',
  'Accepts Email Marketing',
  'Default Address Address1',
  'Default Address Address2',
  'Default Address City',
  'Default Address Zip',
  'Default Address Country Code',
  'Phone',
  'Total Spent',
  'Total Orders',
  'Note',
] as const

export async function exportCustomersCsv(payload: Payload, req: PayloadRequest) {
  const { docs } = await payload.find({
    collection: 'customers',
    depth: 0,
    limit: 0,
    pagination: false,
    sort: 'lastName',
    req,
    overrideAccess: true,
  })
  return toCsv(
    CUSTOMER_HEADERS,
    docs.map((c) => {
      const a = c.addresses?.[0] ?? {}
      return {
        'First Name': c.firstName ?? '',
        'Last Name': c.lastName ?? '',
        Email: c.email,
        'Accepts Email Marketing': c.acceptsMarketing ? 'yes' : 'no',
        'Default Address Address1': a.address1 ?? '',
        'Default Address Address2': a.address2 ?? '',
        'Default Address City': a.city ?? '',
        'Default Address Zip': a.postalCode ?? '',
        'Default Address Country Code':
          (a.country ?? 'Srbija') === 'Srbija' ? 'RS' : (a.country ?? ''),
        Phone: c.phone ?? a.phone ?? '',
        'Total Spent': c.totalSpent ?? 0,
        'Total Orders': c.ordersCount ?? 0,
        Note: c.note ?? '',
      }
    }),
  )
}

/** GET /api/<kolekcija>/export-csv, samo za osoblje. */
export function csvExportEndpoint(
  name: string,
  build: (payload: Payload, req: PayloadRequest) => Promise<string>,
): Endpoint {
  return {
    path: '/export-csv',
    method: 'get',
    handler: async (req) => {
      if (!isStaff({ req }))
        return Response.json({ message: 'Nemate dozvolu za ovu akciju.' }, { status: 403 })
      const csv = await build(req.payload, req)
      return new Response(csv, {
        headers: {
          'content-type': 'text/csv; charset=utf-8',
          'content-disposition': `attachment; filename="cambio-${name}-${new Date().toISOString().slice(0, 10)}.csv"`,
          'cache-control': 'no-store',
        },
      })
    },
  }
}
