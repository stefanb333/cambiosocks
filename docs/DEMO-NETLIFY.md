# Demo sajt na Netlify-u (za prikaz klijentu)

Cilj: sajt na adresi kao `https://cambio-carape-demo.netlify.app`, sa demo katalogom, adminom i porudžbinama, zatvoren za Google. Za demo su potrebni **besplatni nalozi**: GitHub (kod, privatan repozitorijum), Netlify (sajt) i Supabase (baza i slike). Produkcija kasnije može na drugi hosting (D-069).

Šta demo **ne radi**: emailovi se ne šalju (porudžbine i recenzije rade, poruke idu u log servera). Proizvodi, slike i recenzije su demo. Besplatna Supabase baza se pauzira posle 7 dana bez posete: tada je u Supabase panelu treba ponovo pokrenuti ("Restore project").

## 1. Supabase: baza i slike

1. Otvori nalog na [supabase.com](https://supabase.com) i napravi projekat:
   - Name: `cambio-demo`
   - Database password: jaka lozinka, sačuvaj je (treba u koraku 3)
   - Region: **Central EU (Frankfurt)**
2. **Adresa baze**: dugme **Connect** na vrhu projekta. Trebaju dve adrese:
   - **Session pooler** (port `5432`): za pripremu baze sa računara (korak 3)
   - **Transaction pooler** (port `6543`): za Netlify (korak 4)

   Na kraj obe adrese dodaj `?sslmode=require&uselibpqcompat=true` (šifrovana veza) i umesto `[YOUR-PASSWORD]` upiši lozinku baze.
3. **Slike**: Storage > New bucket
   - Name: `cambio-media`
   - **Public bucket: uključeno**
4. **Ključ za slike**: Storage > Settings > **S3 Connection**
   - zapiši **Endpoint** i **Region**
   - "New access key": zapiši **Access key ID** i **Secret access key** (secret se prikazuje samo jednom)
5. Javna adresa slika je: `https://<ref>.supabase.co/storage/v1/object/public/cambio-media`, gde je `<ref>` deo adrese projekta (vidi se u Endpoint-u i u adresi Supabase panela).

## 2. Tajne

Dva nasumična stringa (za `PAYLOAD_SECRET` i `REVALIDATE_SECRET`), svaki se pravi ovom komandom:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. Priprema baze sa računara (tabele, admin, demo sadržaj)

U korenu projekta napravi fajl `.env.demo.local` (ne ide u git):

```
NEXT_PUBLIC_SERVER_URL=https://cambio-carape-demo.netlify.app
PAYLOAD_SECRET=<prvi nasumični string>
DATABASE_URL=<Session pooler adresa, port 5432, sa ?sslmode=require&uselibpqcompat=true>
S3_BUCKET=cambio-media
S3_ENDPOINT=<Endpoint iz S3 Connection>
S3_REGION=<Region iz S3 Connection, npr. eu-central-1>
S3_ACCESS_KEY_ID=<Access key ID>
S3_SECRET_ACCESS_KEY=<Secret access key>
S3_PUBLIC_URL=https://<ref>.supabase.co/storage/v1/object/public/cambio-media
SEED_ADMIN_EMAIL=<email za admin nalog>
SEED_ADMIN_PASSWORD=<jaka lozinka za admin>
```

Zatim:

```bash
npm run demo:db
```

Komanda pravi sve tabele (migracije), admin nalog i demo sadržaj, a slike otprema u Supabase. Na kraju piše `Seed završen. media: 26, ... products: 6 ...`. Ponovno pokretanje ne duplira sadržaj.

## 4. Netlify: sajt preko GitHub-a

Build mora da se radi na Netlify-u (Linux), ne na Windows računaru: Payload pri pokretanju učitava `sharp` (obrada slika), a build sa Windows-a bi poslao Windows verziju i sajt na Netlify-u ne bi radio. Zato kod ide preko privatnog GitHub repozitorijuma.

1. **GitHub**: na [github.com/new](https://github.com/new) napravi **privatan** repozitorijum (npr. `cambio-socks-web`) **bez** README-a, .gitignore-a i licence (prazan). Projekat već ima commit na grani `main`, pa u korenu projekta:

   Jednom, ako git javlja "detected dubious ownership" (projekat je na spoljnom disku D:):

```bash
git config --global --add safe.directory D:/WEB/cambio-socks-web
```

```bash
git remote add origin https://github.com/<nalog>/cambio-socks-web.git
```

```bash
git push -u origin main
```

   Pri prvom push-u Windows otvara prijavu na GitHub u pregledaču. `.env`, `.env.demo.local`, `media/`, `node_modules/` i snimci iz provera (`docs/screenshots`, `docs/diff`) ne idu u git (`.gitignore`).
2. **Netlify**: otvori nalog na [netlify.com](https://www.netlify.com) (može prijava preko GitHub-a) > **Add new project > Import an existing project > GitHub** > izaberi repozitorijum. Build podešavanja se čitaju iz `netlify.toml` (komanda `npm run ci`: migracije pa build), ne menjaj ih.
3. **Pre prvog build-a**, na istom ekranu (ili Site configuration > Environment variables > **Import from a .env file**) nalepi promenljive:

```
NEXT_PUBLIC_SERVER_URL=https://cambio-carape-demo.netlify.app
PAYLOAD_SECRET=<isti kao u .env.demo.local>
DATABASE_URL=<Transaction pooler adresa, port 6543, sa ?sslmode=require&uselibpqcompat=true>
S3_BUCKET=cambio-media
S3_ENDPOINT=<isto>
S3_REGION=<isto>
S3_ACCESS_KEY_ID=<isto>
S3_SECRET_ACCESS_KEY=<isto>
S3_PUBLIC_URL=<isto>
REVALIDATE_SECRET=<drugi nasumični string>
SITE_NOINDEX=1
```

   `SITE_NOINDEX=1` zatvara demo za Google (zaglavlje `noindex` na svim stranicama i `Disallow: /` u robots.txt). Na pravom sajtu ga nema.
4. **Ime sajta**: Site configuration > Change site name > `cambio-carape-demo` (ako je zauzeto, izaberi drugo i isto ime upiši u `NEXT_PUBLIC_SERVER_URL`, ovde i u `.env.demo.local`).
5. **Deploy**: Deploys > Trigger deploy. Build traje nekoliko minuta; posle toga svaki `git push` sam objavljuje novu verziju.

## 5. Provera

- Sajt: početna, kolekcija, proizvod, pretraga, korpa, porudžbina pouzećem (porudžbina se vidi u adminu).
- Admin: `https://cambio-carape-demo.netlify.app/admin`, nalog iz `SEED_ADMIN_EMAIL`.
- `https://cambio-carape-demo.netlify.app/robots.txt` mora da prikaže `Disallow: /`.

Izmene u kodu: `git push`, Netlify sam pravi novu verziju. Izmene sadržaja u adminu se vide odmah, bez nove objave.

## Česti problemi

| Problem | Rešenje |
|---|---|
| `self-signed certificate in certificate chain` | Adresi baze nedostaje `?sslmode=require&uselibpqcompat=true` |
| `password authentication failed` | Pogrešna lozinka baze u adresi; posebne znakove u lozinki (`@`, `#`, `/`) treba kodirati ili izabrati lozinku bez njih |
| Slike se ne vide | Bucket nije "Public" ili `S3_PUBLIC_URL` ne odgovara imenu bucketa |
| Sajt ne radi posle nekoliko dana | Supabase je pauzirao besplatni projekat: Supabase panel > "Restore project" |
| Build pada sa `JavaScript heap out of memory` | U `netlify.toml` povećati `--max-old-space-size` (sada 4096; lokalno proveren build sa 4096 prolazi) |
