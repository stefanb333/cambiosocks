import { adminOnly, isStaff, staffOnly } from '@/access'
import { revalidate } from '@/hooks/revalidate'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  Payload,
  PayloadRequest,
} from 'payload'

/** Prosečna ocena i broj odobrenih recenzija upisuju se u proizvod (kartica, šema, filteri). */
async function syncProductRating(payload: Payload, req: PayloadRequest, productId: number) {
  const { docs } = await payload.find({
    collection: 'reviews',
    where: { and: [{ product: { equals: productId } }, { status: { equals: 'approved' } }] },
    select: { rating: true },
    pagination: false,
    depth: 0,
    req,
  })
  const count = docs.length
  const average = count ? docs.reduce((sum, r) => sum + (r.rating ?? 0), 0) / count : null
  const product = await payload.update({
    collection: 'products',
    id: productId,
    data: { rating: average === null ? null : Math.round(average * 10) / 10, ratingCount: count },
    depth: 0,
    req,
  })
  await revalidate(req, {
    paths: ['/', `/proizvodi/${product.slug}`],
    tags: ['reviews', 'products'],
  })
}

const productIdOf = (value: unknown) =>
  typeof value === 'object' && value ? (value as { id: number }).id : (value as number | null)

const afterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  const ids = new Set([productIdOf(doc.product), productIdOf(previousDoc?.product)])
  for (const id of ids) if (id) await syncProductRating(req.payload, req, id)
  return doc
}

const afterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const id = productIdOf(doc.product)
  if (id) await syncProductRating(req.payload, req, id)
  return doc
}

/**
 * Recenzije kupaca (D-068). Kupac ih šalje sa stranice proizvoda ili sa početne (server akcija
 * actions/review.ts); nova recenzija je "Na čekanju" i na sajtu se vidi tek kada je osoblje
 * odobri. Ocena proizvoda se računa sama iz odobrenih recenzija.
 */
export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: { singular: 'Recenzija', plural: 'Recenzije' },
  admin: {
    group: 'Prodaja',
    useAsTitle: 'name',
    defaultColumns: ['name', 'rating', 'product', 'status', 'featured', 'createdAt'],
    listSearchableFields: ['name', 'text', 'city'],
    description:
      'Recenzije kupaca. Nova recenzija se na sajtu vidi tek kada joj status promenite u "Odobrena".',
  },
  defaultSort: '-createdAt',
  access: {
    // Javno se vide samo odobrene; slanje sa sajta ide kroz server akciju (overrideAccess).
    read: ({ req }) => (isStaff({ req }) ? true : { status: { equals: 'approved' } }),
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly,
  },
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
        {
          name: 'name',
          label: 'Ime',
          type: 'text',
          required: true,
          maxLength: 60,
          admin: { width: '50%' },
        },
        {
          name: 'city',
          label: 'Grad',
          type: 'text',
          maxLength: 60,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'rating',
      label: 'Ocena',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      defaultValue: 5,
      admin: { step: 1, description: 'Od 1 do 5 zvezdica.' },
    },
    { name: 'text', label: 'Recenzija', type: 'textarea', required: true, maxLength: 1500 },
    {
      name: 'email',
      label: 'Email (nije javan)',
      type: 'email',
      access: { read: ({ req }) => isStaff({ req }) },
      admin: { description: 'Služi samo za proveru kupovine; ne prikazuje se na sajtu.' },
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'Na čekanju', value: 'pending' },
        { label: 'Odobrena', value: 'approved' },
        { label: 'Odbijena', value: 'rejected' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'featured',
      label: 'Prikaži na početnoj',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Sekcija "Recenzije" na početnoj prikazuje do 6 odobrenih recenzija.',
      },
    },
    {
      name: 'verified',
      label: 'Potvrđena kupovina',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Označava se samo ako email odgovara porudžbini sa ovim proizvodom.',
      },
    },
  ],
  hooks: {
    afterChange: [afterChange],
    afterDelete: [afterDelete],
  },
}
