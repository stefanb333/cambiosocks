import { adminOnly, staffOnly } from '@/access'
import type { CollectionConfig } from 'payload'

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: { singular: 'Prijava', plural: 'Newsletter prijave' },
  admin: {
    group: 'Prodaja',
    useAsTitle: 'email',
    defaultColumns: ['email', 'source', 'interest', 'createdAt'],
    description: 'Prijave na newsletter i na obaveštenja "Obavesti me" za proizvode koji stižu.',
  },
  access: {
    read: staffOnly,
    // Javne prijave idu kroz API rutu sa validacijom (overrideAccess).
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'email', label: 'Email', type: 'email', required: true, index: true },
    {
      name: 'source',
      label: 'Izvor',
      type: 'select',
      defaultValue: 'newsletter',
      options: [
        { label: 'Newsletter', value: 'newsletter' },
        { label: 'Obavesti me', value: 'notify' },
        { label: 'Checkout', value: 'checkout' },
      ],
    },
    {
      name: 'interest',
      label: 'Interesovanje',
      type: 'text',
      admin: { description: 'Za "Obavesti me": naziv proizvoda ili kolekcije.' },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (typeof data.email === 'string') data.email = data.email.trim().toLowerCase()
        return data
      },
    ],
  },
}
