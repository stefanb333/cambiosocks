/** Cene su celi dinari sa tačkom za hiljade, kao u tekstovima sajta ("1.600 RSD", D-080). */
export function formatPrice(amount: number): string {
  const whole = String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${whole} RSD`
}
