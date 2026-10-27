import { staffOnly, variantOfActiveOrStaff } from '@/access'
import { syncProductAggregates } from '@/lib/catalog/aggregates'
import type { CollectionConfig } from 'payload'

const relationId = (value: unknown): number | string | undefined => {
  if (value && typeof value === 'object' && 'id' in value)
    return (value as { id: number | string }).id
  return value as number | string | undefined
}

export const Variants: CollectionConfig = {
  slug: 'variants',
  labels: { singular: 'Varijanta', plural: 'Varijante' },
  admin: {
    group: 'Prodavnica',
    useAsTitle: 'label',
    defaultColumns: ['label', 'sku', 'price', 'stock', 'updatedAt'],
    listSearchableFields: ['label', 'sku', 'barcode'],
    description:
      'Svaka kombinacija opcija proizvoda (npr. Bela / 42-44) sa sopstvenom cenom, SKU-om i zalihom.',
  },
  access: {
    read: variantOfActiveOrStaff,
    create: staffOnly,
    update: staffOnly,
    delete: staffOnly,
  },
  defaultSort: 'position',
  fields: [
    {
      name: 'product',
      label: 'Proizvod',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      index: true,
    },
    {
      type: 'row',
      fields: [
        { name: 'option1', label: 'Opcija 1', type: 'text', admin: { width: '33%' } },
        { name: 'option2', label: 'Opcija 2', type: 'text', admin: { width: '33%' } },
        { name: 'option3', label: 'Opcija 3', type: 'text', admin: { width: '33%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          label: 'Cena (RSD)',
          type: 'number',
          required: true,
          min: 0,
          admin: { width: '33%' },
        },
        {
          name: 'compareAtPrice',
          label: 'Stara cena (RSD)',
          type: 'number',
          min: 0,
          admin: { width: '33%', description: 'Prikazuje se precrtano ako je veća od cene.' },
        },
        {
          name: 'sku',
          label: 'SKU',
          type: 'text',
          unique: true,
          index: true,
          admin: { width: '33%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'stock',
          label: 'Zaliha (kom)',
          type: 'number',
          defaultValue: 0,
          admin: { width: '33%' },
        },
        {
          name: 'trackInventory',
          label: 'Prati zalihu',
          type: 'checkbox',
          defaultValue: true,
          admin: { width: '33%' },
        },
        {
          name: 'allowBackorder',
          label: 'Prodaja kad nema na stanju',
          type: 'checkbox',
          defaultValue: false,
          admin: { width: '33%' },
        },
      ],
    },
    {
      name: 'image',
      label: 'Slika varijante',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Prikazuje se kada kupac izabere ovu varijantu (npr. slika u toj boji).',
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'barcode', label: 'Barkod', type: 'text', admin: { width: '33%' } },
        { name: 'weight', label: 'Težina (g)', type: 'number', min: 0, admin: { width: '33%' } },
        {
          name: 'position',
          label: 'Redosled',
          type: 'number',
          defaultValue: 0,
          admin: { width: '33%' },
        },
      ],
    },
    {
      name: 'title',
      label: 'Naziv varijante',
      type: 'text',
      admin: { readOnly: true, position: 'sidebar' },
    },
    { name: 'label', type: 'text', admin: { hidden: true } },
  ],
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        const values = [data.option1, data.option2, data.option3]
          .map((v: string | null | undefined) => (typeof v === 'string' ? v.trim() : v))
          .filter(Boolean) as string[]
        data.title = values.length ? values.join(' / ') : 'Osnovna'
        const productId = relationId(data.product ?? originalDoc?.product)
        if (productId) {
          const product = await req.payload
            .findByID({
              collection: 'products',
              id: productId,
              depth: 0,
              req,
              overrideAccess: true,
              select: { title: true },
            })
            .catch(() => null)
          data.label = product ? `${product.title} | ${data.title}` : data.title
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req, context }) => {
        if (context.skipAggregateSync) return doc
        const ids = new Set(
          [relationId(doc.product), relationId(previousDoc?.product)].filter(Boolean),
        )
        for (const id of ids) await syncProductAggregates(req.payload, id as number, req)
        return doc
      },
    ],
    afterDelete: [
      async ({ doc, req, context }) => {
        if (context.skipAggregateSync) return
        const id = relationId(doc.product)
        if (id) await syncProductAggregates(req.payload, id, req)
      },
    ],
  },
}
