import 'server-only'

/**
 * Plaćanje je apstrahovano iza PaymentProvider interfejsa. Prva implementacija je pouzeće.
 * Kartični gateway (banka, Stripe...) dodaje se kao nova klasa u `providers` i, po potrebi,
 * webhook ruta koja poziva `handleWebhook`; checkout tok se ne menja.
 */

export type PaymentContext = { total: number; currency: 'RSD'; country: string }

export type PaymentResult =
  /** Plaćanje se završava kasnije (pouzeće): porudžbina je kreirana, kupac ide na potvrdu. */
  | { status: 'pending'; redirectUrl?: null }
  /** Kupac se preusmerava na stranicu za plaćanje (kartice). */
  | { status: 'redirect'; redirectUrl: string }
  | { status: 'failed'; message: string }

export type OrderForPayment = {
  id: number
  orderNumber: number
  total: number
  email: string
  accessToken: string
}

export interface PaymentProvider {
  id: string
  label: string
  description: string
  isAvailable(ctx: PaymentContext): boolean
  createPayment(order: OrderForPayment): Promise<PaymentResult>
  handleWebhook?(request: Request): Promise<{ orderId: number; paid: boolean } | null>
}

const cashOnDelivery: PaymentProvider = {
  id: 'cod',
  label: 'Plaćanje pouzećem',
  description: 'Plaćate gotovinom kuriru prilikom preuzimanja pošiljke.',
  isAvailable: (ctx) => ctx.country === 'Srbija',
  async createPayment() {
    return { status: 'pending' }
  },
}

export const providers: PaymentProvider[] = [cashOnDelivery]

export function availableProviders(ctx: PaymentContext) {
  return providers.filter((p) => p.isAvailable(ctx))
}

export function getProvider(id: string) {
  return providers.find((p) => p.id === id) ?? null
}
