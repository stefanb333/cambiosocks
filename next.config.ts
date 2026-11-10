import path from 'path'
import { fileURLToPath } from 'url'
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

// Javni R2 domen za slike (npr. https://media.cambiosocks.com), vidi .env.example.
const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = []
if (process.env.S3_PUBLIC_URL) {
  const url = new URL(process.env.S3_PUBLIC_URL)
  remotePatterns.push({
    protocol: url.protocol.replace(':', '') as 'https' | 'http',
    hostname: url.hostname,
    pathname: '/**',
  })
}

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 80, 85],
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1200, 1440, 1920, 2560, 2880],
    imageSizes: [96, 128, 256, 320, 384],
    localPatterns: [{ pathname: '/api/media/file/**' }],
    remotePatterns,
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
  // Bez "X-Powered-By: Next.js" (ne otkrivamo tehnologiju sajta).
  poweredByHeader: false,
  async headers() {
    // Bezbednosna zaglavlja na svim odgovorima, i na stranicama koje pravi server (D-080).
    // netlify.toml ih dodaje samo statičnim fajlovima, pa checkout i admin bez ovoga nisu
    // zaštićeni od ugrađivanja u tuđi okvir (clickjacking).
    const security = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ]
    // Demo ili probni sajt (SITE_NOINDEX=1, D-069): nijedna stranica ne ulazi u Google, čak ni
    // ako neko negde objavi link.
    if (process.env.SITE_NOINDEX === '1')
      security.push({ key: 'X-Robots-Tag', value: 'noindex, nofollow' })
    return [
      { source: '/:path*', headers: security },
      // Admin nikad ne ulazi u Google, ni na pravom domenu.
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
