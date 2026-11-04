/**
 * Seed sadržaj. Tekstovi su preuzeti iz Shopify teme (templates/*.json) i Figma dizajna,
 * uz zamenu dugih crta (pravilo projekta). Katalog proizvoda je demonstracioni i zamenjuje
 * se CSV uvozom pravog kataloga (vidi DECISIONS.md D-016).
 */

/** focal: fokus tačka u % (x, y), izračunata iz isečka slike u Figmi. */
export type SeedImage = { file: string; alt: string; focal?: [number, number] }

export const images = {
  hero: { file: 'hero.jpg', alt: 'Ruka drži par belih Cambio čarapa na pozadini plavog neba' },
  catMen: { file: 'cat-1.jpg', alt: 'Muškarac u crnim karo čarapama i patikama sedi na stolici' },
  catWomen: {
    file: 'cat-women.jpg',
    alt: 'Žena navlači bele čarape na stepeništu, pored nje kafa',
  },
  catSport: {
    file: 'cat-3.jpg',
    alt: 'Sportista u crnim čarapama i patikama za trčanje',
    focal: [50, 5.8],
  },
  ctaBg: {
    file: 'cta-bg.jpg',
    alt: 'Ruke drže crne i bele Cambio čarape kroz žutu pozadinu',
    focal: [50, 60.8],
  },
  ctaPill: {
    file: 'cta-pill.jpg',
    alt: 'Šarene čarape sa tačkama i prugama na tirkiznoj pozadini',
    focal: [50, 9.8],
  },
  newsletter: {
    file: 'newsletter-bg.jpg',
    alt: 'Bele Cambio čarape suše se na štipaljkama pod plavim nebom',
    focal: [50, 45],
  },
  plpCampaign: { file: 'plp-campaign.jpg', alt: 'Noge u crnim karo čarapama na žutoj fotelji' },
  ctaCollection: {
    file: 'cta-collection.jpg',
    alt: 'Ruke drže crne, bele i teget karo čarape kroz zelenu pozadinu',
  },
  // Pojedinačni par (D-076): fotografije proizvoda bez oznake 12X
  socksWhite: { file: 'product-socks-white.png', alt: 'Par belih Cambio čarapa' },
  socksBlack: { file: 'product-socks-black.png', alt: 'Par crnih Cambio čarapa' },
  // Pojedinačni par (D-085): svaka boja ima tačno dve fotografije, flat pa model. Flat je ujedno
  // sličica boje na stranici proizvoda. Stare model fotografije ostaju tamo gde nove ne postoje.
  elRombFlat: { file: 'par-elegant-romb-flat.jpg', alt: 'Crne elegantne muške čarape sa sitnim rombom, par' },
  elCrnaModel: {
    file: 'single-elegant-crna-model.jpg',
    alt: 'Muškarac u crnim elegantnim čarapama',
  },
  elKaroFlat: { file: 'par-elegant-karo-flat.jpg', alt: 'Crne elegantne muške čarape sa sivim karo dezenom, par' },
  elKaroModel: {
    file: 'single-elegant-karo-model.jpg',
    alt: 'Muškarac u crnim elegantnim čarapama sa karo dezenom',
  },
  elTegetFlat: { file: 'par-elegant-teget-flat.jpg', alt: 'Teget elegantne muške čarape sa karo dezenom, par' },
  elTegetModel: {
    file: 'single-elegant-teget-model.jpg',
    alt: 'Muškarac u teget elegantnim čarapama sa karo dezenom',
  },
  t34BelaFlat: { file: 'par-34-bela-flat.jpg', alt: 'Bele 3/4 čarape od pamuka, par' },
  t34CrnaFlat: { file: 'par-34-crna-flat.jpg', alt: 'Crne 3/4 čarape od pamuka, par' },
  t34SivaFlat: { file: 'par-34-siva-flat.jpg', alt: 'Sive 3/4 čarape od pamuka, par' },
  t34TegetFlat: { file: 'par-34-teget-flat.jpg', alt: 'Teget 3/4 čarape od pamuka, par' },
  t34mBelaModel: { file: 'par-34-muske-bela-model.jpg', alt: 'Muškarac u belim 3/4 čarapama' },
  t34mCrnaModel: { file: 'par-34-muske-crna-model.jpg', alt: 'Muškarac u crnim 3/4 čarapama' },
  t34mSivaModel: { file: 'par-34-muske-siva-model.jpg', alt: 'Muškarac u sivim 3/4 čarapama' },
  t34mTegetModel: { file: 'par-34-muske-teget-model.jpg', alt: 'Muškarac u teget 3/4 čarapama' },
  t34zBelaModel: { file: 'par-34-zenske-bela-model.jpg', alt: 'Žena u belim 3/4 čarapama' },
  t34zCrnaModel: { file: 'par-34-zenske-crna-model.jpg', alt: 'Žena u crnim 3/4 čarapama' },
  t34zSivaModel: { file: 'par-34-zenske-siva-model.jpg', alt: 'Žena u sivim 3/4 čarapama' },
  t34zTegetModel: { file: 'par-34-zenske-teget-model.jpg', alt: 'Žena u teget 3/4 čarapama' },
  nzBelaFlat: { file: 'par-nazuvice-bela-flat.jpg', alt: 'Bele nazuvice od pamuka, par' },
  nzCrnaFlat: { file: 'par-nazuvice-crna-flat.jpg', alt: 'Crne nazuvice od pamuka, par' },
  nzSivaFlat: { file: 'par-nazuvice-siva-flat.jpg', alt: 'Sive nazuvice od pamuka, par' },
  nzTegetFlat: { file: 'par-nazuvice-teget-flat.jpg', alt: 'Teget nazuvice od pamuka, par' },
  nzmBelaModel: { file: 'par-nazuvice-muske-bela-model.jpg', alt: 'Muškarac u belim nazuvicama' },
  nzmCrnaModel: { file: 'par-nazuvice-muske-crna-model.jpg', alt: 'Muškarac u crnim nazuvicama' },
  nzmSivaModel: { file: 'par-nazuvice-muske-siva-model.jpg', alt: 'Muškarac u sivim nazuvicama' },
  nzmTegetModel: {
    file: 'single-nazuvice-muske-teget-model.jpg',
    alt: 'Muškarac u teget nazuvicama',
  },
  nzzBelaModel: { file: 'par-nazuvice-zenske-bela-model.jpg', alt: 'Žena u belim nazuvicama' },
  nzzCrnaModel: { file: 'par-nazuvice-zenske-crna-model.jpg', alt: 'Žena u crnim nazuvicama' },
  nzzSivaModel: { file: 'par-nazuvice-zenske-siva-model.jpg', alt: 'Žena u sivim nazuvicama' },
  nzzTegetModel: { file: 'par-nazuvice-zenske-teget-model.jpg', alt: 'Žena u teget nazuvicama' },
  spBelaFlat: { file: 'par-sport-bela-flat.jpg', alt: 'Bele sportske čarape od pamuka, par' },
  spCrnaFlat: { file: 'par-sport-crna-flat.jpg', alt: 'Crne sportske čarape od pamuka, par' },
  spSivaFlat: { file: 'par-sport-siva-flat.jpg', alt: 'Sive sportske čarape od pamuka, par' },
  spTegetFlat: { file: 'par-sport-teget-flat.jpg', alt: 'Teget sportske čarape od pamuka, par' },
  spmBelaModel: { file: 'par-sport-muske-bela-model.jpg', alt: 'Muškarac u belim sportskim čarapama' },
  spmCrnaModel: {
    file: 'single-sport-muske-crna-model.jpg',
    alt: 'Muškarac u crnim sportskim čarapama',
  },
  spmSivaModel: { file: 'par-sport-muske-siva-model.jpg', alt: 'Muškarac u sivim sportskim čarapama' },
  spmTegetModel: { file: 'par-sport-muske-teget-model.jpg', alt: 'Muškarac u teget sportskim čarapama' },
  spzBelaModel: { file: 'par-sport-zenske-bela-model.jpg', alt: 'Žena u belim sportskim čarapama' },
  spzCrnaModel: { file: 'par-sport-zenske-crna-model.jpg', alt: 'Žena u crnim sportskim čarapama' },
  spzSivaModel: { file: 'par-sport-zenske-siva-model.jpg', alt: 'Žena u sivim sportskim čarapama' },
  spzTegetModel: { file: 'par-sport-zenske-teget-model.jpg', alt: 'Žena u teget sportskim čarapama' },
  // Paketi od 12 pari (D-089): koriste iste nove flat fotografije kao pojedinačni proizvodi,
  // deljene po alt tekstu; nema zasebnih "bundle" slika ni žute pozadine.
  aboutHero: {
    file: 'about-hero.jpg',
    alt: 'Proizvodna hala Cambio fabrike sa mašinama za pletenje čarapa',
  },
  aboutIntro1: { file: 'about-intro-1.jpg', alt: 'Ruke proveravaju pamučno predivo u radionici' },
  aboutIntro2: { file: 'about-intro-2.jpg', alt: 'Kružna mašina za pletenje čarapa izbliza' },
  aboutBrand1: { file: 'about-brand-1.jpg', alt: 'Sportista vezuje patike na atletskoj stazi' },
  aboutBrand2: { file: 'about-brand-2.jpg', alt: 'Noge u belim čarapama na roze pozadini' },
  aboutBrand3: { file: 'about-brand-3.jpg', alt: 'Bele čarape i teniska loptica na plavom terenu' },
  aboutBrand4: {
    file: 'about-brand-4.jpg',
    alt: 'Ruke drže Cambio čarape kroz žutu pozadinu',
    focal: [27.2, 50],
  },
  stat1995: { file: 'about-stat-1995.jpg', alt: 'Radnik podešava mašinu u Cambio fabrici' },
  stat32: { file: 'about-stat-32.jpg', alt: 'Red mašina za pletenje u proizvodnoj hali' },
  stat200k: { file: 'about-stat-200k.jpg', alt: 'Kalemovi predive na mašini za pletenje' },
  stat5: {
    file: 'about-stat-5.jpg',
    alt: 'Noge u belim Cambio čarapama podignute u žutoj sobi',
    focal: [50, 30],
  },
  blogFeatured: {
    file: 'blog-featured.jpg',
    alt: 'Bele i crne čarape suše se na štipaljkama pod vedrim nebom',
  },
  blogOutfit: {
    file: 'blog-outfit.jpg',
    alt: 'Noge u belim Cambio čarapama na žutoj pozadini',
    focal: [50, 25],
  },
  blogCotton: { file: 'blog-cotton.jpg', alt: 'Stopalo u crnoj Cambio čarapi na žutoj pozadini' },
  blogTraining: {
    file: 'blog-training.jpg',
    alt: 'Žena u sportskoj opremi i crnim Cambio čarapama',
    focal: [40, 60],
  },
} satisfies Record<string, SeedImage>

export type ImageKey = keyof typeof images

// --- Kolekcije ---
// SEO (D-063): naslov (H1) i tekst u zaglavlju sa ključnom reči kategorije, "description" je tekst
// ispod proizvoda (CollectionText) sa odgovorima na česta pitanja i internim linkovima, a "seo"
// su naslov i opis za Google (do 60 i 160 znakova).

export const collections = [
  {
    key: 'sve',
    title: 'Sve čarape',
    slug: 'sve',
    heroHeading: 'Čarape za svaki dan, iz naše fabrike.',
    heroText:
      'Muške i ženske čarape od pamuka, kao par ili u paketu od 12 pari: elegantne, 3/4 i nazuvice. Pravimo ih u Novom Pazaru od 1995. i šaljemo širom Srbije.',
    image: 'plpCampaign' as ImageKey,
    rules: [{ field: 'brand', value: 'Cambio' }],
    menuOrder: 0,
    showInMenu: false,
    seo: {
      title: 'Čarape online: muške, ženske i sportske',
      description:
        'Pamučne čarape online od proizvođača iz Novog Pazara: muške i ženske, elegantne, 3/4 i nazuvice, kao par ili paket od 12 pari. Dostava 1 do 3 dana.',
    },
    description: `## Čarape direktno od proizvođača iz Novog Pazara
Cambio čarape pravimo u sopstvenoj fabrici u Novom Pazaru od 1995. godine. Kada kupujete ovde, kupujete direktno od proizvođača: bez posrednika, sa istim pamukom i istom kontrolom kvaliteta koju godinama koristimo za partnere širom regiona.
## Koje čarape da izaberete?
- **[Muške elegantne čarape](/proizvodi/muske-elegantne-carape)** uz odelo i za posao: crne, karo ili sa rombom.
- **3/4 čarape** klasične visine, do sredine lista, za patike i svaki dan: [muške](/proizvodi/muske-carape-3-4) i [ženske](/proizvodi/zenske-carape-3-4).
- **Nazuvice**, niske do članka, koje ne vire iz patike: [muške](/proizvodi/muske-nazuvice) i [ženske](/proizvodi/zenske-nazuvice).
- **Sportske čarape** za trening, muške i ženske, uskoro u ponudi.
## Par ili paket od 12 pari?
Svaki model možete da kupite kao pojedinačan par ili u paketu od 12 pari iste boje i veličine. Paket je najisplativiji: cena po paru je niža (od oko 100 RSD), imate čist par za svaki dan u mesecu, a kada se jedan pocepa, ostali se i dalje slažu.
## Kako da izaberem veličinu?
Veličina čarapa je označena brojem obuće, na primer 41-46. Izaberite raspon u koji upada broj vaših cipela; detalje i savete za granične brojeve naći ćete u vodiču [Tabela veličina čarapa](/blog/tabela-velicina-carapa).
## Dostava i plaćanje
Porudžbine isporučuje kurirska služba AKS za 1 do 3 radna dana na celoj teritoriji Srbije; dostava je 300 RSD, a za porudžbine od 2.000 RSD besplatna. Plaćate pouzećem, a fiskalni račun stiže uz pošiljku. Sve uslove pogledajte na stranici [Dostava i plaćanje](/dostava).`,
  },
  {
    key: 'muske',
    title: 'Muške čarape',
    slug: 'muske-carape',
    heroHeading: 'Muške čarape za svaki dan.',
    heroText:
      'Muške čarape od pamuka, par ili paket od 12 pari: elegantne za odelo, 3/4 i nazuvice. Pojačana peta i prsti, pamuk koji diše i manžetna bez stezanja.',
    image: 'catMen' as ImageKey,
    rules: [{ field: 'productType', value: 'muske' }],
    menuOrder: 1,
    showInMenu: true,
    seo: {
      title: 'Muške čarape od pamuka',
      description:
        'Muške čarape od pamuka, par ili paket od 12 pari: elegantne za odelo, 3/4 i nazuvice, veličine 38 do 46. Proizvođač iz Novog Pazara, dostava 1 do 3 dana.',
    },
    description: `## Pamučne muške čarape koje traju
Dobra muška čarapa se ne primećuje tokom dana: ne klizi u cipeli, ne steže oko članka i ne tanji se posle nekoliko pranja. Zato naše muške čarape imaju pojačanu petu i prste, pamuk koji diše i manžetnu koja drži bez otiska na koži.
## Za posao, trening i svaki dan
- **[Muške elegantne čarape](/proizvodi/muske-elegantne-carape)** idu uz odelo, košulju i cipele: jednobojne crne, sa karo dezenom ili sa diskretnim rombom.
- **[Muške 3/4 čarape](/proizvodi/muske-carape-3-4)** klasične visine, do sredine lista, za patike, teretanu i svaki dan.
- **[Muške nazuvice](/proizvodi/muske-nazuvice)** su niske do članka: ne vire iz niskih patika, a štite petu od žuljanja.
- **Muške sportske čarape** za trening su uskoro u ponudi.
Svaki model je dostupan kao pojedinačan par i u paketu od 12 pari iste boje i veličine, za ceo mesec.
## Koja veličina muških čarapa?
Muške čarape su u rasponima 38-42, 42-44 i 44-46, prema broju obuće. Ako nosite 42 ili 44, pogledajte [tabelu veličina čarapa](/blog/tabela-velicina-carapa) i savet za granične brojeve.
## Kako da muške čarape duže traju?
Perite ih naopačke na 30 do 40°C, bez izbeljivača i sušilice. Više saveta je u članku [5 saveta kako da produžite život čarapama](/blog/5-saveta-kako-da-produzite-zivotnost-vase-omiljene-carape).`,
  },
  {
    key: 'zenske',
    title: 'Ženske čarape',
    slug: 'zenske-carape',
    heroHeading: 'Ženske čarape koje prate korak.',
    heroText:
      'Ženske čarape od pamuka, par ili paket od 12 pari: 3/4 i nazuvice. Uži kroj koji prati stopalo, bez stezanja i bez traga na koži.',
    image: 'catWomen' as ImageKey,
    rules: [{ field: 'productType', value: 'zenske' }],
    menuOrder: 2,
    showInMenu: true,
    seo: {
      title: 'Ženske čarape od pamuka',
      description:
        'Ženske čarape od pamuka, par ili paket od 12 pari: 3/4 i nazuvice užeg kroja, veličine 34 do 42. Proizvođač iz Novog Pazara, dostava 1 do 3 dana.',
    },
    description: `## Ženske čarape koje se ne osećaju
Ženska čarapa treba da prati oblik stopala, a ne da ga steže. Naše ženske čarape imaju uži kroj, ravan šav na prstima koji ne žulja i meku manžetnu koja ne ostavlja trag ni posle celog dana.
## Sportske, 3/4 ili nazuvice?
- **[Ženske 3/4 čarape](/proizvodi/zenske-carape-3-4)** klasične visine, do sredine lista, uz helanke, trenerku i patike.
- **[Ženske nazuvice](/proizvodi/zenske-nazuvice)** su niske do članka: ne vire iz patike, za trening, šetnju i leto.
- **Ženske sportske čarape** za trening su uskoro u ponudi.
Svaki model je dostupan kao pojedinačan par i u paketu od 12 pari iste boje i veličine.
## Koja veličina ženskih čarapa?
Ženske čarape su u rasponima 34-36, 36-38 i 38-42, prema broju obuće. Ako ste između dve veličine, za uži kroj izaberite manju, a za opušteniji veću; više u vodiču [Tabela veličina čarapa](/blog/tabela-velicina-carapa).
## Zašto pamuk?
Pamuk upija vlagu i diše, pa je stopalo suvo i kada ste ceo dan u zatvorenoj obući. Zašto je to važno, objašnjavamo u članku [Zašto pamuk i komfor treba da budu prvi izbor](/blog/zasto-pamuk-i-komfor-treba-da-budu-prvi-izbor-za-svakodnevne-carape).`,
  },
  {
    key: 'sport',
    title: 'Sportske čarape',
    slug: 'sport-i-aktivne',
    heroHeading: 'Sportske čarape za trening i trčanje.',
    heroText:
      'Napravljene za trening, trčanje i sve između. Pojačanje tamo gde treba, disanje tamo gde je najbitnije, i čarapa koja ne klizi u patici.',
    image: 'catSport' as ImageKey,
    rules: [{ field: 'tags', value: 'sport' }],
    menuOrder: 3,
    showInMenu: true,
    seo: {
      title: 'Sportske čarape za trčanje i trening',
      description:
        'Čarape za trening i trčanje: muške i ženske nazuvice do članka koje ne klize u patici, par ili paket od 12 pari. Uskoro i sportske čarape. Pouzećem.',
    },
    description: `## Kakve čarape za trčanje i trening?
Dobra sportska čarapa ima tri stvari: ojačan đon koji ublažava udarce, zonu koja diše na gornjem delu stopala i elastičnu traku oko svoda koja je drži na mestu. Tako stopalo ostaje suvo, a čarapa ne klizi i ne pravi nabore u patici.
## Sportske čarape u ovoj kolekciji
- **Nazuvice do članka**, [muške](/proizvodi/muske-nazuvice) i [ženske](/proizvodi/zenske-nazuvice), koje ne vire iz patike i ne klize sa pete.
- **Sportske čarape** za trening, muške i ženske, su uskoro u ponudi.
Svi modeli su dostupni kao par i u paketu od 12 pari, sa kojim za svaki trening imate svež par.
## Koliko pari sportskih čarapa vam treba?
Ako trenirate tri do četiri puta nedeljno, najbolje je imati bar četiri do pet pari u rotaciji, da svaki par posle pranja potpuno odmori i zadrži elastičnost. Kako da izaberete pravi model, pročitajte u članku [Kako da izaberete čarape za trening](/blog/kako-da-izaberete-carape-za-trening-koje-nece-ometati-tokom-aktivnosti).
## Veličina sportskih čarapa
Sportske čarape su u rasponima 36-40, 41-46 i 47-51. Sportska čarapa treba da prijanja uz stopalo, pa na granici dve veličine izaberite manju; više u vodiču [Tabela veličina čarapa](/blog/tabela-velicina-carapa).`,
  },
] as const

// --- Proizvodi (katalog, D-075, D-077) ---
// Katalog klijenta: svaki model kao pojedinačan par i kao paket od 12 pari istog modela, boje i
// veličine. Muške: elegant, sport, 3/4 i nazuvice; ženske: sport, 3/4 i nazuvice. Cene paketa
// (D-073): nazuvice 1.200 RSD, 3/4 1.400 RSD, sport i elegant 1.600 RSD. Cene pojedinačnog para
// su privremene dok ih klijent ne potvrdi (D-076). Na proizvodima su samo fotografije proizvoda
// (par bez oznake, paket 12X); modeli bez fotografije su u nacrtu dok ona ne stigne.
// "description" je pun opis (markdown, ProductDetails), "seo" naslov (do 60 znakova) i opis
// (do 160) za Google. Sastav se ne izmišlja: upisuje se u "Materijal i sastav" kada je poznat (D-044).

export type SeedProduct = {
  title: string
  slug: string
  /** Nacrt se ne vidi na sajtu (npr. dok nema fotografije); podrazumevano aktivan. */
  status?: 'active' | 'draft'
  shortDescription: string
  description: string
  seo: { title: string; description: string }
  productType: 'muske' | 'zenske' | 'sport'
  tags: string[]
  category: string[]
  pattern: string[]
  images: ImageKey[]
  sizes: string[]
  colors: { value: string; swatch: string; image?: ImageKey }[]
  price: number
  compareAtPrice?: number
  /** Varijante bez zalihe, u formatu "Boja/Veličina", za prikaz rasprodatih opcija. */
  soldOut?: string[]
  skuCode: string
}

const SIZES_MEN = ['38-42', '42-44', '44-46']
const SIZES_WOMEN = ['34-36', '36-38', '38-42']

/** Cena paketa od 12 pari po vrsti (klijent, D-073). */
const PRICE = { nazuvice: 1200, tri4: 1400, sport: 1600, elegant: 1600 }
/** Cena jednog para (privremena, D-076). */
const SINGLE = { nazuvice: 129, tri4: 169, sport: 199, elegant: 199 }
const perPair = (price: number) => Math.round(price / 12)
// Cena u tekstu sa tačkom za hiljade, kao na sajtu ("1.600 RSD"), D-080.
const rsd = (price: number) => String(price).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

type Color = SeedProduct['colors'][number]
type Variant = { images: ImageKey[]; colors: Color[]; status?: 'active' | 'draft' }

/**
 * Model čarape (D-077): iz jednog opisa nastaju dva proizvoda, pojedinačan par i paket od
 * 12 pari. Vrste prema klijentu: nazuvice su niske do članka, 3/4 su klasične visine do sredine
 * lista, sportske su za trening, elegantne uz odelo.
 */
type Model = {
  /** Slug paketa; par dobija sufiks "-par". */
  slug: string
  who: 'Muške' | 'Ženske'
  type: 'muske' | 'zenske'
  /** Naziv vrste u nazivu proizvoda, npr. "3/4 čarape", "nazuvice". */
  name: string
  kind: keyof typeof PRICE
  /** Prvi pasus opisa sa glavnom ključnom reči (bez rečenice o paketu). */
  intro: string
  bullets: string[]
  /** Za kratki opis: za šta je model. */
  use: string
  seoTitle: string
  seoWhat: string
  tags: string[]
  pattern: string[]
  sizes: string[]
  sku: string
  collection: [label: string, url: string]
  pack: Variant
  single: Variant
}

/** Završni pasus opisa: poreklo, veličina i interni linkovi (isti ton na svim proizvodima). */
const closing = (what: string, [label, url]: Model['collection']) =>
  `${what} pravimo u sopstvenoj fabrici u Novom Pazaru od 1995. godine i svaki par pregledamo pre pakovanja. Veličinu birate prema broju obuće; savete za granične brojeve naći ćete u [tabeli veličina čarapa](/blog/tabela-velicina-carapa). Ostale modele pogledajte u kolekciji [${label}](${url}).`

const lower = (who: Model['who']) => (who === 'Muške' ? 'muških' : 'ženskih')

/** Naziv modela u genitivu množine: "elegantne čarape" > "elegantnih čarapa". */
const ofName = (name: string) =>
  name
    .replace('elegantne', 'elegantnih')
    .replace('sportske', 'sportskih')
    .replace('čarape', 'čarapa')
    .replace('nazuvice', 'nazuvica')

function pack(m: Model): SeedProduct {
  const price = PRICE[m.kind]
  return {
    title: `${m.who} ${m.name} (12 pari)`,
    slug: m.slug,
    status: m.pack.status,
    shortDescription: `Paket od 12 pari ${lower(m.who)} ${ofName(m.name)} od pamuka, ${m.use}. Oko ${perPair(price)} RSD po paru.`,
    description: `${m.intro} U paketu je **12 pari istog modela, boje i veličine**, dovoljno da ceo mesec imate čist par.
${m.bullets.map((b) => `- ${b}`).join('\n')}
- **Isplativo:** oko ${perPair(price)} RSD po paru, umesto kupovine jednog po jednog para.
${closing(`${m.who} ${m.name}`, m.collection)}`,
    seo: {
      title: `${m.seoTitle}, 12 pari`,
      description: `${m.seoWhat} Paket 12 pari: ${rsd(price)} RSD, oko ${perPair(price)} RSD po paru.`,
    },
    productType: m.type,
    tags: [...m.tags, 'paket', '12-pari'],
    category: ['odrasli', 'paketi'],
    pattern: m.pattern,
    images: m.pack.images,
    sizes: m.sizes,
    colors: m.pack.colors,
    price,
    skuCode: m.sku,
  }
}

function single(m: Model): SeedProduct {
  const price = SINGLE[m.kind]
  return {
    title: `${m.who} ${m.name}`,
    slug: `${m.slug}-par`,
    status: m.single.status,
    shortDescription: `Par ${lower(m.who)} ${ofName(m.name)} od pamuka, ${m.use}. Isti model postoji i u paketu od 12 pari.`,
    description: `${m.intro}
${m.bullets.map((b) => `- ${b}`).join('\n')}
Isti model postoji i u [paketu od 12 pari](/proizvodi/${m.slug}) za ${rsd(PRICE[m.kind])} RSD, oko ${perPair(PRICE[m.kind])} RSD po paru: najisplativije za ceo mesec.
${closing(`${m.who} ${m.name}`, m.collection)}`,
    seo: {
      title: m.seoTitle,
      description: `${m.seoWhat} Par za ${rsd(price)} RSD, dostava za 1 do 3 radna dana.`,
    },
    productType: m.type,
    tags: [...m.tags, 'par'],
    category: ['odrasli'],
    pattern: m.pattern,
    images: m.single.images,
    sizes: m.sizes,
    colors: m.single.colors,
    price,
    skuCode: `${m.sku}1`,
  }
}

const WHITE = { value: 'Bela', swatch: '#FFFFFF' }
const BLACK = { value: 'Crna', swatch: '#0F0F0F' }
const NAVY = { value: 'Teget', swatch: '#1F2A44' }
const GRAY = { value: 'Siva', swatch: '#8E8E8E' }

/** Par (D-085): svaka boja ima flat pa model; flat je i slika boje (sličica u izboru boje). */
const pairs = (...list: [color: Omit<Color, 'image'>, flat: ImageKey, model: ImageKey][]): Variant => ({
  images: list.flatMap(([, flat, model]) => [flat, model]),
  colors: list.map(([color, flat]) => ({ ...color, image: flat })),
})
const MEN: Model['collection'] = ['Muške čarape', '/kolekcije/muske-carape']
const WOMEN: Model['collection'] = ['Ženske čarape', '/kolekcije/zenske-carape']
const SPORT: Model['collection'] = ['Sportske čarape', '/kolekcije/sport-i-aktivne']

const tri4 = (who: Model['who']): Model => {
  const men = who === 'Muške'
  return {
    slug: men ? 'muske-carape-3-4' : 'zenske-carape-3-4',
    who,
    type: men ? 'muske' : 'zenske',
    name: '3/4 čarape',
    kind: 'tri4',
    intro: `**${who} 3/4 čarape** su čarape klasične visine, do sredine lista: pokrivaju članak, ne spadaju u patici i lepo stoje uz farmerke, ${men ? 'trenerku i šorts' : 'helanke i trenerku'}. To je model za svaki dan, šetnju i teretanu.`,
    bullets: [
      '**Klasična visina, do sredine lista:** čarapa ostaje na mestu i ne skuplja se oko članka.',
      `**${men ? 'Pojačana peta i prsti' : 'Uži ženski kroj'}:** ${men ? 'duži vek uz patike i česta pranja.' : 'prati oblik stopala, bez nabora na prstima i peti.'}`,
      '**Pamuk koji diše:** stopalo ostaje suvo i posle celog dana u patikama.',
      '**Bela boja:** ide uz sve patike, a pere se na 30 do 40°C.',
    ],
    use: 'klasične visine do sredine lista, za patike i svaki dan',
    seoTitle: `${who} 3/4 čarape klasične visine`,
    seoWhat: `Bele ${men ? 'muške' : 'ženske'} 3/4 čarape od pamuka, klasične visine do sredine lista, za patike, šetnju i teretanu.`,
    tags: [men ? 'muske' : 'zenske', '3-4', 'svakodnevne'],
    pattern: ['jednobojni'],
    sizes: men ? SIZES_MEN : SIZES_WOMEN,
    sku: men ? 'M34' : 'Z34',
    collection: men ? MEN : WOMEN,
    pack: { images: ['t34BelaFlat'], colors: [{ ...WHITE, image: 't34BelaFlat' }] },
    // Par (D-085): četiri boje, svaka flat pa model.
    single: men
      ? pairs(
          [WHITE, 't34BelaFlat', 't34mBelaModel'],
          [BLACK, 't34CrnaFlat', 't34mCrnaModel'],
          [GRAY, 't34SivaFlat', 't34mSivaModel'],
          [NAVY, 't34TegetFlat', 't34mTegetModel'],
        )
      : pairs(
          [WHITE, 't34BelaFlat', 't34zBelaModel'],
          [BLACK, 't34CrnaFlat', 't34zCrnaModel'],
          [GRAY, 't34SivaFlat', 't34zSivaModel'],
          [NAVY, 't34TegetFlat', 't34zTegetModel'],
        ),
  }
}

const nazuvice = (who: Model['who']): Model => {
  const men = who === 'Muške'
  return {
    slug: men ? 'muske-nazuvice' : 'zenske-nazuvice',
    who,
    type: men ? 'muske' : 'zenske',
    name: 'nazuvice',
    kind: 'nazuvice',
    intro: `**${who} nazuvice** su niske čarape do članka, za patike: ne vire iz niske obuće, a pokrivaju petu i štite je od žuljanja. Prave su za leto, trening i patike uz ${men ? 'šorts ili farmerke' : 'farmerke, suknju ili haljinu'}.`,
    bullets: [
      '**Niske, do članka:** ne vide se iz niskih patika, a peta je pokrivena.',
      '**Ne klize sa pete:** elastična manžetna drži nazuvicu na mestu i u pokretu.',
      '**Pojačana peta i prsti:** za dug hod i česte treninge.',
      '**Pamuk koji diše:** prijatne i u najtoplijim danima.',
    ],
    use: 'niske do članka, za patike, trening i leto',
    seoTitle: `${who} nazuvice za patike, do članka`,
    seoWhat: `Bele ${men ? 'muške' : 'ženske'} nazuvice od pamuka, niske do članka: ne vire iz patike i ne klize sa pete.`,
    tags: [men ? 'muske' : 'zenske', 'nazuvice', 'sport', 'leto'],
    pattern: ['jednobojni'],
    sizes: men ? SIZES_MEN : SIZES_WOMEN,
    sku: men ? 'MNZ' : 'ZNZ',
    collection: men ? SPORT : WOMEN,
    pack: { images: ['nzBelaFlat'], colors: [{ ...WHITE, image: 'nzBelaFlat' }] },
    // Par (D-085): četiri boje, svaka flat pa model.
    single: men
      ? pairs(
          [WHITE, 'nzBelaFlat', 'nzmBelaModel'],
          [BLACK, 'nzCrnaFlat', 'nzmCrnaModel'],
          [GRAY, 'nzSivaFlat', 'nzmSivaModel'],
          [NAVY, 'nzTegetFlat', 'nzmTegetModel'],
        )
      : pairs(
          [WHITE, 'nzBelaFlat', 'nzzBelaModel'],
          [BLACK, 'nzCrnaFlat', 'nzzCrnaModel'],
          [GRAY, 'nzSivaFlat', 'nzzSivaModel'],
          [NAVY, 'nzTegetFlat', 'nzzTegetModel'],
        ),
  }
}

const sport = (who: Model['who']): Model => {
  const men = who === 'Muške'
  return {
    slug: men ? 'muske-sportske-carape' : 'zenske-sportske-carape',
    who,
    type: men ? 'muske' : 'zenske',
    name: 'sportske čarape',
    kind: 'sport',
    intro: `**${who} sportske čarape** za trening, trčanje i dug dan na nogama: pamuk upija znoj, a pojačani delovi podnose česte treninge i pranja.`,
    bullets: [
      '**Za trening:** teretana, trčanje, mali fudbal i šetnja.',
      '**Pojačana peta i prsti:** duži vek uz patike i sportsku obuću.',
      '**Pamuk koji diše:** stopalo ostaje suvlje tokom treninga i posle njega.',
    ],
    use: 'za trening, trčanje i patike',
    seoTitle: `${who} sportske čarape od pamuka`,
    seoWhat: `${men ? 'Muške' : 'Ženske'} sportske čarape od pamuka za trening i trčanje, pojačana peta i prsti.`,
    tags: [men ? 'muske' : 'zenske', 'sport', 'trening'],
    pattern: ['jednobojni'],
    sizes: men ? SIZES_MEN : SIZES_WOMEN,
    sku: men ? 'MSP' : 'ZSP',
    collection: SPORT,
    // Paket sportskih (12 pari) i dalje nema fotografiju: ostaje nacrt dok ne stigne.
    pack: { images: [], colors: [WHITE, BLACK], status: 'draft' },
    // Par (D-085): četiri boje, svaka flat pa model.
    single: men
      ? pairs(
          [BLACK, 'spCrnaFlat', 'spmCrnaModel'],
          [WHITE, 'spBelaFlat', 'spmBelaModel'],
          [GRAY, 'spSivaFlat', 'spmSivaModel'],
          [NAVY, 'spTegetFlat', 'spmTegetModel'],
        )
      : pairs(
          [WHITE, 'spBelaFlat', 'spzBelaModel'],
          [BLACK, 'spCrnaFlat', 'spzCrnaModel'],
          [GRAY, 'spSivaFlat', 'spzSivaModel'],
          [NAVY, 'spTegetFlat', 'spzTegetModel'],
        ),
  }
}

const elegant: Model = {
  slug: 'muske-elegantne-carape',
  who: 'Muške',
  type: 'muske',
  name: 'elegantne čarape',
  kind: 'elegant',
  intro:
    '**Muške elegantne čarape** su klasika uz odelo, cipele i poslovnu garderobu: čarapa do sredine lista koja se ne vidi dok sedite i ne klizi u cipeli ceo dan.',
  bullets: [
    '**Modeli:** jednobojne crne, crne sa sivim karo (argyle) dezenom i crne sa sitnim rombom sa strane.',
    '**Pojačana peta i prsti:** delovi koji se najbrže troše su ojačani, pa par duže traje i posle mnogo pranja.',
    '**Pamuk koji diše:** stopalo ostaje suvo i u kožnoj obući, od jutra do večeri.',
    '**Manžetna koja drži bez stezanja:** čarapa ostaje podignuta i ne ostavlja otisak na koži.',
    '**Za posao, svadbe i proslave:** uz odelo, chino pantalone ili tamne farmerke sa cipelama.',
  ],
  use: 'za odelo, posao i svečane prilike',
  seoTitle: 'Muške elegantne čarape za odelo',
  seoWhat:
    'Elegantne muške čarape od pamuka za odelo i posao: crne, karo ili sa rombom, pojačana peta i prsti.',
  tags: ['muske', 'elegant', 'klasik'],
  pattern: ['jednobojni', 'graficki'],
  sizes: SIZES_MEN,
  sku: 'MEL',
  collection: MEN,
  pack: {
    images: ['elRombFlat', 'elKaroFlat', 'elTegetFlat'],
    colors: [
      { ...BLACK, image: 'elRombFlat' },
      { value: 'Crna karo', swatch: '#3A3A3A', image: 'elKaroFlat' },
      { value: 'Teget karo', swatch: '#1F2A44', image: 'elTegetFlat' },
    ],
  },
  // Par (D-085): crna (sa sitnim rombom), crna karo i teget karo, svaka flat pa model.
  single: pairs(
    [BLACK, 'elRombFlat', 'elCrnaModel'],
    [{ value: 'Crna karo', swatch: '#3A3A3A' }, 'elKaroFlat', 'elKaroModel'],
    [{ value: 'Teget karo', swatch: '#1F2A44' }, 'elTegetFlat', 'elTegetModel'],
  ),
}

// Redosled: prvo paketi (prva četiri aktivna su izdvojena na početnoj), pa pojedinačni parovi.
const MODELS: Model[] = [
  elegant,
  tri4('Muške'),
  tri4('Ženske'),
  nazuvice('Muške'),
  nazuvice('Ženske'),
  sport('Muške'),
  sport('Ženske'),
]

export const products: SeedProduct[] = [...MODELS.map(pack), ...MODELS.map(single)]

// --- Početna: tekstovi 1:1 iz Figme (frame "pocetna", 50:640) ---
// Naslovi su u Figmi upisani malim slovima i dobijaju velika početna slova preko
// CSS text-transform: capitalize, pa se tako i čuvaju ovde.
// Jedina razlika: duga crta (—) zamenjena je dvotačkom/zarezom (pravilo projekta, D-011).

export const home = {
  hero: {
    // SEO (D-063): H1 sa ključnom reči "čarape", podnaslov sa vrstama, poreklom i dostavom.
    heading: 'Čarape Koje Se Primete',
    subheading: 'Pamučne Čarape Iz Naše Fabrike u Novom Pazaru, Od 1995. Sada Dolaze Pravo Do Tebe',
    primaryCta: { label: 'Poruči Odmah', url: '/kolekcije/sve' },
    secondaryCta: { label: 'Saznaj Našu Priču', url: '/o-nama' },
  },
  categories: {
    heading: 'Čarape za svakog, u svakoj fazi života',
    subheading:
      'Od kancelarije do jutarnjeg trčanja: tri kolekcije, jedna ista opsesija kvalitetom',
    cards: [
      {
        tag1: 'Veličine 38-46',
        tag2: 'Za Njega',
        theme: 'light' as const,
        tagTheme: 'blue' as const,
        title: 'Muške čarape',
        text: 'Pamučne muške čarape u klasičnim bojama i sportskim krojevima. Pojačana peta, pamuk koji diše, stil koji ne mora da se dokazuje',
        image: 'catMen' as ImageKey,
        cta: { label: 'Pogledaj Kolekciju', url: '/kolekcije/muske-carape' },
      },
      {
        tag1: 'Veličine 34-42',
        tag2: 'Za Nju',
        theme: 'light' as const,
        tagTheme: 'yellow' as const,
        title: 'Ženske čarape',
        text: 'Mekane ženske čarape od pamuka, od suptilnih tonova do sportskih modela. Kroj koji prati stopalo, bez stezanja',
        image: 'catWomen' as ImageKey,
        cta: { label: 'Pogledaj Kolekciju', url: '/kolekcije/zenske-carape' },
      },
      {
        tag1: 'Trening',
        tag2: 'Aktivan život',
        theme: 'blue' as const,
        tagTheme: 'dark-blue' as const,
        title: 'Sportske čarape',
        text: 'Sportske čarape za trening i trčanje. Ojačan đon tamo gde treba, disanje tamo gde je najbitnije.',
        image: 'catSport' as ImageKey,
        cta: { label: 'Pogledaj Kolekciju', url: '/kolekcije/sport-i-aktivne' },
      },
    ],
  },
  featured: {
    heading: 'Parovi koje bismo mi prvi stavili u korpu',
    note: 'Ovo nisu slučajni bestseleri: ovo je ono što nosimo i mi, u fabrici i van nje.',
    buttonLabel: 'Dodaj u Korpu',
    colorsLabel: 'Dostupne Boje',
  },
  ctaBanner: {
    headingLine1: 'Sve boje',
    headingLine2: 'jedno mesto',
    text: 'Muške, ženske i sportske čarape na jednom mestu: kompletna Cambio kolekcija, filtrirana po veličini, boji i prilici.',
    cta: { label: 'Pogledaj Kolekciju', url: '/kolekcije/sve' },
  },
  reviews: {
    heading: 'Šta kažu oni koji su već prošetali u njima',
    subheading: 'Prava iskustva ljudi koji nose Cambio svaki dan',
    topCta: { label: 'Pogledaj Kolekciju', url: '/kolekcije/sve' },
    formButtonLabel: 'Ostavi Recenziju',
  },
  newsletter: {
    heading: 'Ne oklevaj',
    subheading: 'Tvoj Sledeći Par Te Čeka',
    placeholder: 'Prijavi se na Newsletter',
    // **...** se prikazuje žutom bojom, kao u Figmi.
    note: 'Prijavi se i **uzmi 10% popusta** na prvu porudžbinu, a o novim modelima saznaj prvi',
  },
}

// --- Stranice ---

export const about = {
  // Figma 60:766: fotografija sa zatamnjenjem 50%, naslov i podnaslov (sloj "headings").
  hero: {
    heading: 'Naša priča',
    subheading:
      'Pre nego što smo postali brend, bili smo fabrika. Ovo je priča o tome kako se to promenilo',
  },
  intro: {
    heading: 'Sve je počelo jednom jednostavnom idejom.',
    lead: 'Čarapa mora da bude udobna pre nego što bude bilo šta drugo.',
    text: 'Cambio je krenuo 1995. godine u Novom Pazaru, gradu koji decenijama diše tekstil. Od male radionice stigli smo do fabrike sa 32 mašine, ali brojevi nikada nisu bili poenta. Poenta je ostao pamuk: biramo najfiniji, sarađujemo sa proverenim dobavljačima i svaki par pregledamo pre nego što krene dalje.',
  },
  brand: {
    heading: 'Tri decenije iskustva. Prvi put, direktno za tebe.',
    text: 'Godinama smo pravili čarape za partnere širom regiona. Verovatno si nosio Cambio, a da nisi znao. Danas isti zanat izlazi pod našim imenom: bez posrednika, bez kompromisa, u modernijem i hrabrijem izdanju. Kobalt i neon nisu slučajni. To je naš način da kažemo da čarapa može biti deo toga ko si.',
    note: 'ZA SVE GENERACIJE, OD 6 DO 90',
  },
  stats: {
    heading: 'Brojevi iza svakog para.',
    description:
      'Kapacitet je važan. Ali pažnja koju posvećujemo svakom paru je ono po čemu nas pamtiš.',
    items: [
      { number: '1995', label: 'GODINA OSNIVANJA', highlight: true, image: 'stat1995' as ImageKey },
      { number: '32', label: 'MAŠINE U POGONU', highlight: false, image: 'stat32' as ImageKey },
      { number: '200.000+', label: 'PARI MESEČNO', highlight: true, image: 'stat200k' as ImageKey },
      { number: '5', label: 'ZEMALJA REGIONA', highlight: false, image: 'stat5' as ImageKey },
    ],
    ctaText: 'Upoznaj proizvod, ne samo priču.',
    cta: { label: 'Pogledaj Kolekciju', url: '/kolekcije/sve' },
  },
}

export const contact = {
  heading: 'Kontakt',
  description:
    'Imate pitanje o proizvodu, porudžbini ili isporuci? Naš tim će vam odgovoriti u najkraćem roku.',
  email: 'cambio.carape@gmail.com',
  phone: '+381 63 785 9390',
  address: 'Ulica Pante Gajića 22, 36300 Novi Pazar',
  availability: 'Ponedeljak-petak · 09:00-17:00',
  // Profili na mrežama (D-080): stalne adrese, bez parametara za praćenje iz deljenih linkova.
  instagram: 'https://www.instagram.com/cambiosocks/',
  facebook: 'https://www.facebook.com/profile.php?id=100066785253816',
  formHeading: 'Pošaljite nam poruku',
  formDescription: 'Popunite formu i javićemo vam se u roku od jednog radnog dana.',
  topics: 'Porudžbina\nProizvod\nIsporuka i reklamacije\nRecenzija\nSaradnja\nOstalo',
  consentText: 'Saglasan/na sam sa obradom podataka u svrhu odgovora na upit.',
  responseNote: 'Odgovaramo za manje od 24h',
  successMessage: 'Hvala! Poruka je poslata, javićemo vam se uskoro.',
}

export const faq = {
  heading: 'Često postavljana pitanja',
  description:
    'Odgovori na najčešća pitanja o kupovini čarapa: dostava, plaćanje pouzećem, veličine, materijal, vraćanje i održavanje.',
  // AEO (D-063): pitanja kako ih kupci postavljaju, prva rečenica odgovora je direktan odgovor
  // (Google i AI asistenti je preuzimaju kao odgovor). Činjenice moraju da prate uslove (D-061).
  items: [
    {
      question: 'Kako da poručim čarape online?',
      answer:
        'Izaberite model, veličinu i boju, dodajte čarape u korpu i na stranici za poručivanje unesite ime, telefon i adresu. Nalog nije potreban, a potvrda porudžbine stiže vam na email odmah po slanju.',
    },
    {
      question: 'Koliko košta dostava i koliko traje?',
      answer:
        'Dostava košta 300 RSD po porudžbini, a za porudžbine od 2.000 RSD je besplatna. Šaljemo kurirskom službom AKS i pošiljka stiže za 1 do 3 radna dana, na celoj teritoriji Srbije.',
    },
    {
      question: 'Kako se plaća porudžbina?',
      answer:
        'Plaća se pouzećem, gotovinom kuriru prilikom preuzimanja pošiljke. Fiskalni račun stiže uz pošiljku, a sve cene na sajtu su u dinarima sa uračunatim PDV-om.',
    },
    {
      question: 'Koju veličinu čarapa da izaberem?',
      answer:
        'Izaberite veličinu prema broju obuće: oznaka 41-46 znači da je čarapa za brojeve od 41 do 46. Ako ste na granici dva raspona, za sportske čarape uzmite manju, a za svakodnevne veću; detaljna tabela je u vodiču Tabela veličina čarapa na blogu.',
    },
    {
      question: 'Od čega su Cambio čarape?',
      answer:
        'Cambio čarape su od pamuka, sa dodatkom elastičnih niti u manžetni koje ih drže na mestu. Tačan sastav svakog modela piše na stranici proizvoda, u odeljku Materijal i održavanje.',
    },
    {
      question: 'Gde se proizvode Cambio čarape?',
      answer:
        'Cambio čarape se proizvode u našoj fabrici u Novom Pazaru, u Srbiji, gde pravimo čarape od 1995. U pogonu radi 32 mašine za pletenje, a svaki par pregledamo pre pakovanja.',
    },
    {
      question: 'Koje čarape su najbolje za trčanje i trening?',
      answer:
        'Za trčanje i trening najbolje su sportske čarape sa ojačanim đonom, zonom koja diše i trakom oko svoda koja ih drži na mestu. Takve čarape ne klize u patici i čuvaju stopalo od žuljeva; pogledajte kolekciju Sportske čarape.',
    },
    {
      question: 'Kako da održavam čarape da duže traju?',
      answer:
        'Perite ih naopačke na 30 do 40°C sa sličnim bojama, bez izbeljivača i omekšivača, i sušite na vazduhu, ne u sušilici. Tako pamuk i elastičnost manžetne traju mnogo duže.',
    },
    {
      question: 'Kako mogu da pratim porudžbinu?',
      answer:
        'Čim pošiljka krene, dobijate email sa brojem pošiljke i linkom za praćenje kod kurirske službe.',
    },
    {
      question: 'Da li mogu da vratim čarape?',
      answer:
        'Da, od kupovine možete da odustanete u roku od 14 dana od prijema, bez navođenja razloga. Čarape stižu u zapečaćenom pakovanju i iz higijenskih razloga se ne mogu vratiti ako je pakovanje otvoreno; postupak i obrazac su na stranici Reklamacije i odustanak.',
    },
    {
      question: 'Da li je moguća zamena veličine?',
      answer:
        'Da, ako vam veličina ne odgovara, javite nam se u roku od 14 dana od prijema i dogovorićemo zamenu. Čarape treba da budu nenošene, neoprane i u originalnom pakovanju.',
    },
    {
      question: 'Šta ako čarape imaju nedostatak?',
      answer:
        'Proizvod sa nedostatkom možete da reklamirate u roku od dve godine od isporuke. Na reklamaciju odgovaramo u roku od 8 dana, rešavamo je u roku od 15 dana, a troškove slanja snosimo mi.',
    },
    {
      question: 'Da li čarape prodajete pojedinačno ili u paketu?',
      answer:
        'Oba. Svaki model možete da kupite kao pojedinačan par ili u paketu od 12 pari iste boje i veličine. Paket je isplativiji: nazuvice 1.200 RSD, 3/4 čarape 1.400 RSD, a sportske i elegantne 1.600 RSD za 12 pari. Paket je i praktičan poklon, a stiže u zapečaćenom originalnom pakovanju.',
    },
    {
      question: 'Da li je potreban nalog za kupovinu?',
      answer:
        'Ne, nalog nije potreban. Kupujete kao gost, a svi podaci o porudžbini stižu vam na email.',
    },
    {
      question: 'Da li isporučujete van Srbije?',
      answer:
        'Za sada isporučujemo samo na teritoriji Srbije. Za veće porudžbine iz regiona pišite nam na email i dogovorićemo isporuku.',
    },
    {
      question: 'Da li prodajete čarape na veliko?',
      answer:
        'Da, kao proizvođač radimo i sa partnerima i prodavnicama. Pišite nam na cambio.carape@gmail.com ili preko kontakt forme (tema Saradnja) i poslaćemo ponudu.',
    },
  ],
  support: {
    show: true,
    title: 'Niste pronašli odgovor?',
    text: 'Naš tim je tu da pomogne. Pišite nam i odgovorićemo u roku od jednog radnog dana.',
    buttonLabel: 'Kontaktirajte nas',
    buttonUrl: '/kontakt',
    availability: 'Ponedeljak-petak · 09:00-17:00',
  },
}

/** SEO naslovi i opisi CMS stranica (D-063), po slug-u; naslov do 60, opis do 160 znakova. */
export const pageSeo: Record<string, { title: string; description: string }> = {
  'o-nama': {
    title: 'O nama: fabrika čarapa u Novom Pazaru od 1995.',
    description:
      'Cambio je proizvođač čarapa iz Novog Pazara: od 1995, 32 mašine i više od 200.000 pari mesečno. Pamučne čarape iz naše fabrike, direktno do vas.',
  },
  kontakt: {
    title: 'Kontakt',
    description:
      'Pitanje o čarapama, porudžbini ili dostavi? Pišite na cambio.carape@gmail.com ili pozovite +381 63 785 9390, radnim danima od 9 do 17h.',
  },
  'cesta-pitanja': {
    title: 'Česta pitanja o kupovini čarapa',
    description:
      'Koliko košta dostava, kako se plaća, koju veličinu izabrati i kako vratiti čarape: odgovori na najčešća pitanja kupaca Cambio online prodavnice.',
  },
  dostava: {
    title: 'Dostava i plaćanje',
    description:
      'Dostava čarapa širom Srbije kurirskom službom AKS za 300 RSD, besplatno od 2.000 RSD. Isporuka za 1 do 3 radna dana, plaćanje pouzećem, fiskalni račun uz pošiljku.',
  },
  'uslovi-koriscenja': {
    title: 'Uslovi korišćenja i kupovine',
    description:
      'Uslovi kupovine u Cambio online prodavnici: podaci o prodavcu, cene sa PDV-om, poručivanje, plaćanje pouzećem, pravo na odustanak i reklamacije.',
  },
  reklamacije: {
    title: 'Reklamacije i odustanak od kupovine',
    description:
      'Kako da reklamirate ili vratite čarape: odustanak u roku od 14 dana, reklamacija 2 godine, odgovor za 8 dana. Obrazac za odustanak na stranici.',
  },
  privatnost: {
    title: 'Politika privatnosti',
    description:
      'Kako Cambio doo Novi Pazar obrađuje podatke kupaca: koje podatke prikupljamo, zašto, koliko ih čuvamo i koja su vaša prava. Bez kolačića za praćenje.',
  },
}

// Pravne stranice i linkovi u dnu footer-a (D-061)
export { footerCopyright, footerLegalLinks, legalPages } from './legal'

// --- Blog (članci iz Figma dizajna) ---
// SEO/AEO (D-063): članci odgovaraju na pitanja koja kupci pretražuju ("kako oprati čarape",
// "koje čarape za trčanje", "veličina čarapa"). Podnaslovi su pitanja, prva rečenica ispod je
// direktan odgovor, a linkovi vode na kolekcije i proizvode. Slug je fiksan (postojeći linkovi).
export const posts = [
  {
    title: '5 saveta kako da produžite životnost vaše omiljene čarape',
    slug: '5-saveta-kako-da-produzite-zivotnost-vase-omiljene-carape',
    subtitle:
      'Kratka i korisna uputstva za bolje pranje, sušenje i organizaciju svakodnevnih čarapa.',
    readTime: 5,
    excerpt:
      'Kako prati čarape da traju duže: pranje naopačke na 30 do 40°C, bez izbeljivača i sušilice, i rotacija parova. Pet saveta iz fabrike čarapa.',
    seoTitle: 'Kako prati čarape da duže traju: 5 saveta',
    image: 'blogFeatured' as ImageKey,
    tags: ['Saveti', 'Održavanje'],
    featured: true,
    publishedAt: '2026-03-12T09:00:00.000Z',
    body: `Čarape najduže traju kada se peru naopačke na 30 do 40°C, bez izbeljivača i omekšivača, suše na vazduhu i nose u rotaciji sa drugim parovima. Ovo su saveti koje i sami primenjujemo, posle tri decenije pravljenja čarapa u Novom Pazaru.
## 1. Zašto čarape treba prati naopačke?
Pranjem naopačke štitite spoljnu stranu čarape od trenja u bubnju. Boja duže ostaje živa, a pamuk ne pravi kuglice. Unutrašnja strana, koja je u dodiru sa kožom, tako se i bolje opere.
## 2. Na kojoj temperaturi prati čarape?
Za većinu pamučnih čarapa dovoljno je 30 do 40°C. Viša temperatura brže troši elastične niti u manžetni, pa čarapa počinje da spada niz nogu. Bele čarape možete povremeno oprati na 60°C, ali ne svaki put.
## 3. Da li koristiti izbeljivač i omekšivač?
Ne. Izbeljivač slabi vlakna i pravi tanke tačke na peti i prstima, a omekšivač smanjuje sposobnost pamuka da upija vlagu, pa se stopalo više znoji. Za bele čarape bolje je potapanje u mlakoj vodi sa malo sode bikarbone pre pranja.
## 4. Da li čarape smeju u sušilicu?
Bolje je da ne. Toplota u sušilici skraćuje život elastičnih niti i skuplja pamuk. Čarape se na vazduhu, na štipaljkama ili na sušilici za veš, osuše za nekoliko sati.
## 5. Koliko pari čarapa treba imati?
Dovoljno da svaki par posle pranja "odmori" bar dan ili dva. Kada imate sedam do deset pari u rotaciji, svaki se manje troši i duže zadržava oblik. Zato su naše čarape u paketu od 12 pari, na primer [muške elegantne](/proizvodi/muske-elegantne-carape) ili [ženske 3/4 čarape](/proizvodi/zenske-carape-3-4).
## Kada je vreme za nove čarape?
Kada se peta istanji toliko da se kroz nju vidi koža, ili kada manžetna više ne drži čarapu na mestu. Tada je vreme za novi par: pogledajte [muške](/kolekcije/muske-carape), [ženske](/kolekcije/zenske-carape) ili [sportske čarape](/kolekcije/sport-i-aktivne).`,
  },
  {
    title: '3 načina da kombinujete čarape sa svakodnevnim outfitom',
    slug: '3-nacina-da-kombinujete-carape-sa-svakodnevnim-outfitom',
    readTime: 4,
    excerpt:
      'Bele čarape uz bele patike, crne uz cipele i odelo, a boja kao detalj koji se primeti. Tri jednostavna pravila za kombinovanje čarapa.',
    seoTitle: 'Kako kombinovati čarape uz patike i cipele',
    image: 'blogOutfit' as ImageKey,
    tags: ['Trendovi', 'Kolekcija'],
    featured: false,
    publishedAt: '2026-03-05T09:00:00.000Z',
    body: `Čarape najlakše kombinujete po jednom pravilu: ili se slažu sa obućom, ili su namerno upadljiv detalj. Ovo su tri kombinacije koje uvek rade.
## Koje čarape uz bele patike?
Bele čarape uz bele patike su najsigurnija kombinacija za leto i ležeran stil: noga izgleda duže, a izgled je čist. Birajte srednju visinu, koja proviri iznad patike, ili niske čarape uz kratke pantalone. Pogledajte bele 3/4 čarape klasične visine, [ženske](/proizvodi/zenske-carape-3-4) i [muške](/proizvodi/muske-carape-3-4), ili niske [nazuvice](/proizvodi/zenske-nazuvice) uz kratke pantalone.
## Koje čarape uz odelo i cipele?
Uz odelo i cipele nosite tamne čarape, crne, sive ili teget, u tonu pantalona ili cipela. Čarapa treba da bude dovoljno visoka da se pri sedenju ne vidi koža između pantalona i čarape. Crne [muške elegantne čarape](/proizvodi/muske-elegantne-carape) idu uz skoro svako odelo.
## Kako nositi čarape u boji?
Čarape u boji ili sa printom najbolje izgledaju kada su jedini upadljiv detalj: uz jednobojne pantalone i neutralnu obuću. Neka se boja čarape ponovi još jednom u outfitu, na primer na kapi ili majici, i kombinacija deluje promišljeno.
## Da li se vide čarape uz patike?
Zavisi od stila. Niske čarape su za kratke pantalone i letnje dane, a srednja visina, koja se vidi iznad patike, sada je deo stila. Za trening birajte [sportske čarape](/kolekcije/sport-i-aktivne) koje ne klize u patici.
## Najvažnije pravilo
Udobnost je ispred trenda. Čarapa koja steže ili klizi pokvariće i najbolji outfit, zato birajte pravu [veličinu čarapa](/blog/tabela-velicina-carapa) i pamuk koji diše.`,
  },
  {
    title: 'Zašto pamuk i komfor treba da budu prvi izbor za svakodnevne čarape',
    slug: 'zasto-pamuk-i-komfor-treba-da-budu-prvi-izbor-za-svakodnevne-carape',
    readTime: 5,
    excerpt:
      'Pamučne čarape upijaju vlagu, dišu i ne iritiraju kožu, pa su najbolji izbor za svaki dan. Šta pamuk čini boljim od sintetike i kako prepoznati kvalitetnu čarapu.',
    seoTitle: 'Pamučne čarape: zašto su najbolje za svaki dan',
    image: 'blogCotton' as ImageKey,
    tags: ['Materijali', 'Kvalitet'],
    featured: false,
    publishedAt: '2026-02-26T09:00:00.000Z',
    body: `Pamučne čarape su najbolji izbor za svakodnevno nošenje jer upijaju vlagu, dišu i ne iritiraju kožu. Stopalo u pamučnoj čarapi ostaje suvo i kada ste ceo dan u zatvorenoj obući.
## Da li su pamučne čarape bolje od sintetičkih?
Za svakodnevno nošenje, da. Pamuk upija vlagu i propušta vazduh, pa se stopalo manje znoji i manje miriše. Sintetička vlakna su korisna u sportskim čarapama, gde brzo odvode znoj, ali za ceo dan na poslu ili u školi pamuk je prijatniji.
## Zašto pamučne čarape imaju i malo elastičnih niti?
Čist pamuk nema elastičnost, pa bi čarapa spadala niz nogu. Mala količina elastičnih niti u manžetni i oko stopala drži čarapu na mestu, a ne menja osećaj pamuka na koži. Tačan sastav svakog modela piše na stranici proizvoda.
## Kako prepoznati kvalitetnu čarapu?
- **Pojačana peta i prsti:** tu se čarapa najviše troši.
- **Ravan šav na prstima:** ne žulja i ne pravi pritisak.
- **Manžetna bez otiska:** drži, a ne steže.
- **Gustina pletenja:** kada čarapu rastegnete, ne vidi se kroz nju.
## Zašto je komfor bitniji od izgleda?
Čarapu nosite ceo dan, a primećujete je samo kada smeta. Žulj, nabor u cipeli ili manžetna koja steže kvare dan, ma koliko čarapa lepo izgledala. Zato naše čarape pravimo prvo udobne, pa tek onda lepe.
## Gde kupiti pamučne čarape?
Naše pamučne čarape pravimo u fabrici u Novom Pazaru i šaljemo ih na kućnu adresu širom Srbije: [muške čarape](/kolekcije/muske-carape), [ženske čarape](/kolekcije/zenske-carape) i [sportske čarape](/kolekcije/sport-i-aktivne).`,
  },
  {
    title: 'Kako da izaberete čarape za trening koje neće ometati tokom aktivnosti',
    slug: 'kako-da-izaberete-carape-za-trening-koje-nece-ometati-tokom-aktivnosti',
    readTime: 5,
    excerpt:
      'Čarape za trening i trčanje treba da prijanjaju uz stopalo, imaju ojačan đon i zonu koja diše. Kako izabrati veličinu, visinu i materijal sportskih čarapa.',
    seoTitle: 'Kako izabrati čarape za trčanje i trening',
    image: 'blogTraining' as ImageKey,
    tags: ['Aktivni stil', 'Trening'],
    featured: false,
    publishedAt: '2026-02-18T09:00:00.000Z',
    body: `Dobre čarape za trening prijanjaju uz stopalo bez nabora, imaju ojačan đon koji ublažava udarce i zonu koja diše i odvodi znoj. Tako sprečavaju žuljeve i klizanje u patici, pa mislite na trening, a ne na stopala.
## Koju veličinu sportskih čarapa da izaberem?
Sportska čarapa treba da prijanja uz stopalo, bez viška materijala na prstima i peti. Ako ste na granici dva raspona, izaberite manju veličinu; prevelika čarapa pravi nabore, a nabori prave žuljeve. Sve veličine su u vodiču [Tabela veličina čarapa](/blog/tabela-velicina-carapa).
## Zašto sportska čarapa ima ojačan đon?
Ojačan đon ublažava udarce pri trčanju i skokovima i štiti petu i prednji deo stopala od trenja. Na dugim treninzima to je razlika između udobnog stopala i žulja.
## Kakav materijal je najbolji za trening?
Materijal koji brzo odvodi vlagu i ima mrežastu zonu na gornjem delu stopala. Suvo stopalo se manje tare o patiku, pa je manje žuljeva i neprijatnog mirisa.
## Kolika treba da bude visina čarape za trening?
- **Niske čarape** su dobre za teretanu i trening u zatvorenom.
- **Srednja visina** štiti skočni zglob od trenja o ivicu patike pri trčanju.
- **Više čarape** su za trčanje po stazi i hladnije dane.
## Koliko pari sportskih čarapa vam treba?
Ako trenirate tri do četiri puta nedeljno, bar četiri do pet pari, da svaki par posle pranja odmori i zadrži elastičnost.
## Naše sportske čarape
Za trening su tu nazuvice do članka, [muške](/proizvodi/muske-nazuvice) i [ženske](/proizvodi/zenske-nazuvice), i 3/4 čarape klasične visine, [muške](/proizvodi/muske-carape-3-4) i [ženske](/proizvodi/zenske-carape-3-4), kao par ili u paketu od 12 pari. Sportske čarape za trening su uskoro u ponudi u kolekciji [Sportske čarape](/kolekcije/sport-i-aktivne).`,
  },
  {
    title: 'Tabela veličina čarapa: kako da izaberete pravu veličinu',
    slug: 'tabela-velicina-carapa',
    readTime: 4,
    excerpt:
      'Veličina čarapa se bira prema broju obuće: oznaka 41-46 znači brojeve od 41 do 46. Tabela veličina za muške, ženske i sportske čarape i saveti za granične brojeve.',
    seoTitle: 'Tabela veličina čarapa: muške, ženske i sportske',
    image: 'stat5' as ImageKey,
    tags: ['Vodič', 'Veličine'],
    featured: false,
    publishedAt: '2026-10-26T09:00:00.000Z',
    body: `Veličinu čarapa birate prema broju obuće: oznaka na čarapi pokazuje raspon brojeva cipela kojima odgovara. Ako nosite broj 43, čarapa 41-46 ili 42-44 je za vas.
## Kako se čitaju veličine čarapa?
Veličina čarape je raspon brojeva obuće, na primer 38-42. Čarapa je pletena tako da se lagano rasteže, pa jedna veličina pokriva nekoliko brojeva. Uvek gledajte broj cipela koji najčešće nosite, a ne broj patika koje su vam malo veće.
## Tabela veličina muških čarapa
- **38-42:** za obuću od broja 38 do 42
- **42-44:** za obuću broj 42, 43 i 44
- **44-46:** za obuću broj 44, 45 i 46
Pogledajte [muške čarape](/kolekcije/muske-carape).
## Tabela veličina ženskih čarapa
- **34-36:** za obuću broj 34, 35 i 36
- **36-38:** za obuću broj 36, 37 i 38
- **38-42:** za obuću od broja 38 do 42
Pogledajte [ženske čarape](/kolekcije/zenske-carape).
## Tabela veličina sportskih čarapa
- **36-40:** za obuću od broja 36 do 40
- **41-46:** za obuću od broja 41 do 46
- **47-51:** za obuću od broja 47 do 51
Pogledajte [sportske čarape](/kolekcije/sport-i-aktivne).
## Šta ako sam između dve veličine?
Ako vaš broj upada u dva raspona (na primer broj 42 je i u 38-42 i u 42-44), birajte prema tome kako volite da čarapa stoji:
- **Manja veličina** čvršće prijanja uz stopalo. Bolja je za sportske čarape, jer nema nabora u patici.
- **Veća veličina** je opuštenija na prstima. Bolja je za svakodnevno nošenje i za šire stopalo.
## Šta ako veličina ne odgovara?
Javite nam se u roku od 14 dana od prijema i dogovorićemo zamenu za odgovarajuću veličinu; čarape treba da budu nenošene i u originalnom pakovanju. Sve o vraćanju je na stranici [Reklamacije i odustanak](/reklamacije).`,
  },
]

// --- Demo recenzije (D-068) ---
// Tekstovi iz Figme (sekcija recenzija, 35:754), vezani za demo proizvode po slug-u.
// Nisu stvarne recenzije kupaca: obrisati ih u adminu (Prodaja > Recenzije) pre puštanja u rad.
export const demoReviews = [
  {
    product: 'muske-elegantne-carape',
    name: 'Marko Petrović',
    text: 'Najudobnije čarape koje sam ikad nosio. Nisu previše tanke, nisu previše debele - baš ono što treba za svakodnevno nošenje.',
  },
  {
    product: 'muske-carape-3-4',
    name: 'Nikola Jovanović',
    text: 'Cambio sport čarape su savršene za trening i trčanje. Ne klize, ne stežu i osećaju se kao deo noge.',
  },
  {
    product: 'zenske-carape-3-4',
    name: 'Ana Marković',
    text: 'Suptilne boje, udoban kroj i pamuk koji se oseća prirodno. Baš ono što sam tražila za svakodnevnu garderobu.',
  },
  {
    product: 'zenske-nazuvice',
    name: 'Jovana Stojanović',
    text: 'Ove čarape su prve koje nisu bile previše tesne za stopalo, a istovremeno su zadržale oblik čak i posle nekoliko pranja.',
  },
  {
    product: 'muske-elegantne-carape',
    name: 'Marija Đorđević',
    text: 'Kupila sam ih za muža i sina, a sada ih kupujem i za sebe. Kvalitet je isti u svakoj kolekciji.',
  },
  {
    product: 'muske-nazuvice',
    name: 'Stefan Ilić',
    text: 'Najbolje su mi bile za dugotrajne treninge. Nisu se stezale, nisu klizile i nisu bile previše vrele.',
  },
] as const
