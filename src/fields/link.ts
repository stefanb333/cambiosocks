import type { GroupField } from 'payload'

export const linkFields = (name = 'link', label = 'Link', urlRequired = true): GroupField => ({
  name,
  label,
  type: 'group',
  fields: [
    { name: 'label', label: 'Tekst', type: 'text', required: true },
    {
      name: 'url',
      label: 'Adresa',
      type: 'text',
      required: urlRequired,
      admin: {
        description: urlRequired
          ? 'Unutrašnja putanja (npr. /kolekcije/muske-carape) ili pun URL.'
          : 'Unutrašnja putanja ili pun URL. Ako je prazno, prikazuje se samo tekst.',
      },
    },
    { name: 'newTab', label: 'Otvori u novom tabu', type: 'checkbox', defaultValue: false },
  ],
})
