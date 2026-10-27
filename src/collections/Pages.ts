import { publishedOrStaff, staffOnly } from '@/access'
import { pageBlocks } from '@/blocks'
import { seoField } from '@/fields/seo'
import { slugField } from '@/fields/slug'
import { revalidate } from '@/hooks/revalidate'
import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Stranica', plural: 'Stranice' },
  admin: {
    group: 'Sadržaj',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    description: 'Statične stranice: O nama, Kontakt, Česta pitanja, Dostava, Uslovi, Privatnost.',
  },
  access: {
    read: publishedOrStaff,
    create: staffOnly,
    update: staffOnly,
    delete: staffOnly,
  },
  versions: { drafts: true, maxPerDoc: 20 },
  fields: [
    { name: 'title', label: 'Naslov', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Sadržaj',
          fields: [
            {
              name: 'layout',
              label: 'Sekcije',
              type: 'blocks',
              blocks: pageBlocks,
              admin: { initCollapsed: true },
            },
          ],
        },
        { label: 'SEO', fields: [seoField] },
      ],
    },
    slugField('title'),
  ],
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        const paths = [`/${doc.slug}`]
        if (previousDoc?.slug && previousDoc.slug !== doc.slug) paths.push(`/${previousDoc.slug}`)
        await revalidate(req, { paths, tags: ['pages'] })
        return doc
      },
    ],
    afterDelete: [({ doc, req }) => revalidate(req, { paths: [`/${doc.slug}`], tags: ['pages'] })],
  },
}
