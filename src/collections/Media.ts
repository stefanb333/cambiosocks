import { APIError, type CollectionConfig } from 'payload'
import { anyone, staffOnly } from '@/access'
import { revalidate } from '@/hooks/revalidate'
import { IMAGE_MIME_TYPES } from '@/lib/media'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Slika', plural: 'Mediji' },
  admin: {
    group: 'Sadržaj',
    listSearchableFields: ['filename', 'alt'],
    defaultColumns: ['filename', 'alt', 'updatedAt'],
  },
  access: {
    read: anyone,
    create: staffOnly,
    update: staffOnly,
    delete: staffOnly,
  },
  upload: {
    // Samo rasterske slike: SVG može da sadrži skriptu koja bi se izvršila na našem domenu.
    mimeTypes: [...IMAGE_MIME_TYPES],
    focalPoint: true,
    // Original se čuva najviše 2400 px po dužoj strani (fotografije sa aparata su često 4000+ px i 6+ MB).
    resizeOptions: { width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true },
    // Original se čuva kao WebP (PNG sa aparata od 6-7 MB postaje nekoliko stotina KB, providnost ostaje).
    formatOptions: { format: 'webp', options: { quality: 86 } },
    crop: true,
    adminThumbnail: 'thumb',
    imageSizes: [
      {
        name: 'thumb',
        width: 300,
        height: 300,
        position: 'centre',
        formatOptions: { format: 'webp', options: { quality: 80 } },
      },
      { name: 'card', width: 640, formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'large', width: 1600, formatOptions: { format: 'webp', options: { quality: 82 } } },
      {
        name: 'og',
        width: 1200,
        height: 630,
        position: 'centre',
        formatOptions: { format: 'jpeg', options: { quality: 82 } },
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      label: 'Alternativni tekst',
      type: 'text',
      required: true,
      admin: {
        description:
          'Kratak opis slike za čitače ekrana i Google (npr. "Crne muške sport čarape, par"). Obavezno.',
      },
    },
    { name: 'caption', label: 'Opis ispod slike', type: 'text' },
    {
      name: 'sourceUrl',
      label: 'Uvezeno sa adrese',
      type: 'text',
      index: true,
      admin: {
        readOnly: true,
        condition: (data) => Boolean(data?.sourceUrl),
        description: 'Popunjava CSV uvoz, da se ista slika ne uveze dva puta.',
      },
    },
  ],
  hooks: {
    beforeDelete: [
      async ({ id, req }) => {
        // Galerija proizvoda zahteva sliku, pa slika u upotrebi ne može da se obriše.
        const { docs } = await req.payload.find({
          collection: 'products',
          where: { 'gallery.image': { equals: id } },
          limit: 3,
          depth: 0,
          req,
          overrideAccess: true,
          select: { title: true },
        })
        if (docs.length) {
          throw new APIError(
            `Slika se koristi u galeriji proizvoda: ${docs.map((d) => d.title).join(', ')}. Prvo je uklonite iz proizvoda.`,
            400,
            null,
            true,
          )
        }
      },
    ],
    afterChange: [({ req }) => revalidate(req, { tags: ['media'] })],
  },
}
