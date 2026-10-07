# Svečani salon (demo: "Aurora", Mostar)

Web stranica za svadbeni salon: kalendar slobodnih datuma, okvirna cijena, upit na Viber/WhatsApp, sale, meniji, galerija, razgledanje, akcije, proslave, doček Nove godine, česta pitanja, lokacija i posebna stranica za goste svadbe sa QR kodom.

Obični HTML, CSS i JavaScript. Nema instalacije paketa ni "build" koraka.

> DEMO: salon, cijene, termini, utisci i kontakt su izmišljeni. Stranica je sakrivena od Googlea (`noindex`).

---

## 1. Pokretanje na svom računaru

Treba ti samo [Node.js](https://nodejs.org) (bilo koja verzija od 18 naviše).

```bash
git clone https://github.com/grabator/svecana-sala.git
cd svecana-sala
git checkout feature/demo
node serve.mjs
```

Otvori **http://localhost:8080** u pregledniku.

- Stranica za goste: http://localhost:8080/gosti.html (forma) ili
  http://localhost:8080/gosti.html?par=Amra%20%26%20Kenan&datum=2027-06-12&mladenci=1
- Drugi port: `node serve.mjs 3000`
- Jezik se može zadati u linku: `?lang=de` (bs, hr, en, de)

Bez Node.js: fajlovi se mogu otvoriti i preko bilo kojeg lokalnog servera (npr. VS Code "Live Server"). Sve osim `/api/zauzeto` radi isto.

---

## 2. Fajlovi

| Fajl | Šta je |
|---|---|
| `data/salon.js` | **SVI podaci o salonu** (ime, kontakt, sale, meniji, cijene, galerija, pitanja...). Za novog klijenta mijenjaš skoro samo ovo. |
| `js/i18n.js` | Tekstovi dugmadi i naslova na 4 jezika (bs, hr, en, de). |
| `js/app.js` | Logika glavne stranice. |
| `js/gosti.js` | Logika stranice za goste (`gosti.html`). |
| `js/scenes.js` | Ilustracije za demo (dok salon ne pošalje prave slike). |
| `js/icons.js` | Ikonice. |
| `js/qrcode.js` | Biblioteka za QR kod (MIT licenca), radi bez interneta. |
| `css/style.css` | Izgled. Boje su varijable na vrhu fajla. |
| `worker/zauzeto.js`, `worker/ics.js` | Cloudflare Worker koji čita Google Kalendar salona. |
| `serve.mjs` | Lokalni server za pregled. |
| `wrangler.jsonc`, `.assetsignore`, `_headers` | Postavke za Cloudflare. |

---

## 3. Novi klijent (pravi salon)

1. Napravi novi repo (ili granu) od ovog i otvori `data/salon.js`.
2. Promijeni `name`, `kind`, `city`, `title`, `tagline`, `contact` (telefon, Viber, WhatsApp, email, Instagram, Facebook).
3. Sale, menije, cijene po osobi i dodatke upiši u `halls`, `menus`, `extras`. Meni bez cijene: `price: null` (piše "Na upit").
4. Slike: stavi ih u `assets/img/` (najbolje `.webp`, širina oko 1600 px) i u podacima umjesto `scene: '...'` napiši `image: 'assets/img/sala.webp'`.
   - Prvi ekran: `hero: { image: 'assets/img/naslovna.webp' }` ili video `hero: { video: { mp4: 'assets/img/video.mp4', poster: 'assets/img/naslovna.webp' } }` (video do ~5 MB, bez zvuka).
5. Zauzeti datumi: ili ručno u `availability.busy`, ili Google Kalendar (tačka 4).
6. Isključi demo:
   - `demo: false` i `availability.demoAuto: false` u `data/salon.js`
   - u `index.html` obriši red `<meta name="robots" content="noindex, nofollow">`
   - u `robots.txt` stavi verziju za pravog klijenta (upisana je u komentaru)
   - u `index.html` i `sitemap.xml` zamijeni adresu `svecana-sala.grabafaceit.workers.dev` pravom domenom
   - ponovo napravi `assets/og.jpg` (slika 1200×630 koja se vidi kad se link podijeli na Viberu/Facebooku)
7. Utisci (`reviews`): samo pravi utisci gostiju, uz njihovu dozvolu. Ako ih nema, obriši listu i sekcija nestaje.

**Sve sekcije su opcionalne:** ako polje obrišeš ili ostaviš prazno (`[]` ili `null`), sekcija i link u meniju se ne prikazuju.

Boje: `theme: { gold: '#c9a35b', ink: '#14201c' }` u `data/salon.js` (imena su ista kao varijable na vrhu `css/style.css`).

---

## 4. Google Kalendar (salon upisuje svadbe, stranica sama pokazuje zauzeto)

Vlasnik salona ne mora ništa mijenjati na stranici. Svaki događaj koji upiše u svoj Google Kalendar postaje zauzet dan na stranici (najkasnije za 15 minuta).

**Kod vlasnika (jednom):**
1. Google Kalendar na računaru → lijevo pored kalendara salona tri tačkice → **Postavke i dijeljenje** (Settings and sharing).
2. Skroz dolje: **Tajna adresa u iCal formatu** (Secret address in iCal format) → kopiraj link (završava sa `.ics`).
3. Pošalje ti taj link (privatno, ne javno).

**Kod tebe:**
1. Cloudflare → Workers & Pages → `svecana-sala` → **Settings → Variables and Secrets** → **Add**:
   - Type: **Secret**, Name: `ICS_URL`, Value: tajni link iz Google Kalendara → **Deploy**.
2. U `data/salon.js`: `availability: { busy: [], ics: '/api/zauzeto', demoAuto: false, monthsAhead: 20 }`.
3. Commit i push. Provjera: otvori `https://ADRESA/api/zauzeto`, treba vratiti npr. `{"busy":["2027-06-12", ...]}`.

Pravila:
- Cjelodnevni događaj (i preko više dana) zauzme sve te dane.
- Događaj sa satnicom (npr. 17:00 do 03:00) zauzme samo dan početka.
- Otkazani događaji i oni označeni kao "Slobodan" (Free) se ne računaju.
- Ponavljajući događaji se ne računaju (svadbe se upisuju pojedinačno).
- Ako Google ne odgovori, stranica i dalje radi sa ručno upisanim datumima.

Lokalno: `node serve.mjs` na `/api/zauzeto` vraća datume iz primjera `worker/primjer.ics`, a sa `ICS_URL=https://... node serve.mjs` iz pravog kalendara.

---

## 5. Objava na Cloudflare

Projekat je napravljen za **Cloudflare Workers** (statični fajlovi + mali Worker za kalendar).

**Prvi put:**
1. Cloudflare → **Workers & Pages → Create → Import a repository** → izaberi `grabator/svecana-sala`.
2. Project name: `svecana-sala`. Production branch: grana koju objavljuješ (npr. `main` poslije spajanja ili `feature/demo` za pregled).
3. Build command: prazno. Deploy command: `npx wrangler deploy` (ostaje kako Cloudflare predloži). Cloudflare sam pročita `wrangler.jsonc`.
4. Deploy. Adresa je `https://svecana-sala.<tvoj-nalog>.workers.dev`.

Svaki push na tu granu automatski objavi novu verziju. `_headers` se brine da se nova verzija css/js odmah vidi, a fontovi i slike keširaju.

Varijabla `ICS_URL` treba samo kad se koristi Google Kalendar (tačka 4). Bez nje `/api/zauzeto` vraća prazan spisak i stranica normalno radi.

Vlastita domena: Worker → **Settings → Domains & Routes → Add → Custom domain**.

---

## 6. Razgledanje i akcije

- **Razgledanje:** gost bira dan u kalendaru i sat (`viewing.times`, npr. svaki sat od 10 do 19). Dani i koliko unaprijed: `viewing.weekdays` (0 = nedjelja ... 6 = subota) i `viewing.daysAhead`. Na Viber stiže **zahtjev**: salon potvrdi termin ili predloži drugi (to piše i na stranici, da gost ne misli da je termin već potvrđen).
- **Akcije:** `offers: [{ date: '2027-02-13', discount: 15 }]`. Prikazuju se kao mala traka iznad kalendara, a u kalendaru su označene zlatno. Klik izabere datum, a popust se sam oduzme u okvirnoj cijeni (popust važi za meni). Akcija za zauzet ili prošao datum se sama sakrije.

---

## 7. Stranica za goste svadbe

`gosti.html?par=Amra%20%26%20Kenan&datum=2027-06-12`

- Imena mladenaca, datum, odbrojavanje, satnica, mjesto i mapa, parking, smještaj u blizini, kontakt salona.
- **Dodaj u kalendar**: preuzme `.ics` fajl (Google, Apple, Outlook kalendar), sa podsjetnikom dan ranije.
- Mladenci prave link sami na `gosti.html` (forma). Dobiju link sa `&mladenci=1` gdje vide **QR kod za pozivnice** (preuzimanje kao PNG) i dugme za kopiranje linka. Gostima šalju link bez `mladenci=1`.
- Na dnu je poziv "Planirate i vi proslavu?" nazad na salon, pa svaka svadba dovodi nove goste na stranicu salona.
- Satnicu, parking i smještaj salon mijenja u `data/salon.js` → `guestPage`.

---

## 8. Provjera prije predaje

- Telefon i računar, sva 4 jezika.
- Klik na datum u kalendaru → okvirna cijena → upit na Viber (na telefonu se otvara Viber sa napisanom porukom).
- Galerija, razgledanje, mapa, stranica za goste i QR kod.
