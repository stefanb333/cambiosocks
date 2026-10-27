import { adminOnly, staffOnly } from '@/access'
import { csvExportEndpoint, exportCustomersCsv } from '@/lib/shopify-export'
import { addressFields } from './Orders'
import type { CollectionConfig } from 'payload'

export const Customers: CollectionConfig = {
  slug: 'customers',
  labels: { singular: 'Kupac', plural: 'Kupci' },
  endpoints: [csvExportEndpoint('kupci', exportCustomersCsv)],
  admin: {
    components: {
      beforeListTable: [
        {
          path: '@/components/admin/ExportCsvButton#ExportCsvButton',
          clientProps: { collection: 'customers' },
        },
      ],
    },
    group: 'Prodaja',
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'email', 'phone', 'ordersCount', 'totalSpent'],
    listSearchableFields: ['fullName', 'email', 'phone'],
    description: 'Kupci se automatski dodaju i ažuriraju pri svakoj porudžbini (po email adresi).',
  },
  access: {
    read: staffOnly,
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'firstName', label: 'Ime', type: 'text', admin: { width: '50%' } },
        { name: 'lastName', label: 'Prezime', type: 'text', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          required: true,
          unique: true,
          index: true,
          admin: { width: '50%' },
        },
        { name: 'phone', label: 'Telefon', type: 'text', admin: { width: '50%' } },
      ],
    },
    {
      name: 'addresses',
      label: 'Adrese',
      type: 'array',
      labels: { singular: 'Adresa', plural: 'Adrese' },
      fields: addressFields,
    },
    {
      name: 'acceptsMarketing',
      label: 'Prima marketinške poruke',
      type: 'checkbox',
      defaultValue: false,
    },
    { name: 'note', label: 'Napomena', type: 'textarea' },
    {
      name: 'orders',
      label: 'Istorija porudžbina',
      type: 'join',
      collection: 'orders',
      on: 'customer',
      defaultSort: '-createdAt',
      admin: { defaultColumns: ['name', 'createdAt', 'total', 'status'] },
    },
    { name: 'fullName', label: 'Ime i prezime', type: 'text', admin: { hidden: true } },
    {
      name: 'ordersCount',
      label: 'Broj porudžbina',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'totalSpent',
      label: 'Ukupno potrošeno (RSD)',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (typeof data.email === 'string') data.email = data.email.trim().toLowerCase()
        data.fullName = [data.firstName, data.lastName].filter(Boolean).join(' ') || data.email
        return data
      },
    ],
  },
}
