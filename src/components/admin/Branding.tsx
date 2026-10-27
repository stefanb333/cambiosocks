import Link from 'next/link'
import type { CSSProperties } from 'react'

/**
 * Cambio znak u adminu umesto Payload logotipa (prijava i navigacija).
 * Logo je jednobojan, pa je SVG maska obojena bojom teksta teme: radi i u svetloj i u tamnoj temi.
 */
const mark = (url: string, width: number, height: number): CSSProperties => ({
  display: 'block',
  width,
  height,
  backgroundColor: 'var(--theme-text)',
  mask: `url(${url}) center / contain no-repeat`,
  WebkitMask: `url(${url}) center / contain no-repeat`,
})

export function Logo() {
  return <span role="img" aria-label="Cambio" style={mark('/figma/logo-dark.svg', 188, 88)} />
}

export function Icon() {
  return <span role="img" aria-label="Cambio" style={mark('/figma/logo-dark.svg', 56, 26)} />
}

/** Logo na vrhu bočne navigacije (tamna traka kao footer sajta, custom.scss). */
export function NavBrand() {
  return (
    <Link href="/admin" className="cambio-nav-brand" aria-label="Cambio admin, kontrolni panel">
      <span style={{ ...mark('/figma/logo-dark.svg', 94, 44), backgroundColor: 'currentColor' }} />
      <span className="cambio-nav-brand__tag">Admin</span>
    </Link>
  )
}
