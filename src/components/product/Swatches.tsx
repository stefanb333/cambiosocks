/**
 * Preklopljeni krugovi boja kao u Figmi.
 * "card" (featured kartica, 25:545): r=9, korak 14px.
 * "listing" (kartica u kolekciji, 52:1141): r=7.083, korak 9.917px, svetle boje sa tankim obodom.
 */
export function Swatches({
  colors,
  variant = 'card',
  className = '',
}: {
  colors: { name: string; hex: string }[]
  variant?: 'card' | 'listing'
  className?: string
}) {
  const list = colors.slice(0, 3)
  if (!list.length) return null
  const r = variant === 'card' ? 9 : 7.08333
  const step = variant === 'card' ? 14 : 9.91667
  const width = r * 2 + step * (list.length - 1)
  const height = variant === 'card' ? 18 : 14.3792
  const isLight = (hex: string) => {
    const h = hex.replace('#', '')
    const n = parseInt(
      h.length === 3
        ? h
            .split('')
            .map((c) => c + c)
            .join('')
        : h,
      16,
    )
    const lum = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)
    return lum > 235
  }
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Boje: ${list.map((c) => c.name).join(', ')}`}
      className={className}
    >
      {list.map((c, i) => (
        <circle
          key={c.name + i}
          cx={r + i * step}
          cy={height / 2}
          r={r}
          fill={variant === 'listing' && isLight(c.hex) ? '#F9F9FA' : c.hex}
          {...(variant === 'listing' && isLight(c.hex)
            ? { stroke: '#ADADAD', strokeWidth: 0.2125 }
            : {})}
        />
      ))}
    </svg>
  )
}

type OptionLike = {
  kind?: string | null
  values?: { value: string; swatch?: string | null }[] | null
}

export function colorsOf(options: OptionLike[] | null | undefined) {
  const color = options?.find((o) => o.kind === 'color')
  return (color?.values ?? [])
    .filter((v) => v.swatch)
    .map((v) => ({ name: v.value, hex: v.swatch as string }))
}
