/**
 * Podaci o trgovcu (APR, preuzeto sa CompanyWall 26.10.2026). Koriste ih pravne stranice
 * (seed/legal.ts) i podnožje emailova. Zakon o zaštiti potrošača (čl. 12 i 27) i Zakon o
 * elektronskoj trgovini traže da kupac pre kupovine vidi ko je prodavac.
 */
export const COMPANY = {
  legalName: 'Privredno društvo Cambio doo Novi Pazar',
  name: 'Cambio doo Novi Pazar',
  street: 'Pante Gajića 22',
  city: '36300 Novi Pazar',
  country: 'Srbija',
  registrationNumber: '07830939',
  taxId: '100744119',
  activity: '1431, proizvodnja pletenih i kukičanih čarapa',
  email: 'cambio.carape@gmail.com',
  phone: '+381 63 785 9390',
  hours: 'ponedeljak-petak, 09:00-17:00',
} as const

export const companyAddress = `${COMPANY.street}, ${COMPANY.city}, ${COMPANY.country}`

/** Jedan red za podnožje: naziv, MB, PIB i adresa. */
export const companyLine = `${COMPANY.name} · MB ${COMPANY.registrationNumber} · PIB ${COMPANY.taxId} · ${COMPANY.street}, ${COMPANY.city}`
