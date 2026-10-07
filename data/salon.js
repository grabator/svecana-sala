/*
 * Svečani salon - SVI podaci o salonu na jednom mjestu.
 *
 * Za novog klijenta mijenjaš samo ovaj fajl (i slike u assets/img/).
 * Svaki tekst je objekat po jeziku: { bs: '...', hr: '...', en: '...', de: '...' }.
 * Ako neki jezik fali, stranica pokaže engleski, pa bosanski tekst.
 * Sve sekcije su opcionalne: ako polje obrišeš ili ostaviš prazno ([] ili null), sekcija se ne prikazuje.
 *
 * DEMO: "Svečani salon Aurora" je izmišljen salon. Kontakt, cijene, termini i utisci su primjer.
 */
window.SALON = {
  /* ---------- osnovno (obavezno) ---------- */
  name: 'Aurora',
  kind: { bs: 'Svečani salon', hr: 'Svečani salon', en: 'Event venue', de: 'Festsaal' },
  city: 'Mostar',
  title: { bs: 'Svečani salon Aurora · Mostar', hr: 'Svečani salon Aurora · Mostar', en: 'Aurora Event Venue · Mostar', de: 'Festsaal Aurora · Mostar' },
  tagline: {
    bs: 'Svadbe i proslave koje se pamte, uz pogled na Neretvu.',
    hr: 'Vjenčanja i proslave koje se pamte, uz pogled na Neretvu.',
    en: 'Weddings and celebrations to remember, overlooking the Neretva.',
    de: 'Hochzeiten und Feiern, die in Erinnerung bleiben, mit Blick auf die Neretva.'
  },
  /* jezici stranice (prvi je zadani) */
  languages: ['bs', 'hr', 'en', 'de'],
  currency: 'KM',
  /* demo: napomena u footeru i stranica sakrivena od Googlea (za pravog klijenta: false + obrisati noindex u index.html) */
  demo: true,
  demoNote: {
    bs: 'Demo stranica, primjer rada. Salon, cijene, termini i kontakt su izmišljeni.',
    hr: 'Demo stranica, primjer rada. Salon, cijene, termini i kontakt su izmišljeni.',
    en: 'Demo website, a portfolio example. The venue, prices, dates and contact details are fictional.',
    de: 'Demo-Website, ein Arbeitsbeispiel. Saal, Preise, Termine und Kontaktdaten sind erfunden.'
  },
  credit: null,

  /* boje (opcionalno): iste varijable kao na vrhu css/style.css, npr. { gold: '#c9a35b', ink: '#14201c' } */
  theme: null,

  /* prvi ekran: prava slika ili video (null = ilustracija). video: { mp4, webm, poster } */
  hero: { image: null, video: null },

  /* ključne brojke ispod naslova (ikonice iz js/icons.js) */
  stats: [
    { icon: 'guests', value: '450', label: { bs: 'gostiju', hr: 'gostiju', en: 'guests', de: 'Gäste' } },
    { icon: 'hall', value: '3', label: { bs: 'sale', hr: 'dvorane', en: 'halls', de: 'Säle' } },
    { icon: 'parking', value: '150', label: { bs: 'parking mjesta', hr: 'parkirnih mjesta', en: 'parking spaces', de: 'Parkplätze' } },
    { icon: 'suite', label: { bs: 'apartman za mladence', hr: 'apartman za mladence', en: 'bridal suite', de: 'Brautsuite' } }
  ],

  /* ---------- kontakt ---------- */
  contact: {
    phone: '+387 36 000 000',
    viber: '+38761000000',
    whatsapp: '38761000000',
    email: 'info@salon-aurora.ba',
    instagram: 'salon.aurora',
    facebook: 'salonaurora',
    hours: {
      bs: 'Razgledanje i dogovori: pon–sub, 10–19 h',
      hr: 'Razgledavanje i dogovori: pon–sub, 10–19 h',
      en: 'Viewings and meetings: Mon–Sat, 10 am–7 pm',
      de: 'Besichtigungen und Termine: Mo–Sa, 10–19 Uhr'
    }
  },

  /* ---------- sale ---------- */
  halls: [
    {
      id: 'velika', scene: 'grandHall', seated: 450, standing: 600,
      name: { bs: 'Velika sala', hr: 'Velika dvorana', en: 'Grand Hall', de: 'Großer Saal' },
      text: {
        bs: 'Visoki stropovi, kristalni lusteri i veliki plesni podij. Za velike svadbe i svečane večeri.',
        hr: 'Visoki stropovi, kristalni lusteri i veliki plesni podij. Za velika vjenčanja i svečane večeri.',
        en: 'High ceilings, crystal chandeliers and a large dance floor. Made for big weddings and gala nights.',
        de: 'Hohe Decken, Kristalllüster und eine große Tanzfläche. Für große Hochzeiten und festliche Abende.'
      },
      features: ['stage', 'dance', 'light']
    },
    {
      id: 'kristalna', scene: 'crystalHall', seated: 180, standing: 250,
      name: { bs: 'Kristalna sala', hr: 'Kristalna dvorana', en: 'Crystal Hall', de: 'Kristallsaal' },
      text: {
        bs: 'Intimnija sala sa pogledom na rijeku. Idealna za manje svadbe, krstitke, akike i rođendane.',
        hr: 'Intimnija dvorana s pogledom na rijeku. Idealna za manja vjenčanja, krštenja i rođendane.',
        en: 'A more intimate hall with a river view. Ideal for smaller weddings, christenings and birthdays.',
        de: 'Ein intimerer Saal mit Flussblick. Ideal für kleinere Hochzeiten, Taufen und Geburtstage.'
      },
      features: ['view', 'dance']
    },
    {
      id: 'vrt', scene: 'garden', seated: 250, standing: 350,
      name: { bs: 'Vrt i terasa', hr: 'Vrt i terasa', en: 'Garden and terrace', de: 'Garten und Terrasse' },
      text: {
        bs: 'Vjenčanje pod vedrim nebom: pergola sa svjetlima, travnjak i terasa uz rijeku. Od maja do septembra.',
        hr: 'Vjenčanje pod vedrim nebom: pergola sa svjetlima, travnjak i terasa uz rijeku. Od svibnja do rujna.',
        en: 'A wedding under the open sky: a pergola with string lights, lawn and riverside terrace. May to September.',
        de: 'Hochzeit unter freiem Himmel: Pergola mit Lichterketten, Rasen und Terrasse am Fluss. Mai bis September.'
      },
      features: ['outdoor', 'ceremony', 'light']
    }
  ],

  /* ---------- meniji (price: cijena po osobi, null = na upit) ---------- */
  menus: [
    {
      id: 'klasik', price: 65,
      name: { bs: 'Klasik', hr: 'Klasik', en: 'Classic', de: 'Klassik' },
      courses: [
        { bs: 'Hladno predjelo: pršut, sirevi, masline', hr: 'Hladno predjelo: pršut, sirevi, masline', en: 'Cold starter: prosciutto, cheeses, olives', de: 'Kalte Vorspeise: Pršut, Käse, Oliven' },
        { bs: 'Teleća čorba', hr: 'Teleća juha', en: 'Veal soup', de: 'Kalbssuppe' },
        { bs: 'Miješano meso sa prilozima', hr: 'Miješano meso s prilozima', en: 'Mixed grill with sides', de: 'Gemischte Grillplatte mit Beilagen' },
        { bs: 'Sezonska salata', hr: 'Sezonska salata', en: 'Seasonal salad', de: 'Saisonsalat' }
      ],
      includes: ['drinks', 'cake']
    },
    {
      id: 'gala', price: 85, featured: true,
      name: { bs: 'Gala', hr: 'Gala', en: 'Gala', de: 'Gala' },
      courses: [
        { bs: 'Topli i hladni aperitiv dobrodošlice', hr: 'Topli i hladni aperitiv dobrodošlice', en: 'Warm and cold welcome bites', de: 'Warme und kalte Begrüßungshäppchen' },
        { bs: 'Hercegovačka plata i domaći hljeb', hr: 'Hercegovačka plata i domaći kruh', en: 'Herzegovinian platter and homemade bread', de: 'Herzegowinische Platte und hausgemachtes Brot' },
        { bs: 'Krem čorba od gljiva', hr: 'Krem juha od gljiva', en: 'Cream of mushroom soup', de: 'Pilzcremesuppe' },
        { bs: 'Teletina ispod sača i pastrmka sa Neretve', hr: 'Teletina ispod peke i pastrva s Neretve', en: 'Veal under the bell and Neretva trout', de: 'Kalb unter der Glocke und Neretva-Forelle' },
        { bs: 'Desert po izboru', hr: 'Desert po izboru', en: 'Dessert of your choice', de: 'Dessert nach Wahl' }
      ],
      includes: ['drinks', 'cake', 'decor']
    },
    {
      id: 'premium', price: 110,
      name: { bs: 'Premium', hr: 'Premium', en: 'Premium', de: 'Premium' },
      courses: [
        { bs: 'Šampanjac i kanapei na terasi', hr: 'Šampanjac i kanapei na terasi', en: 'Champagne and canapés on the terrace', de: 'Champagner und Kanapees auf der Terrasse' },
        { bs: 'Carpaccio od govedine', hr: 'Carpaccio od govedine', en: 'Beef carpaccio', de: 'Rindercarpaccio' },
        { bs: 'Riblja ili goveđa čorba', hr: 'Riblja ili goveđa juha', en: 'Fish or beef soup', de: 'Fisch- oder Rindersuppe' },
        { bs: 'Biftek u umaku od vina i brancin', hr: 'Biftek u umaku od vina i brancin', en: 'Beef tenderloin in wine sauce and sea bass', de: 'Rinderfilet in Weinsauce und Wolfsbarsch' },
        { bs: 'Bar sa desertima i voćem', hr: 'Bar s desertima i voćem', en: 'Dessert and fruit bar', de: 'Dessert- und Obstbar' }
      ],
      includes: ['drinks', 'cake', 'decor', 'suite']
    }
  ],

  /* dodaci u kalkulatoru: per 'guest' (po osobi) ili 'event' (paušal) */
  extras: [
    { id: 'band', price: 1800, per: 'event', label: { bs: 'Muzika uživo (partner)', hr: 'Glazba uživo (partner)', en: 'Live music (partner)', de: 'Livemusik (Partner)' } },
    { id: 'photo', price: 1200, per: 'event', label: { bs: 'Fotograf i video (partner)', hr: 'Fotograf i video (partner)', en: 'Photo and video (partner)', de: 'Foto und Video (Partner)' } },
    { id: 'flowers', price: 4, per: 'guest', label: { bs: 'Cvjetni aranžmani na stolovima', hr: 'Cvjetni aranžmani na stolovima', en: 'Floral table arrangements', de: 'Blumengestecke auf den Tischen' } }
  ],

  /* broj gostiju u kalkulatoru */
  guests: { min: 30, max: 600, step: 10, start: 200 },

  /* ---------- slobodni i zauzeti termini ----------
   * busy: zauzeti datumi koje upišeš ručno, npr. ['2027-06-12', '2027-06-19']
   * ics: putanja do Workera koji čita Google Kalendar salona (vidi README), npr. '/api/zauzeto'; null = ne koristi se
   * demoAuto: SAMO za demo, sam izmisli zauzete subote da kalendar izgleda živo (za pravog klijenta: false)
   */
  availability: { busy: [], ics: null, demoAuto: true, monthsAhead: 20 },

  /* akcije za slobodne datume: { date: 'GGGG-MM-DD', discount: 10 } (demoAuto sam izmisli 3 akcije) */
  offers: [],
  offersLead: {
    bs: 'Idealno za manje svadbe, zimske proslave i radne dane. Popust važi za meni.',
    hr: 'Idealno za manja vjenčanja, zimske proslave i radne dane. Popust vrijedi za jelovnik.',
    en: 'Perfect for smaller weddings, winter parties and weekdays. The discount applies to the menu.',
    de: 'Ideal für kleinere Hochzeiten, Winterfeiern und Wochentage. Der Rabatt gilt für das Menü.'
  },

  /* ---------- razgledanje sale (weekdays: 0 = nedjelja ... 6 = subota; daysAhead: koliko dana unaprijed se može zakazati) ---------- */
  viewing: { weekdays: [1, 2, 3, 4, 5, 6], times: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'], daysAhead: 60 },

  /* ---------- ostale proslave (type: vrsta u formi za upit) ---------- */
  events: [
    { icon: 'cap', type: 'graduation', title: { bs: 'Mature', hr: 'Maturalne večeri', en: 'Proms', de: 'Abschlussbälle' }, text: { bs: 'Maturska večer za cijelu generaciju, sa muzikom i fotografom.', hr: 'Maturalna večer za cijelu generaciju, s glazbom i fotografom.', en: 'A prom night for the whole class, with music and a photographer.', de: 'Ein Abschlussball für den ganzen Jahrgang, mit Musik und Fotograf.' } },
    { icon: 'gift', type: 'birthday', title: { bs: 'Rođendani i godišnjice', hr: 'Rođendani i obljetnice', en: 'Birthdays and anniversaries', de: 'Geburtstage und Jubiläen' }, text: { bs: 'Od 18. rođendana do zlatne godišnjice braka.', hr: 'Od 18. rođendana do zlatne obljetnice braka.', en: 'From an 18th birthday to a golden wedding anniversary.', de: 'Vom 18. Geburtstag bis zur goldenen Hochzeit.' } },
    { icon: 'baby', type: 'christening', title: { bs: 'Krstitke, akike i suneti', hr: 'Krštenja i krizme', en: 'Christenings and family feasts', de: 'Taufen und Familienfeste' }, text: { bs: 'Porodična slavlja uz domaću kuhinju i dječji kutak.', hr: 'Obiteljska slavlja uz domaću kuhinju i dječji kutak.', en: 'Family celebrations with home cooking and a kids corner.', de: 'Familienfeiern mit Hausmannskost und Kinderecke.' } },
    { icon: 'briefcase', type: 'company', title: { bs: 'Firme i konferencije', hr: 'Tvrtke i konferencije', en: 'Corporate events', de: 'Firmenfeiern und Konferenzen' }, text: { bs: 'Novogodišnje zabave, sastanci i promocije, sa ozvučenjem i projektorom.', hr: 'Novogodišnje zabave, sastanci i promocije, s ozvučenjem i projektorom.', en: 'Holiday parties, meetings and launches, with sound system and projector.', de: 'Weihnachtsfeiern, Meetings und Präsentationen, mit Tonanlage und Beamer.' } }
  ],

  /* doček Nove godine (sakrije se sam kad datum prođe) */
  newYear: {
    date: '2026-12-31', price: 120,
    title: { bs: 'Doček Nove 2027. godine', hr: 'Doček Nove 2027. godine', en: 'New Year\'s Eve 2027', de: 'Silvester 2027' },
    text: {
      bs: 'Svečana večera, neograničeno piće i muzika uživo do zore, u Velikoj sali.',
      hr: 'Svečana večera, neograničeno piće i glazba uživo do zore, u Velikoj dvorani.',
      en: 'Gala dinner, unlimited drinks and live music until dawn, in the Grand Hall.',
      de: 'Festliches Abendessen, unbegrenzte Getränke und Livemusik bis zum Morgen, im Großen Saal.'
    },
    includes: [
      { bs: 'Večera u pet sljedova', hr: 'Večera u pet sljedova', en: 'Five-course dinner', de: 'Fünf-Gänge-Menü' },
      { bs: 'Neograničeno piće', hr: 'Neograničeno piće', en: 'Unlimited drinks', de: 'Unbegrenzte Getränke' },
      { bs: 'Bend i DJ do 4 h', hr: 'Bend i DJ do 4 h', en: 'Band and DJ until 4 am', de: 'Band und DJ bis 4 Uhr' },
      { bs: 'Ponoćna zdravica', hr: 'Ponoćna zdravica', en: 'Midnight toast', de: 'Mitternachtssekt' }
    ]
  },

  /* ---------- galerija (cat: hall, decor, food, outdoor) ---------- */
  gallery: [
    { scene: 'grandHall', cat: 'hall', label: { bs: 'Velika sala', hr: 'Velika dvorana', en: 'Grand Hall', de: 'Großer Saal' } },
    { scene: 'nightHall', cat: 'hall', label: { bs: 'Sala noću', hr: 'Dvorana noću', en: 'The hall at night', de: 'Der Saal bei Nacht' } },
    { scene: 'tableSet', cat: 'decor', label: { bs: 'Postavka stola', hr: 'Postava stola', en: 'Table setting', de: 'Tischdekoration' } },
    { scene: 'garden', cat: 'outdoor', label: { bs: 'Vrt sa pergolom', hr: 'Vrt s pergolom', en: 'Garden pergola', de: 'Garten mit Pergola' } },
    { scene: 'cake', cat: 'food', label: { bs: 'Svadbena torta', hr: 'Svadbena torta', en: 'Wedding cake', de: 'Hochzeitstorte' } },
    { scene: 'crystalHall', cat: 'hall', label: { bs: 'Kristalna sala', hr: 'Kristalna dvorana', en: 'Crystal Hall', de: 'Kristallsaal' } },
    { scene: 'arch', cat: 'decor', label: { bs: 'Cvjetni luk', hr: 'Cvjetni luk', en: 'Floral arch', de: 'Blumenbogen' } },
    { scene: 'riverTerrace', cat: 'outdoor', label: { bs: 'Terasa uz rijeku', hr: 'Terasa uz rijeku', en: 'Riverside terrace', de: 'Terrasse am Fluss' } },
    { scene: 'dessertBar', cat: 'food', label: { bs: 'Bar sa desertima', hr: 'Bar s desertima', en: 'Dessert bar', de: 'Dessertbar' } }
  ],

  /* ---------- usluge ---------- */
  services: [
    { icon: 'flower', label: { bs: 'Dekoracija i cvijeće', hr: 'Dekoracija i cvijeće', en: 'Decoration and flowers', de: 'Dekoration und Blumen' } },
    { icon: 'music', label: { bs: 'Muzika i ozvučenje', hr: 'Glazba i ozvučenje', en: 'Music and sound', de: 'Musik und Tontechnik' } },
    { icon: 'camera', label: { bs: 'Fotograf i video', hr: 'Fotograf i video', en: 'Photo and video', de: 'Foto und Video' } },
    { icon: 'cake', label: { bs: 'Torte i deserti', hr: 'Torte i deserti', en: 'Cakes and desserts', de: 'Torten und Desserts' } },
    { icon: 'suite', label: { bs: 'Apartman za mladence', hr: 'Apartman za mladence', en: 'Bridal suite', de: 'Brautsuite' } },
    { icon: 'bed', label: { bs: 'Smještaj za goste u blizini', hr: 'Smještaj za goste u blizini', en: 'Guest accommodation nearby', de: 'Unterkunft für Gäste in der Nähe' } },
    { icon: 'parking', label: { bs: 'Parking za 150 auta', hr: 'Parkiralište za 150 automobila', en: 'Parking for 150 cars', de: 'Parkplatz für 150 Autos' } },
    { icon: 'access', label: { bs: 'Pristup za invalidska kolica', hr: 'Pristup za invalidska kolica', en: 'Wheelchair access', de: 'Rollstuhlgerecht' } }
  ],

  /* ---------- utisci (u demu izmišljeni) ---------- */
  reviews: [
    { names: 'Amra & Kenan', from: { bs: 'Mostar', hr: 'Mostar', en: 'Mostar', de: 'Mostar' }, text: { bs: 'Od prvog razgledanja do posljednjeg plesa sve je bilo kako smo zamislili. Gosti i danas pričaju o hrani.', hr: 'Od prvog razgledavanja do posljednjeg plesa sve je bilo kako smo zamislili. Gosti i danas pričaju o hrani.', en: 'From the first viewing to the last dance, everything was exactly as we imagined. Guests still talk about the food.', de: 'Von der ersten Besichtigung bis zum letzten Tanz war alles so, wie wir es uns vorgestellt hatten. Die Gäste schwärmen noch heute vom Essen.' } },
    { names: 'Ivana & Marko', from: { bs: 'Split', hr: 'Split', en: 'Split', de: 'Split' }, text: { bs: 'Došli smo iz Splita zbog ovog salona i ne žalimo. Vrt uz rijeku je čarolija.', hr: 'Došli smo iz Splita zbog ovog salona i ne žalimo. Vrt uz rijeku je čarolija.', en: 'We came from Split for this venue and have no regrets. The riverside garden is pure magic.', de: 'Wir sind wegen dieses Saals aus Split gekommen und bereuen nichts. Der Garten am Fluss ist ein Traum.' } },
    { names: 'Lejla & Adnan', from: { bs: 'Stuttgart', hr: 'Stuttgart', en: 'Stuttgart', de: 'Stuttgart' }, text: { bs: 'Sve smo dogovorili iz Njemačke preko Vibera. Kad smo stigli, sve je već bilo spremno.', hr: 'Sve smo dogovorili iz Njemačke preko Vibera. Kad smo stigli, sve je već bilo spremno.', en: 'We arranged everything from Germany over Viber. When we arrived, everything was ready.', de: 'Wir haben alles von Deutschland aus über Viber geregelt. Als wir ankamen, war alles schon vorbereitet.' } }
  ],

  /* ---------- česta pitanja ---------- */
  faq: [
    { q: { bs: 'Kada je datum proslave rezervisan?', hr: 'Kada je datum proslave rezerviran?', en: 'When is our date actually reserved?', de: 'Wann ist unser Termin wirklich reserviert?' }, a: { bs: 'Kad vam salon potvrdi da je datum slobodan i uplatite kaparu. Upit sa stranice ne zadržava datum, ali odgovaramo istog dana.', hr: 'Kad vam salon potvrdi da je datum slobodan i uplatite predujam. Upit sa stranice ne zadržava datum, ali odgovaramo istog dana.', en: 'Once the venue confirms the date is free and you pay the deposit. An inquiry from the website does not hold the date, but we reply the same day.', de: 'Sobald der Saal bestätigt, dass der Termin frei ist, und Sie die Anzahlung leisten. Eine Anfrage über die Website hält den Termin nicht, aber wir antworten noch am selben Tag.' } },
    { q: { bs: 'Kako izgleda razgledanje i da li je termin odmah potvrđen?', hr: 'Kako izgleda razgledavanje i je li termin odmah potvrđen?', en: 'What is a viewing like, and is the time confirmed right away?', de: 'Wie läuft eine Besichtigung ab, und ist die Uhrzeit sofort bestätigt?' }, a: { bs: 'Razgledanje traje oko 30 minuta. Termin koji izaberete je zahtjev: na Viberu vam potvrdimo ili predložimo drugo vrijeme, obično isti dan.', hr: 'Razgledavanje traje oko 30 minuta. Termin koji odaberete je zahtjev: na Viberu vam potvrdimo ili predložimo drugo vrijeme, obično isti dan.', en: 'A viewing takes about 30 minutes. The time you choose is a request: we confirm on Viber or suggest another time, usually the same day.', de: 'Eine Besichtigung dauert etwa 30 Minuten. Die gewählte Uhrzeit ist eine Anfrage: Wir bestätigen per Viber oder schlagen eine andere Zeit vor, meist am selben Tag.' } },
    { q: { bs: 'Imate li degustaciju menija?', hr: 'Imate li degustaciju jelovnika?', en: 'Do you offer a menu tasting?', de: 'Gibt es ein Probeessen?' }, a: { bs: 'Da. Nakon uplate kapare mladenci dolaze na besplatnu degustaciju za do četiri osobe.', hr: 'Da. Nakon uplate predujma mladenci dolaze na besplatnu degustaciju za do četiri osobe.', en: 'Yes. After the deposit, the couple is invited to a free tasting for up to four people.', de: 'Ja. Nach der Anzahlung laden wir das Brautpaar zu einem kostenlosen Probeessen für bis zu vier Personen ein.' } },
    { q: { bs: 'Imate li vegetarijanski i dječiji meni?', hr: 'Imate li vegetarijanski i dječji jelovnik?', en: 'Do you have vegetarian and kids menus?', de: 'Gibt es vegetarische Menüs und Kindermenüs?' }, a: { bs: 'Da. Vegetarijanski, posni i dječiji meni pripremamo na upit, bez doplate.', hr: 'Da. Vegetarijanski, posni i dječji jelovnik pripremamo na upit, bez nadoplate.', en: 'Yes. Vegetarian, fasting and kids menus are available on request at no extra cost.', de: 'Ja. Vegetarische, Fasten- und Kindermenüs bereiten wir auf Anfrage ohne Aufpreis zu.' } },
    { q: { bs: 'Možemo li dovesti svoj bend, fotografa ili dekoratera?', hr: 'Možemo li dovesti svoj bend, fotografa ili dekoratera?', en: 'Can we bring our own band, photographer or decorator?', de: 'Dürfen wir eigene Band, Fotografen oder Dekorateur mitbringen?' }, a: { bs: 'Možete, uz dogovor. Bina, struja i ozvučenje su spremni, a naši partneri su samo preporuka.', hr: 'Možete, uz dogovor. Pozornica, struja i ozvučenje su spremni, a naši partneri su samo preporuka.', en: 'Yes, by arrangement. Stage, power and sound are ready, and our partners are only a recommendation.', de: 'Ja, nach Absprache. Bühne, Strom und Tontechnik sind vorhanden, unsere Partner sind nur eine Empfehlung.' } },
    { q: { bs: 'Koliko je kapara i kada se plaća?', hr: 'Koliki je predujam i kada se plaća?', en: 'How much is the deposit and when is it paid?', de: 'Wie hoch ist die Anzahlung und wann ist sie fällig?' }, a: { bs: 'Kapara je 20% okvirnog iznosa i potvrđuje datum. Ostatak se plaća sedam dana prije proslave.', hr: 'Predujam je 20% okvirnog iznosa i potvrđuje datum. Ostatak se plaća sedam dana prije proslave.', en: 'The deposit is 20% of the estimated total and secures the date. The rest is paid seven days before the event.', de: 'Die Anzahlung beträgt 20 % der geschätzten Summe und sichert den Termin. Der Rest wird sieben Tage vor der Feier bezahlt.' } },
    { q: { bs: 'Šta ako moramo otkazati ili pomjeriti datum?', hr: 'Što ako moramo otkazati ili pomaknuti datum?', en: 'What if we need to cancel or move the date?', de: 'Was ist, wenn wir absagen oder den Termin verschieben müssen?' }, a: { bs: 'Datum možete jednom besplatno pomjeriti do 90 dana prije proslave. Kod otkazivanja kapara se ne vraća.', hr: 'Datum možete jednom besplatno pomaknuti do 90 dana prije proslave. Kod otkazivanja predujam se ne vraća.', en: 'You can move the date once free of charge up to 90 days before the event. The deposit is non-refundable on cancellation.', de: 'Sie können den Termin bis 90 Tage vorher einmal kostenlos verschieben. Bei Absage wird die Anzahlung nicht erstattet.' } },
    { q: { bs: 'Možemo li donijeti svoje piće ili tortu?', hr: 'Možemo li donijeti svoje piće ili tortu?', en: 'Can we bring our own drinks or cake?', de: 'Dürfen wir eigene Getränke oder Torte mitbringen?' }, a: { bs: 'Tortu da, bez doplate. Vlastito piće je moguće uz dogovor i čepovinu.', hr: 'Tortu da, bez nadoplate. Vlastito piće je moguće uz dogovor i čeparinu.', en: 'Cake yes, at no extra cost. Your own drinks are possible by arrangement with a corkage fee.', de: 'Torte ja, ohne Aufpreis. Eigene Getränke sind nach Absprache mit Korkgeld möglich.' } },
    { q: { bs: 'Do koliko sati traje muzika?', hr: 'Do koliko sati traje glazba?', en: 'How late can the music play?', de: 'Wie lange darf die Musik spielen?' }, a: { bs: 'U sali do 3 h, u vrtu do ponoći.', hr: 'U dvorani do 3 h, u vrtu do ponoći.', en: 'Until 3 am in the hall and until midnight in the garden.', de: 'Im Saal bis 3 Uhr, im Garten bis Mitternacht.' } },
    { q: { bs: 'Koliko najmanje gostiju moramo imati?', hr: 'Koliko najmanje gostiju moramo imati?', en: 'What is the minimum number of guests?', de: 'Wie viele Gäste müssen es mindestens sein?' }, a: { bs: 'Za subotu u sezoni 150, za ostale dane i Kristalnu salu 30 gostiju.', hr: 'Za subotu u sezoni 150, za ostale dane i Kristalnu dvoranu 30 gostiju.', en: '150 for Saturdays in season, 30 for other days and the Crystal Hall.', de: '150 für Samstage in der Saison, 30 für andere Tage und den Kristallsaal.' } },
    { q: { bs: 'Ima li dovoljno parkinga?', hr: 'Ima li dovoljno parkirališta?', en: 'Is there enough parking?', de: 'Gibt es genug Parkplätze?' }, a: { bs: 'Da, 150 mjesta uz salon, besplatno za sve goste.', hr: 'Da, 150 mjesta uz salon, besplatno za sve goste.', en: 'Yes, 150 spaces next to the venue, free for all guests.', de: 'Ja, 150 Plätze direkt am Saal, kostenlos für alle Gäste.' } }
  ],

  /* ---------- lokacija ---------- */
  location: {
    address: { bs: 'Bulevar uz Neretvu bb, 88000 Mostar', hr: 'Bulevar uz Neretvu bb, 88000 Mostar', en: 'Bulevar uz Neretvu bb, 88000 Mostar', de: 'Bulevar uz Neretvu bb, 88000 Mostar' },
    mapQuery: 'Mostar, Bosna i Hercegovina',
    distances: [
      { icon: 'pin', place: { bs: 'Stari most', hr: 'Stari most', en: 'Old Bridge', de: 'Alte Brücke' }, time: { bs: '5 min', hr: '5 min', en: '5 min', de: '5 Min.' } },
      { icon: 'ring', place: { bs: 'Matični ured', hr: 'Matični ured', en: 'Registry office', de: 'Standesamt' }, time: { bs: '7 min', hr: '7 min', en: '7 min', de: '7 Min.' } },
      { icon: 'bed', place: { bs: 'Hoteli u centru', hr: 'Hoteli u centru', en: 'City hotels', de: 'Hotels im Zentrum' }, time: { bs: '5–10 min', hr: '5–10 min', en: '5–10 min', de: '5–10 Min.' } },
      { icon: 'plane', place: { bs: 'Aerodrom Mostar', hr: 'Zračna luka Mostar', en: 'Mostar Airport', de: 'Flughafen Mostar' }, time: { bs: '15 min', hr: '15 min', en: '15 min', de: '15 Min.' } }
    ]
  },

  /* ---------- stranica za goste svadbe (gosti.html) ---------- */
  guestPage: {
    schedule: [
      { time: '17:00', label: { bs: 'Dolazak gostiju i piće dobrodošlice', hr: 'Dolazak gostiju i piće dobrodošlice', en: 'Guest arrival and welcome drink', de: 'Ankunft der Gäste und Begrüßungsgetränk' } },
      { time: '18:00', label: { bs: 'Dolazak mladenaca', hr: 'Dolazak mladenaca', en: 'Arrival of the couple', de: 'Ankunft des Brautpaars' } },
      { time: '19:00', label: { bs: 'Svečana večera', hr: 'Svečana večera', en: 'Dinner', de: 'Festessen' } },
      { time: '22:00', label: { bs: 'Rezanje torte', hr: 'Rezanje torte', en: 'Cake cutting', de: 'Anschneiden der Torte' } },
      { time: '23:00', label: { bs: 'Ples do jutra', hr: 'Ples do jutra', en: 'Dancing until morning', de: 'Tanz bis in den Morgen' } }
    ],
    parking: { bs: 'Besplatan parking za 150 auta uz salon, ulaz sa Bulevara.', hr: 'Besplatno parkiralište za 150 automobila uz salon, ulaz s Bulevara.', en: 'Free parking for 150 cars next to the venue, entrance from the boulevard.', de: 'Kostenloser Parkplatz für 150 Autos am Saal, Einfahrt vom Boulevard.' },
    stay: [
      { name: 'Hotel Neretva', distance: { bs: '5 min hoda', hr: '5 min hoda', en: '5 min walk', de: '5 Min. zu Fuß' } },
      { name: 'Apartmani Stari grad', distance: { bs: '8 min vožnje', hr: '8 min vožnje', en: '8 min drive', de: '8 Min. Fahrt' } }
    ]
  }
};
