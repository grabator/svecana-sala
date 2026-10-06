/*
 * Cloudflare Worker: /api/zauzeto vraća zauzete dane iz Google Kalendara salona.
 * Adresa kalendara (tajna .ics adresa) se upisuje u Cloudflare kao varijabla ICS_URL (vidi README).
 * Rezultat se kešira 15 minuta, pa Google dobije najviše 4 upita na sat.
 * Sve ostale adrese služe obične fajlove stranice.
 */
import { busyDays } from './ics.js';

const MAX_AGE = 900;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/zauzeto') return env.ASSETS.fetch(request);

    const headers = { 'content-type': 'application/json; charset=utf-8', 'cache-control': `public, max-age=${MAX_AGE}` };
    if (!env.ICS_URL) return new Response(JSON.stringify({ busy: [], configured: false }), { headers });

    const cache = caches.default;
    const key = new Request(url.origin + '/api/zauzeto');
    const hit = await cache.match(key);
    if (hit) return hit;

    try {
      const r = await fetch(env.ICS_URL, { cf: { cacheTtl: MAX_AGE } });
      if (!r.ok) throw new Error('ics ' + r.status);
      const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      const body = JSON.stringify({ busy: busyDays(await r.text(), yesterday), updated: new Date().toISOString() });
      const res = new Response(body, { headers });
      ctx.waitUntil(cache.put(key, res.clone()));
      return res;
    } catch (e) {
      // kalendar nedostupan: stranica i dalje radi sa ručno upisanim terminima
      return new Response(JSON.stringify({ busy: [], error: true }), { status: 200, headers: { ...headers, 'cache-control': 'no-store' } });
    }
  }
};
