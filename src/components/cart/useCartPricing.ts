'use client'

import { useEffect, useRef, useState } from 'react'
import type { PricedCart } from '@/lib/pricing/cart'
import { useCart } from './CartProvider'

/**
 * Serverski obračun korpe (/api/cart/validate) kad god se promeni sadržaj ili kupon.
 * Ako server smanji količinu ili ukloni artikal (zaliha, arhiviran proizvod), lokalna korpa se usklađuje.
 */
export function useCartPricing(enabled = true) {
  const cart = useCart()
  const [data, setData] = useState<PricedCart | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notices, setNotices] = useState<string[]>([])
  const seq = useRef(0)
  const key = JSON.stringify([cart.lines, cart.discountCode])

  useEffect(() => {
    if (!enabled || !cart.ready || !cart.lines.length) return
    const id = ++seq.current
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/cart/validate', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ lines: cart.lines, discountCode: cart.discountCode || null }),
        })
        if (!res.ok) throw new Error()
        const priced = (await res.json()) as PricedCart
        if (id !== seq.current) return
        setData(priced)
        setError(null)
        const messages = [
          ...priced.removed.map((r) => r.reason),
          ...priced.lines.filter((l) => l.notice).map((l) => `${l.title}: ${l.notice}`),
        ]
        setNotices(messages)
        const corrected = priced.lines.map((l) => ({
          variantId: l.variantId,
          quantity: l.quantity,
        }))
        const changed =
          corrected.length !== cart.lines.length ||
          corrected.some(
            (c) => cart.lines.find((l) => l.variantId === c.variantId)?.quantity !== c.quantity,
          )
        if (changed) cart.replace(corrected)
      } catch {
        if (id === seq.current) setError('Korpa trenutno ne može da se osveži. Pokušajte ponovo.')
      } finally {
        if (id === seq.current) setLoading(false)
      }
    }, 150)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled, cart.ready])

  // Prazna korpa: nema serverskog obračuna (izvedeno, bez dodatnog stanja).
  if (!cart.lines.length)
    return { data: null, loading: false, error: null, notices: [] as string[] }
  return { data, loading, error, notices }
}
