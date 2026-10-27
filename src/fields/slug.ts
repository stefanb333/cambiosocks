import { slugify } from '@/lib/slugify'
import type { TextField } from 'payload'

/** Slug koji se automatski pravi iz naslova, ali može ručno da se menja. */
export function slugField(sourceField = 'title'): TextField {
  return {
    name: 'slug',
    label: 'URL (slug)',
    type: 'text',
    index: true,
    unique: true,
    admin: {
      position: 'sidebar',
      description: 'Deo adrese stranice. Pravi se automatski iz naziva ako ostane prazan.',
    },
    hooks: {
      beforeValidate: [
        ({ value, data }) => {
          if (typeof value === 'string' && value.trim()) return slugify(value)
          const source = data?.[sourceField]
          return typeof source === 'string' ? slugify(source) : value
        },
      ],
    },
  }
}
