'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import type Lenis from 'lenis'

declare global {
  interface Window {
    __lenis?: Lenis
  }
}

const REVEAL = '[data-reveal]:not(.in-view)'

/**
 * Pokreće motion sloj sajta (D-057):
 * - Lenis glatki skrol (samo točkić i trackpad; dodir ostaje nativan),
 * - otkrivanje elemenata `[data-reveal]` kada uđu u ekran (klasa .in-view),
 * - paralaksu `[data-parallax="0.12"]` u odnosu na roditelja.
 * Ako korisnik ima uključeno "smanji pokrete", ništa se ne pokreće i sadržaj je odmah vidljiv.
 */
export function MotionProvider() {
  const pathname = usePathname()

  useEffect(() => {
    const root = document.documentElement
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Ako je hidratacija trajala duže od rezervnih 4s iz <head> skripte, klasa se vraća ovde.
    root.classList.add('motion', 'motion-ready')

    // --- Otkrivanje pri ulasku u ekran
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          // U nizu sa prevlačenjem (.snap-row) kartice van ekrana se nikad ne "vide", pa bi se
          // animirale tek pri prevlačenju: otkrivaju se sve zajedno, kada niz uđe u ekran.
          const row = entry.target.closest('.snap-row')
          const targets = row ? row.querySelectorAll(REVEAL) : [entry.target]
          for (const el of targets) {
            el.classList.add('in-view')
            io.unobserve(el)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    )
    const observeAll = () => document.querySelectorAll(REVEAL).forEach((el) => io.observe(el))
    observeAll()

    // --- Paralaksa: računa se samo za elemente blizu ekrana
    const near = new Set<HTMLElement>()
    const pio = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement
          // will-change (poseban GPU sloj) samo dok je slika blizu ekrana
          el.classList.toggle('is-near', entry.isIntersecting)
          if (entry.isIntersecting) near.add(el)
          else near.delete(el)
        }
      },
      { rootMargin: '25% 0px 25% 0px' },
    )
    const tracked = new WeakSet<Element>()
    const trackParallax = () =>
      document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
        if (tracked.has(el)) return
        tracked.add(el)
        pio.observe(el)
      })
    trackParallax()

    const update = () => {
      const vh = window.innerHeight
      near.forEach((el) => {
        const box = (el.parentElement ?? el).getBoundingClientRect()
        // -1 kada je roditelj ispod ekrana, 0 u sredini, 1 kada je iznad
        const progress = Math.max(
          -1,
          Math.min(1, (vh / 2 - (box.top + box.height / 2)) / (vh / 2 + box.height / 2)),
        )
        const speed = Number(el.dataset.parallax) || 0.1
        el.style.setProperty('--parallax-y', `${(progress * speed * box.height).toFixed(1)}px`)
      })
    }
    // Paralaksa prati nativni skrol dok se Lenis ne učita (i na dodir, gde Lenis ne radi).
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        update()
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    update()

    // Lenis se učitava tek kada je stranica učitana i pregledač slobodan (ne opterećuje prvi prikaz).
    let lenis: Lenis | undefined
    let cancelled = false
    const startLenis = async () => {
      const { default: LenisClass } = await import('lenis')
      if (cancelled) return
      lenis = new LenisClass({
        autoRaf: true,
        lerp: 0.1,
        anchors: { offset: -72 },
        allowNestedScroll: true,
        stopInertiaOnNavigate: true,
        // Modalni paneli (korpa, meni, filteri) i označeni elementi skroluju nativno.
        prevent: (node) => Boolean(node.closest?.('dialog, [data-lenis-prevent]')),
      })
      window.__lenis = lenis
    }
    const idle = (cb: () => void) =>
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(cb, { timeout: 2500 })
        : setTimeout(cb, 1200)
    const scheduleLenis = () => idle(() => void startLenis())
    if (document.readyState === 'complete') scheduleLenis()
    else window.addEventListener('load', scheduleLenis, { once: true })

    // --- Magnetna dugmad ([data-magnetic]): blago prate kursor, samo uz miš (D-064)
    let magnet: HTMLElement | null = null
    const onPointerMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-magnetic]') ?? null
      if (el !== magnet) {
        if (magnet) magnet.style.translate = ''
        magnet = el
      }
      if (!el) return
      const r = el.getBoundingClientRect()
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height
      el.style.translate = `${(dx * 12).toFixed(1)}px ${(dy * 8).toFixed(1)}px`
    }
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (finePointer) document.addEventListener('pointermove', onPointerMove, { passive: true })

    // Nove sekcije posle klijentske navigacije, filtera ili učitavanja
    let queued = false
    const mo = new MutationObserver(() => {
      if (queued) return
      queued = true
      requestAnimationFrame(() => {
        queued = false
        observeAll()
        trackParallax()
        update()
      })
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      cancelled = true
      window.removeEventListener('load', scheduleLenis)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', update)
      document.removeEventListener('pointermove', onPointerMove)
      if (magnet) magnet.style.translate = ''
      mo.disconnect()
      io.disconnect()
      pio.disconnect()
      lenis?.destroy()
      window.__lenis = undefined
      root.classList.remove('motion-ready')
    }
  }, [])

  // Posle promene stranice Lenis preračunava visinu stranice.
  useEffect(() => {
    window.__lenis?.resize()
  }, [pathname])

  return null
}

/** Pokreće se u <head> pre prvog crtanja: bez JS-a ili uz "smanji pokrete" sadržaj je odmah vidljiv. */
export const motionBootScript = `(function(){try{var d=document.documentElement;if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.classList.add('motion');setTimeout(function(){if(!d.classList.contains('motion-ready'))d.classList.remove('motion')},4000)}catch(e){}})()`
