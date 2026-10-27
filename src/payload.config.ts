import path from 'path'
import { fileURLToPath } from 'url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { rsLatin } from '@payloadcms/translations/languages/rsLatin'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { Customers } from './collections/Customers'
import { Discounts } from './collections/Discounts'
import { Media } from './collections/Media'
import { Orders } from './collections/Orders'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Products } from './collections/Products'
import { Reviews } from './collections/Reviews'
import { ShopCollections } from './collections/ShopCollections'
import { Subscribers } from './collections/Subscribers'
import { Users } from './collections/Users'
import { Variants } from './collections/Variants'
import { globals } from './globals'
import { resendRestAdapter } from './lib/email/payload-adapter'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const useS3 = Boolean(process.env.S3_BUCKET)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    // Cambio tema admina (D-059): fontovi, logo, pregled prodavnice; stilovi u app/(payload)/custom.scss
    components: {
      graphics: {
        Logo: '@/components/admin/Branding#Logo',
        Icon: '@/components/admin/Branding#Icon',
      },
      providers: ['@/components/admin/AdminTheme#AdminTheme'],
      beforeNavLinks: ['@/components/admin/Branding#NavBrand'],
      beforeDashboard: ['@/components/admin/Dashboard#Dashboard'],
    },
    meta: {
      titleSuffix: ' | Cambio admin',
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/favicon.svg' }],
    },
    dateFormat: 'd. MMM yyyy. HH:mm',
  },
  i18n: {
    supportedLanguages: { 'rs-latin': rsLatin },
    fallbackLanguage: 'rs-latin',
    // Polje za pretragu u listama: "Pretraga: Naziv, URL (slug) ili Opis i tagovi".
    translations: {
      'rs-latin': {
        // "Kreiraj novo Porudžbina" i "Kreiranje novog Proizvod" ne slažu rod; ovako važi za svaki naziv.
        general: {
          searchBy: 'Pretraga: {{label}}',
          or: 'ili',
          createNew: 'Dodaj',
          createNewLabel: 'Dodaj: {{label}}',
          creatingNewLabel: 'Novi unos: {{label}}',
        },
        version: { publish: 'Objavi', publishChanges: 'Objavi izmene' },
      },
    },
  },
  collections: [
    Products,
    Variants,
    ShopCollections,
    Orders,
    Customers,
    Discounts,
    Subscribers,
    Reviews,
    Pages,
    Posts,
    Media,
    Users,
  ],
  globals,
  editor: lexicalEditor(),
  email: resendRestAdapter,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    // Lokalno se šema sinhronizuje automatski; u produkciji se koriste migracije.
    push: process.env.NODE_ENV !== 'production',
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  plugins: [
    s3Storage({
      enabled: useS3,
      // Kolone za skladište (prefix, _objectKey) postoje i bez S3 (lokalno), pa su šema i
      // migracije iste u svim okruženjima (D-069).
      alwaysInsertFields: true,
      collections: {
        media: {
          prefix: 'media',
          // Javni R2 URL: storefront i next/image čitaju slike direktno sa R2/CDN-a.
          generateFileURL: ({ filename, prefix }) =>
            `${process.env.S3_PUBLIC_URL}/${prefix ? `${prefix}/` : ''}${filename}`,
        },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'auto',
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  ],
})
