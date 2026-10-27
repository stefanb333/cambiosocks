'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'

/**
 * Korpa na klijentu čuva samo { variantId, quantity } u localStorage.
 * Cene, nazivi i zaliha se uvek proveravaju na serveru (/api/cart/validate i checkout),
 * vrednostima sa klijenta se ne veruje.
 */
export type CartLine = { variantId: number; quantity: number }

type CartContextValue = {
  lines: CartLine[]
  count: number
  ready: boolean
  isOpen: boolean
  open: () => void
  close: () => void
  add: (variantId: number, quantity?: number) => void
  setQuantity: (variantId: number, quantity: number) => void
  remove: (variantId: number) => void
  replace: (lines: CartLine[]) => void
  clear: () => void
  discountCode: string
  setDiscountCode: (code: string) => void
}

const STORAGE_KEY = 'cambio-cart-v1'
const DISCOUNT_KEY = 'cambio-discount-v1'
const MAX_QTY = 99
const EMPTY: CartLine[] = []

const sanitize = (value: unknown): CartLine[] =>
  Array.isArray(value)
    ? value
        .filter(
          (l) =>
            l && Number.isInteger(l.variantId) && Number.isInteger(l.quantity) && l.quantity > 0,
        )
        .map((l) => ({ variantId: l.variantId, quantity: Math.min(MAX_QTY, l.quantity) }))
    : []

// --- Spoljni store (localStorage) za useSyncExternalStore ---
type State = { lines: CartLine[]; discountCode: string }
let state: State | null = null
const listeners = new Set<() => void>()

function read(): State {
  if (state) return state
  let lines: CartLine[] = []
  let discountCode = ''
  try {
    lines = sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))
    discountCode = localStorage.getItem(DISCOUNT_KEY) || ''
  } catch {
    /* privatni režim: korpa radi do zatvaranja taba */
  }
  state = { lines, discountCode }
  return state
}

function write(next: State) {
  state = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next.lines))
    if (next.discountCode) localStorage.setItem(DISCOUNT_KEY, next.discountCode)
    else localStorage.removeItem(DISCOUNT_KEY)
  } catch {
    /* zanemari */
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  // Sinhronizacija između tabova
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY && e.key !== DISCOUNT_KEY) return
    state = null
    listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

const serverState: State = { lines: EMPTY, discountCode: '' }
const noopSubscribe = () => () => {}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, read, () => serverState)
  const ready = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
  const [isOpen, setOpen] = useState(false)

  const update = useCallback((fn: (lines: CartLine[]) => CartLine[]) => {
    const current = read()
    write({ ...current, lines: fn(current.lines) })
  }, [])

  const add = useCallback(
    (variantId: number, quantity = 1) =>
      update((prev) => {
        const existing = prev.find((l) => l.variantId === variantId)
        if (existing) {
          return prev.map((l) =>
            l.variantId === variantId
              ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + quantity) }
              : l,
          )
        }
        return [...prev, { variantId, quantity: Math.min(MAX_QTY, quantity) }]
      }),
    [update],
  )

  const setQuantity = useCallback(
    (variantId: number, quantity: number) =>
      update((prev) =>
        quantity <= 0
          ? prev.filter((l) => l.variantId !== variantId)
          : prev.map((l) =>
              l.variantId === variantId ? { ...l, quantity: Math.min(MAX_QTY, quantity) } : l,
            ),
      ),
    [update],
  )

  const remove = useCallback(
    (variantId: number) => update((prev) => prev.filter((l) => l.variantId !== variantId)),
    [update],
  )
  const replace = useCallback((next: CartLine[]) => update(() => sanitize(next)), [update])
  const clear = useCallback(() => update(() => []), [update])
  const setDiscountCode = useCallback((code: string) => {
    write({ ...read(), discountCode: code.trim().toUpperCase() })
  }, [])

  const value = useMemo<CartContextValue>(
    () => ({
      lines: snapshot.lines,
      count: snapshot.lines.reduce((sum, l) => sum + l.quantity, 0),
      ready,
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add,
      setQuantity,
      remove,
      replace,
      clear,
      discountCode: snapshot.discountCode,
      setDiscountCode,
    }),
    [snapshot, ready, isOpen, add, setQuantity, remove, replace, clear, setDiscountCode],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart mora da bude unutar CartProvider-a')
  return ctx
}
