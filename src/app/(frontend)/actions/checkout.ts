'use server'

import { z } from 'zod'
import { clientIp } from '@/lib/client-ip'
import { notifyRecipients, sendEmail } from '@/lib/email/send'
import { orderConfirmationEmail, orderNotificationEmail } from '@/lib/email/templates'
import { getPayload } from '@/lib/payload'
import { getProvider } from '@/lib/payments'
import { priceCart } from '@/lib/pricing/cart'
import { rateLimit } from '@/lib/rate-limit'
import type { Customer, Order } from '@/payload-types'

export type CheckoutField =
  | 'email'
  | 'phone'
  | 'name'
  | 'address1'
  | 'address2'
  | 'postalCode'
  | 'city'
  | 'note'
  | 'terms'
  | 'paymentMethod'

export type CheckoutState = {
  status: 'idle' | 'error' | 'success'
  message: string
  errors?: Partial<Record<CheckoutField, string>>
  token?: string
  /** Spoljna stranica za plaćanje (kartice); za pouzeće nije postavljeno. */
  redirectUrl?: string
  /** Korpa je promenjena na serveru (cena, zaliha): kupac treba da pregleda pre ponovnog slanja. */
  cartChanged?: boolean
}

const phoneRe = /^(\+3816\d{7,8}|06\d{7,8}|\+381[1-5]\d{6,8}|0[1-5]\d{6,8})$/

const schema = z.object({
  email: z.string().trim().toLowerCase().email('Unesite ispravnu e-mail adresu.'),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s\-/()]/g, ''))
    .refine((v) => phoneRe.test(v), 'Unesite ispravan broj telefona, npr. 064 123 4567.'),
  name: z
    .string()
    .trim()
    .min(3, 'Unesite ime i prezime.')
    .max(120)
    .refine((v) => v.includes(' '), 'Unesite i ime i prezime.'),
  address1: z.string().trim().min(3, 'Unesite ulicu i broj.').max(160),
  address2: z.string().trim().max(120).optional().default(''),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, 'Poštanski broj ima 5 cifara.'),
  city: z.string().trim().min(2, 'Unesite grad.').max(80),
  note: z
    .string()
    .trim()
    .max(500, 'Napomena može imati najviše 500 znakova.')
    .optional()
    .default(''),
  terms: z.literal('on', { message: 'Potrebno je da prihvatite uslove kupovine.' }),
  paymentMethod: z.string().default('cod'),
  discountCode: z.string().trim().max(40).optional().default(''),
  lines: z
    .string()
    .transform((v, ctx) => {
      try {
        return JSON.parse(v) as unknown
      } catch {
        ctx.addIssue({ code: 'custom', message: 'Korpa nije ispravna.' })
        return z.NEVER
      }
    })
    .pipe(
      z
        .array(
          z.object({
            variantId: z.number().int().positive(),
            quantity: z.number().int().positive().max(99),
          }),
        )
        .min(1, 'Korpa je prazna.')
        .max(100),
    ),
  company: z.string().max(0).optional(),
})

export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    const errors: CheckoutState['errors'] = {}
    let message = 'Proverite označena polja.'
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as CheckoutField | 'lines'
      if (key === 'lines') message = issue.message
      else if (key && !errors[key]) errors[key] = issue.message
    }
    return { status: 'error', message, errors }
  }
  const data = parsed.data

  if (!rateLimit(`checkout:${await clientIp()}`, 10, 60 * 60 * 1000)) {
    return { status: 'error', message: 'Previše pokušaja. Pokušajte ponovo za nekoliko minuta.' }
  }

  const provider = getProvider(data.paymentMethod)
  if (!provider)
    return {
      status: 'error',
      message: 'Izaberite način plaćanja.',
      errors: { paymentMethod: 'Izaberite način plaćanja.' },
    }

  const payload = await getPayload()

  // Cene, zaliha i popust se uvek računaju ponovo na serveru.
  const cart = await priceCart(payload, data.lines, {
    discountCode: data.discountCode || null,
    email: data.email,
  })
  const adjusted =
    cart.removed.length > 0 || cart.lines.some((l) => l.quantity !== l.requestedQuantity)
  if (!cart.lines.length)
    return {
      status: 'error',
      message: 'Korpa je prazna ili artikli više nisu dostupni.',
      cartChanged: true,
    }
  if (adjusted) {
    return {
      status: 'error',
      message:
        'Neki artikli u korpi su u međuvremenu promenjeni (zaliha ili dostupnost). Proverite korpu i pošaljite ponovo.',
      cartChanged: true,
    }
  }
  if (data.discountCode && cart.discountError) {
    return { status: 'error', message: cart.discountError, cartChanged: true }
  }

  const [firstName, ...rest] = data.name.split(/\s+/)
  const address = {
    name: data.name,
    address1: data.address1,
    address2: data.address2 || null,
    postalCode: data.postalCode,
    city: data.city,
    country: 'Srbija',
    phone: data.phone,
  }

  // Kupac: pronađi po emailu ili napravi novog. Gost bez prijave može da upiše bilo čiji email,
  // pa postojećem kupcu dopunjujemo samo prazna polja i nove adrese, a ime i telefon ne prepisujemo.
  const existing = await payload.find({
    collection: 'customers',
    where: { email: { equals: data.email } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  let customer = existing.docs[0] as Customer | undefined
  if (customer) {
    const known = (customer.addresses ?? []).some(
      (a) => a.address1 === address.address1 && a.postalCode === address.postalCode,
    )
    customer = (await payload.update({
      collection: 'customers',
      id: customer.id,
      overrideAccess: true,
      data: {
        firstName: customer.firstName || firstName,
        lastName: customer.lastName || rest.join(' '),
        phone: customer.phone || data.phone,
        addresses: known ? customer.addresses : [...(customer.addresses ?? []), address],
      },
    })) as Customer
  } else {
    customer = (await payload.create({
      collection: 'customers',
      overrideAccess: true,
      data: {
        email: data.email,
        firstName,
        lastName: rest.join(' '),
        phone: data.phone,
        addresses: [address],
      },
    })) as Customer
  }

  let order: Order
  try {
    order = (await payload.create({
      collection: 'orders',
      overrideAccess: true,
      data: {
        status: 'nova',
        customer: customer.id,
        email: data.email,
        phone: data.phone,
        shippingAddress: address,
        billingSameAsShipping: true,
        customerNote: data.note || null,
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        discountCode: cart.discount?.code ?? null,
        discountTotal: cart.discount?.amount ?? 0,
        shippingTotal: cart.shipping,
        lineItems: cart.lines.map((l) => ({
          product: l.productId,
          variant: l.variantId,
          title: l.title,
          variantTitle: l.variantLabel || l.variantTitle,
          sku: l.sku,
          unitPrice: l.unitPrice,
          compareAtPrice: l.compareAtPrice,
          quantity: l.quantity,
          image: l.imageId,
        })),
      },
    })) as Order
  } catch (error) {
    payload.logger.error({ msg: 'Kreiranje porudžbine nije uspelo', error })
    return {
      status: 'error',
      message: 'Porudžbina trenutno ne može da se završi. Pokušajte ponovo ili nas pozovite.',
    }
  }

  // Statistika kupca i iskorišćenost koda (ne blokira porudžbinu ako ne uspe).
  await payload
    .update({
      collection: 'customers',
      id: customer.id,
      overrideAccess: true,
      data: {
        ordersCount: (customer.ordersCount ?? 0) + 1,
        totalSpent: (customer.totalSpent ?? 0) + (order.total ?? 0),
      },
    })
    .catch(() => null)
  if (cart.discount) {
    const d = await payload.find({
      collection: 'discounts',
      where: { code: { equals: cart.discount.code } },
      limit: 1,
      overrideAccess: true,
    })
    if (d.docs[0]) {
      await payload
        .update({
          collection: 'discounts',
          id: d.docs[0].id,
          overrideAccess: true,
          data: { usageCount: (d.docs[0].usageCount ?? 0) + 1 },
        })
        .catch(() => null)
    }
  }

  const payment = await provider.createPayment({
    id: order.id,
    orderNumber: order.orderNumber ?? 0,
    total: order.total ?? 0,
    email: order.email,
    accessToken: order.accessToken ?? '',
  })
  if (payment.status === 'failed') return { status: 'error', message: payment.message }

  // Emailovi: kupcu potvrda, prodavnici obaveštenje. Neuspeh slanja ne poništava porudžbinu.
  const settings = await payload.findGlobal({
    slug: 'shop-settings',
    depth: 0,
    overrideAccess: true,
  })
  const confirmation = orderConfirmationEmail(
    order,
    settings.deliveryEstimate || '1 do 3 radna dana',
  )
  const notification = orderNotificationEmail(order)
  const to = await notifyRecipients(settings.notifyEmails)
  if (!to.length)
    payload.logger.warn(
      `Obaveštenje o porudžbini ${order.name} nije poslato: nije podešena adresa za obaveštenja.`,
    )
  const results = await Promise.all([
    sendEmail({ to: order.email, ...confirmation }),
    to.length
      ? sendEmail({ to, replyTo: order.email, ...notification })
      : Promise.resolve({ ok: true }),
  ])
  results.forEach((r) => {
    if (!r.ok)
      payload.logger.error(
        `Email za porudžbinu ${order.name} nije poslat: ${'error' in r ? r.error : ''}`,
      )
  })

  // Kartični gateway (kasnije): kupac ide na stranicu za plaćanje, pa se vraća na potvrdu.
  if (payment.status === 'redirect') {
    return {
      status: 'success',
      message: '',
      token: order.accessToken ?? '',
      redirectUrl: payment.redirectUrl,
    }
  }
  return { status: 'success', message: '', token: order.accessToken ?? '' }
}
