import crypto from 'node:crypto'
import { sql } from '@payloadcms/db-postgres'
import { adminOnly, staffOnly } from '@/access'
import { sendEmail } from '@/lib/email/send'
import { orderShippedEmail } from '@/lib/email/templates'
import { adjustStock } from '@/lib/orders/stock'
import { csvExportEndpoint, exportOrdersCsv } from '@/lib/shopify-export'
import { orderEndpoints } from './endpoints/orders'
import type { CollectionConfig, Field, PayloadRequest } from 'payload'

export const ORDER_STATUSES = [
  { label: 'Nova', value: 'nova' },
  { label: 'Potvrđena', value: 'potvrdjena' },
  { label: 'Poslata', value: 'poslata' },
  { label: 'Isporučena', value: 'isporucena' },
  { label: 'Otkazana', value: 'otkazana' },
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]['value']

/** Statusi posle kojih je zaliha već skinuta. */
const STOCK_DEDUCTED: OrderStatus[] = ['potvrdjena', 'poslata', 'isporucena']

export const addressFields: Field[] = [
  { name: 'name', label: 'Ime i prezime', type: 'text' },
  { name: 'address1', label: 'Adresa i broj', type: 'text' },
  { name: 'address2', label: 'Stan, sprat (opciono)', type: 'text' },
  {
    type: 'row',
    fields: [
      { name: 'postalCode', label: 'Poštanski broj', type: 'text', admin: { width: '33%' } },
      { name: 'city', label: 'Grad', type: 'text', admin: { width: '33%' } },
      {
        name: 'country',
        label: 'Država',
        type: 'text',
        defaultValue: 'Srbija',
        admin: { width: '33%' },
      },
    ],
  },
  { name: 'phone', label: 'Telefon', type: 'text' },
]

async function nextOrderNumber(req: PayloadRequest) {
  const db = req.payload.db as unknown as {
    drizzle: { execute: (q: unknown) => Promise<{ rows: { n: string | number }[] }> }
  }
  await db.drizzle.execute(sql`CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1001`)
  const result = await db.drizzle.execute(sql`SELECT nextval('order_number_seq') AS n`)
  const n = Number(result.rows[0]?.n)
  // Ako je sekvenca vraćena na početak (npr. seed:reset) ili napravljena iznova, nastavi od najvećeg broja.
  const taken = await db.drizzle.execute(
    sql`SELECT 1 AS n FROM orders WHERE order_number = ${n} LIMIT 1`,
  )
  if (!taken.rows.length) return n
  await db.drizzle.execute(
    // order_number je numeric, a setval traži bigint (bez kasta upit puca i checkout ne radi).
    sql`SELECT setval('order_number_seq', (SELECT MAX(order_number)::bigint FROM orders))`,
  )
  const next = await db.drizzle.execute(sql`SELECT nextval('order_number_seq') AS n`)
  return Number(next.rows[0]?.n)
}

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: { singular: 'Porudžbina', plural: 'Porudžbine' },
  endpoints: [csvExportEndpoint('porudzbine', exportOrdersCsv), ...orderEndpoints],
  admin: {
    components: {
      beforeListTable: [
        {
          path: '@/components/admin/ExportCsvButton#ExportCsvButton',
          clientProps: {
            collection: 'orders',
            // Porudžbine koje čekaju slanje, za uvoz pošiljki u AKS (D-079)
            extra: [{ label: 'Izvoz za kurira (CSV)', url: '/api/orders/courier-csv' }],
          },
        },
      ],
    },
    group: 'Prodaja',
    useAsTitle: 'name',
    defaultColumns: ['name', 'createdAt', 'email', 'total', 'status', 'paymentStatus'],
    listSearchableFields: ['name', 'email', 'phone', 'shippingAddress.name'],
    pagination: { defaultLimit: 25 },
  },
  access: {
    read: staffOnly,
    // Kupci prave porudžbine samo kroz checkout (server, overrideAccess). Ručno: admin.
    create: adminOnly,
    update: staffOnly,
    delete: adminOnly,
  },
  defaultSort: '-createdAt',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Porudžbina',
          fields: [
            {
              name: 'lineItems',
              label: 'Stavke',
              type: 'array',
              required: true,
              minRows: 1,
              labels: { singular: 'Stavka', plural: 'Stavke' },
              admin: {
                initCollapsed: false,
                components: { RowLabel: '@/components/admin/RowLabels#LineItemRowLabel' },
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'product',
                      label: 'Proizvod',
                      type: 'relationship',
                      relationTo: 'products',
                      admin: { width: '50%' },
                    },
                    {
                      name: 'variant',
                      label: 'Varijanta',
                      type: 'relationship',
                      relationTo: 'variants',
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'title',
                      label: 'Naziv',
                      type: 'text',
                      required: true,
                      admin: { width: '40%' },
                    },
                    {
                      name: 'variantTitle',
                      label: 'Varijanta',
                      type: 'text',
                      admin: { width: '30%' },
                    },
                    { name: 'sku', label: 'SKU', type: 'text', admin: { width: '30%' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'unitPrice',
                      label: 'Cena (RSD)',
                      type: 'number',
                      required: true,
                      admin: { width: '25%' },
                    },
                    {
                      name: 'compareAtPrice',
                      label: 'Stara cena',
                      type: 'number',
                      admin: { width: '25%' },
                    },
                    {
                      name: 'quantity',
                      label: 'Količina',
                      type: 'number',
                      required: true,
                      min: 1,
                      admin: { width: '25%' },
                    },
                    {
                      name: 'lineTotal',
                      label: 'Ukupno',
                      type: 'number',
                      admin: { width: '25%', readOnly: true },
                    },
                  ],
                },
                { name: 'image', label: 'Slika', type: 'upload', relationTo: 'media' },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'subtotal',
                  label: 'Međuzbir',
                  type: 'number',
                  admin: { width: '25%', readOnly: true },
                },
                {
                  name: 'discountTotal',
                  label: 'Popust',
                  type: 'number',
                  defaultValue: 0,
                  admin: { width: '25%' },
                },
                {
                  name: 'shippingTotal',
                  label: 'Dostava',
                  type: 'number',
                  defaultValue: 0,
                  admin: { width: '25%' },
                },
                {
                  name: 'total',
                  label: 'Ukupno (RSD)',
                  type: 'number',
                  admin: { width: '25%', readOnly: true },
                },
              ],
            },
            { name: 'discountCode', label: 'Kod za popust', type: 'text' },
            {
              name: 'customerNote',
              label: 'Napomena kupca',
              type: 'textarea',
              admin: { readOnly: true },
            },
            {
              name: 'internalNote',
              label: 'Interna napomena',
              type: 'textarea',
              admin: { description: 'Vidi samo osoblje.' },
            },
          ],
        },
        {
          label: 'Kupac i dostava',
          fields: [
            {
              name: 'courierPanel',
              type: 'ui',
              admin: { components: { Field: '@/components/admin/CourierPanel#CourierPanel' } },
            },
            { name: 'customer', label: 'Kupac', type: 'relationship', relationTo: 'customers' },
            {
              type: 'row',
              fields: [
                {
                  name: 'email',
                  label: 'Email',
                  type: 'email',
                  required: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'phone',
                  label: 'Telefon',
                  type: 'text',
                  required: true,
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'shippingAddress',
              label: 'Adresa za dostavu',
              type: 'group',
              fields: addressFields,
            },
            {
              name: 'billingSameAsShipping',
              label: 'Adresa za račun ista kao za dostavu',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'billingAddress',
              label: 'Adresa za račun',
              type: 'group',
              fields: addressFields,
              admin: { condition: (data) => data?.billingSameAsShipping === false },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'trackingNumber',
                  label: 'Broj pošiljke',
                  type: 'text',
                  admin: { width: '50%' },
                },
                {
                  name: 'trackingUrl',
                  label: 'Link za praćenje',
                  type: 'text',
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
        {
          label: 'Istorija',
          fields: [
            {
              name: 'statusHistory',
              label: 'Istorija statusa',
              type: 'array',
              admin: {
                readOnly: true,
                initCollapsed: true,
                components: { RowLabel: '@/components/admin/RowLabels#StatusHistoryRowLabel' },
              },
              labels: { singular: 'Promena', plural: 'Promene' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'from',
                      label: 'Iz',
                      type: 'select',
                      options: [...ORDER_STATUSES],
                      admin: { width: '20%' },
                    },
                    {
                      name: 'to',
                      label: 'U',
                      type: 'select',
                      options: [...ORDER_STATUSES],
                      admin: { width: '20%' },
                    },
                    {
                      name: 'at',
                      label: 'Vreme',
                      type: 'date',
                      admin: { width: '30%', date: { pickerAppearance: 'dayAndTime' } },
                    },
                    { name: 'by', label: 'Ko', type: 'text', admin: { width: '30%' } },
                  ],
                },
                { name: 'note', label: 'Napomena', type: 'text' },
              ],
            },
          ],
        },
      ],
    },
    // --- Bočna kolona ---
    {
      name: 'name',
      label: 'Porudžbina',
      type: 'text',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'orderNumber',
      label: 'Broj',
      type: 'number',
      unique: true,
      index: true,
      admin: { hidden: true },
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'nova',
      index: true,
      options: [...ORDER_STATUSES],
      admin: {
        position: 'sidebar',
        description: 'Potvrda skida zalihu, otkazivanje potvrđene porudžbine je vraća.',
        components: { Cell: '@/components/admin/StatusCell#StatusCell' },
      },
    },
    {
      name: 'statusNote',
      label: 'Napomena uz promenu statusa',
      type: 'text',
      virtual: true,
      admin: { position: 'sidebar', description: 'Upisuje se u istoriju statusa.' },
    },
    {
      name: 'paymentMethod',
      label: 'Način plaćanja',
      type: 'select',
      defaultValue: 'cod',
      options: [{ label: 'Pouzećem', value: 'cod' }],
      admin: { position: 'sidebar' },
    },
    {
      name: 'paymentStatus',
      label: 'Status plaćanja',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Čeka naplatu', value: 'pending' },
        { label: 'Plaćeno', value: 'paid' },
        { label: 'Vraćeno', value: 'refunded' },
      ],
      admin: {
        position: 'sidebar',
        components: { Cell: '@/components/admin/StatusCell#StatusCell' },
      },
    },
    {
      name: 'stockDeducted',
      label: 'Zaliha skinuta',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', readOnly: true },
    },
    { name: 'accessToken', type: 'text', index: true, admin: { hidden: true } },
  ],
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, operation, req }) => {
        // Obračun stavki i ukupnog iznosa (izvor istine je server, ne klijent).
        const items = (data.lineItems ?? originalDoc?.lineItems ?? []) as {
          unitPrice: number
          quantity: number
          lineTotal?: number
        }[]
        for (const item of items) item.lineTotal = Math.round(item.unitPrice * item.quantity)
        data.subtotal = items.reduce((sum, item) => sum + (item.lineTotal ?? 0), 0)
        const discount = data.discountTotal ?? originalDoc?.discountTotal ?? 0
        const shipping = data.shippingTotal ?? originalDoc?.shippingTotal ?? 0
        data.total = Math.max(0, data.subtotal - discount + shipping)

        const by = (req.user as { email?: string } | null)?.email ?? 'sistem'
        const now = new Date().toISOString()
        const history = [...((originalDoc?.statusHistory ?? data.statusHistory ?? []) as object[])]

        if (operation === 'create') {
          const number = await nextOrderNumber(req)
          data.orderNumber = number
          data.name = `#${number}`
          data.accessToken = crypto.randomBytes(24).toString('base64url')
          data.status = data.status ?? 'nova'
          history.push({
            from: null,
            to: data.status,
            at: now,
            by,
            note: data.statusNote || 'Porudžbina kreirana',
          })
          data.stockDeducted = false
          if (STOCK_DEDUCTED.includes(data.status)) {
            await adjustStock(req, items, -1)
            data.stockDeducted = true
          }
          data.statusHistory = history
          return data
        }

        const from = originalDoc?.status as OrderStatus
        const to = (data.status ?? from) as OrderStatus
        if (from !== to) {
          const deducted = Boolean(originalDoc?.stockDeducted)
          if (STOCK_DEDUCTED.includes(to) && !deducted) {
            await adjustStock(req, originalDoc?.lineItems ?? items, -1)
            data.stockDeducted = true
          } else if (to === 'otkazana' && deducted) {
            await adjustStock(req, originalDoc?.lineItems ?? items, 1)
            data.stockDeducted = false
          }
          history.push({ from, to, at: now, by, note: data.statusNote || null })
        }
        data.statusHistory = history
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req, context }) => {
        if (operation !== 'update' || context.skipEmails) return doc
        if (doc.status === 'poslata' && previousDoc?.status !== 'poslata') {
          const mail = orderShippedEmail(doc)
          const result = await sendEmail({ to: doc.email, ...mail })
          if (!result.ok)
            req.payload.logger.error(`Email o slanju za ${doc.name} nije poslat: ${result.error}`)
        }
        return doc
      },
    ],
  },
}
