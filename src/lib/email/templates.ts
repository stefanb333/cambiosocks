import { companyLine } from '@/lib/company'
import { formatPrice } from '@/lib/money'
import type { Order } from '@/payload-types'
import { esc } from './send'

/**
 * Email šabloni u boji brenda (plava #0462CD, žuta #FFDE00, Inter/Plus Jakarta Sans sa sistemskim
 * zamenama jer email klijenti ne učitavaju web fontove). Tabele radi podrške u Outlook-u.
 */

const site = () => process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

function layout(title: string, body: string) {
  return `<!doctype html><html lang="sr-Latn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(title)}</title></head>
<body style="margin:0;background:#f5f5f5;font-family:'Plus Jakarta Sans',Arial,sans-serif;color:#0f0f0f">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden">
<tr><td style="background:#0462cd;padding:28px 32px;color:#ffffff;font-family:Inter,Arial,sans-serif;font-size:26px;font-weight:900;letter-spacing:-1px">CAMBIO</td></tr>
<tr><td style="padding:32px">${body}</td></tr>
<tr><td style="background:#0f0f0f;color:#adadad;padding:20px 32px;font-size:12px;line-height:18px">© ${new Date().getFullYear()} ${esc(companyLine)}<br><a href="${site()}" style="color:#ffde00">${site().replace(/^https?:\/\//, '')}</a></td></tr>
</table></td></tr></table></body></html>`
}

/** Uz potvrdu porudžbine: pravo na odustanak, obrazac i uslovi (ugovor na daljinu, D-061). */
function legalNote() {
  const a = 'color:#0462cd'
  return `<p style="font-size:13px;line-height:20px;color:#6b6b66;margin:28px 0 0">Imate pravo da odustanete od kupovine u roku od 14 dana od prijema proizvoda, bez navođenja razloga. Postupak i obrazac za odustanak: <a href="${site()}/reklamacije" style="${a}">Reklamacije i odustanak</a>. Porudžbina je zaključena prema <a href="${site()}/uslovi-koriscenja" style="${a}">Uslovima korišćenja i kupovine</a>; sačuvajte ovaj email kao potvrdu.</p>`
}

function itemsTable(order: Order) {
  const rows = (order.lineItems ?? [])
    .map(
      (i) => `<tr>
<td style="padding:10px 0;border-bottom:1px solid #f3f3f3;font-size:14px;line-height:20px"><strong style="color:#0462cd">${esc(i.title)}</strong><br><span style="color:#444">${esc(i.variantTitle ?? '')}</span> × ${i.quantity}</td>
<td align="right" style="padding:10px 0;border-bottom:1px solid #f3f3f3;font-size:14px;white-space:nowrap">${formatPrice(i.lineTotal ?? i.unitPrice * i.quantity)}</td></tr>`,
    )
    .join('')
  const line = (label: string, value: string, strong = false) =>
    `<tr><td style="padding:6px 0;font-size:${strong ? 16 : 13}px;color:${strong ? '#0f0f0f' : '#444'}${strong ? ';font-weight:700' : ''}">${label}</td><td align="right" style="padding:6px 0;font-size:${strong ? 16 : 13}px${strong ? ';font-weight:700' : ''}">${value}</td></tr>`
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}
${line('Ukupno proizvodi', formatPrice(order.subtotal ?? 0))}
${order.discountTotal ? line(`Popust${order.discountCode ? ` (${esc(order.discountCode)})` : ''}`, `-${formatPrice(order.discountTotal)}`) : ''}
${line('Troškovi dostave', shippingLabel(order))}
${line('Ukupno', formatPrice(order.total ?? 0), true)}</table>`
}

function addressBlock(order: Order) {
  const a = order.shippingAddress
  if (!a) return ''
  return `<p style="font-size:14px;line-height:21px;color:#444;margin:0">${[
    a.name,
    a.address1,
    a.address2,
    `${a.postalCode ?? ''} ${a.city ?? ''}`.trim(),
    a.country,
    order.phone,
  ]
    .filter(Boolean)
    .map((x) => esc(String(x)))
    .join('<br>')}</p>`
}

/** Dostava u emailu: "Besplatna" kada je porudžbina preko praga za besplatnu dostavu. */
const shippingLabel = (order: Order) =>
  order.shippingTotal ? formatPrice(order.shippingTotal) : 'Besplatna'

export function orderConfirmationEmail(order: Order, deliveryEstimate: string) {
  const link = `${site()}/porucivanje/potvrda/${order.accessToken}`
  const html = layout(
    `Porudžbina ${order.name}`,
    `<h1 style="font-family:Inter,Arial,sans-serif;font-size:28px;line-height:34px;letter-spacing:-1px;margin:0 0 8px">Hvala na porudžbini!</h1>
<p style="font-size:15px;line-height:23px;color:#444;margin:0 0 24px">Primili smo porudžbinu <strong>${esc(order.name ?? '')}</strong>. Javićemo vam se kada pošiljka krene. Očekivani rok isporuke: ${esc(deliveryEstimate)}.</p>
${itemsTable(order)}
<h2 style="font-family:Inter,Arial,sans-serif;font-size:18px;margin:28px 0 8px">Dostava</h2>${addressBlock(order)}
<h2 style="font-family:Inter,Arial,sans-serif;font-size:18px;margin:28px 0 8px">Plaćanje</h2>
<p style="font-size:14px;line-height:21px;color:#444;margin:0 0 28px">Pouzećem: plaćate <strong>${formatPrice(order.total ?? 0)}</strong> kuriru prilikom preuzimanja.</p>
<a href="${link}" style="display:inline-block;background:#0462cd;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:14px 24px;border-radius:99px">Pogledaj porudžbinu</a>
${legalNote()}`,
  )
  const text = `Hvala na porudžbini ${order.name}!\n\n${(order.lineItems ?? [])
    .map(
      (i) =>
        `${i.title} (${i.variantTitle ?? ''}) x${i.quantity}: ${formatPrice(i.lineTotal ?? 0)}`,
    )
    .join(
      '\n',
    )}\nDostava: ${shippingLabel(order)}\nUkupno: ${formatPrice(order.total ?? 0)} (pouzećem)\n\nPorudžbina: ${link}\n\nPravo na odustanak u roku od 14 dana od prijema i obrazac: ${site()}/reklamacije\nUslovi kupovine: ${site()}/uslovi-koriscenja`
  return { subject: `Porudžbina ${order.name} je primljena`, html, text }
}

export function orderNotificationEmail(order: Order) {
  const link = `${site()}/admin/collections/orders/${order.id}`
  const html = layout(
    `Nova porudžbina ${order.name}`,
    `<h1 style="font-family:Inter,Arial,sans-serif;font-size:26px;margin:0 0 8px">Nova porudžbina ${esc(order.name ?? '')}</h1>
<p style="font-size:14px;color:#444;margin:0 0 20px">${esc(order.email)} · ${esc(order.phone)}</p>
${itemsTable(order)}
<h2 style="font-family:Inter,Arial,sans-serif;font-size:18px;margin:24px 0 8px">Dostava</h2>${addressBlock(order)}
${order.customerNote ? `<h2 style="font-family:Inter,Arial,sans-serif;font-size:18px;margin:24px 0 8px">Napomena kupca</h2><p style="font-size:14px;color:#444">${esc(order.customerNote)}</p>` : ''}
<p style="margin-top:28px"><a href="${link}" style="display:inline-block;background:#0f0f0f;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:14px 24px;border-radius:99px">Otvori u adminu</a></p>`,
  )
  const text = `Nova porudžbina ${order.name}\n${order.email} / ${order.phone}\nUkupno: ${formatPrice(order.total ?? 0)}\n${link}`
  return { subject: `Nova porudžbina ${order.name} (${formatPrice(order.total ?? 0)})`, html, text }
}

export function orderShippedEmail(order: Order) {
  const tracking = order.trackingUrl
    ? `<a href="${esc(order.trackingUrl)}" style="color:#0462cd">${esc(order.trackingNumber || order.trackingUrl)}</a>`
    : esc(order.trackingNumber ?? '')
  const html = layout(
    `Porudžbina ${order.name} je poslata`,
    `<h1 style="font-family:Inter,Arial,sans-serif;font-size:28px;line-height:34px;letter-spacing:-1px;margin:0 0 8px">Vaša pošiljka je krenula!</h1>
<p style="font-size:15px;line-height:23px;color:#444;margin:0 0 20px">Porudžbina <strong>${esc(order.name ?? '')}</strong> je predata kurirskoj službi.${tracking ? ` Broj pošiljke: ${tracking}.` : ''}</p>
${itemsTable(order)}
<p style="font-size:14px;line-height:21px;color:#444;margin:24px 0 0">Iznos za plaćanje kuriru: <strong>${formatPrice(order.total ?? 0)}</strong>.</p>`,
  )
  const text = `Porudžbina ${order.name} je poslata.${order.trackingNumber ? ` Broj pošiljke: ${order.trackingNumber}.` : ''}${order.trackingUrl ? ` Praćenje: ${order.trackingUrl}` : ''}\nZa plaćanje kuriru: ${formatPrice(order.total ?? 0)}`
  return { subject: `Porudžbina ${order.name} je poslata`, html, text }
}

export function newsletterWelcomeEmail(code: string) {
  const html = layout(
    'Dobrodošli u Cambio svet',
    `<h1 style="font-family:Inter,Arial,sans-serif;font-size:30px;line-height:34px;letter-spacing:-1.5px;margin:0 0 8px;color:#0462cd">NE OKLEVAJ</h1>
<p style="font-size:15px;line-height:23px;color:#444;margin:0 0 20px">Hvala na prijavi! Vaš kod za <strong>10% popusta</strong> na prvu porudžbinu:</p>
<p style="margin:0 0 24px"><span style="display:inline-block;background:#ffde00;color:#0f0f0f;font-family:Inter,Arial,sans-serif;font-size:22px;font-weight:900;letter-spacing:1px;padding:12px 22px;border-radius:99px">${esc(code)}</span></p>
<a href="${site()}/kolekcije/sve" style="display:inline-block;background:#0462cd;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:14px 24px;border-radius:99px">Pogledaj kolekciju</a>`,
  )
  return {
    subject: 'Vaš kod za 10% popusta',
    html,
    text: `Hvala na prijavi! Vaš kod za 10% popusta: ${code}\n${site()}/kolekcije/sve`,
  }
}
