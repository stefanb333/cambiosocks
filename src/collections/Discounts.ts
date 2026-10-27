import { adminOnly, staffOnly } from '@/access'
import type { CollectionConfig } from 'payload'

export const Discounts: CollectionConfig = {
  slug: 'discounts',
  labels: { singular: 'Popust', plural: 'Popusti' },
  admin: {
    group: 'Prodaja',
    useAsTitle: 'code',
    defaultColumns: ['code', 'type', 'value', 'usageCount', 'active', 'endsAt'],
    description: 'Kodovi za popust koje kupci unose u korpi.',
  },
  access: {
    read: staffOnly,
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'code',
      label: 'Kod',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Npr. DOBRODOSLI10. Velika i mala slova nisu bitna.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          label: 'Vrsta',
          type: 'select',
          required: true,
          defaultValue: 'percentage',
          admin: { width: '50%' },
          options: [
            { label: 'Procenat', value: 'percentage' },
            { label: 'Fiksni iznos (RSD)', value: 'fixed' },
            { label: 'Besplatna dostava', value: 'free_shipping' },
          ],
        },
        {
          name: 'value',
          label: 'Vrednost',
          type: 'number',
          min: 0,
          admin: {
            width: '50%',
            description: 'Za procenat 1-100, za fiksni iznos u dinarima.',
            condition: (data) => data?.type !== 'free_shipping',
          },
          validate: (
            value: number | null | undefined,
            { siblingData }: { siblingData: { type?: string } },
          ) => {
            if (siblingData.type === 'free_shipping') return true
            if (typeof value !== 'number' || value <= 0) return 'Unesite vrednost veću od nule.'
            if (siblingData.type === 'percentage' && value > 100)
              return 'Procenat ne može biti veći od 100.'
            return true
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Uslovi',
      fields: [
        {
          name: 'minSubtotal',
          label: 'Minimalan iznos korpe (RSD)',
          type: 'number',
          min: 0,
        },
        {
          name: 'appliesTo',
          label: 'Važi za',
          type: 'radio',
          defaultValue: 'all',
          options: [
            { label: 'Sve proizvode', value: 'all' },
            { label: 'Određene kolekcije', value: 'collections' },
            { label: 'Određene proizvode', value: 'products' },
          ],
        },
        {
          name: 'collections',
          label: 'Kolekcije',
          type: 'relationship',
          relationTo: 'shop-collections',
          hasMany: true,
          admin: { condition: (data) => data?.appliesTo === 'collections' },
        },
        {
          name: 'products',
          label: 'Proizvodi',
          type: 'relationship',
          relationTo: 'products',
          hasMany: true,
          admin: { condition: (data) => data?.appliesTo === 'products' },
        },
        {
          name: 'oncePerCustomer',
          label: 'Jednom po kupcu (email)',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Važenje i limit',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'startsAt',
              label: 'Važi od',
              type: 'date',
              admin: { width: '50%', date: { pickerAppearance: 'dayAndTime' } },
            },
            {
              name: 'endsAt',
              label: 'Važi do',
              type: 'date',
              admin: { width: '50%', date: { pickerAppearance: 'dayAndTime' } },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'usageLimit',
              label: 'Ukupan limit korišćenja',
              type: 'number',
              min: 1,
              admin: { width: '50%', description: 'Prazno = bez limita.' },
            },
            {
              name: 'usageCount',
              label: 'Iskorišćeno puta',
              type: 'number',
              defaultValue: 0,
              admin: { width: '50%', readOnly: true },
            },
          ],
        },
      ],
    },
    {
      name: 'active',
      label: 'Aktivan',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    { name: 'note', label: 'Interna napomena', type: 'textarea', admin: { position: 'sidebar' } },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (typeof data.code === 'string')
          data.code = data.code.trim().toUpperCase().replace(/\s+/g, '')
        return data
      },
    ],
  },
}
