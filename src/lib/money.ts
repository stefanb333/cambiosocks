/** Cene su celi dinari, bez razdvajanja hiljada (kao u Figmi: "1699 RSD"). */
export function formatPrice(amount: number): string {
  return `${Math.round(amount)} RSD`
}
