# Svečana sala Aurora

Demo website for a wedding venue in Mostar. The venue, prices, dates, reviews and contact are made up.

**Live:** https://svecana-sala.grabafaceit.workers.dev

## What's inside

- Availability calendar synced from Google Calendar through a Cloudflare Worker (`/api/zauzeto`)
- Instant price estimate and an enquiry that opens Viber or WhatsApp
- Halls, menus, gallery, viewing booking, offers, celebrations, New Year's Eve, FAQ and location
- A separate page for wedding guests with a QR code (`gosti.html`)
- Bosnian, Croatian, English and German

## Tech

Plain HTML, CSS and JavaScript, no framework and no build step, plus one small Cloudflare Worker for the calendar. All venue data is in `data/salon.js`.

## Run locally

```
node serve.mjs
```

Then open http://localhost:8080.

Made by [Ahmed Grabus (Graba)](https://graba-portofolio.grabafaceit.workers.dev)
