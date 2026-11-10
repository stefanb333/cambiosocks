# Puštanje sajta u rad (klijentov Netlify i pravi domen)

Kontrolna lista za prelazak sa demo sajta (cambiocarape.netlify.app) na klijentov Netlify nalog i
pravi domen. Redom, bez preskakanja. Tajne se unose samo u Netlify, nikad u kod.

## 1. Netlify: novi sajt iz GitHub repozitorijuma

- Import from Git, grana `main`. Build komanda i podešavanja su u `netlify.toml` (`npm run ci`:
  migracije baze pa build), ne menjati ih u interfejsu.
- Ako Netlify javi "unrecognized Git contributor" (besplatni plan), vlasnik naloga pokreće
  deploy ručno: Deploys > Trigger deploy > Deploy site, ili dodaje saradnika na plan.

## 2. Environment variables (Project configuration > Environment variables)

| Promenljiva | Vrednost na pravom sajtu |
|---|---|
| `NEXT_PUBLIC_SERVER_URL` | `https://pravi-domen.rs` (bez kose crte na kraju). Od nje zavise canonical, sitemap, linkovi u mejlovima i kolačić za admin. |
| `PAYLOAD_SECRET` | nova nasumična vrednost, najmanje 32 znaka (ne ista kao na demo sajtu) |
| `DATABASE_URL` | baza koju koristi pravi sajt (pooled konekcija, `sslmode=require`) |
| `S3_BUCKET`, `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL` | skladište slika (R2 ili Supabase Storage) |
| `S3_CLIENT_UPLOADS` | `1` tek kad je podešen CORS iz tačke 3 (inače ostaviti prazno) |
| `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_NOTIFY_TO` | slanje mejlova; domen pošiljaoca mora biti verifikovan u Resend-u |
| `REVALIDATE_SECRET` | nova nasumična vrednost |
| `SITE_NOINDEX` | **prazno** (sa `1` sajt je sakriven od Google-a, to je samo za demo) |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | ne postavljati na pravom sajtu |

## 3. Slike: upload direktno iz admina (CORS na bucketu)

Netlify funkcija prima najviše oko 6 MB po zahtevu, a fotografije sa aparata su često veće. Sa
`S3_CLIENT_UPLOADS=1` admin šalje sliku direktno u skladište, pa limit ne važi (D-091). Za to
bucket mora da dozvoli upload sa domena sajta. Cloudflare R2 > bucket > Settings > CORS policy:

```json
[
  {
    "AllowedOrigins": ["https://pravi-domen.rs", "https://www.pravi-domen.rs"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["content-type", "content-length", "if-none-match"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Posle toga postaviti `S3_CLIENT_UPLOADS=1` i ponovo objaviti (Trigger deploy). Provera: u adminu
dodati sliku veću od 6 MB; mora da se sačuva za nekoliko sekundi. Admin svaku sliku čuva najviše
2400 px i kao WebP, a jedna slika ne sme biti veća od 20 MB.

## 4. Domen

- Netlify > Domain management > Add domain, pa DNS zapise kod registra po uputstvu Netlify-a.
- HTTPS (Let's Encrypt) se uključuje sam kad DNS proradi; sačekati zeleni status pre objave.
- Ako se koristi i `www`, jedan od dva oblika postaviti kao glavni (drugi preusmerava).

## 5. Posle prvog deploya

1. Otvoriti `/admin`, prijaviti se i proveriti: lista proizvoda, izmena slike, čuvanje.
2. U Podešavanjima prodavnice upisati adresu za obaveštenja o porudžbinama.
3. Probna porudžbina na pravom domenu (pouzeće), proveriti mejl kupcu i prodavnici, pa je u
   adminu otkazati.
4. `https://pravi-domen.rs/robots.txt` i `/sitemap.xml` moraju imati pravi domen, ne localhost ili
   netlify.app adresu.
5. Google Search Console: dodati domen i poslati `/sitemap.xml`.

## Poznato i prihvaćeno

- Zaliha se skida kad se porudžbina u adminu potvrdi (ne pri slanju porudžbine), a vraća pri
  otkazivanju. Do potvrde, isti poslednji komad mogu da poruče dva kupca.
- Limit pokušaja na formama (checkout, kontakt, recenzije) važi po instanci Netlify funkcije, pa je
  osnovna zaštita uz honeypot i serversku validaciju, ne strogi limit.
- `npm audit` prijavljuje ranjivosti u alatima za migracije (esbuild, drizzle-kit) i u `happy-dom`
  unutar Payload editora; ništa od toga nije izloženo posetiocima. Rešava ih novija verzija Payload-a.
