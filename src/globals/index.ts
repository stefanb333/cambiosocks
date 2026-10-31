import { adminOnly, anyone, isAdmin, staffOnly } from '@/access'
import { linkFields } from '@/fields/link'
import { revalidate } from '@/hooks/revalidate'
import type { GlobalConfig } from 'payload'

const afterChangeRevalidate =
  (tag: string): NonNullable<NonNullable<GlobalConfig['hooks']>['afterChange']>[number] =>
  async ({ doc, req }) => {
    await revalidate(req, { tags: [tag] })
    return doc
  }

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Zaglavlje (meni)',
  admin: { group: 'Sajt' },
  access: { read: anyone, update: staffOnly },
  fields: [
    {
      name: 'navItems',
      label: 'Stavke menija',
      type: 'array',
      maxRows: 8,
      labels: { singular: 'Stavka', plural: 'Stavke' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              label: 'Tekst',
              type: 'text',
              required: true,
              admin: { width: '50%' },
            },
            { name: 'url', label: 'Adresa', type: 'text', admin: { width: '50%' } },
          ],
        },
        {
          name: 'showCollections',
          label: 'Podmeni sa kolekcijama',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Automatski prikazuje kolekcije označene za meni (stavka "Kategorije").',
          },
        },
        {
          name: 'children',
          label: 'Podmeni (ručno)',
          type: 'array',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'label',
                  label: 'Tekst',
                  type: 'text',
                  required: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'url',
                  label: 'Adresa',
                  type: 'text',
                  required: true,
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'searchPlaceholder',
      label: 'Tekst u polju pretrage',
      type: 'text',
      defaultValue: 'Pretraži proizvode',
    },
  ],
  hooks: { afterChange: [afterChangeRevalidate('global:header')] },
}

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Podnožje',
  admin: { group: 'Sajt' },
  access: { read: anyone, update: staffOnly },
  fields: [
    { name: 'heading', label: 'Naslov', type: 'text', defaultValue: 'Dobrodošli u Cambio svet' },
    {
      name: 'emailPlaceholder',
      label: 'Tekst u polju za email',
      type: 'text',
      defaultValue: 'Vaša e-mail adresa',
    },
    { name: 'buttonLabel', label: 'Tekst dugmeta', type: 'text', defaultValue: 'Prijavi se' },
    { name: 'newsletterNote', label: 'Tekst ispod prijave', type: 'text' },
    {
      name: 'groups',
      label: 'Grupe linkova',
      type: 'array',
      maxRows: 4,
      fields: [
        { name: 'heading', label: 'Naslov grupe', type: 'text', required: true },
        {
          name: 'links',
          label: 'Linkovi',
          type: 'array',
          fields: linkFields('link', 'Link', false).fields,
        },
      ],
    },
    {
      name: 'legalLinks',
      label: 'Pravni linkovi',
      type: 'array',
      fields: linkFields('link', 'Link', false).fields,
    },
    {
      name: 'copyright',
      label: 'Copyright',
      type: 'text',
      defaultValue: '© 2026 Cambio. Sva prava zadržana.',
    },
    { name: 'location', label: 'Lokacija', type: 'text', defaultValue: 'Novi Pazar · Srbija' },
  ],
  hooks: { afterChange: [afterChangeRevalidate('global:footer')] },
}

export const PromoBar: GlobalConfig = {
  slug: 'promo-bar',
  label: 'Promo traka',
  admin: { group: 'Sajt' },
  access: { read: anyone, update: staffOnly },
  fields: [
    { name: 'enabled', label: 'Prikaži traku', type: 'checkbox', defaultValue: false },
    { name: 'text', label: 'Tekst', type: 'text', maxLength: 90 },
    { name: 'url', label: 'Link (opciono)', type: 'text' },
    {
      name: 'theme',
      label: 'Boja',
      type: 'select',
      defaultValue: 'blue',
      options: [
        { label: 'Plava', value: 'blue' },
        { label: 'Žuta', value: 'yellow' },
        { label: 'Crna', value: 'black' },
      ],
    },
  ],
  hooks: { afterChange: [afterChangeRevalidate('global:promo-bar')] },
}

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Početna stranica',
  admin: { group: 'Sajt' },
  access: { read: anyone, update: staffOnly },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          name: 'hero',
          fields: [
            { name: 'heading', label: 'Naslov', type: 'text', required: true },
            { name: 'subheading', label: 'Podnaslov', type: 'textarea' },
            {
              name: 'image',
              label: 'Slika (računar)',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Obavezna za prikaz hero sekcije. Preporučeno najmanje 2880px širine.',
              },
            },
            {
              name: 'mobileImage',
              label: 'Slika (telefon, uspravna)',
              type: 'upload',
              relationTo: 'media',
            },
            linkFields('primaryCta', 'Glavno dugme'),
            linkFields('secondaryCta', 'Drugo dugme'),
          ],
        },
        {
          label: 'Kategorije',
          name: 'categories',
          fields: [
            { name: 'heading', label: 'Naslov', type: 'text' },
            { name: 'subheading', label: 'Podnaslov', type: 'textarea' },
            {
              name: 'cards',
              label: 'Kartice',
              type: 'array',
              maxRows: 6,
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'tag1', label: 'Oznaka 1', type: 'text', admin: { width: '33%' } },
                    { name: 'tag2', label: 'Oznaka 2', type: 'text', admin: { width: '33%' } },
                    {
                      name: 'theme',
                      label: 'Boja kartice',
                      type: 'select',
                      defaultValue: 'light',
                      admin: { width: '33%' },
                      options: [
                        { label: 'Bež', value: 'light' },
                        { label: 'Plava', value: 'blue' },
                      ],
                    },
                  ],
                },
                {
                  name: 'tagTheme',
                  label: 'Boja oznaka',
                  type: 'select',
                  defaultValue: 'blue',
                  options: [
                    { label: 'Plava', value: 'blue' },
                    { label: 'Žuta', value: 'yellow' },
                    { label: 'Tamnoplava', value: 'dark-blue' },
                  ],
                },
                { name: 'title', label: 'Naslov', type: 'text', required: true },
                { name: 'text', label: 'Tekst', type: 'textarea' },
                { name: 'image', label: 'Slika', type: 'upload', relationTo: 'media' },
                linkFields('cta', 'Dugme'),
              ],
            },
          ],
        },
        {
          label: 'Izdvojeni proizvodi',
          name: 'featured',
          fields: [
            { name: 'heading', label: 'Naslov', type: 'text' },
            { name: 'note', label: 'Tekst ispod', type: 'textarea' },
            {
              name: 'buttonLabel',
              label: 'Tekst dugmeta na kartici',
              type: 'text',
              defaultValue: 'Dodaj u Korpu',
            },
            {
              name: 'colorsLabel',
              label: 'Tekst ispod boja',
              type: 'text',
              defaultValue: 'Dostupne Boje',
            },
            {
              name: 'products',
              label: 'Proizvodi',
              type: 'relationship',
              relationTo: 'products',
              hasMany: true,
              maxRows: 8,
            },
          ],
        },
        {
          label: 'CTA baner',
          name: 'ctaBanner',
          fields: [
            { name: 'headingLine1', label: 'Naslov, prvi red', type: 'text' },
            { name: 'headingLine2', label: 'Naslov, drugi red', type: 'text' },
            { name: 'text', label: 'Tekst', type: 'textarea' },
            { name: 'image', label: 'Pozadinska slika', type: 'upload', relationTo: 'media' },
            {
              name: 'pillImage',
              label: 'Mala slika u naslovu',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'collectionImage',
              label: 'Pozadinska slika na stranici kolekcije',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Isti baner se prikazuje ispod proizvoda u kolekciji, sa ovom slikom.',
              },
            },
            linkFields('cta', 'Dugme'),
          ],
        },
        {
          label: 'Recenzije',
          name: 'reviews',
          fields: [
            { name: 'heading', label: 'Naslov', type: 'text' },
            { name: 'subheading', label: 'Podnaslov', type: 'text' },
            // Kartice su odobrene recenzije kupaca (Prodaja > Recenzije, "Prikaži na početnoj"), D-068.
            linkFields('topCta', 'Dugme gore'),
            {
              name: 'formButtonLabel',
              label: 'Dugme dole (otvara formu za recenziju)',
              type: 'text',
              defaultValue: 'Ostavi Recenziju',
            },
          ],
          description:
            'Kartice su odobrene recenzije kupaca iz Prodaja > Recenzije: prvo one sa oznakom "Prikaži na početnoj", pa najnovije sa ocenom 4 ili 5 (najviše 6).',
        },
        {
          label: 'Newsletter',
          name: 'newsletter',
          fields: [
            { name: 'heading', label: 'Naslov', type: 'text' },
            { name: 'subheading', label: 'Podnaslov', type: 'text' },
            { name: 'placeholder', label: 'Tekst u polju', type: 'text' },
            {
              name: 'note',
              label: 'Tekst ispod',
              type: 'text',
              admin: { description: 'Deo teksta između ** ** prikazuje se žutom bojom.' },
            },
            { name: 'image', label: 'Pozadinska slika', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
  ],
  hooks: { afterChange: [afterChangeRevalidate('global:home-page')] },
}

export const ShopSettings: GlobalConfig = {
  slug: 'shop-settings',
  label: 'Podešavanja prodavnice',
  admin: {
    group: 'Podešavanja',
    hidden: ({ user }) => (user as { role?: string } | null)?.role !== 'admin',
  },
  access: { read: adminOnly, update: ({ req }) => isAdmin({ req }) },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Dostava',
          fields: [
            {
              name: 'shippingPrice',
              label: 'Cena dostave (RSD)',
              type: 'number',
              required: true,
              defaultValue: 300,
              min: 0,
            },
            {
              name: 'freeShippingThreshold',
              label: 'Besplatna dostava od (RSD)',
              type: 'number',
              min: 0,
              admin: { description: 'Prazno = besplatna dostava je isključena.' },
            },
            {
              name: 'deliveryEstimate',
              label: 'Rok isporuke',
              type: 'text',
              defaultValue: '1 do 3 radna dana',
            },
            {
              name: 'countries',
              label: 'Države za dostavu',
              type: 'text',
              hasMany: true,
              defaultValue: ['Srbija'],
            },
          ],
        },
        {
          label: 'Obaveštenja',
          fields: [
            {
              name: 'notifyEmails',
              label: 'Email adrese za nove porudžbine',
              type: 'text',
              hasMany: true,
              admin: {
                description: 'Ako je prazno, koristi se EMAIL_NOTIFY_TO iz podešavanja servera.',
              },
              validate: (value: string[] | null | undefined) =>
                !value?.length ||
                value.every((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) ||
                'Unesite ispravne email adrese.',
            },
            {
              name: 'newsletterDiscountCode',
              label: 'Kod za popust za nove pretplatnike',
              type: 'text',
              defaultValue: 'DOBRODOSLI10',
            },
          ],
        },
        {
          label: 'Kontakt',
          fields: [
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'phone', label: 'Telefon', type: 'text' },
            { name: 'address', label: 'Adresa', type: 'text' },
            { name: 'hours', label: 'Radno vreme', type: 'text' },
            { name: 'instagram', label: 'Instagram URL', type: 'text' },
            { name: 'facebook', label: 'Facebook URL', type: 'text' },
          ],
        },
        {
          label: 'Proizvodi',
          fields: [
            {
              name: 'defaultCare',
              label: 'Opšte uputstvo za održavanje',
              type: 'textarea',
            },
            {
              name: 'shippingInfo',
              label: 'Tekst "Dostava i zamena" na stranici proizvoda',
              type: 'textarea',
            },
            {
              name: 'lowStockThreshold',
              label: 'Prag za nisku zalihu (kom)',
              type: 'number',
              defaultValue: 5,
            },
          ],
        },
      ],
    },
  ],
  hooks: { afterChange: [afterChangeRevalidate('global:shop-settings')] },
}

export const globals = [Header, Footer, PromoBar, HomePage, ShopSettings]
