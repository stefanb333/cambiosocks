import { NextResponse } from 'next/server'
import { ACCESS_COOKIE, accessToken } from '@/lib/maintenance'

/**
 * Otključavanje kapije održavanja: proverava šifru iz forme prema SITE_PASSWORD. Na tačnu šifru
 * postavlja kolačić pristupa i vraća na početnu; na pogrešnu vraća na stranicu održavanja sa greškom.
 */
export async function POST(req: Request) {
  const password = process.env.SITE_PASSWORD
  const origin = new URL(req.url).origin
  const form = await req.formData()
  const entered = String(form.get('sifra') ?? '')

  if (password && entered === password) {
    const res = NextResponse.redirect(`${origin}/`, { status: 303 })
    res.cookies.set(ACCESS_COOKIE, await accessToken(password), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
    return res
  }

  return NextResponse.redirect(`${origin}/?greska=1`, { status: 303 })
}
