import { adminFieldOnly, adminOnly, isAdmin } from '@/access'
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Korisnik', plural: 'Korisnici admina' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Podešavanja',
    hidden: ({ user }) => (user as { role?: string } | null)?.role !== 'admin',
  },
  auth: {
    // Posle 5 pogrešnih lozinki nalog je zaključan 15 minuta (zaštita od pogađanja lozinke).
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    // Kolačić za prijavu ide samo preko HTTPS-a kada sajt radi na HTTPS-u (produkcija).
    cookies: {
      secure: (process.env.NEXT_PUBLIC_SERVER_URL || '').startsWith('https://'),
      sameSite: 'Lax',
    },
  },
  access: {
    // Prvi korisnik se pravi kroz admin; posle toga samo admin dodaje nove.
    create: adminOnly,
    read: ({ req }) => (isAdmin({ req }) ? true : { id: { equals: req.user?.id } }),
    update: ({ req }) => (isAdmin({ req }) ? true : { id: { equals: req.user?.id } }),
    delete: adminOnly,
    admin: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', label: 'Ime', type: 'text' },
    {
      name: 'role',
      label: 'Uloga',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      access: { create: adminFieldOnly, update: adminFieldOnly },
      options: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Urednik', value: 'editor' },
      ],
      admin: {
        description:
          'Urednik upravlja proizvodima, kolekcijama, sadržajem i statusima porudžbina, ali ne može da briše porudžbine niti da menja podešavanja prodavnice.',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ req, operation, data }) => {
        // Prvi nalog u sistemu je uvek administrator.
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users', req })
          if (totalDocs === 0) data.role = 'admin'
        }
        return data
      },
    ],
  },
}
