const map: Record<string, string> = {
  č: 'c',
  ć: 'c',
  š: 's',
  ž: 'z',
  đ: 'dj',
  Č: 'c',
  Ć: 'c',
  Š: 's',
  Ž: 'z',
  Đ: 'dj',
}

/** "Muške čarape & Sport" -> "muske-carape-sport" */
export function slugify(input: string): string {
  return input
    .replace(/[čćšžđČĆŠŽĐ]/g, (ch) => map[ch] ?? ch)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Za pretragu: uklanja dijakritike da "carape" nađe "čarape". */
export function normalizeSearch(input: string): string {
  return slugify(input).replace(/-/g, ' ')
}
