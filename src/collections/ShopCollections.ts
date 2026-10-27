import { anyone, staffOnly } from '@/access'
import { seoField } from '@/fields/seo'
import { slugField } from '@/fields/slug'
import { revalidate } from '@/hooks/revalidate'
import { CATEGORY_OPTIONS, PATTERN_OPTIONS, PRODUCT_TYPE_OPTIONS } from '@/lib/catalog/constants'
import type { CollectionConfig } from 'payload'

export const SORT_OPTIONS = [
  { label: 'Izdvojeno (ručni redosled)', value: 'featured' },
  { label: 'Najnovije', value: 'newest' },
  { label: 'Cena: niža ka višoj', value: 'price-asc' },
  { label: 'Cena: viša ka nižoj', value: 'price-desc' },
  { label: 'Naziv: A-Ž', value: 'title-asc' },
] as const

export const ShopCollections: CollectionConfig = {
  slug: 'shop-collections',
  labels: { singular: 'Kolekcija', plural: 'Kolekcije' },
  admin: {
    group: 'Prodavnica',
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'slug', 'updatedAt'],
    description:
      'Grupe proizvoda (npr. Muške čarape). Ručne: birate proizvode. Automatske: proizvodi po pravilima.',
  },
  access: {
    read: anyone,
    create: staffOnly,
    update: staffOnly,
    delete: staffOnly,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Osnovno',
          fields: [
            { name: 'title', label: 'Naziv', type: 'text', required: true },
            { name: 'description', label: 'Opis', type: 'richText' },
            {
              name: 'image',
              label: 'Slika',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Slika u zaglavlju kolekcije i na kartici kategorije.' },
            },
            {
              name: 'heroHeading',
              label: 'Naslov u zaglavlju',
              type: 'text',
              admin: {
                description:
                  'Npr. "Jednostavne čarape, jasne linije." Ako ostane prazno, koristi se naziv.',
              },
            },
            { name: 'heroText', label: 'Tekst u zaglavlju', type: 'textarea' },
            {
              name: 'listHeading',
              label: 'Naslov iznad proizvoda',
              type: 'text',
              defaultValue: 'Najnovije u kolekciji',
            },
          ],
        },
        {
          label: 'Proizvodi',
          fields: [
            {
              name: 'type',
              label: 'Način izbora proizvoda',
              type: 'radio',
              required: true,
              defaultValue: 'manual',
              options: [
                { label: 'Ručno', value: 'manual' },
                { label: 'Automatski (po pravilima)', value: 'automatic' },
              ],
            },
            {
              name: 'products',
              label: 'Proizvodi',
              type: 'relationship',
              relationTo: 'products',
              hasMany: true,
              admin: {
                condition: (data) => data?.type === 'manual',
                description:
                  'Redosled ovde je redosled "Izdvojeno". Proizvodi se mogu dodati i iz samog proizvoda.',
              },
            },
            {
              name: 'match',
              label: 'Proizvod mora da ispuni',
              type: 'radio',
              defaultValue: 'all',
              options: [
                { label: 'Sva pravila', value: 'all' },
                { label: 'Bilo koje pravilo', value: 'any' },
              ],
              admin: { condition: (data) => data?.type === 'automatic' },
            },
            {
              name: 'rules',
              label: 'Pravila',
              type: 'array',
              labels: { singular: 'Pravilo', plural: 'Pravila' },
              admin: { condition: (data) => data?.type === 'automatic' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'field',
                      label: 'Polje',
                      type: 'select',
                      required: true,
                      admin: { width: '50%' },
                      options: [
                        { label: 'Tag', value: 'tags' },
                        { label: 'Tip proizvoda', value: 'productType' },
                        { label: 'Brend', value: 'brand' },
                        { label: 'Kategorija', value: 'category' },
                        { label: 'Dezen / šara', value: 'pattern' },
                      ],
                    },
                    {
                      name: 'value',
                      label: 'Jednako',
                      type: 'text',
                      required: true,
                      admin: {
                        width: '50%',
                        description: `Tip: ${PRODUCT_TYPE_OPTIONS.map((o) => o.value).join(', ')}. Kategorija: ${CATEGORY_OPTIONS.map((o) => o.value).join(', ')}. Dezen: ${PATTERN_OPTIONS.map((o) => o.value).join(', ')}.`,
                      },
                    },
                  ],
                },
              ],
            },
            {
              name: 'defaultSort',
              label: 'Podrazumevano sortiranje',
              type: 'select',
              defaultValue: 'featured',
              options: [...SORT_OPTIONS],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [seoField],
        },
      ],
    },
    slugField('title'),
    {
      name: 'quickLinks',
      label: 'Prečice (pill dugmad)',
      type: 'relationship',
      relationTo: 'shop-collections',
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: 'Kolekcije prikazane kao dugmad iznad proizvoda (npr. Muške, Ženske, Sport).',
      },
    },
    {
      name: 'showInMenu',
      label: 'Prikaži u meniju "Kategorije"',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'menuOrder',
      label: 'Redosled u meniju',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        const paths = [`/kolekcije/${doc.slug}`]
        if (previousDoc?.slug && previousDoc.slug !== doc.slug)
          paths.push(`/kolekcije/${previousDoc.slug}`)
        await revalidate(req, { paths, tags: ['collections', 'navigation'] })
        return doc
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        await revalidate(req, {
          paths: [`/kolekcije/${doc.slug}`],
          tags: ['collections', 'navigation'],
        })
      },
    ],
  },
}
