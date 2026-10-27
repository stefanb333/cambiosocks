# Uputstvo za rad u adminu prodavnice Cambio

Admin se otvara na adresi `https://<vaš-domen>/admin`. Radi i na telefonu: meni je ispod dugmeta sa tri crte u gornjem levom uglu.

## Uloge

| Uloga | Šta može |
|---|---|
| Administrator | Sve, uključujući podešavanja prodavnice, korisnike admina i brisanje porudžbina. |
| Urednik | Proizvodi, kolekcije, popusti, sadržaj sajta i statusi porudžbina. Ne vidi podešavanja prodavnice, ne pravi nove korisnike i ne briše porudžbine. |

Novog korisnika dodaje administrator: Podešavanja > Korisnici admina > Kreiraj novo. Zaboravljena lozinka se menja preko linka "Zaboravljena lozinka?" na strani za prijavu (stiže email).

## Proizvodi

### Novi proizvod
1. Prodavnica > Proizvodi > **Kreiraj novo**.
2. Tab **Osnovno**: naziv, kratak opis (do 240 znakova, vidi se na karticama), opis, materijal i sastav, održavanje.
3. Tab **Slike**: dodajte slike. Prva slika je glavna. Redosled se menja prevlačenjem. Svaka slika mora imati **alternativni tekst** (kratak opis za Google i čitače ekrana, npr. "Crne muške sport čarape, par").
4. Desna kolona: **Status** (Nacrt, Aktivan, Arhiviran), kolekcije, tip proizvoda, tagovi, kategorije i dezen za filtere.
5. **Sačuvaj**. Proizvod je vidljiv u prodavnici tek kada je status **Aktivan** i ima bar jednu varijantu.

### Opcije i varijante
Varijanta je jedna kombinacija opcija (npr. Veličina 36-40, Boja Crna) i ima svoju cenu, SKU i zalihu.

1. Tab **Opcije i varijante** > **Dodaj Opciju**. Naziv (npr. "Veličina"), vrsta (Veličina, Boja ili Ostalo) i vrednosti (36-40, 41-46...). Za boju upišite i kod boje (npr. `#0F0F0F`), da bi se prikazao kružić u boji.
2. Upišite **podrazumevanu cenu** i, ako postoji popust, **staru cenu** (prikazuje se precrtano).
3. **Sačuvajte** proizvod.
4. U delu **Generator varijanti** proverite spisak kombinacija i kliknite **Generiši varijante**. Prave se samo varijante koje nedostaju; postojeće cene, zalihe i SKU ostaju kakve jesu.
5. U tabeli **Varijante** kliknite na varijantu da promenite cenu, zalihu, SKU ili sliku varijante.

Kada uklonite vrednost iz opcije (npr. veličinu koja se više ne proizvodi), sačuvajte proizvod, uključite "Obriši varijante koje više ne postoje u opcijama" i ponovo kliknite **Generiši varijante**.

### Zaliha
- "Prati zalihu" uključeno: kupac ne može da poruči više komada nego što je na stanju.
- "Prodaja kad nema na stanju": dozvoljava porudžbinu i kada je zaliha 0.
- Zaliha se automatski smanjuje kada porudžbinu prebacite u status **Potvrđena**, a vraća se ako potvrđenu porudžbinu otkažete.

### Masovne izmene
U listi proizvoda označite proizvode (kvadratić levo od naziva). Iznad tabele se pojavljuju dugmad **Aktiviraj**, **Vrati u nacrt** i **Arhiviraj**. Brisanje izabranih je u gornjem desnom uglu ("Obriši"); briše i sve varijante tih proizvoda.

### Uvoz i izvoz (CSV, Shopify format)
- **Izvezi CSV**: preuzima ceo katalog u Shopify formatu (jedan red po varijanti). Fajl se otvara u Excel-u.
- **Uvezi CSV**: izaberite fajl u Shopify formatu (izvoz iz Shopify-ja ili ovaj izvoz, izmenjen u Excel-u). Prvo se prikazuje **provera**: koliko proizvoda je novo, koliko se ažurira i koji redovi imaju grešku. Uvoz počinje tek kada kliknete **Uvezi**.
- Proizvod se prepoznaje po koloni **Handle** (deo adrese, npr. `muske-carape`), a varijanta po **SKU** ili po kombinaciji opcija.
- Prazno polje u fajlu ne briše postojeću vrednost.
- "Uvezi i slike": slike iz kolone Image Src se preuzimaju i dodaju u galeriju. Slike koje su već uvezene se ne dupliraju.
- Tip proizvoda mora postojati u prodavnici (npr. "Muške čarape"); u suprotnom se preskače i to piše u izveštaju.

## Kolekcije
Prodavnica > Kolekcije.
- **Ručno**: sami birate proizvode.
- **Automatski**: proizvodi se biraju po pravilima (tag, tip proizvoda, brend, kategorija, dezen). Novi proizvod koji ispunjava pravila sam ulazi u kolekciju.
- "Prikaži u meniju Kategorije" i redosled određuju šta se vidi u meniju Kategorije.

## Porudžbine
Prodaja > Porudžbine. Nova porudžbina stiže i na email iz Podešavanja prodavnice.

| Status | Značenje |
|---|---|
| Nova | Kupac je poručio. Pozovite ga ako je potrebno. |
| Potvrđena | Porudžbina je proverena; zaliha se skida. |
| Poslata | Paket je predat kuriru. Kupac dobija email; upišite broj pošiljke i link za praćenje pre promene statusa. |
| Isporučena | Kupac je preuzeo paket. Za plaćanje pouzećem promenite i "Status plaćanja" u Plaćeno. |
| Otkazana | Ako je bila potvrđena, zaliha se vraća. |

Svaka promena statusa se upisuje u tab **Istorija** (ko i kada). Polje "Napomena uz promenu statusa" se upisuje uz tu promenu.

**Izvezi CSV** iznad liste preuzima sve porudžbine (jedan red po stavci), za knjigovodstvo ili kurirsku službu. Isto postoji i za kupce.

## Popusti
Prodaja > Popusti > Kreiraj novo: kod (npr. `DOBRODOSLI10`), vrsta (procenat, fiksni iznos ili besplatna dostava), vrednost, uslovi (minimalan iznos korpe, kolekcije ili proizvodi), period važenja i limit korišćenja. Kod iz newsletter emaila se podešava u Podešavanja prodavnice.

## Sadržaj sajta
- **Sajt > Početna stranica**: naslovna slika, kategorije, izdvojeni proizvodi, baner, recenzije, newsletter.
- **Sajt > Zaglavlje (meni)**, **Podnožje**, **Promo traka**.
- **Sadržaj > Stranice**: O nama, Kontakt, Česta pitanja, Dostava, Uslovi, Privatnost. Stranica se sastavlja od blokova; izmene se vide na sajtu posle klika na **Objavi izmene** (dugme **Sačuvaj nacrt** čuva bez objavljivanja).
- **Sadržaj > Blog**: članci. Članak označen kao "Izdvojen članak" je prvi na blogu.
- **Sadržaj > Mediji**: sve slike. Slika koja se koristi u galeriji proizvoda ne može da se obriše dok se ne ukloni iz proizvoda.

Izmene u adminu se na sajtu vide odmah posle čuvanja (nekoliko sekundi).

## Podešavanja prodavnice (samo administrator)
Cena dostave, prag za besplatnu dostavu, rok isporuke, email adrese za nove porudžbine, kontakt podaci, Instagram i TikTok, kod popusta za newsletter, opšte uputstvo za održavanje i tekst o dostavi.

## Kako pisati tekstove da sajt bude bolje rangiran (SEO)
Google i AI asistenti (ChatGPT, Perplexity, Gemini) čitaju tekst na sajtu i preporučuju prodavnice čiji tekst odgovara na pitanje kupca. Za svaki novi proizvod i kolekciju:
- **Naziv proizvoda**: vrsta, za koga i glavna osobina, npr. "Muške pamučne čarape" ili "Sportske čarape za trening". Ljudi pretražuju "sportske čarape", ne "sport čarape".
- **Kratak opis** (vidi se uz naslov): jedna do dve rečenice, šta je proizvod i zašto je dobar.
- **Opis** (vidi se u "Detalji o proizvodu"): prva rečenica kaže šta je proizvod, zatim 3 do 5 kratkih stavki (pojačana peta, pamuk, ne klizi...). Bez kopiranja istog teksta na više proizvoda.
- **Materijal i sastav**: tačan sastav sa etikete (npr. "80% pamuk, 17% poliamid, 3% elastin"). Kupci i Google to traže.
- **SEO naslov** (do 60 znakova) i **meta opis** (120 do 160 znakova) na kartici SEO: ono što se vidi u Google rezultatu. Ako ostane prazno, koriste se naziv i kratak opis.
- **Alternativni tekst slike** (Mediji): šta je na slici, npr. "Crne muške pamučne čarape, par". Pomaže u Google slikama.
- **Ocena i broj recenzija** upisujte samo ako su stvarni (od kupaca); Google kažnjava izmišljene ocene.
- **Opis kolekcije** (Kolekcije > Opis): tekst ispod proizvoda, sa 2 do 4 podnaslova u obliku pitanja ("Koja veličina?") i kratkim odgovorima.
- **Blog**: novi članak jednom do dva puta mesečno, na pitanje koje kupci postavljaju, sa linkovima na kolekcije i proizvode.
