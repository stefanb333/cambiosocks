import { NextResponse, type NextRequest } from 'next/server'
import { ACCESS_COOKIE, accessToken, maintenanceHtml } from '@/lib/maintenance'

/**
 * Kapija održavanja (D-093). Kada je postavljena promenljiva SITE_PASSWORD, posetioci bez važećeg
 * kolačića vide stranicu održavanja (503); sa šifrom dobijaju kolačić i pristup. Bez te promenljive
 * kapija je ugašena i sajt radi normalno. Admin (/admin) i API ostaju otvoreni da klijent nastavi
 * rad u adminu i da ruta za otključavanje bude dostupna.
 */
function isOpen(path: string): boolean {
  return (
    path.startsWith('/_next') ||
    path.startsWith('/admin') ||
    path.startsWith('/api') ||
    path.startsWith('/figma') ||
    path.startsWith('/google') || // verifikacija za Google Search Console
    path === '/favicon.ico' ||
    path === '/robots.txt' ||
    path === '/sitemap.xml' ||
    path === '/llms.txt'
  )
}

export async function middleware(req: NextRequest) {
  const password = process.env.SITE_PASSWORD
  if (!password) return NextResponse.next()

  const { pathname, searchParams } = req.nextUrl
  if (isOpen(pathname)) return NextResponse.next()

  const token = req.cookies.get(ACCESS_COOKIE)?.value
  if (token && token === (await accessToken(password))) return NextResponse.next()

  return new NextResponse(maintenanceHtml({ error: searchParams.get('greska') === '1' }), {
    status: 503,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'retry-after': '3600',
    },
  })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
