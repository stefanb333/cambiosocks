/**
 * Pravne stranice prodavnice (D-061). Format: "## " podnaslov, "### " manji podnaslov, "- " stavka
 * liste, "**tekst**" podebljano (lib/richtext.ts > markdownToLexical).
 * Usklađeno sa Zakonom o zaštiti potrošača ("Sl. glasnik RS", br. 88/2021), Zakonom o elektronskoj
 * trgovini i Zakonom o zaštiti podataka o ličnosti ("Sl. glasnik RS", br. 87/2018).
 * Upis u postojeću bazu: npm run payload -- run scripts/update-legal-pages.ts
 * Pre puštanja u rad tekst treba da pregleda pravnik ili knjigovođa (vidi D-061: šta treba potvrditi).
 */
import { COMPANY, companyAddress, companyLine } from '../lib/company'

const VALID_FROM = '26. oktobra 2026.'

const seller = `- **${COMPANY.legalName}**
- Sedište: ${companyAddress}
- Matični broj: ${COMPANY.registrationNumber}
- PIB: ${COMPANY.taxId}
- Pretežna delatnost: ${COMPANY.activity}
- Registrovano u Registru privrednih subjekata Agencije za privredne registre
- Email: ${COMPANY.email}
- Telefon: ${COMPANY.phone} (${COMPANY.hours}; poziv se naplaćuje po redovnoj tarifi vašeg operatera)`

const terms = `Važi od ${VALID_FROM}

## Podaci o prodavcu
Prodavac u online prodavnici Cambio je:
${seller}

## Opšte odredbe
Ovi uslovi uređuju korišćenje ovog sajta i kupovinu proizvoda u online prodavnici Cambio. Na odnose između prodavca i kupca primenjuju se ovi uslovi, Zakon o zaštiti potrošača, Zakon o elektronskoj trgovini i Zakon o obligacionim odnosima.
Prodavnica je namenjena kupcima na teritoriji Republike Srbije. Ugovor se zaključuje na srpskom jeziku.
Pre slanja porudžbine potrebno je da prihvatite ove uslove i Politiku privatnosti. Uslove možete da sačuvate ili odštampate sa ove stranice u bilo kom trenutku.

## Proizvodi
Uz svaki proizvod navodimo osnovne karakteristike: naziv, opis, dostupne veličine i boje, a kada je poznat i materijal i sastav. Fotografije verno prikazuju proizvod, ali boja na ekranu može malo da odstupa od stvarne, u zavisnosti od podešavanja uređaja.
Veličine su označene na stranici proizvoda. Ako niste sigurni koju veličinu da izaberete, pišite nam pre poručivanja.

## Cene
Sve cene su izražene u dinarima (RSD) i konačne su, sa uračunatim PDV-om. Cena dostave nije uključena u cenu proizvoda; prikazuje se posebno u korpi i u pregledu porudžbine, pre nego što porudžbinu pošaljete.
Važi cena prikazana u trenutku slanja porudžbine. Ako na sajtu dođe do očigledne greške u ceni ili opisu, obavestićemo vas pre slanja pošiljke i ponuditi da porudžbinu potvrdite po ispravnoj ceni ili da je otkažete bez ikakvih troškova.

## Poručivanje i zaključenje ugovora
- Izaberite proizvod, veličinu i boju i dodajte ga u korpu.
- U korpi proverite proizvode i količine; možete uneti kod za popust.
- Na stranici za poručivanje unesite ime i prezime, email, telefon i adresu za dostavu.
- Pre slanja proverite pregled porudžbine: proizvode, cenu dostave i ukupan iznos za plaćanje.
- Prihvatite ove uslove i kliknite na dugme "Poruči Odmah". Slanjem porudžbine preuzimate obavezu plaćanja.
Ugovor o kupoprodaji je zaključen kada vam stigne email sa potvrdom porudžbine. Email sadrži broj porudžbine, proizvode, cene, troškove dostave i ukupan iznos; sačuvajte ga, jer je to vaša potvrda ugovora. Podatke o porudžbini čuvamo i mi.
Ako neki proizvod iz porudžbine u međuvremenu više nije dostupan, obavestićemo vas i taj deo porudžbine otkazati, bez ikakvih troškova za vas.

## Plaćanje
Plaćanje je pouzećem: iznos porudžbine, sa troškovima dostave, plaćate gotovinom kuriru prilikom preuzimanja pošiljke. Fiskalni račun dobijate uz pošiljku.

## Isporuka
Isporučujemo na teritoriji Republike Srbije, kurirskom službom, na adresu koju navedete u porudžbini. Rokovi i cena dostave opisani su na stranici Dostava i plaćanje.
Prilikom preuzimanja pregledajte pakovanje. Ako je oštećeno, to možete odmah da prijavite kuriru, a nama javite u najkraćem roku.

## Pravo na odustanak od ugovora
Kupovinom u online prodavnici zaključujete ugovor na daljinu. Kao potrošač, imate pravo da odustanete od ugovora u roku od **14 dana od dana kada ste primili proizvode**, bez navođenja razloga.
- Odustanak izjavljujete slanjem obrasca za odustanak (stranica Reklamacije i odustanak) na ${COMPANY.email} ili poštom na adresu ${companyAddress}, ili bilo kojom drugom nedvosmislenom izjavom. Rok je ispoštovan ako izjavu pošaljete pre njegovog isteka.
- Proizvode nam vraćate najkasnije u roku od 14 dana od dana kada ste poslali izjavu o odustanku, na adresu ${companyAddress}.
- Snosite samo direktne troškove vraćanja proizvoda.
- Vraćamo vam sve što ste platili, uključujući troškove isporuke (osim dodatnih troškova ako ste izabrali skuplji način dostave od najjeftinijeg koji nudimo), najkasnije u roku od 14 dana od dana kada smo primili vašu izjavu o odustanku.
- Pošto se plaća gotovinom pouzećem, novac vraćamo uplatom na tekući račun koji navedete u obrascu. Povraćaj možemo da zadržimo dok ne primimo proizvode ili dok nam ne dostavite dokaz da ste ih poslali.
**Važno, zapečaćeno pakovanje:** čarape isporučujemo u zapečaćenom pakovanju. Iz higijenskih razloga pravo na odustanak nemate ako je pakovanje otvoreno nakon isporuke (Zakon o zaštiti potrošača, član 38). Proizvode u neotvorenom pakovanju možete da vratite u roku od 14 dana.

## Reklamacije
Odgovaramo za saobraznost proizvoda ugovoru u skladu sa Zakonom o zaštiti potrošača. Nesaobraznost možete da reklamirate ako se pojavi u roku od **dve godine od dana isporuke**. Na reklamaciju odgovaramo najkasnije u roku od 8 dana, a rešavamo je najkasnije u roku od 15 dana od dana podnošenja. Postupak je detaljno opisan na stranici Reklamacije i odustanak.

## Vansudsko rešavanje potrošačkih sporova
${COMPANY.name} je, u skladu sa Zakonom o zaštiti potrošača, obavezan da učestvuje u postupku vansudskog rešavanja potrošačkih sporova.
Ako reklamacija nije rešena na vaše zadovoljstvo, možete da pokrenete postupak pred telom za vansudsko rešavanje potrošačkih sporova. Postupak je za stranke besplatan, a pokreće se tek nakon što ste podneli reklamaciju prodavcu, najkasnije u roku od godinu dana od dana podnošenja reklamacije. Listu tela vodi i javno objavljuje ministarstvo nadležno za zaštitu potrošača.

## Intelektualna svojina
Sadržaj sajta (tekstovi, fotografije, logo i dizajn) pripada prodavcu ili se koristi uz dozvolu nosioca prava. Nije dozvoljeno njegovo kopiranje i korišćenje u komercijalne svrhe bez pisane saglasnosti.

## Izmene uslova
Uslove možemo da izmenimo. Izmene važe od dana objavljivanja na ovoj stranici i ne odnose se na porudžbine poslate pre toga.

## Merodavno pravo
Na ove uslove primenjuje se pravo Republike Srbije. Sporove nastojimo da rešimo dogovorom; ako to nije moguće, nadležan je sud u Republici Srbiji, u skladu sa zakonom.`

const returns = `Važi od ${VALID_FROM}

## Reklamacija proizvoda
Reklamaciju možete da podnesete ako proizvod ima nedostatak, ne odgovara opisu sa sajta ili ste dobili pogrešan proizvod, veličinu ili boju.
- Odgovaramo za nesaobraznost koja se pojavi u roku od **dve godine od dana isporuke**. Ako se nesaobraznost pojavi u roku od godinu dana od isporuke, pretpostavlja se da je postojala u trenutku isporuke.
- O nesaobraznosti nas obavestite u roku od dva meseca od dana kada ste je primetili.

### Kako se podnosi reklamacija
Pišite nam na ${COMPANY.email}, pozovite ${COMPANY.phone} ili pošaljite pismo na adresu ${companyAddress}. Navedite:
- ime i prezime i kontakt telefon ili email,
- broj porudžbine (nalazi se u emailu sa potvrdom),
- opis nedostatka i, ako je moguće, fotografiju,
- šta tražite: zamenu proizvoda, umanjenje cene ili raskid ugovora i povraćaj novca.
Kao dokaz o kupovini dovoljan je račun ili email sa potvrdom porudžbine.

### Šta se dešava posle prijave
- Prijem reklamacije potvrđujemo bez odlaganja, emailom.
- Najkasnije u roku od 8 dana od prijema odgovaramo da li reklamaciju prihvatamo, šta predlažemo i u kom roku je rešavamo.
- Reklamaciju rešavamo najkasnije u roku od 15 dana od dana podnošenja.
- Troškove slanja reklamiranog proizvoda i zamene snosi prodavac.
- Reklamacije evidentiramo i evidenciju čuvamo najmanje dve godine.
Ako reklamaciju odbijemo, obavestićemo vas o mogućnosti vansudskog rešavanja spora.

## Odustanak od kupovine u roku od 14 dana
Imate pravo da odustanete od kupovine u roku od 14 dana od dana prijema proizvoda, bez navođenja razloga.
- Popunite obrazac ispod i pošaljite ga na ${COMPANY.email} ili poštom na adresu ${companyAddress}. Možete poslati i drugu nedvosmislenu izjavu da odustajete.
- Proizvode vratite najkasnije u roku od 14 dana od dana slanja izjave, na adresu ${companyAddress}. Direktne troškove vraćanja snosite vi.
- Novac, uključujući troškove isporuke, vraćamo najkasnije u roku od 14 dana od prijema izjave, uplatom na tekući račun koji navedete. Povraćaj možemo da zadržimo dok ne primimo proizvode ili dokaz da su poslati.
**Važno, zapečaćeno pakovanje:** čarape isporučujemo u zapečaćenom pakovanju. Iz higijenskih razloga ne mogu se vratiti ako je pakovanje otvoreno nakon isporuke. Pakovanje zato otvorite tek kada ste sigurni da proizvod zadržavate. Ovo ne utiče na reklamaciju: proizvod sa nedostatkom uvek možete da reklamirate.

## Zamena veličine
Pored zakonskih prava, ako vam veličina ne odgovara, javite nam se u roku od 14 dana od prijema i dogovorićemo zamenu. Proizvod treba da bude nenošen, neopran i u originalnom pakovanju.

## Obrazac za odustanak od ugovora zaključenog na daljinu
Popunite i pošaljite ovaj obrazac samo ako želite da odustanete od ugovora.
**Prima:** ${COMPANY.name}, ${companyAddress}, email: ${COMPANY.email}
- Ovim obaveštavam da odustajem od ugovora o kupovini sledećih proizvoda: ______________________
- Broj porudžbine: ______________________
- Datum prijema proizvoda: ______________________
- Ime i prezime potrošača: ______________________
- Adresa potrošača: ______________________
- Broj tekućeg računa za povraćaj novca: ______________________
- Potpis potrošača (samo ako se obrazac šalje poštom): ______________________
- Datum: ______________________

## Vansudsko rešavanje potrošačkih sporova
${COMPANY.name} je, u skladu sa Zakonom o zaštiti potrošača, obavezan da učestvuje u postupku vansudskog rešavanja potrošačkih sporova. Postupak pred telom za vansudsko rešavanje je besplatan i pokreće se nakon podnete reklamacije, najkasnije u roku od godinu dana od dana njenog podnošenja. Listu tela vodi i javno objavljuje ministarstvo nadležno za zaštitu potrošača.`

const delivery = `Važi od ${VALID_FROM}

## Gde isporučujemo
Isporučujemo na celoj teritoriji Republike Srbije, kurirskom službom, na adresu koju unesete pri poručivanju.

## Rok isporuke
Porudžbine šaljemo u roku od 1 do 2 radna dana od prijema. Kurir isporučuje u roku od 2 do 4 radna dana. Porudžbine primljene vikendom i praznikom obrađujemo prvog sledećeg radnog dana.

## Cena dostave
Cena dostave je 499 RSD po porudžbini. Prikazuje se u korpi i u pregledu porudžbine, pre nego što porudžbinu pošaljete.

## Plaćanje
Plaćanje je pouzećem: ukupan iznos (proizvodi i dostava) plaćate kuriru gotovinom prilikom preuzimanja pošiljke. Fiskalni račun dobijate uz pošiljku.

## Praćenje pošiljke
Kada pošiljka krene, dobijate email sa brojem pošiljke i linkom za praćenje.

## Preuzimanje pošiljke
Prilikom preuzimanja pregledajte pakovanje. Ako je oštećeno, prijavite to kuriru i javite nam se na ${COMPANY.email} ili ${COMPANY.phone}. Ako vas kurir ne zatekne na adresi, pokušaće ponovo ili će vas kontaktirati telefonom.

## Vraćanje i zamena
Imate pravo da odustanete od kupovine u roku od 14 dana od prijema, a za nedostatke proizvoda odgovaramo dve godine od isporuke. Čarape stižu u zapečaćenom pakovanju: posle otvaranja pakovanja ne mogu se vratiti iz higijenskih razloga, ali se proizvod sa nedostatkom uvek može reklamirati. Postupak i obrazac za odustanak nalaze se na stranici Reklamacije i odustanak.`

const privacy = `Važi od ${VALID_FROM}

## Ko obrađuje vaše podatke
Rukovalac podacima o ličnosti je ${COMPANY.legalName}, ${companyAddress}, matični broj ${COMPANY.registrationNumber}, PIB ${COMPANY.taxId}. Za sva pitanja o podacima pišite nam na ${COMPANY.email}.
Podatke obrađujemo u skladu sa Zakonom o zaštiti podataka o ličnosti.

## Koje podatke obrađujemo
- **Porudžbina:** ime i prezime, email, broj telefona, adresa za dostavu (i za račun, ako je drugačija), napomena uz porudžbinu i sadržaj porudžbine.
- **Newsletter:** email adresa, ako se prijavite.
- **Kontakt forma:** ime, email, tema i tekst poruke.
- **Recenzija proizvoda:** ime, grad (opciono), ocena i tekst, koji se objavljuju na sajtu, i email (opciono), koji se ne objavljuje i služi samo za proveru da li ste proizvod kupili kod nas.
- **Tehnički podaci:** server na kom je sajt beleži uobičajene tehničke podatke o pristupu (na primer IP adresu i vrstu pregledača), radi bezbednosti i rada sajta.
Podatke o platnim karticama ne prikupljamo, jer se plaća pouzećem.

## Zašto ih obrađujemo i na osnovu čega
- Obrada i isporuka porudžbine i komunikacija u vezi sa njom: izvršenje ugovora koji zaključujete sa nama.
- Vođenje evidencija i čuvanje računa i reklamacija: zakonske obaveze (propisi o računovodstvu, porezima i zaštiti potrošača).
- Slanje newslettera i ponuda: vaš pristanak, koji možete da opozovete u svakom trenutku, linkom za odjavu ili emailom. Opoziv ne utiče na zakonitost obrade pre opoziva.
- Odgovor na poruku iz kontakt forme: vaš pristanak, koji dajete pri slanju poruke.
- Objava recenzije: vaš pristanak, koji dajete pri slanju recenzije. Na zahtev poslat emailom recenziju uklanjamo.
- Bezbednost sajta i sprečavanje zloupotreba: naš legitimni interes.
Podaci potrebni za porudžbinu su neophodni: bez njih ne možemo da isporučimo proizvode. Prijava na newsletter je dobrovoljna. Ne donosimo odluke isključivo automatizovanom obradom, niti pravimo profile kupaca.

## Kome podatke prosleđujemo
- Kurirskoj službi: ime, adresu, telefon i iznos za naplatu, radi isporuke.
- Pružaocima usluga koji za nas obrađuju podatke (obrađivači), samo u meri potrebnoj za rad prodavnice: hosting sajta (Netlify), baza podataka (Neon, serveri u Evropskoj uniji), čuvanje fotografija (Cloudflare) i slanje emailova (Resend).
- Državnim organima, kada to zahteva zakon.
Podatke ne prodajemo i ne ustupamo trećim licima za njihov marketing.
Neki od navedenih pružalaca usluga imaju sedište van Republike Srbije (Evropska unija i Sjedinjene Američke Države). Prenos podataka vršimo samo uz mere zaštite propisane Zakonom o zaštiti podataka o ličnosti, kao što su standardne ugovorne klauzule.

## Koliko dugo čuvamo podatke
- Podatke o porudžbinama i račune: koliko to zahtevaju propisi o računovodstvu i porezima.
- Evidenciju reklamacija: najmanje dve godine, kako propisuje Zakon o zaštiti potrošača.
- Email za newsletter: do odjave.
- Poruke iz kontakt forme: do 12 meseci od poslednje komunikacije.
- Recenzije: dok su objavljene na sajtu, odnosno do vašeg zahteva za uklanjanje.
Po isteku roka podatke brišemo ili trajno anonimizujemo.

## Kolačići i lokalno skladište
Sajt ne koristi kolačiće za praćenje, analitiku ni oglašavanje. Sadržaj korpe čuva se u vašem pregledaču (lokalno skladište) i do nas stiže tek kada pošaljete porudžbinu. Korpu možete da obrišete brisanjem podataka sajta u pregledaču.

## Vaša prava
Imate pravo da od nas zatražite:
- pristup svojim podacima i kopiju podataka,
- ispravku netačnih ili dopunu nepotpunih podataka,
- brisanje podataka, kada za njihovu obradu više nema osnova,
- ograničenje obrade,
- prenos podataka drugom rukovaocu (prenosivost),
- i da podnesete prigovor na obradu zasnovanu na legitimnom interesu.
Zahtev pošaljite na ${COMPANY.email}. Odgovaramo bez odlaganja, a najkasnije u roku od 30 dana od prijema zahteva.
Ako smatrate da se vaši podaci obrađuju suprotno zakonu, imate pravo da podnesete pritužbu Povereniku za informacije od javnog značaja i zaštitu podataka o ličnosti (www.poverenik.rs).

## Izmene politike privatnosti
O izmenama ove politike obaveštavamo objavljivanjem nove verzije na ovoj stranici, sa datumom od kada važi.`

export const legalPages = [
  { title: 'Dostava i plaćanje', slug: 'dostava', body: delivery },
  { title: 'Uslovi korišćenja i kupovine', slug: 'uslovi-koriscenja', body: terms },
  { title: 'Reklamacije i odustanak', slug: 'reklamacije', body: returns },
  { title: 'Politika privatnosti', slug: 'privatnost', body: privacy },
]

/** Linkovi u dnu footer-a; poslednji ističe obavezu učešća u vansudskom rešavanju sporova (čl. 173). */
export const footerLegalLinks = [
  { label: 'Uslovi', url: '/uslovi-koriscenja' },
  { label: 'Privatnost', url: '/privatnost' },
  { label: 'Dostava', url: '/dostava' },
  { label: 'Reklamacije i odustanak', url: '/reklamacije' },
  { label: 'Učestvujemo u vansudskom rešavanju potrošačkih sporova', url: '/reklamacije' },
]

export const footerCopyright = `© 2026 ${companyLine}`
