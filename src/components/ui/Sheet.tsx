'use client'

import { useCallback, useEffect, useRef, type ReactNode } from 'react'

type Side = 'full' | 'right' | 'bottom' | 'left' | 'center' | 'bottom-center'

type Props = {
  open: boolean
  onClose: () => void
  side?: Side
  /** Pristupačni naziv dijaloga (čita ga čitač ekrana). */
  label: string
  className?: string
  children: ReactNode
}

const SWIPE_CLOSE_PX = 80

/**
 * Modalni panel na native <dialog> elementu: zaključan skrol pozadine (CSS u globals),
 * fokus ostaje unutar panela, Esc i klik na pozadinu zatvaraju, a na dodir se zatvara
 * prevlačenjem (nadole za "bottom", udesno za "right", ulevo za "left" i "full").
 * Ulazak i izlazak panela animira CSS prema `data-side` (motion.css), bez JS-a.
 */
export function Sheet({ open, onClose, side = 'full', label, className = '', children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const start = useRef<{ x: number; y: number } | null>(null)
  const returnFocus = useRef<Element | null>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      returnFocus.current = document.activeElement
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
      ;(returnFocus.current as HTMLElement | null)?.focus?.()
    }
  }, [open])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse') return
      // Panel odozdo se prevlači samo za zaglavlje (data-swipe-handle), da skrol sadržaja ne zatvara panel.
      if (
        (side === 'bottom' || side === 'bottom-center') &&
        !(e.target as Element).closest('[data-swipe-handle]')
      )
        return
      start.current = { x: e.clientX, y: e.clientY }
    },
    [side],
  )

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const s = start.current
      start.current = null
      if (!s) return
      const dx = e.clientX - s.x
      const dy = e.clientY - s.y
      const horizontal = Math.abs(dx) > Math.abs(dy)
      if ((side === 'bottom' || side === 'bottom-center') && !horizontal && dy > SWIPE_CLOSE_PX)
        onClose()
      if (side === 'right' && horizontal && dx > SWIPE_CLOSE_PX) onClose()
      if ((side === 'left' || side === 'full') && horizontal && dx < -SWIPE_CLOSE_PX) onClose()
    },
    [onClose, side],
  )

  const position = {
    full: 'm-0 h-dvh max-h-none w-full max-w-none',
    right: 'm-0 ml-auto h-dvh max-h-none w-full max-w-[420px]',
    left: 'm-0 mr-auto h-dvh max-h-none w-full max-w-[420px]',
    bottom: 'm-0 mt-auto max-h-[90dvh] w-full max-w-none rounded-t-[24px]',
    center: 'm-auto max-h-[90dvh] w-[min(643px,calc(100%-32px))] rounded-[16px]',
    // Telefon: panel odozdo; od 768px: centriran modal (Figma panel filtera).
    'bottom-center':
      'm-0 mt-auto max-h-[90dvh] w-full max-w-none rounded-t-[24px] md:m-auto md:w-[min(643px,calc(100%-32px))] md:rounded-[16px]',
  }[side]

  return (
    <dialog
      ref={ref}
      aria-label={label}
      data-side={side}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      className={`overscroll-contain bg-white p-0 text-black ${position} ${className}`}
    >
      {children}
    </dialog>
  )
}
