import { isStaff } from '@/access'
import { COMPANY } from '@/lib/company'
import { toCsv } from '@/lib/csv'
import { esc } from '@/lib/email/send'
import {
  SHIPMENT_CSV_HEADERS,
  shipmentCsvRow,
  shipmentFromOrder,
  shipmentText,
  type Shipment,
} from '@/lib/orders/shipment'
import type { Order } from '@/payload-types'
import type { Endpoint, PayloadRequest } from 'payload'

/** Statusi koji čekaju slanje (izvoz za kurira). */
const TO_SHIP = ['nova', 'potvrdjena']

const forbidden = () => Response.json({ message: 'Nemate dozvolu za ovu akciju.' }, { status: 403 })

async function orderById(req: PayloadRequest): Promise<Order | null> {
  const id = Number(req.routeParams?.id)
  if (!id) return null
  return req.payload
    .findByID({ collection: 'orders', id, depth: 0, overrideAccess: true })
    .catch(() => null)
}

/** Adresnica za štampu (nalepnica 100x150 mm): pošiljalac, primalac, otkupnina, referenca. */
function labelHtml(s: Shipment): string {
  const row = (label: string, value: string) =>
    value ? `<p><span>${esc(label)}</span><strong>${esc(value)}</strong></p>` : ''
  return `<!doctype html>
<html lang="sr"><head><meta charset="utf-8"><title>Adresnica ${esc(s.reference)}</title>
<style>
  @page { size: 100mm 150mm; margin: 6mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #000; margin: 0; }
  .label { width: 88mm; min-height: 138mm; border: 1.5px solid #000; padding: 5mm; display: flex; flex-direction: column; gap: 4mm; }
  h2 { font-size: 9pt; text-transform: uppercase; letter-spacing: .05em; margin: 0 0 1.5mm; color: #444; }
  .to { font-size: 14pt; line-height: 1.3; }
  .to .name { font-size: 17pt; font-weight: 700; }
  .from { font-size: 9pt; line-height: 1.35; border-bottom: 1px dashed #000; padding-bottom: 3mm; }
  .cod { border: 2px solid #000; padding: 3mm; text-align: center; font-size: 15pt; font-weight: 700; }
  .cod small { display: block; font-size: 8pt; font-weight: 400; text-transform: uppercase; letter-spacing: .05em; }
  .meta p { display: flex; justify-content: space-between; gap: 3mm; margin: 0 0 1mm; font-size: 9pt; }
  .meta span { color: #444; }
  .ref { margin-top: auto; text-align: center; font-size: 20pt; font-weight: 700; letter-spacing: .04em; }
  .no-print { margin: 6mm 0; font: 14px Arial; }
  @media print { .no-print { display: none; } }
</style></head>
<body>
<div class="no-print"><button onclick="print()">Odštampaj</button> Format nalepnice 100x150 mm.</div>
<div class="label">
  <div class="from"><h2>Pošiljalac</h2>${esc(COMPANY.name)}<br>${esc(COMPANY.street)}, ${esc(COMPANY.city)}<br>${esc(COMPANY.phone)}</div>
  <div class="to"><h2>Primalac</h2><div class="name">${esc(s.recipient)}</div>${esc(s.street)}<br>${esc(s.postalCode)} ${esc(s.city)}<br>Tel: ${esc(s.phone)}</div>
  <div class="cod"><small>Otkupnina</small>${s.cod ? `${s.cod} RSD` : 'NEMA (plaćeno)'}</div>
  <div class="meta">
    ${row('Sadržaj', s.contents)}
    ${row('Masa (procena)', `${s.weightKg} kg`)}
    ${row('Napomena', s.note)}
  </div>
  <div class="ref">${esc(s.reference)}</div>
</div>
<script>window.addEventListener('load', () => setTimeout(() => print(), 300))</script>
</body></html>`
}

/**
 * Kurirska služba (D-079): podaci za pošiljku iz porudžbine, bez prepisivanja.
 * - GET /api/orders/courier-csv: porudžbine koje čekaju slanje (Nova, Potvrđena), za uvoz u AKS
 * - GET /api/orders/:id/courier: tekst i podaci za blok na porudžbini u adminu
 * - GET /api/orders/:id/label: adresnica za štampu
 */
export const orderEndpoints: Endpoint[] = [
  {
    path: '/courier-csv',
    method: 'get',
    handler: async (req) => {
      if (!isStaff({ req })) return forbidden()
      const { docs } = await req.payload.find({
        collection: 'orders',
        where: { status: { in: TO_SHIP } },
        sort: 'createdAt',
        pagination: false,
        depth: 0,
        overrideAccess: true,
      })
      const csv = toCsv(
        SHIPMENT_CSV_HEADERS,
        docs.map((o) => shipmentCsvRow(shipmentFromOrder(o))),
      )
      return new Response(csv, {
        headers: {
          'content-type': 'text/csv; charset=utf-8',
          'content-disposition': `attachment; filename="cambio-kurir-${new Date().toISOString().slice(0, 10)}.csv"`,
          'cache-control': 'no-store',
        },
      })
    },
  },
  {
    path: '/:id/courier',
    method: 'get',
    handler: async (req) => {
      if (!isStaff({ req })) return forbidden()
      const order = await orderById(req)
      if (!order) return Response.json({ message: 'Porudžbina nije pronađena.' }, { status: 404 })
      const shipment = shipmentFromOrder(order)
      return Response.json(
        { shipment, text: shipmentText(shipment) },
        { headers: { 'cache-control': 'no-store' } },
      )
    },
  },
  {
    path: '/:id/label',
    method: 'get',
    handler: async (req) => {
      if (!isStaff({ req })) return forbidden()
      const order = await orderById(req)
      if (!order) return new Response('Porudžbina nije pronađena.', { status: 404 })
      return new Response(labelHtml(shipmentFromOrder(order)), {
        headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
      })
    },
  },
]
