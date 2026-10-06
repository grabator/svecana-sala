/*
 * Stranica za goste svadbe: gosti.html?par=Amra%20i%20Kenan&datum=2027-06-12
 * Mladenci dobiju link sa &mladenci=1 (vide QR kod za pozivnice), a gostima šalju link bez toga.
 * Podaci o salonu (satnica, parking, smještaj) su u data/salon.js -> guestPage.
 */
(function () {
  'use strict';
  var D = window.SALON, UI = window.SALON_UI, ic = window.SALON_ICON, SC = window.SALON_SCENES || {};
  var GP = D.guestPage || {};
  var root = document.documentElement;
  var LANGS = (D.languages || ['bs']).filter(function (l) { return UI[l]; });
  var params = new URLSearchParams(location.search);

  var lang = (function () {
    var saved = null;
    try { saved = localStorage.getItem('salon-lang'); } catch (e) { /* privatni mod */ }
    return [params.get('lang'), saved, (navigator.language || '').slice(0, 2)].filter(function (l) { return l && LANGS.indexOf(l) > -1; })[0] || LANGS[0] || 'bs';
  })();

  function get(o, p) { return p.split('.').reduce(function (x, k) { return x == null ? x : x[k]; }, o); }
  function fill(s, v) { return v ? String(s).replace(/\{(\w+)\}/g, function (m, k) { return v[k] != null ? v[k] : m; }) : s; }
  function t(key, vars) {
    var v = get(UI[lang], key);
    if (v == null) v = get(UI.en, key);
    if (v == null) v = get(UI.bs, key);
    return v == null ? key : (typeof v === 'string' ? fill(v, vars) : v);
  }
  function L(o) { if (o == null) return ''; if (typeof o === 'string') return o; return o[lang] != null ? o[lang] : (o.en != null ? o.en : (o.bs || '')); }
  function plural(f, n) {
    var k = 'other';
    if (lang === 'bs' || lang === 'hr') { var a = n % 10, b = n % 100; if (a === 1 && b !== 11) k = 'one'; else if (a >= 2 && a <= 4 && (b < 12 || b > 14)) k = 'few'; }
    else if (n === 1) k = 'one';
    return fill(f[k] || f.other, { n: n });
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function parse(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function longDate(s) {
    var d = parse(s), m = t('monthsOf')[d.getMonth()], day = cap(t('days')[d.getDay()]);
    return day + ', ' + (lang === 'en' ? d.getDate() + ' ' + m + ' ' + d.getFullYear() : d.getDate() + '. ' + m + ' ' + d.getFullYear() + (lang === 'de' ? '' : '.'));
  }

  /* ---------------- podaci iz linka ---------------- */
  var par = (params.get('par') || '').trim().slice(0, 80);
  var datum = /^\d{4}-\d{2}-\d{2}$/.test(params.get('datum') || '') && !isNaN(parse(params.get('datum'))) ? params.get('datum') : '';
  var couple = params.get('mladenci') === '1';
  var today = new Date(); today.setHours(0, 0, 0, 0);

  function guestUrl() {
    var u = new URL(location.href.split('?')[0].split('#')[0]);
    u.searchParams.set('par', par);
    u.searchParams.set('datum', datum);
    if (lang !== LANGS[0]) u.searchParams.set('lang', lang);
    return u.toString();
  }
  function address() { return D.location ? L(D.location.address) : D.city; }
  function mapQuery() { return D.location && D.location.mapQuery ? D.location.mapQuery : address(); }
  function navHref() { return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(mapQuery()); }
  function phoneHref() { return 'tel:' + String(D.contact.phone || '').replace(/[^\d+]/g, ''); }

  /* ---------------- dijelovi stranice ---------------- */
  function topbar() {
    var k = LANGS.indexOf(lang);
    return '<div class="topbar-in"><a class="brand" href="./"><span class="brand-mono" aria-hidden="true">' + esc(D.name.charAt(0)) + '</span><span class="brand-name">' + esc(D.name) + '</span></a>' +
      '<div class="top-tools">' + (LANGS.length > 1 ? '<div class="seg" role="group" aria-label="' + esc(t('langLabel')) + '" style="--n:' + LANGS.length + ';--k:' + k + '"><span class="seg-thumb" aria-hidden="true"></span>' +
      LANGS.map(function (l) { return '<button type="button" data-lang="' + l + '" lang="' + l + '" aria-pressed="' + (l === lang) + '">' + l.toUpperCase() + '</button>'; }).join('') + '</div>' : '') + '</div></div>';
  }
  function countdown() {
    var days = Math.round((parse(datum) - today) / 864e5);
    if (days > 0) return plural(t('gDaysLeft'), days);
    return days === 0 ? t('gToday') : t('gPast');
  }
  function hero() {
    var names = par.split(/\s+(?:&|i|and|und|\+)\s+/i);
    var title = names.length === 2 ? esc(names[0]) + '<span class="gp-amp">&amp;</span>' + esc(names[1]) : esc(par);
    return '<section class="gp-hero"><div class="wrap gp-hero-in">' +
      '<div class="gp-arch" aria-hidden="true">' + (SC.arch ? SC.arch() : '') + '</div>' +
      '<div class="gp-hero-txt"><p class="hero-kind">' + esc(t('gEyebrow')) + '</p>' +
      '<h1 class="gp-names">' + title + '</h1>' +
      '<p class="gp-date">' + esc(longDate(datum)) + '</p>' +
      '<p class="gp-count">' + ic('heart') + '<span>' + esc(countdown()) + '</span></p>' +
      '<div class="hero-ctas"><button type="button" class="btn btn-gold" data-ics>' + ic('calendar') + esc(t('gAddCal')) + '</button>' +
      '<a class="btn btn-ghost" href="' + esc(navHref()) + '" target="_blank" rel="noopener">' + ic('nav') + esc(t('navigate')) + '</a></div></div>' +
      '</div></section>';
  }
  function schedule() {
    if (!GP.schedule || !GP.schedule.length) return '';
    return '<section class="sec gp-sec" id="satnica"><div class="wrap gp-narrow"><div class="sec-head center in"><p class="eyebrow">' + esc(t('gSchedule')) + '</p><h2>' + esc(t('gSchedule')) + '</h2></div>' +
      '<ol class="gp-time">' + GP.schedule.map(function (s) { return '<li><b>' + esc(s.time) + '</b><span>' + esc(L(s.label)) + '</span></li>'; }).join('') + '</ol></div></section>';
  }
  function where() {
    var stay = (GP.stay || []).map(function (s) { return '<li>' + ic('bed') + '<span>' + esc(s.name) + '</span><b>' + esc(L(s.distance)) + '</b></li>'; }).join('');
    return '<section class="sec sec-alt gp-sec" id="mjesto"><div class="wrap gp-narrow">' +
      '<div class="sec-head center in"><p class="eyebrow">' + esc(t('gWhere')) + '</p><h2>' + esc(L(D.title)) + '</h2><p class="lead">' + esc(address()) + '</p></div>' +
      '<div class="map gp-map" id="gp-map"><div class="gp-map-ph">' + ic('pin') + '<b>' + esc(L(D.title)) + '</b><span>' + esc(address()) + '</span></div>' +
      '<div class="map-actions"><button type="button" class="btn btn-dark btn-small" data-map>' + ic('pin') + esc(t('showMap')) + '</button>' +
      '<a class="btn btn-gold btn-small" href="' + esc(navHref()) + '" target="_blank" rel="noopener">' + ic('nav') + esc(t('navigate')) + '</a></div></div>' +
      '<div class="gp-info">' +
      (GP.parking ? '<div class="card gp-card"><h3>' + ic('parking') + esc(t('gParking')) + '</h3><p>' + esc(L(GP.parking)) + '</p></div>' : '') +
      (stay ? '<div class="card gp-card"><h3>' + ic('bed') + esc(t('gStay')) + '</h3><ul class="dists">' + stay + '</ul></div>' : '') +
      '<div class="card gp-card"><h3>' + ic('phone') + esc(t('gContact')) + '</h3><p><a href="' + esc(phoneHref()) + '">' + esc(D.contact.phone) + '</a>' + (D.contact.hours ? '<br><span class="muted small">' + esc(L(D.contact.hours)) + '</span>' : '') + '</p></div>' +
      '</div></div></section>';
  }
  function qrBlock() {
    if (!couple) return '';
    return '<section class="sec gp-sec" id="qr"><div class="wrap gp-narrow"><div class="card gp-qr">' +
      '<div class="gp-qr-code" id="qr-code" role="img" aria-label="QR"></div>' +
      '<div class="gp-qr-txt"><p class="eyebrow">' + esc(t('gCouple')) + '</p><h2>' + esc(t('gQrTitle')) + '</h2><p class="muted">' + esc(t('gQrLead')) + '</p>' +
      '<input class="gp-link" id="gp-link" readonly value="' + esc(guestUrl()) + '" aria-label="Link">' +
      '<div class="gp-btns"><button type="button" class="btn btn-dark" data-qr-dl>' + ic('download') + esc(t('gQrDownload')) + '</button>' +
      '<button type="button" class="btn btn-line" data-copy>' + ic('copy') + '<span>' + esc(t('gCopy')) + '</span></button></div>' +
      '<p class="muted small">' + esc(t('gCoupleView')) + '</p></div></div></div></section>';
  }
  function makeForm() {
    var d = new Date(today); d.setMonth(d.getMonth() + 6);
    return '<section class="sec gp-sec gp-make-sec" id="napravi"><div class="wrap gp-narrow"><form class="card gp-make" id="gp-make" novalidate>' +
      '<p class="eyebrow">' + esc(L(D.title)) + '</p><h1 class="gp-make-h">' + esc(t('gMakeTitle')) + '</h1><p class="muted">' + esc(t('gMakeLead')) + '</p>' +
      '<label class="field"><span>' + esc(t('gNames')) + '</span><input id="gp-names" required maxlength="80" placeholder="' + esc(t('gNamesPh')) + '" value="' + esc(par) + '"></label>' +
      '<label class="field"><span>' + esc(t('gDate')) + '</span><input id="gp-date" type="date" required value="' + esc(datum || (d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()))) + '"></label>' +
      '<p class="form-err" id="gp-err" role="alert"></p>' +
      '<button type="submit" class="btn btn-gold">' + ic('spark') + esc(t('gMake')) + '</button></form></div></section>';
  }
  function plan() {
    return '<section class="sec sec-dark gp-plan" style="--prev-bg:var(--bg)"><div class="wrap gp-narrow center"><p class="eyebrow">' + esc(L(D.title)) + '</p><h2>' + esc(t('gPlan')) + '</h2><p class="lead" style="margin-inline:auto">' + esc(t('gPlanLead')) + '</p>' +
      '<p style="margin-top:26px"><a class="btn btn-gold" href="./#date">' + ic('calendar') + esc(t('gPlanBtn')) + '</a></p></div></section>';
  }
  function footer() {
    return '<div class="wrap foot-in"><span class="brand-mono foot-mono" aria-hidden="true">' + esc(D.name.charAt(0)) + '</span><p>' + esc(L(D.title)) + '</p>' +
      (D.demo ? '<p class="demo-note">' + esc(L(D.demoNote)) + '</p>' : '') + '</div>';
  }

  /* ---------------- QR kod (pravi se lokalno, bez interneta) ---------------- */
  function makeQr() {
    if (typeof window.qrcode !== 'function') return null;
    var q = window.qrcode(0, 'M');
    q.addData(guestUrl());
    q.make();
    return q;
  }
  function drawQr() {
    var box = document.getElementById('qr-code');
    if (!box) return;
    var q = makeQr();
    if (!q) return;
    box.innerHTML = q.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
    var svg = box.querySelector('svg');
    if (svg) { svg.setAttribute('aria-hidden', 'true'); svg.removeAttribute('width'); svg.removeAttribute('height'); }
    box.setAttribute('aria-label', 'QR: ' + guestUrl());
  }
  function downloadQr() {
    var q = makeQr();
    if (!q) return;
    var n = q.getModuleCount(), m = 4, size = 1024, cell = Math.floor(size / (n + m * 2)), off = Math.floor((size - cell * n) / 2);
    var c = document.createElement('canvas'); c.width = c.height = size;
    var x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, size, size); x.fillStyle = '#10181a';
    for (var r = 0; r < n; r++) for (var k = 0; k < n; k++) if (q.isDark(r, k)) x.fillRect(off + k * cell, off + r * cell, cell, cell);
    var a = document.createElement('a');
    a.download = 'qr-' + slug(par || 'svadba') + '.png';
    a.href = c.toDataURL('image/png');
    document.body.appendChild(a); a.click(); a.remove();
  }
  function slug(s) {
    return String(s).toLowerCase().replace(/[čć]/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z').replace(/đ/g, 'dj').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'svadba';
  }

  /* ---------------- "Dodaj u kalendar" (.ics) ---------------- */
  function icsText() {
    var first = (GP.schedule && GP.schedule[0] && GP.schedule[0].time) || '18:00';
    var h = first.split(':'), d = parse(datum), end = new Date(d); end.setDate(end.getDate() + 1);
    function stamp(dt, hh, mm) { return dt.getFullYear() + pad(dt.getMonth() + 1) + pad(dt.getDate()) + 'T' + pad(hh) + pad(mm) + '00'; }
    function icsEsc(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
    var now = new Date(), dtstamp = now.getUTCFullYear() + pad(now.getUTCMonth() + 1) + pad(now.getUTCDate()) + 'T' + pad(now.getUTCHours()) + pad(now.getUTCMinutes()) + '00Z';
    var desc = (GP.schedule || []).map(function (s) { return s.time + ' ' + L(s.label); }).join('\n') + '\n\n' + guestUrl();
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//' + D.name + '//Gosti//BS', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT', 'UID:' + datum + '-' + slug(par) + '@' + slug(D.name), 'DTSTAMP:' + dtstamp,
      'DTSTART:' + stamp(d, +h[0], +h[1] || 0), 'DTEND:' + stamp(end, 3, 0),
      'SUMMARY:' + icsEsc(t('gEyebrow') + ': ' + par), 'LOCATION:' + icsEsc(L(D.title) + ', ' + address()),
      'DESCRIPTION:' + icsEsc(desc), 'URL:' + guestUrl(),
      'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEsc(par), 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'].map(fold).join('\r\n');
  }
  /* duge linije u .ics se prelamaju (standard: najviše 75 znakova po liniji) */
  function fold(line) {
    var out = [];
    while (line.length > 73) { out.push(line.slice(0, 73)); line = ' ' + line.slice(73); }
    out.push(line);
    return out.join('\r\n');
  }
  function downloadIcs() {
    var blob = new Blob([icsText()], { type: 'text/calendar;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = slug(par) + '.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }

  /* ---------------- crtanje ---------------- */
  function render() {
    root.lang = lang;
    var sk = document.querySelector('.skip'); if (sk) sk.textContent = t('skip');
    document.getElementById('topbar').innerHTML = topbar();
    var main = document.getElementById('main');
    if (par && datum) {
      document.title = par + ' · ' + longDate(datum) + ' | ' + L(D.title);
      main.innerHTML = hero() + qrBlock() + schedule() + where() + plan();
    } else {
      document.title = t('gMakeTitle') + ' | ' + L(D.title);
      main.innerHTML = makeForm() + plan();
    }
    document.getElementById('foot').innerHTML = footer();
    drawQr();
    onScroll();
  }

  document.addEventListener('click', function (e) {
    var b;
    if ((b = e.target.closest('[data-lang]'))) {
      lang = b.getAttribute('data-lang');
      try { localStorage.setItem('salon-lang', lang); } catch (x) { /* privatni mod */ }
      render();
      var f = document.querySelector('[data-lang="' + lang + '"]'); if (f) f.focus();
      return;
    }
    if (e.target.closest('[data-ics]')) { downloadIcs(); return; }
    if (e.target.closest('[data-qr-dl]')) { downloadQr(); return; }
    if ((b = e.target.closest('[data-copy]'))) {
      var input = document.getElementById('gp-link'), done = function () { b.querySelector('span').textContent = t('gCopied'); setTimeout(function () { b.querySelector('span').textContent = t('gCopy'); }, 2200); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(input.value).then(done, function () { input.select(); document.execCommand('copy'); done(); });
      else { input.select(); document.execCommand('copy'); done(); }
      return;
    }
    if (e.target.closest('[data-map]')) {
      document.getElementById('gp-map').innerHTML = '<iframe title="' + esc(t('gWhere')) + '" src="https://maps.google.com/maps?q=' + encodeURIComponent(mapQuery()) + '&amp;z=14&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>';
    }
  });
  document.addEventListener('submit', function (e) {
    if (e.target.id !== 'gp-make') return;
    e.preventDefault();
    var n = document.getElementById('gp-names').value.trim(), d = document.getElementById('gp-date').value;
    if (n.length < 2 || !/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      document.getElementById('gp-err').textContent = t('gNames') + ', ' + t('gDate');
      document.getElementById(n.length < 2 ? 'gp-names' : 'gp-date').focus();
      return;
    }
    par = n.slice(0, 80); datum = d; couple = true;
    var u = new URL(guestUrl()); u.searchParams.set('mladenci', '1');
    history.replaceState(null, '', u.toString());
    render();
    window.scrollTo(0, 0);
    var q = document.getElementById('qr'); if (q) q.scrollIntoView({ block: 'start' });
  });
  /* na formi (svijetla pozadina) traka je odmah svijetla */
  function onScroll() { root.classList.toggle('scrolled', window.scrollY > 40 || !(par && datum)); }
  window.addEventListener('scroll', onScroll, { passive: true });

  render();
})();
