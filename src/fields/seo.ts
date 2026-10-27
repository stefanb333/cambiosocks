import type { GroupField } from 'payload'

export const seoField: GroupField = {
  name: 'seo',
  label: 'SEO',
  type: 'group',
  admin: {
    description:
      'Kako stranica izgleda u Google pretrazi i kada se podeli na mrežama. Ako ostane prazno, koriste se naziv i opis.',
  },
  fields: [
    {
      name: 'title',
      label: 'SEO naslov',
      type: 'text',
      maxLength: 70,
      admin: { description: 'Preporučeno do 60 znakova.' },
    },
    {
      name: 'description',
      label: 'Meta opis',
      type: 'textarea',
      maxLength: 200,
      admin: { description: 'Preporučeno 120 do 160 znakova.' },
    },
    {
      name: 'image',
      label: 'Slika za deljenje (OG)',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
