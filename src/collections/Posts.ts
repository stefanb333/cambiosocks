import { publishedOrStaff, staffOnly } from '@/access'
import { seoField } from '@/fields/seo'
import { slugField } from '@/fields/slug'
import { revalidate } from '@/hooks/revalidate'
import { lexicalToPlainText } from '@/lib/richtext'
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Članak', plural: 'Blog' },
  admin: {
    group: 'Sadržaj',
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', '_status', 'featured'],
  },
  access: {
    read: publishedOrStaff,
    create: staffOnly,
    update: staffOnly,
    delete: staffOnly,
  },
  versions: { drafts: true, maxPerDoc: 20 },
  defaultSort: '-publishedAt',
  fields: [
    { name: 'title', label: 'Naslov', type: 'text', required: true },
    {
      name: 'subtitle',
      label: 'Podnaslov',
      type: 'textarea',
      maxLength: 200,
      admin: { description: 'Prikazuje se ispod naslova izdvojenog članka na blog stranici.' },
    },
    { name: 'excerpt', label: 'Kratak opis', type: 'textarea', maxLength: 300 },
    {
      name: 'coverImage',
      label: 'Naslovna slika',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    { name: 'content', label: 'Sadržaj', type: 'richText', required: true },
    seoField,
    slugField('title'),
    {
      name: 'publishedAt',
      label: 'Datum objave',
      type: 'date',
      index: true,
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd. MMMM yyyy.' },
      },
    },
    { name: 'tags', label: 'Tagovi', type: 'text', hasMany: true, admin: { position: 'sidebar' } },
    {
      name: 'featured',
      label: 'Izdvojen članak',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'readTime',
      label: 'Vreme čitanja (min)',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Ako ostane prazno, računa se automatski iz teksta.',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        const words = lexicalToPlainText(data.content).split(/\s+/).filter(Boolean).length
        if (!data.readTime) data.readTime = Math.max(1, Math.round(words / 200))
        if (data._status === 'published' && !data.publishedAt)
          data.publishedAt = new Date().toISOString()
        return data
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        await revalidate(req, { paths: ['/blog', `/blog/${doc.slug}`], tags: ['posts'] })
        return doc
      },
    ],
  },
}
