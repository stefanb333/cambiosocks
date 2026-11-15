/**
 * Održavanje sajta (kapija pod šifrom). Kada je postavljena promenljiva SITE_PASSWORD, middleware
 * prikazuje stranicu održavanja svima koji nemaju važeći kolačić pristupa. Šifra se nikad ne piše u
 * kod (repozitorijum je javan) — stoji samo u Netlify promenljivoj SITE_PASSWORD. Kolačić čuva heš
 * šifre (ne samu šifru), isti ga računaju i middleware i ruta za otključavanje.
 */
export const ACCESS_COOKIE = 'cambio_pristup'

/** SHA-256 heš šifre (Web Crypto radi i na edge-u i u Node-u). */
export async function accessToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`cambio-odrzavanje:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Potpuna HTML stranica održavanja (bez spoljnih fajlova, pa radi i kad je sve ostalo zatvoreno). */
export function maintenanceHtml({ error = false }: { error?: boolean } = {}): string {
  const errorBox = error
    ? `<p class="err" role="alert">Pogrešna šifra. Pokušajte ponovo.</p>`
    : ''
  return `<!doctype html>
<html lang="sr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>Uskoro se vraćamo — Cambio Socks</title>
<style>
  :root { --primary: #0462cd; --primary-dark: #0051ad; --ink: #0f0f0f; }
  * { box-sizing: border-box; }
  html, body { height: 100%; margin: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: var(--ink); background: #f3f4f6;
    display: flex; align-items: center; justify-content: center;
    padding: 24px; padding-top: max(24px, env(safe-area-inset-top));
    padding-bottom: max(24px, env(safe-area-inset-bottom)); line-height: 1.5;
  }
  .card {
    width: 100%; max-width: 440px; background: #fff; border-radius: 24px;
    padding: 40px 32px; text-align: center;
    box-shadow: 0 10px 40px rgba(15,15,15,0.08); border: 1px solid #ececf0;
  }
  .brand { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; color: var(--ink); }
  .brand span { color: var(--primary); }
  .dotrow { display: flex; gap: 6px; justify-content: center; margin: 18px 0 22px; }
  .dotrow i { width: 8px; height: 8px; border-radius: 50%; background: var(--primary); opacity: .25; animation: p 1.2s ease-in-out infinite; }
  .dotrow i:nth-child(2){ animation-delay: .2s } .dotrow i:nth-child(3){ animation-delay: .4s }
  @keyframes p { 0%,100%{opacity:.25;transform:translateY(0)} 50%{opacity:1;transform:translateY(-4px)} }
  h1 { font-size: 24px; margin: 0 0 10px; letter-spacing: -0.01em; }
  p.lead { font-size: 16px; color: #3f3f46; margin: 0 auto; max-width: 340px; }
  .staff { margin-top: 30px; padding-top: 24px; border-top: 1px solid #ececf0; }
  .staff label { display: block; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: #8a8a93; margin-bottom: 10px; }
  form { display: flex; gap: 8px; }
  input {
    flex: 1 1 auto; min-width: 0; font-size: 16px; padding: 12px 14px;
    border: 1px solid #d4d4d8; border-radius: 12px; outline-offset: 2px;
  }
  input:focus-visible { outline: 2px solid var(--primary); border-color: var(--primary); }
  button {
    flex: 0 0 auto; font-size: 15px; font-weight: 600; color: #fff; background: var(--primary);
    border: 0; border-radius: 12px; padding: 12px 20px; cursor: pointer;
  }
  button:hover { background: var(--primary-dark); }
  .err { color: #b91c1c; font-size: 14px; margin: 14px 0 0; }
</style>
</head>
<body>
  <main class="card">
    <div class="brand">Cambio <span>Socks</span></div>
    <div class="dotrow" aria-hidden="true"><i></i><i></i><i></i></div>
    <h1>Uskoro se vraćamo</h1>
    <p class="lead">Izvinjavamo se — trenutno radimo na unapređenju sajta i brzo se vraćamo. Hvala na strpljenju.</p>
    <div class="staff">
      <label for="sifra">Pristup za saradnike</label>
      <form method="post" action="/api/otkljucaj">
        <input id="sifra" name="sifra" type="password" autocomplete="current-password" placeholder="Šifra" aria-label="Šifra" required>
        <button type="submit">Uđi</button>
      </form>
      ${errorBox}
    </div>
  </main>
</body>
</html>`
}
