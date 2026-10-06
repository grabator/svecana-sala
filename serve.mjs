// Lokalni server za pregled: node serve.mjs (pa otvori http://localhost:8080)
// Drugi port: node serve.mjs 3000
// /api/zauzeto radi kao na Cloudflareu: čita ICS_URL (ako je postavljen) ili primjer worker/primjer.ics
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { busyDays } from './worker/ics.js';

// fileURLToPath: ispravna putanja i na Windowsu (C:\...) i na Linux/macOS
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.argv[2]) || 8080;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.mp4': 'video/mp4', '.webm': 'video/webm', '.xml': 'application/xml', '.txt': 'text/plain', '.ics': 'text/calendar' };

async function zauzeto() {
  const ics = process.env.ICS_URL
    ? await (await fetch(process.env.ICS_URL)).text()
    : fs.readFileSync(path.join(ROOT, 'worker', 'primjer.ics'), 'utf8');
  return { busy: busyDays(ics, new Date(Date.now() - 864e5).toISOString().slice(0, 10)), local: true };
}

http.createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/api/zauzeto') {
    try {
      const body = JSON.stringify(await zauzeto());
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
      return res.end(body);
    } catch (e) {
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ busy: [], error: true }));
    }
  }
  if (p.endsWith('/')) p += 'index.html';
  const file = path.resolve(ROOT, '.' + path.posix.normalize(p));
  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log('Svečani salon: http://localhost:' + PORT));
