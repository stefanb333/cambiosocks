# Cambio Socks web shop

Next.js 16 storefront i Payload CMS 3 admin u jednom projektu. Baza Postgres (Neon), slike na Cloudflare R2, email preko Resend-a, hosting na Netlify-u.

Status: **Sve faze (1 do 5) završene**: storefront prema Figma dizajnu (statične stranice sa osvežavanjem na zahtev), korpa i checkout (plaćanje pouzećem), emailovi, admin na srpskom (generator varijanti, masovne akcije, CSV uvoz i izvoz u Shopify formatu, admin na telefonu), SEO (sitemap, robots, JSON-LD), migracije i Netlify konfiguracija. Rezultati Lighthouse-a su u DECISIONS.md (D-054). Uputstvo za rad u adminu: [docs/UPUTSTVO.md](docs/UPUTSTVO.md). Plan je u [PLAN.md](PLAN.md), odluke u [DECISIONS.md](DECISIONS.md).

## Lokalno pokretanje

Potrebno: Node.js 20.9 ili noviji.

```bash
npm install
cp .env.example .env        # pa popuni PAYLOAD_SECRET i DATABASE_URL (vidi ispod)
npm run db:local            # lokalni Postgres, ostavi ovaj terminal otvoren
npm run seed                # u drugom terminalu: početni sadržaj i demo katalog
npm run dev                 # http://localhost:3000, admin na /admin
```

- `DATABASE_URL` za lokalnu bazu: `postgres://postgres:postgres@127.0.0.1:54329/cambio`
- Admin nalog: ako su u `.env` postavljeni `SEED_ADMIN_EMAIL` i `SEED_ADMIN_PASSWORD`, seed ga pravi. U suprotnom, prvi nalog se pravi na `/admin` (prvi korisnik je uvek administrator).
- `npm run seed:reset` briše sav sadržaj (osim korisnika) i puni ponovo.
- Bez `S3_BUCKET` slike se čuvaju lokalno u `media/`.

## Skripte

| Komanda | Šta radi |
|---|---|
| `npm run dev` | Razvojni server |
| `npm run build` / `npm start` | Produkcioni build i pokretanje |
| `npm run ci` | Migracije baze pa build (koristi ga Netlify) |
| `npm run migrate:create -- <naziv>` | Nova migracija posle izmene kolekcija |
| `npm run migrate` | Primena migracija na bazu iz `DATABASE_URL` |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript provera |
| `npm run format` / `npm run format:check` | Formatiranje koda (Prettier) / provera formatiranja |
| `npm run generate:types` | Regeneriše `src/payload-types.ts` posle izmene kolekcija |
| `npm run generate:importmap` | Regeneriše import mapu admina posle dodavanja custom komponenti |
| `npm run seed` | Početni sadržaj |
| `npm run demo:db` | Migracije i demo sadržaj u bazu iz `.env.demo.local` (demo na Netlify-u, [docs/DEMO-NETLIFY.md](docs/DEMO-NETLIFY.md)) |
| `npm run db:local` | Lokalni Postgres bez Docker-a |
| `npm run payload -- run scripts/smoke-orders.ts` | Provera logike porudžbina (broj, zaliha, statusi) |
| `npm run payload -- run scripts/smoke-roles.ts` | Provera dozvola za uloge administrator i urednik |
| `npm run payload -- run scripts/update-seo-content.ts` | SEO tekstovi (početna, kolekcije, proizvodi, FAQ, blog) u postojeću bazu, D-063 |
| `npm run payload -- run scripts/update-legal-pages.ts` | Pravne stranice i footer u postojeću bazu, D-061 |
| `npm run payload -- run scripts/replace-catalog.ts` | Katalog klijenta (paketi od 12 pari), recenzije i slike u postojeću bazu, D-075 |
| `npm run payload -- run scripts/update-shipping.ts` | Dostava AKS u Podešavanja prodavnice, D-073 |
| `npm run payload -- run scripts/update-media-files.ts` | Novi fajlovi za postojeće slike, D-070/D-074 |
| `npm run payload -- run scripts/update-social-links.ts` | Instagram i Facebook, popravka linkova u tekstovima, D-080 |
| `node scripts/screens.mjs <putanja> <naziv>` | Snimci na 9 širina u `docs/screenshots/` i provera horizontalnog skrola |
| `node scripts/visual-diff.mjs <url> <figma.png> <naziv>` | Poređenje sa Figma eksportom na 1440px |
| `node scripts/ux-audit.mjs [putanje]` | UX provera na telefonu: mete za dodir, veličina teksta i polja, horizontalni skrol |

## Promenljive okruženja

Sve su opisane u [.env.example](.env.example). Tajne idu samo u `.env` (nije u repou) i u Netlify podešavanja.

| Promenljiva | Obavezna | Opis |
|---|---|---|
| `NEXT_PUBLIC_SERVER_URL` | da | Javna adresa sajta, bez `/` na kraju |
| `PAYLOAD_SECRET` | da | Nasumičan string, najmanje 32 znaka |
| `DATABASE_URL` | da | Postgres connection string (Neon u produkciji) |
| `S3_BUCKET`, `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL` | u produkciji | Cloudflare R2 |
| `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_NOTIFY_TO` | u produkciji | Email. Bez ključa poruke idu u log servera (`[email:dev]`) |
| `REVALIDATE_SECRET` | da | Tajna za ručnu revalidaciju |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | ne | Samo za lokalni seed |
| `SITE_NOINDEX` | ne | `1` = sajt zatvoren za pretraživače (demo); mora biti postavljeno pre build-a |

## Puštanje u rad

### 1. Neon (baza)
1. Na [neon.tech](https://neon.tech) napravi projekat (region Frankfurt, `aws-eu-central-1`).
2. Dashboard > Connection Details: izaberi **Pooled connection** i kopiraj string sa `?sslmode=require`. To je `DATABASE_URL`.
3. Šema se pravi sama pri prvom Netlify build-u (`npm run ci` pokreće migracije). Početni sadržaj: lokalno postavi `DATABASE_URL` na Neon string i pokreni `npm run migrate`, pa `npm run seed`, jednom.

### 2. Cloudflare R2 (slike)
1. Cloudflare > R2 > Create bucket (npr. `cambio-media`).
2. Bucket > Settings > Public access: uključi R2.dev domen ili poveži svoj (npr. `media.cambiosocks.com`). Taj URL je `S3_PUBLIC_URL`.
3. R2 > Manage API tokens > Create token sa dozvolom **Object Read & Write** za taj bucket. Dobijaš `S3_ACCESS_KEY_ID` i `S3_SECRET_ACCESS_KEY`.
4. `S3_ENDPOINT` je `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`, `S3_REGION=auto`, `S3_BUCKET` je ime bucketa.

### 3. Resend (email)
1. Na [resend.com](https://resend.com) dodaj domen (Domains > Add) i upiši DNS zapise (SPF, DKIM) kod registra domena. Sačekaj status **Verified**.
2. API Keys > Create (dozvola Sending access). To je `RESEND_API_KEY`.
3. `EMAIL_FROM`, npr. `Cambio <porudzbine@cambiosocks.com>` (adresa sa verifikovanog domena).
4. `EMAIL_NOTIFY_TO`: adresa na koju stižu nove porudžbine i kontakt poruke. Može i u adminu: Podešavanja prodavnice > Email adrese za nove porudžbine (ima prednost).

### 4. Netlify (hosting)
1. Postavi kod na GitHub i u Netlify-u izaberi Add new site > Import from Git.
2. Build podešavanja čita iz [netlify.toml](netlify.toml) (`npm run ci`, Node 22). Ništa ne menjaj ručno.
3. Site configuration > Environment variables: unesi sve promenljive iz tabele iznad. `NEXT_PUBLIC_SERVER_URL` je konačna adresa (npr. `https://cambiosocks.com`). `PAYLOAD_SECRET` i `REVALIDATE_SECRET` generiši komandom iz `.env.example`.
4. Domain management: dodaj domen i uključi HTTPS.
5. Posle prvog deploy-a otvori `/admin` i napravi prvi nalog (postaje administrator), ako seed nije pravio nalog.

### Pre puštanja u rad
- Admin > Podešavanja prodavnice: kontakt podaci, cena dostave, rok isporuke, emailovi za obaveštenja, Instagram i Facebook linkovi.
- Admin > Stranice: proveri tekst Uslova korišćenja, Privatnosti, Dostave i Reklamacija i potvrdi stavke sa liste u DECISIONS.md (D-061). Postojeća baza: `npm run payload -- run scripts/update-legal-pages.ts`.
- Napravi probnu porudžbinu i proveri da su stigla oba emaila (kupcu i prodavnici), pa je u adminu otkaži.

Uputstvo za klijenta (rad u adminu): [docs/UPUTSTVO.md](docs/UPUTSTVO.md).

### Prelazak sa Shopify-ja
U Shopify adminu: Products > Export > All products, CSV for Excel. U Cambio adminu: Proizvodi > **Uvezi CSV** (uključeno "Uvezi i slike"), pregledaj proveru, pa **Uvezi**. Detalji u D-045 i D-046.

## Struktura

```
src/
  app/(frontend)/     storefront (layout, stranice, globals.css sa tokenima)
  app/(payload)/      Payload admin i API (generisano)
  collections/        Products, Variants, ShopCollections, Orders, Customers, Discounts,
                      Subscribers, Pages, Posts, Media, Users
  globals/            Header, Footer, PromoBar, HomePage, ShopSettings
  blocks/             blokovi za statične stranice
  lib/                katalog, cene korpe, porudžbine (zaliha), email (Resend), plaćanja (PaymentProvider)
  migrations/         Payload migracije za produkcijsku bazu
  seed/               seed skripta, sadržaj i slike
scripts/              lokalna baza, smoke testovi, snimci ekrana, poređenje sa Figmom
reference-shopify-theme/   stara Shopify tema (samo referenca)
docs/figma/           Figma eksporti stranica (1440px)
docs/screenshots/     snimci sajta na 9 širina (360 do 2560)
```
