'use client'

import { Fragment, useEffect, useRef, type CSSProperties } from 'react'

type Props = {
  items: readonly string[]
  tone?: 'yellow' | 'blue'
  /** Nagib trake u stepenima (ukrštene trake: jedna -, druga +). */
  tilt?: number
  /** Početni smer kretanja (druga traka ide na suprotnu stranu). */
  reverse?: boolean
  className?: string
}

const BASE_SPEED = 60 // px u sekundi

/**
 * Traka sa tekstom koji teče (D-064), kao na sajtovima RingPop i two26: brzina raste sa brzinom
 * skrola, traka se blago nakosi, a smer prati smer skrola (nagore se vraća). Animacija radi samo
 * dok je traka na ekranu; bez motion klase ("smanji pokrete" ili bez JS-a) stoji mirno.
 * Dekorativna je (aria-hidden): iste informacije postoje u tekstu stranice.
 */
export function Marquee({
  items,
  tone = 'yellow',
  tilt = -2,
  reverse = false,
  className = '',
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track || !document.documentElement.classList.contains('motion')) return
    let raf = 0
    let visible = false
    let x = 0
    let dir = reverse ? 1 : -1
    let lastY = window.scrollY
    let lastT = performance.now()
    let velocity = 0

    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - lastT) / 1000)
      lastT = t
      const dy = window.scrollY - lastY
      lastY = window.scrollY
      // Uglađena brzina skrola (px po sekundi), ograničena da traka ne "poludi"
      velocity += (Math.max(-3000, Math.min(3000, dy / Math.max(dt, 0.001))) - velocity) * 0.12
      if (Math.abs(dy) > 1) dir = (dy > 0 ? -1 : 1) * (reverse ? -1 : 1)
      x += dir * (BASE_SPEED + Math.abs(velocity) * 0.35) * dt
      const half = track.scrollWidth / 2
      if (half > 0) x = ((x % half) - half) % half
      const skew = Math.max(-8, Math.min(8, velocity * -0.004))
      track.style.transform = `translate3d(${x.toFixed(1)}px,0,0) skewX(${skew.toFixed(2)}deg)`
      if (visible) raf = requestAnimationFrame(frame)
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      cancelAnimationFrame(raf)
      if (visible) {
        lastT = performance.now()
        lastY = window.scrollY
        raf = requestAnimationFrame(frame)
      }
    })
    io.observe(track)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [reverse])

  // Dve iste polovine: kada prva izađe, druga je na njenom mestu (beskonačna petlja bez skoka).
  const half = [...items, ...items]
  return (
    <div
      aria-hidden
      className={`marquee marquee--${tone} ${className}`}
      style={{ '--tilt': `${tilt}deg` } as CSSProperties}
    >
      <div ref={trackRef} className="marquee__track">
        {[0, 1].map((copy) => (
          <div key={copy} className="marquee__group">
            {half.map((item, i) => (
              <Fragment key={i}>
                <span className="marquee__item">{item}</span>
                <span className="marquee__star">✦</span>
              </Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Dve ukrštene trake (žuta i plava, suprotni smerovi): živahan prelaz između sekcija. */
export function MarqueeCross({
  first,
  second,
}: {
  first: readonly string[]
  second: readonly string[]
}) {
  return (
    <div className="marquee-cross" aria-hidden>
      <Marquee items={first} tone="yellow" tilt={-3} />
      <Marquee items={second} tone="blue" tilt={2.5} reverse />
    </div>
  )
}
