import { activeOrStaff, staffOnly } from '@/access'
import { seoField } from '@/fields/seo'
import { slugField } from '@/fields/slug'
import { revalidate } from '@/hooks/revalidate'
import { syncProductAggregates } from '@/lib/catalog/aggregates'
import { CATEGORY_OPTIONS, PATTERN_OPTIONS, PRODUCT_TYPE_OPTIONS } from '@/lib/catalog/constants'
import { lexicalToPlainText } from '@/lib/richtext'
import { normalizeSearch } from '@/lib/slugify'
import { productEndpoints } from './endpoints/products'
import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Proizvod', plural: 'Proizvodi' },
  admin: {
    group: 'Prodavnica',
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'totalStock', 'productType', 'minPrice', 'updatedAt'],
    listSearchableFields: ['title', 'slug', 'searchText'],
    pagination: { defaultLimit: 25 },
    description: 'Katalog proizvoda. Cene i zaliha se unose po varijanti.',
    components: { beforeListTable: ['@/components/admin/ProductListTools#ProductListTools'] },
  },
  access: {
    read: activeOrStaff,
    create: staffOnly,
    update: staffOnly,
    delete: staffOnly,
  },
  versions: { maxPerDoc: 20 },
  endpoints: productEndpoints,
  defaultSort: '-updatedAt',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Osnovno',
          fields: [
            { name: 'title', label: 'Naziv', type: 'text', required: true },
            {
              name: 'shortDescription',
              label: 'Kratak opis',
              type: 'textarea',
              maxLength: 240,
              admin: {
                description: 'Prikazuje se na karticama proizvoda i ispod naslova. Do 240 znakova.',
              },
            },
            { name: 'description', label: 'Opis', type: 'richText' },
            {
              name: 'material',
              label: 'Materijal i sastav',
              type: 'text',
              admin: { description: 'Npr. "80% pamuk, 17% poliamid, 3% elastin".' },
            },
            {
              name: 'care',
              label: 'Održavanje',
              type: 'textarea',
              admin: {
                description:
                  'Uputstvo za pranje. Ako ostane prazno, koristi se opšte uputstvo prodavnice.',
              },
            },
          ],
        },
        {
          label: 'Slike',
          fields: [
            {
              name: 'gallery',
              label: 'Galerija',
              type: 'array',
              labels: { singular: 'Slika', plural: 'Slike' },
              admin: {
                description:
                  'Prevucite redove da promenite redosled. Prva slika je glavna slika proizvoda.',
                components: { RowLabel: '@/components/admin/RowLabels#GalleryRowLabel' },
              },
              fields: [
                {
                  name: 'image',
                  label: 'Slika',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Opcije i varijante',
          description:
            'Definišite opcije (npr. Veličina, Boja), sačuvajte proizvod, pa generišite varijante. Cena, SKU i zaliha se menjaju po varijanti.',
          fields: [
            {
              name: 'options',
              label: 'Opcije',
              type: 'array',
              maxRows: 3,
              labels: { singular: 'Opcija', plural: 'Opcije' },
              admin: { components: { RowLabel: '@/components/admin/RowLabels#OptionRowLabel' } },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'name',
                      label: 'Naziv opcije',
                      type: 'text',
                      required: true,
                      admin: { width: '50%' },
                    },
                    {
                      name: 'kind',
                      label: 'Vrsta',
                      type: 'select',
                      required: true,
                      defaultValue: 'other',
                      admin: {
                        width: '50%',
                        description: 'Veličina i boja se koriste za filtere i prikaz.',
                      },
                      options: [
                        { label: 'Veličina', value: 'size' },
                        { label: 'Boja', value: 'color' },
                        { label: 'Ostalo (npr. set)', value: 'other' },
                      ],
                    },
                  ],
                },
                {
                  name: 'values',
                  label: 'Vrednosti',
                  type: 'array',
                  minRows: 1,
                  labels: { singular: 'Vrednost', plural: 'Vrednosti' },
                  admin: {
                    components: { RowLabel: '@/components/admin/RowLabels#OptionValueRowLabel' },
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'value',
                          label: 'Vrednost',
                          type: 'text',
                          required: true,
                          admin: { width: '50%' },
                        },
                        {
                          name: 'swatch',
                          label: 'Boja (hex)',
                          type: 'text',
                          admin: {
                            width: '50%',
                            description: 'Samo za opciju boje, npr. #0F0F0F.',
                          },
                          validate: (value: string | null | undefined) =>
                            !value ||
                            /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ||
                            'Unesite boju u formatu #RRGGBB.',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'defaultPrice',
                  label: 'Podrazumevana cena (RSD)',
                  type: 'number',
                  min: 0,
                  admin: {
                    width: '50%',
                    description: 'Koristi se za nove varijante pri generisanju.',
                  },
                },
                {
                  name: 'defaultCompareAtPrice',
                  label: 'Podrazumevana stara cena (RSD)',
                  type: 'number',
                  min: 0,
                  admin: { width: '50%', description: 'Precrtana cena. Prazno ako nema popusta.' },
                },
              ],
            },
            {
              name: 'variantGenerator',
              type: 'ui',
              admin: {
                components: { Field: '@/components/admin/VariantGenerator#VariantGenerator' },
              },
            },
            {
              name: 'variants',
              label: 'Varijante',
              type: 'join',
              collection: 'variants',
              on: 'product',
              defaultSort: 'position',
              defaultLimit: 100,
              admin: { defaultColumns: ['title', 'sku', 'price', 'stock'] },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [seoField],
        },
      ],
    },
    // --- Bočna kolona ---
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: [
        { label: 'Nacrt', value: 'draft' },
        { label: 'Aktivan', value: 'active' },
        { label: 'Arhiviran', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Samo aktivni proizvodi su vidljivi u prodavnici.',
        components: { Cell: '@/components/admin/StatusCell#StatusCell' },
      },
    },
    slugField('title'),
    {
      name: 'collections',
      label: 'Kolekcije',
      type: 'relationship',
      relationTo: 'shop-collections',
      hasMany: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Za ručne kolekcije. Automatske kolekcije same biraju proizvode po pravilima.',
      },
    },
    {
      name: 'productType',
      label: 'Tip proizvoda',
      type: 'select',
      index: true,
      options: [...PRODUCT_TYPE_OPTIONS],
      admin: { position: 'sidebar' },
    },
    {
      name: 'brand',
      label: 'Brend',
      type: 'text',
      defaultValue: 'Cambio',
      admin: { position: 'sidebar' },
    },
    {
      name: 'tags',
      label: 'Tagovi',
      type: 'text',
      hasMany: true,
      index: true,
      admin: { position: 'sidebar', description: 'Pritisnite Enter posle svakog taga.' },
    },
    {
      name: 'category',
      label: 'Kategorije (filter)',
      type: 'select',
      hasMany: true,
      options: [...CATEGORY_OPTIONS],
      admin: { position: 'sidebar' },
    },
    {
      name: 'pattern',
      label: 'Dezen / šara (filter)',
      type: 'select',
      hasMany: true,
      options: [...PATTERN_OPTIONS],
      admin: { position: 'sidebar' },
    },
    // Računa se iz odobrenih recenzija (collections/Reviews.ts, D-068); ručni unos nije moguć.
    {
      type: 'row',
      admin: { position: 'sidebar' },
      fields: [
        {
          name: 'rating',
          label: 'Ocena (0-5)',
          type: 'number',
          min: 0,
          max: 5,
          admin: { step: 0.1, readOnly: true },
        },
        {
          name: 'ratingCount',
          label: 'Broj recenzija',
          type: 'number',
          min: 0,
          admin: {
            readOnly: true,
            description: 'Računa se iz odobrenih recenzija (Prodaja > Recenzije).',
          },
        },
      ],
    },
    // --- Izvedena polja (popunjavaju se automatski iz varijanti) ---
    {
      type: 'collapsible',
      label: 'Izračunato iz varijanti',
      admin: { position: 'sidebar', initCollapsed: true },
      fields: [
        {
          name: 'minPrice',
          label: 'Najniža cena',
          type: 'number',
          index: true,
          admin: { readOnly: true },
        },
        { name: 'maxPrice', label: 'Najviša cena', type: 'number', admin: { readOnly: true } },
        { name: 'compareAtPrice', label: 'Stara cena', type: 'number', admin: { readOnly: true } },
        { name: 'totalStock', label: 'Ukupna zaliha', type: 'number', admin: { readOnly: true } },
        {
          name: 'available',
          label: 'Dostupan',
          type: 'checkbox',
          index: true,
          admin: { readOnly: true },
        },
        {
          name: 'variantCount',
          label: 'Broj varijanti',
          type: 'number',
          admin: { readOnly: true },
        },
        {
          name: 'sizeValues',
          label: 'Veličine',
          type: 'text',
          hasMany: true,
          admin: { readOnly: true },
        },
        {
          name: 'colorValues',
          label: 'Boje',
          type: 'text',
          hasMany: true,
          admin: { readOnly: true },
        },
        {
          name: 'searchText',
          label: 'Opis i tagovi',
          type: 'text',
          index: true,
          admin: { hidden: true },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        const parts = [
          data.title,
          data.shortDescription,
          data.productType,
          ...(data.tags ?? []),
          lexicalToPlainText(data.description),
        ]
        data.searchText = normalizeSearch(parts.filter(Boolean).join(' '))
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req, context }) => {
        if (!context.skipAggregateSync) await syncProductAggregates(req.payload, doc.id, req)
        const paths = [`/proizvodi/${doc.slug}`]
        if (previousDoc?.slug && previousDoc.slug !== doc.slug)
          paths.push(`/proizvodi/${previousDoc.slug}`)
        await revalidate(req, { paths, tags: ['products', 'collections'] })
        return doc
      },
    ],
    // Varijante se brišu pre proizvoda: kolona variants.product je obavezna, pa baza
    // ne dozvoljava brisanje proizvoda dok postoje njegove varijante.
    beforeDelete: [
      async ({ id, req }) => {
        await req.payload.delete({
          collection: 'variants',
          where: { product: { equals: id } },
          req,
          overrideAccess: true,
          context: { skipAggregateSync: true },
        })
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        await revalidate(req, {
          paths: [`/proizvodi/${doc.slug}`],
          tags: ['products', 'collections'],
        })
      },
    ],
  },
}
