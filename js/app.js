/*
 * Svečani salon - logika stranice. Sve se crta iz data/salon.js (podaci) i js/i18n.js (tekstovi).
 * Za novog klijenta ovaj fajl ne treba mijenjati.
 */
(function () {
  'use strict';
  var D = window.SALON, UI = window.SALON_UI, ic = window.SALON_ICON, SC = window.SALON_SCENES || {};
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LANGS = (D.languages || ['bs']).filter(function (l) { return UI[l]; });
  if (!LANGS.length) LANGS = ['bs'];

  /* ---------------- jezik ---------------- */
  var lang = (function () {
    var q = (location.search.match(/[?&]lang=([a-z]{2})/) || [])[1];
    var saved = null;
    try { saved = localStorage.getItem('salon-lang'); } catch (e) { /* privatni mod */ }
    var nav = (navigator.language || '').slice(0, 2).toLowerCase();
    if (nav === 'sr') nav = 'bs';
    return [q, saved, nav].filter(function (l) { return l && LANGS.indexOf(l) > -1; })[0] || LANGS[0];
  })();

  function get(obj, path) { return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, obj); }
  function fill(s, vars) { return vars ? String(s).replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; }) : s; }
  function t(key, vars) {
    var over = D.ui && D.ui[lang] && get(D.ui[lang], key);
    var v = over != null ? over : get(UI[lang], key);
    if (v == null) v = get(UI.en, key);
    if (v == null) v = get(UI.bs, key);
    return v == null ? key : (typeof v === 'string' ? fill(v, vars) : v);
  }
  /* tekst iz podataka: { bs, hr, en, de } -> jezik, pa engleski, pa bosanski */
  function L(o) {
    if (o == null) return '';
    if (typeof o === 'string') return o;
    return o[lang] != null ? o[lang] : (o.en != null ? o.en : (o.bs != null ? o.bs : ''));
  }
  function plural(forms, n) {
    var f = typeof forms === 'string' ? { other: forms } : forms, k = 'other';
    if (lang === 'bs' || lang === 'hr') {
      var m10 = n % 10, m100 = n % 100;
      if (m10 === 1 && m100 !== 11) k = 'one';
      else if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) k = 'few';
    } else if (n === 1) k = 'one';
    return fill(f[k] || f.other, { n: n });
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(n) {
    var s = String(Math.round(n)), sep = lang === 'en' ? ',' : '.';
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  }
  function price(n) { return money(n) + ' ' + (D.currency || 'KM'); }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  /* ---------------- datumi ---------------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var todayIso = iso(today);
  function longDate(s, noDay) {
    var d = parse(s), m = t('monthsOf')[d.getMonth()], day = cap(t('days')[d.getDay()]);
    var out = lang === 'en' ? d.getDate() + ' ' + m + ' ' + d.getFullYear() : d.getDate() + '. ' + m + ' ' + d.getFullYear() + (lang === 'de' ? '' : '.');
    return noDay ? out : day + ', ' + out;
  }

  /* ---------------- zauzeti termini ---------------- */
  var MONTHS = Math.max(1, (D.availability && D.availability.monthsAhead) || 18);
  var busy = {};
  (D.availability && D.availability.busy || []).forEach(function (s) { busy[s] = 1; });
  /* demo: stabilno "slučajno" zauzeće (isti datum je uvijek isti) */
  function seeded(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 1000) / 1000; }
  if (D.availability && D.availability.demoAuto) {
    for (var dx = new Date(today), k = 0; k < MONTHS * 31; k++, dx.setDate(dx.getDate() + 1)) {
      var monthsAway = (dx.getFullYear() - today.getFullYear()) * 12 + dx.getMonth() - today.getMonth();
      var wd = dx.getDay(), summer = dx.getMonth() >= 4 && dx.getMonth() <= 8;
      var p = wd === 6 ? Math.max(0.25, 0.92 - monthsAway * 0.05) * (summer ? 1 : 0.75) : wd === 5 ? 0.35 * (summer ? 1 : 0.6) : wd === 0 ? 0.22 : 0.03;
      if (seeded(iso(dx)) < p) busy[iso(dx)] = 1;
    }
  }
  function isBusy(s) { return !!busy[s]; }
  function isPast(s) { return s < todayIso; }

  /* akcije: iz podataka, ili u demu 3 slobodna termina sa popustom */
  var offers = (D.offers || []).filter(function (o) { return o.date >= todayIso && !isBusy(o.date); });
  if (!offers.length && D.availability && D.availability.demoAuto) {
    var want = [{ wd: 5, d: 15 }, { wd: 0, d: 10 }, { wd: 6, d: 10 }], start = new Date(today);
    start.setDate(start.getDate() + 20);
    want.forEach(function (w, i) {
      var x = new Date(start); x.setDate(x.getDate() + i * 18);
      for (var j = 0; j < 90; j++, x.setDate(x.getDate() + 1)) {
        if (x.getDay() === w.wd && !isBusy(iso(x)) && !offers.some(function (o) { return o.date === iso(x); })) { offers.push({ date: iso(x), discount: w.d }); break; }
      }
    });
    offers.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
  }
  function offerFor(s) { for (var i = 0; i < offers.length; i++) if (offers[i].date === s) return offers[i]; return null; }
  function monthStart(off) { return new Date(today.getFullYear(), today.getMonth() + off, 1); }
  function freeSaturdays(off) {
    var m = monthStart(off), n = 0, d = new Date(m);
    while (d.getMonth() === m.getMonth()) { var s = iso(d); if (d.getDay() === 6 && !isPast(s) && !isBusy(s)) n++; d.setDate(d.getDate() + 1); }
    return n;
  }

  /* ---------------- stanje forme ---------------- */
  var G = D.guests || { min: 30, max: 600, step: 10, start: 150 };
  var featured = (D.menus || []).filter(function (m) { return m.featured; })[0] || (D.menus || [])[0];
  var S = {
    month: 0, date: null, type: 'wedding', guests: G.start, hall: '', menu: featured ? featured.id : '', extras: {},
    name: '', phone: '', msg: '', vDay: null, vTime: null, vMonth: 0, mapOn: false, gCat: 'all'
  };
  function hallById(id) { return (D.halls || []).filter(function (h) { return h.id === id; })[0]; }
  function menuById(id) { return (D.menus || []).filter(function (m) { return m.id === id; })[0]; }

  /* ---------------- pomoćno ---------------- */
  function splitTitle(s) {
    return '<h2 class="split">' + String(s).split(/\s+/).map(function (w, i) { return '<span class="w"><span style="--i:' + i + '">' + esc(w) + '</span></span>'; }).join(' ') + '</h2>';
  }
  function head(eyebrow, title, lead, center) {
    return '<div class="sec-head' + (center ? ' center' : '') + '"><p class="eyebrow">' + esc(eyebrow) + '</p>' + splitTitle(title) + (lead ? '<p class="lead">' + esc(lead) + '</p>' : '') + '</div>';
  }
  function art(item, cls) {
    if (item.image) return '<img src="' + esc(item.image) + '" alt="" loading="lazy" decoding="async"' + (cls ? ' class="' + cls + '"' : '') + '>';
    var f = SC[item.scene];
    return f ? f() : '';
  }
  function phoneHref() { return 'tel:' + String(D.contact.phone || '').replace(/[^\d+]/g, ''); }
  function viberHref(text) {
    var n = String(D.contact.viber || '').replace(/[^\d+]/g, '');
    if (n.charAt(0) !== '+') n = '+' + n;
    return 'viber://chat?number=' + encodeURIComponent(n) + (text ? '&draft=' + encodeURIComponent(text) : '');
  }
  function waHref(text) { return 'https://wa.me/' + String(D.contact.whatsapp || '').replace(/\D/g, '') + (text ? '?text=' + encodeURIComponent(text) : ''); }
  var ORN = '<svg class="ornament" viewBox="0 0 120 14" aria-hidden="true"><path d="M0 7h46M74 7h46" stroke="currentColor" stroke-width="1"/><path d="M60 1l6 6-6 6-6-6z" fill="none" stroke="currentColor"/><circle cx="60" cy="7" r="1.6" fill="currentColor"/></svg>';

  /* ---------------- zaglavlje ---------------- */
  var NAV = ['date', 'halls', 'menus', 'gallery', 'events', 'location', 'contact'];
  var has = {
    date: true,
    halls: !!(D.halls && D.halls.length),
    menus: !!(D.menus && D.menus.length),
    gallery: !!(D.gallery && D.gallery.length),
    view: !!(D.viewing && D.viewing.times && D.viewing.times.length),
    offers: true,
    events: !!((D.events && D.events.length) || nyActive()),
    services: !!(D.services && D.services.length),
    reviews: !!(D.reviews && D.reviews.length),
    faq: !!(D.faq && D.faq.length),
    location: !!D.location,
    contact: !!D.contact
  };
  function nyActive() { return !!(D.newYear && D.newYear.date && D.newYear.date >= todayIso); }
  function brandMark() {
    if (D.logo) return '<img class="brand-logo" src="' + esc(D.logo) + '" alt="">';
    return '<span class="brand-mono" aria-hidden="true">' + esc(D.name.charAt(0)) + '</span>';
  }
  function langSeg() {
    if (LANGS.length < 2) return '';
    var k = LANGS.indexOf(lang);
    return '<div class="seg" role="group" aria-label="' + esc(t('langLabel')) + '" style="--n:' + LANGS.length + ';--k:' + k + '"><span class="seg-thumb" aria-hidden="true"></span>' +
      LANGS.map(function (l) { return '<button type="button" data-lang="' + l + '" lang="' + l + '" aria-pressed="' + (l === lang) + '">' + l.toUpperCase() + '</button>'; }).join('') + '</div>';
  }
  function topbar() {
    return '<div class="topbar-in">' +
      '<a class="brand" href="#top" aria-label="' + esc(L(D.title)) + '">' + brandMark() + '<span class="brand-name">' + esc(D.name) + '</span></a>' +
      '<nav class="topnav" aria-label="' + esc(t('menu')) + '">' + NAV.filter(function (id) { return has[id]; }).map(function (id) { return '<a href="#' + id + '">' + esc(t('nav.' + id)) + '</a>'; }).join('') + '<span class="topnav-pill" aria-hidden="true"></span></nav>' +
      '<div class="top-tools">' + langSeg() +
      '<a class="btn btn-gold btn-small top-cta" href="#date">' + esc(t('heroCtaDate')) + '</a>' +
      '<button type="button" class="menu-btn" aria-haspopup="dialog" aria-expanded="false" aria-controls="guide" aria-label="' + esc(t('menu')) + '"><span class="mb-lines" aria-hidden="true"><i></i><i></i></span></button>' +
      '</div></div>';
  }

  /* ---------------- prvi ekran ---------------- */
  function hero() {
    var h = D.hero || {}, media;
    if (h.video) {
      media = '<video autoplay muted loop playsinline preload="metadata"' + (h.video.poster ? ' poster="' + esc(h.video.poster) + '"' : '') + '>' +
        (h.video.webm ? '<source src="' + esc(h.video.webm) + '" type="video/webm">' : '') + (h.video.mp4 ? '<source src="' + esc(h.video.mp4) + '" type="video/mp4">' : '') + '</video>';
    } else if (h.image) media = '<img src="' + esc(h.image) + '" alt="" fetchpriority="high" decoding="async">';
    else media = SC.hero ? SC.hero() : '';
    var letters = D.name.split('').map(function (c, i) { return '<span class="hero-shine" style="--i:' + i + '">' + (c === ' ' ? '&nbsp;' : esc(c)) + '</span>'; }).join('');
    var stats = (D.stats || []).map(function (s) {
      return '<li>' + ic(s.icon) + '<span>' + (s.value ? '<b' + (/^\d+$/.test(s.value) ? ' data-count="' + esc(s.value) + '"' : '') + '>' + esc(s.value) + '</b> ' : '') + esc(L(s.label)) + '</span></li>';
    }).join('');
    var dust = '';
    for (var k = 0; k < 18; k++) {
      var r = seeded('dust' + k), r2 = seeded('dusty' + k);
      dust += '<i style="--x:' + (r * 100).toFixed(1) + '%;--s:' + (2 + r2 * 4).toFixed(1) + 'px;--t:' + (9 + r2 * 10).toFixed(1) + 's;--dl:-' + (r * 18).toFixed(1) + 's;--sw:' + ((r2 - 0.5) * 60).toFixed(0) + 'px"></i>';
    }
    return '<div class="hero-art" aria-hidden="true">' + media + '</div><div class="hero-shade" aria-hidden="true"></div>' +
      '<div class="hero-dust" aria-hidden="true">' + dust + '</div><div class="hero-sweep" aria-hidden="true"></div>' +
      '<div class="hero-in wrap">' +
      '<p class="hero-kind">' + esc(L(D.kind)) + '</p>' +
      '<h1><span class="sr-only">' + esc(L(D.title)) + '</span><span class="h1-name" aria-hidden="true">' + letters + '</span><span class="hero-city" aria-hidden="true">' + esc(D.city) + '</span></h1>' +
      '<span class="hero-rule" aria-hidden="true"><i></i>' + ic('spark') + '<i></i></span>' +
      '<p class="hero-tag">' + esc(L(D.tagline)) + '</p>' +
      '<div class="hero-ctas"><a class="btn btn-gold" href="#date">' + ic('calendar') + esc(t('heroCtaDate')) + '</a>' +
      (has.view ? '<a class="btn btn-ghost" href="#view">' + ic('eye') + esc(t('heroCtaView')) + '</a>' : '') + '</div>' +
      (stats ? '<ul class="hero-stats">' + stats + '</ul>' : '') +
      '</div>' +
      '<a class="hero-cue" href="#date"><span>' + esc(t('scrollMore')) + '</span><i aria-hidden="true"></i></a>';
  }

  /* ---------------- kalendar i upit ---------------- */
  function monthStrip() {
    var out = '';
    for (var i = 0; i < MONTHS; i++) {
      var m = monthStart(i), n = freeSaturdays(i);
      out += '<button type="button" class="ms-chip" data-month="' + i + '" aria-pressed="' + (i === S.month) + '"><b>' + esc(t('months')[m.getMonth()]) + ' ' + String(m.getFullYear()).slice(2) + '</b>' +
        '<small' + (n ? '' : ' class="none"') + '>' + esc(n ? plural(t('freeSat'), n) : t('allSatBusy')) + '</small></button>';
    }
    return out;
  }
  /* razgledanje: dozvoljeni dani (sutra do daysAhead dana, samo radni dani iz podataka) */
  var VLAST = (function () { var d = new Date(today); d.setDate(d.getDate() + ((D.viewing && D.viewing.daysAhead) || 45)); return iso(d); })();
  var VMONTHS = (function () { var d = parse(VLAST); return (d.getFullYear() - today.getFullYear()) * 12 + d.getMonth() - today.getMonth() + 1; })();
  function viewOk(s) { var d = parse(s), w = D.viewing && D.viewing.weekdays; return s > todayIso && s <= VLAST && (!w || w.indexOf(d.getDay()) > -1); }
  /* dva kalendara sa istim izgledom: 'date' (proslava) i 'view' (razgledanje) */
  var CAL = {
    date: { get: function () { return S.month; }, set: function (v) { S.month = v; }, max: function () { return MONTHS; }, ok: function (s) { return !isPast(s) && !isBusy(s); }, sel: function () { return S.date; }, attr: 'data-date' },
    view: { get: function () { return S.vMonth; }, set: function (v) { S.vMonth = v; }, max: function () { return VMONTHS; }, ok: viewOk, sel: function () { return S.vDay; }, attr: 'data-vdate' }
  };
  function calBody(kind) {
    kind = kind || 'date';
    var C = CAL[kind], mo = C.get(), m = monthStart(mo), first = (m.getDay() + 6) % 7, days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
    var cells = '';
    for (var e = 0; e < first; e++) cells += '<span aria-hidden="true"></span>';
    for (var d = 1; d <= days; d++) {
      var dt = new Date(m.getFullYear(), m.getMonth(), d), s = iso(dt), past = isPast(s), wk = dt.getDay() === 0 || dt.getDay() >= 5;
      var okDay = C.ok(s), b = kind === 'date' && !past && isBusy(s), o = kind === 'date' && okDay ? offerFor(s) : null, sel = s === C.sel();
      var cls = 'cal-day' + (okDay ? ' is-free' : '') + (wk ? ' is-weekend' : '') + (b ? ' is-busy' : '') + (o ? ' is-offer' : '') + (s === todayIso ? ' is-today' : '') + (sel ? ' is-sel' : '');
      var state = kind === 'view' ? '' : past ? '' : b ? t('legendBusy') : o ? t('dateOffer', { d: o.discount }) : t('dateFree');
      cells += '<button type="button" class="' + cls + '" ' + C.attr + '="' + s + '"' + (okDay ? '' : ' disabled') + ' aria-pressed="' + sel + '"' +
        ' aria-label="' + esc(longDate(s) + (state ? ', ' + state : '')) + '"><span class="cd-n">' + d + '</span>' + (o ? '<small class="cd-off">−' + o.discount + '%</small>' : '') + '</button>';
    }
    return '<div class="cal-head"><h3 aria-live="polite">' + esc(t('months')[m.getMonth()] + ' ' + m.getFullYear()) + '</h3><div class="cal-nav">' +
      '<button type="button" class="icon-btn" data-cal="-1" data-kind="' + kind + '" aria-label="' + esc(t('prevMonth')) + '"' + (mo <= 0 ? ' disabled' : '') + '>' + ic('left') + '</button>' +
      '<button type="button" class="icon-btn" data-cal="1" data-kind="' + kind + '" aria-label="' + esc(t('nextMonth')) + '"' + (mo >= C.max() - 1 ? ' disabled' : '') + '>' + ic('right') + '</button></div></div>' +
      '<div class="cal-dow" aria-hidden="true">' + t('daysShort').map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' +
      '<div class="cal-grid">' + cells + '</div>';
  }
  function renderAny(kind) { if (kind === 'view') renderVCal(); else renderCal(); }
  function renderVCal() { var b = document.getElementById('vcal-body'); if (b) b.innerHTML = calBody('view'); }
  function datePick() {
    if (!S.date) return ic('calendar') + '<span class="muted">' + esc(t('pickDateHint')) + '</span>';
    var o = offerFor(S.date);
    return ic('check') + '<b>' + esc(longDate(S.date)) + '</b><span class="tag' + (o ? ' offer' : '') + '">' + esc(o ? t('dateOffer', { d: o.discount }) : t('dateFree')) + '</span>';
  }
  function dd(id, label, value, options) {
    var cur = options.filter(function (o) { return o.v === value; })[0] || options[0];
    return '<div class="field"><span id="' + id + '-l">' + esc(label) + '</span><div class="dd" data-dd="' + id + '">' +
      '<button type="button" class="dd-btn" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="' + id + '-l ' + id + '-v"><span class="dd-val" id="' + id + '-v">' + esc(cur.label) + '</span>' + ic('down', 'dd-chev') + '</button>' +
      '<ul class="dd-list" role="listbox" tabindex="-1" aria-labelledby="' + id + '-l" hidden>' +
      options.map(function (o) { return '<li role="option" tabindex="-1" data-v="' + esc(o.v) + '" aria-selected="' + (o.v === cur.v) + '"><span>' + esc(o.label) + (o.small ? ' <small>' + esc(o.small) + '</small>' : '') + '</span>' + ic('check', 'dd-check') + '</li>'; }).join('') +
      '</ul></div></div>';
  }
  function hallOptions() {
    return [{ v: '', label: t('anyHall') }].concat((D.halls || []).map(function (h) { return { v: h.id, label: L(h.name), small: t('seated', { n: h.seated }) }; }));
  }
  function menuOptions() {
    return (D.menus || []).map(function (m) { return { v: m.id, label: L(m.name), small: m.price ? price(m.price) + ' ' + t('perPerson') : t('onRequest') }; });
  }
  function booking() {
    var types = ['wedding', 'graduation', 'birthday', 'christening', 'company', 'other'];
    var extras = (D.extras || []).map(function (x) {
      return '<button type="button" class="chip" data-extra="' + esc(x.id) + '" aria-pressed="' + !!S.extras[x.id] + '">' + ic(S.extras[x.id] ? 'check' : 'plus') + esc(L(x.label)) + ' <small>' + esc((x.per === 'guest' ? '+' + price(x.price) + ' ' + t('perGuest') : '+' + price(x.price))) + '</small></button>';
    }).join('');
    return '<section class="sec" id="date"><div class="wrap">' + head(t('dateEyebrow'), t('dateTitle'), t('dateLead')) +
      '<div class="book-grid">' +
      '<div class="card cal-card reveal">' +
      '<div class="ms-wrap"><button type="button" class="ms-arrow ms-prev" data-ms="-1" aria-label="' + esc(t('prevMonth')) + '" tabindex="-1">' + ic('left') + '</button>' +
      '<div class="month-strip" role="group" aria-label="' + esc(t('dateEyebrow')) + '">' + monthStrip() + '</div>' +
      '<button type="button" class="ms-arrow ms-next" data-ms="1" aria-label="' + esc(t('nextMonth')) + '" tabindex="-1">' + ic('right') + '</button></div>' +
      '<div id="cal-body">' + calBody('date') + '</div>' +
      '<div class="cal-legend"><span><i class="lg-free"></i>' + esc(t('legendFree')) + '</span><span><i class="lg-busy"></i>' + esc(t('legendBusy')) + '</span>' + (offers.length ? '<span><i class="lg-offer"></i>' + esc(t('legendOffer')) + '</span>' : '') + '</div>' +
      '<div class="date-pick' + (S.date ? ' has-date' : '') + '" id="date-pick" aria-live="polite">' + datePick() + '</div>' +
      '</div>' +
      '<form class="card form-card reveal" id="inq" style="--d:1" novalidate>' +
      '<div class="field"><span id="type-l">' + esc(t('eventType')) + '</span><div class="chips" role="radiogroup" aria-labelledby="type-l">' +
      types.map(function (k) { return '<button type="button" class="chip" role="radio" data-type="' + k + '" aria-checked="' + (S.type === k) + '" tabindex="' + (S.type === k ? 0 : -1) + '">' + esc(t('types.' + k)) + '</button>'; }).join('') + '</div></div>' +
      '<div class="field"><span id="g-l">' + esc(t('guestsLabel')) + '</span><div class="stepper">' +
      '<button type="button" class="icon-btn" data-step="-1" aria-label="' + esc(t('fewer')) + '">' + ic('minus') + '</button>' +
      '<input id="f-guests" type="number" inputmode="numeric" min="' + G.min + '" max="' + G.max + '" step="' + G.step + '" value="' + S.guests + '" aria-labelledby="g-l">' +
      '<button type="button" class="icon-btn" data-step="1" aria-label="' + esc(t('more')) + '">' + ic('plus') + '</button></div>' +
      '<input class="range" id="f-range" type="range" min="' + G.min + '" max="' + G.max + '" step="' + G.step + '" value="' + S.guests + '" aria-labelledby="g-l" tabindex="-1">' +
      '<p class="cap-warn" id="cap-warn" aria-live="polite"></p></div>' +
      (D.halls && D.halls.length || D.menus && D.menus.length ? '<div class="field-row dd-row">' +
        (D.halls && D.halls.length ? dd('hall', t('hallLabel'), S.hall, hallOptions()) : '') +
        (D.menus && D.menus.length ? dd('menu', t('menuLabel'), S.menu, menuOptions()) : '') + '</div>' : '') +
      (extras ? '<div class="field"><span>' + esc(t('extrasLabel')) + '</span><div class="chips">' + extras + '</div></div>' : '') +
      '<div class="estimate" aria-live="polite"><p class="est-label">' + esc(t('estimate')) + '</p><p class="est-total" id="est-total"></p><div class="est-lines" id="est-lines"></div><p class="est-note">' + esc(t('estimateNote')) + '</p></div>' +
      '<div><h3 style="font-size:1.8rem">' + esc(t('inquiryTitle')) + '</h3><p class="muted small">' + esc(t('inquiryLead')) + '</p></div>' +
      '<div class="field-row">' +
      '<label class="field"><span>' + esc(t('name')) + ' <i class="req" aria-hidden="true">*</i></span><input id="f-name" name="name" autocomplete="name" required value="' + esc(S.name) + '"></label>' +
      '<label class="field"><span>' + esc(t('phone')) + ' <i class="req" aria-hidden="true">*</i></span><input id="f-phone" name="tel" type="tel" inputmode="tel" autocomplete="tel" required value="' + esc(S.phone) + '"></label></div>' +
      '<label class="field"><span>' + esc(t('message')) + '</span><textarea id="f-msg" rows="2">' + esc(S.msg) + '</textarea></label>' +
      '<div class="need" id="need"><p>' + esc(t('needTitle')) + '</p><ul>' +
      '<li data-need="date">' + ic('check') + esc(t('needDate')) + '</li><li data-need="name">' + ic('check') + esc(t('needName')) + '</li><li data-need="phone">' + ic('check') + esc(t('needPhone')) + '</li></ul></div>' +
      '<p class="form-err" id="form-err" role="alert"></p>' +
      '<div class="send-btns">' +
      (D.contact.viber ? '<a class="btn btn-viber" id="send-viber" data-send="viber" href="#">' + ic('viber') + esc(t('sendViber')) + '</a>' : '') +
      (D.contact.whatsapp ? '<a class="btn btn-wa" id="send-wa" data-send="wa" href="#" target="_blank" rel="noopener">' + ic('whatsapp') + esc(t('sendWhatsapp')) + '</a>' : '') +
      '</div><p class="muted small">' + esc(t('sendNote')) + '</p>' +
      '</form></div></div></section>';
  }
  function calc() {
    var m = menuById(S.menu), g = S.guests, o = S.date ? offerFor(S.date) : null, lines = [], total = 0, known = !!(m && m.price);
    if (!m) return { total: null, lines: [] };
    if (known) { total += m.price * g; lines.push(t('estimateLine', { g: g, p: price(m.price) }) + ' = ' + price(m.price * g)); }
    (D.extras || []).forEach(function (x) {
      if (!S.extras[x.id]) return;
      var v = x.per === 'guest' ? x.price * g : x.price;
      total += v; lines.push(L(x.label) + ': ' + price(v));
    });
    if (o && known) { var cut = Math.round(m.price * g * o.discount / 100); total -= cut; lines.push({ disc: t('discountLine', { d: o.discount }) + ': −' + price(cut) }); }
    return { total: known ? total : null, lines: lines };
  }
  var lastTotal = null;
  function updateEstimate() {
    var tot = document.getElementById('est-total'), ln = document.getElementById('est-lines');
    if (!tot) return;
    var c = calc();
    var txt = c.total == null ? (menuById(S.menu) ? t('onRequest') : t('estimateHint')) : price(c.total);
    tot.textContent = txt;
    ln.innerHTML = c.lines.map(function (l) { return typeof l === 'string' ? '<span>' + esc(l) + '</span>' : '<span class="disc">' + esc(l.disc) + '</span>'; }).join('');
    if (lastTotal !== null && lastTotal !== txt && !reduced) { tot.classList.remove('bump'); void tot.offsetWidth; tot.classList.add('bump'); }
    lastTotal = txt;
    var h = hallById(S.hall), w = document.getElementById('cap-warn');
    if (w) w.textContent = h && S.guests > h.seated ? t('capWarn', { n: h.seated }) : '';
  }
  function phoneOk() { return S.phone.replace(/\D/g, '').length >= 6; }
  function message() {
    var m = menuById(S.menu), h = hallById(S.hall), c = calc(), lines = [t('msgHello', { name: D.name })];
    if (S.date) lines.push(t('msgDate', { d: longDate(S.date) }) + (offerFor(S.date) ? ' (' + t('dateOffer', { d: offerFor(S.date).discount }) + ')' : ''));
    lines.push(t('msgType', { t: t('types.' + S.type) }));
    lines.push(t('msgGuests', { g: S.guests }));
    if (D.halls && D.halls.length) lines.push(t('msgHall', { h: h ? L(h.name) : t('anyHall') }));
    if (m) lines.push(t('msgMenu', { m: L(m.name) + (m.price ? ' (' + price(m.price) + ' ' + t('perPerson') + ')' : '') }));
    var ex = (D.extras || []).filter(function (x) { return S.extras[x.id]; }).map(function (x) { return L(x.label); });
    if (ex.length) lines.push(t('msgExtras', { x: ex.join(', ') }));
    if (c.total != null) lines.push(t('msgEstimate', { e: price(c.total) }));
    if (S.msg.trim()) lines.push('', S.msg.trim());
    lines.push('', t('msgFrom', { n: S.name.trim(), p: S.phone.trim() }));
    return lines.join('\n');
  }
  function updateNeed() {
    var ok = { date: !!S.date, name: S.name.trim().length >= 2, phone: phoneOk() }, all = ok.date && ok.name && ok.phone;
    var box = document.getElementById('need');
    if (!box) return;
    box.querySelectorAll('[data-need]').forEach(function (li) { li.classList.toggle('ok', ok[li.getAttribute('data-need')]); });
    box.classList.toggle('all-ok', all);
    var text = all ? message() : '';
    [['send-viber', viberHref], ['send-wa', waHref]].forEach(function (p) {
      var a = document.getElementById(p[0]);
      if (!a) return;
      a.classList.toggle('is-locked', !all);
      if (all) { a.setAttribute('href', p[1](text)); a.removeAttribute('aria-disabled'); }
      else { a.setAttribute('href', '#'); a.setAttribute('aria-disabled', 'true'); }
    });
    if (all) document.getElementById('form-err').textContent = '';
  }
  function selectDate(s, scroll) {
    if (!s || isPast(s) || isBusy(s)) return;
    S.date = s;
    var d = parse(s);
    S.month = Math.max(0, Math.min(MONTHS - 1, (d.getFullYear() - today.getFullYear()) * 12 + d.getMonth() - today.getMonth()));
    renderCal();
    var dp = document.getElementById('date-pick');
    if (dp) { dp.classList.remove('has-date'); void dp.offsetWidth; dp.classList.add('has-date'); dp.innerHTML = datePick(); }
    updateEstimate(); updateNeed();
    if (scroll) goTo('date');
  }
  function renderCal() {
    var b = document.getElementById('cal-body');
    if (!b) return;
    b.innerHTML = calBody('date');
    var strip = document.querySelector('.month-strip');
    if (strip) {
      strip.innerHTML = monthStrip();
      stripToActive(true);
    }
  }
  /* traka mjeseci: aktivni mjesec uvijek vidljiv, strelice i povlačenje mišem na računaru */
  function stripToActive(smooth) {
    var strip = document.querySelector('.month-strip'), act = strip && strip.querySelector('[aria-pressed="true"]');
    if (!act) return;
    var x = act.getBoundingClientRect().left - strip.getBoundingClientRect().left + strip.scrollLeft - 40;
    strip.scrollTo({ left: Math.max(0, x), behavior: smooth && !reduced ? 'smooth' : 'auto' });
    stripEdges();
  }
  function stripEdges() {
    var strip = document.querySelector('.month-strip'), wrap = strip && strip.parentNode;
    if (!wrap) return;
    var max = strip.scrollWidth - strip.clientWidth;
    wrap.classList.toggle('can-l', strip.scrollLeft > 24);
    wrap.classList.toggle('can-r', strip.scrollLeft < max - 24);
  }
  function bindStrip() {
    var strip = document.querySelector('.month-strip');
    if (!strip) return;
    strip.addEventListener('scroll', stripEdges, { passive: true });
    var x0 = null, s0 = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      x0 = e.clientX; s0 = strip.scrollLeft; moved = false;
    });
    window.addEventListener('pointermove', function (e) {
      if (x0 == null) return;
      var dx = e.clientX - x0;
      if (!moved && Math.abs(dx) > 5) { moved = true; strip.classList.add('is-drag'); }
      if (moved) strip.scrollLeft = s0 - dx;
    });
    window.addEventListener('pointerup', function () {
      if (x0 == null) return;
      x0 = null; strip.classList.remove('is-drag');
      if (moved) setTimeout(function () { moved = false; }, 0);
    });
    /* poslije povlačenja klik ne bira mjesec */
    strip.addEventListener('click', function (e) { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
    /* točkić miša gore-dolje lista mjesece, samo dok ima kud */
    strip.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      var max = strip.scrollWidth - strip.clientWidth;
      if ((e.deltaY > 0 && strip.scrollLeft < max - 1) || (e.deltaY < 0 && strip.scrollLeft > 1)) { e.preventDefault(); strip.scrollLeft += e.deltaY; }
    }, { passive: false });
  }

  /* ---------------- listanje (sale, meniji, utisci na mobitelu) ---------------- */
  function carUi(n, dark) {
    var dots = ''; for (var i = 0; i < n; i++) dots += '<i' + (i === 0 ? ' class="on"' : '') + '></i>';
    return '<div class="car-ui' + (dark ? ' car-dark' : '') + '">' +
      '<button type="button" class="car-arrow" data-car="-1" aria-label="' + esc(t('prev')) + '">' + ic('left') + '</button>' +
      '<span class="car-dots" aria-hidden="true">' + dots + '</span>' +
      '<button type="button" class="car-arrow" data-car="1" aria-label="' + esc(t('next')) + '">' + ic('right') + '</button>' +
      '<span class="car-hint" aria-hidden="true">' + ic('swipe') + esc(t('swipeHint')) + '</span></div>';
  }
  /* beskonačne animacije (svjetla u ilustracijama, akcija, oznaka za listanje) rade samo dok je sekcija na ekranu */
  var animObs = null;
  function animGate() {
    if (animObs) animObs.disconnect();
    var els = document.querySelectorAll('#top, #main > section');
    if (!('IntersectionObserver' in window)) { els.forEach(function (x) { x.classList.add('anim-on'); }); return; }
    animObs = new IntersectionObserver(function (en) { en.forEach(function (x) { x.target.classList.toggle('anim-on', x.isIntersecting); }); });
    els.forEach(function (x) { animObs.observe(x); });
  }
  var carObs = null;
  function carousels() {
    if (carObs) carObs.disconnect();
    carObs = 'IntersectionObserver' in window ? new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { carObs.unobserve(x.target); nudge(x.target); } });
    }, { threshold: 0.55 }) : null;
    document.querySelectorAll('[data-track]').forEach(function (tr) {
      var ui = tr.previousElementSibling;
      function upd() {
        var on = tr.scrollWidth > tr.clientWidth + 4;
        ui.classList.toggle('is-on', on);
        if (!on) return;
        var items = tr.children, max = tr.scrollWidth - tr.clientWidth, best = Math.round((tr.scrollLeft / Math.max(1, max)) * (items.length - 1));
        ui.querySelectorAll('.car-dots i').forEach(function (d, i) { d.classList.toggle('on', i === best); });
        ui.querySelector('[data-car="-1"]').disabled = tr.scrollLeft < 4;
        ui.querySelector('[data-car="1"]').disabled = tr.scrollLeft > tr.scrollWidth - tr.clientWidth - 4;
      }
      tr.addEventListener('scroll', function () { if (!tr.__raf) tr.__raf = requestAnimationFrame(function () { tr.__raf = 0; upd(); }); if (tr.__user) ui.classList.add('touched'); }, { passive: true });
      ['pointerdown', 'touchstart', 'wheel'].forEach(function (ev) { tr.addEventListener(ev, function () { tr.__user = true; }, { passive: true }); });
      tr.__upd = upd;
      upd();
      if (carObs && !reduced) carObs.observe(tr);
    });
  }
  /* kad se lista prvi put pojavi, malo se pomjeri pa vrati: gost vidi da se lista */
  function nudge(tr) {
    if (tr.scrollWidth <= tr.clientWidth + 4 || tr.__user) return;
    var snap = tr.style.scrollSnapType;
    tr.style.scrollSnapType = 'none';
    tr.scrollTo({ left: 80, behavior: 'smooth' });
    setTimeout(function () { tr.scrollTo({ left: 0, behavior: 'smooth' }); setTimeout(function () { tr.style.scrollSnapType = snap; }, 600); }, 650);
  }
  window.addEventListener('resize', function () { document.querySelectorAll('[data-track]').forEach(function (tr) { if (tr.__upd) tr.__upd(); }); });

  /* ---------------- sale i meniji ---------------- */
  function halls() {
    if (!has.halls) return '';
    return '<section class="sec sec-dark" id="halls" style="--prev-bg:var(--bg)"><div class="wrap">' + head(t('hallsEyebrow'), t('hallsTitle'), t('hallsLead'), true) +
      carUi(D.halls.length, true) + '<div class="halls" data-track>' + D.halls.map(function (h, i) {
        return '<article class="hall reveal" style="--d:' + i + '"><div class="hall-art arch-img">' + art(h) + '</div>' +
          '<h3>' + esc(L(h.name)) + '</h3>' +
          '<p class="hall-cap"><span>' + ic('guests') + esc(t('seated', { n: h.seated })) + '</span>' + (h.standing ? '<span>' + ic('glass') + esc(t('standing', { n: h.standing })) + '</span>' : '') + '</p>' +
          '<p>' + esc(L(h.text)) + '</p>' +
          (h.features && h.features.length ? '<ul class="feat-list">' + h.features.map(function (f) { return '<li>' + esc(t('features.' + f)) + '</li>'; }).join('') + '</ul>' : '') +
          '<button type="button" class="btn btn-ghost btn-small" data-pick-hall="' + esc(h.id) + '">' + esc(t('pickHall')) + ic('arrow') + '</button></article>';
      }).join('') + '</div></div></section>';
  }
  var INC_IC = { drinks: 'glass', cake: 'cake', decor: 'flower', suite: 'suite' };
  function menus() {
    if (!has.menus) return '';
    return '<section class="sec" id="menus"><div class="wrap">' + head(t('menusEyebrow'), t('menusTitle'), t('menusLead'), true) +
      carUi(D.menus.length) + '<div class="menus" data-track>' + D.menus.map(function (m, i) {
        return '<article class="menu-card reveal' + (m.featured ? ' is-featured' : '') + '" style="--d:' + i + '">' + (m.featured ? '<span class="menu-badge">' + esc(t('popular')) + '</span>' : '') +
          '<h3>' + esc(L(m.name)) + '</h3>' +
          '<p class="menu-price">' + (m.price ? esc(price(m.price)) + '<small>' + esc(t('perPerson')) + '</small>' : esc(t('onRequest'))) + '</p>' + ORN +
          '<ul class="courses">' + (m.courses || []).map(function (c) { return '<li>' + esc(L(c)) + '</li>'; }).join('') + '</ul>' +
          (m.includes && m.includes.length ? '<ul class="inc-list">' + m.includes.map(function (k) { return '<li>' + ic(INC_IC[k] || 'check') + esc(t('includes.' + k)) + '</li>'; }).join('') + '</ul>' : '') +
          '<button type="button" class="btn ' + (m.featured ? 'btn-gold' : 'btn-line') + '" data-pick-menu="' + esc(m.id) + '">' + esc(t('pickMenu')) + '</button></article>';
      }).join('') + '</div></div></section>';
  }

  /* ---------------- galerija ---------------- */
  function gallery() {
    if (!has.gallery) return '';
    var cats = ['all'].concat(['hall', 'decor', 'food', 'outdoor'].filter(function (c) { return D.gallery.some(function (g) { return g.cat === c; }); }));
    return '<section class="sec sec-alt" id="gallery"><div class="wrap">' + head(t('galleryEyebrow'), t('galleryTitle'), t('galleryLead')) +
      (cats.length > 2 ? '<div class="chips g-filters" role="group" aria-label="' + esc(t('galleryEyebrow')) + '">' + cats.map(function (c) { return '<button type="button" class="chip" data-gcat="' + c + '" aria-pressed="' + (S.gCat === c) + '">' + esc(t('cats.' + c)) + '</button>'; }).join('') + '</div>' : '') +
      '<ul class="gallery">' + D.gallery.map(function (g, i) {
        var hide = S.gCat !== 'all' && g.cat !== S.gCat;
        return '<li class="g-item reveal' + (i === 0 && S.gCat === 'all' ? ' g-wide' : '') + (hide ? ' is-hidden' : '') + '" data-cat="' + esc(g.cat || '') + '" style="--d:' + (i % 4) + '">' +
          '<button type="button" class="g-btn" data-g="' + i + '" aria-label="' + esc(t('galleryOpen') + ': ' + L(g.label)) + '"><span class="g-art">' + art(g) + '</span><span class="g-cap">' + esc(L(g.label)) + '</span></button></li>';
      }).join('') + '</ul></div></section>';
  }
  function filterGallery(c) {
    S.gCat = c;
    document.querySelectorAll('[data-gcat]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-gcat') === c)); });
    document.querySelectorAll('.g-item').forEach(function (li, i) {
      var show = c === 'all' || li.getAttribute('data-cat') === c;
      li.classList.toggle('is-hidden', !show);
      li.classList.toggle('g-wide', i === 0 && c === 'all');
      if (show) li.classList.add('in');
    });
  }
  var LB = (function () {
    var el, list = [], at = 0, last = null, x0 = null;
    function draw(dir) {
      var g = D.gallery[list[at]];
      el.querySelector('.lb-art').outerHTML = '<div class="lb-art' + (dir ? (dir > 0 ? ' from-r' : ' from-l') : '') + '">' + (g.image ? '<img src="' + esc(g.image) + '" alt="' + esc(L(g.label)) + '">' : art(g)) + '</div>';
      el.querySelector('.lb-cap').textContent = L(g.label);
      el.querySelector('.lb-count').textContent = (at + 1) + ' / ' + list.length;
    }
    function open(i) {
      el = document.getElementById('lightbox');
      list = []; document.querySelectorAll('.g-item').forEach(function (li) { if (!li.classList.contains('is-hidden')) list.push(+li.querySelector('[data-g]').getAttribute('data-g')); });
      at = Math.max(0, list.indexOf(i));
      last = document.activeElement;
      el.setAttribute('aria-label', t('galleryTitle'));
      el.innerHTML = '<p class="lb-count" aria-live="polite"></p>' +
        '<button type="button" class="lb-btn lb-close" data-lb="close" aria-label="' + esc(t('close')) + '">' + ic('close') + '</button>' +
        (list.length > 1 ? '<button type="button" class="lb-btn lb-prev" data-lb="-1" aria-label="' + esc(t('prev')) + '">' + ic('left') + '</button><button type="button" class="lb-btn lb-next" data-lb="1" aria-label="' + esc(t('next')) + '">' + ic('right') + '</button>' : '') +
        '<div class="lb-stage"><div class="lb-art"></div></div><p class="lb-cap"></p>';
      draw(0);
      el.hidden = false;
      document.body.classList.add('locked');
      requestAnimationFrame(function () { el.classList.add('open'); });
      el.querySelector('.lb-close').focus({ preventScroll: true });
    }
    function close() {
      if (!el || el.hidden) return;
      el.classList.remove('open');
      document.body.classList.remove('locked');
      setTimeout(function () { el.hidden = true; el.innerHTML = ''; }, reduced ? 0 : 250);
      if (last && document.contains(last)) last.focus({ preventScroll: true });
    }
    function go(d) { if (list.length < 2) return; at = (at + d + list.length) % list.length; draw(d); }
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-g]');
      if (b) { open(+b.getAttribute('data-g')); return; }
      if (!el || el.hidden) return;
      var c = e.target.closest('[data-lb]');
      if (c) { var v = c.getAttribute('data-lb'); if (v === 'close') close(); else go(+v); return; }
      if (e.target.classList.contains('lb-stage') || e.target === el) close();
    });
    document.addEventListener('keydown', function (e) {
      if (!el || el.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'Tab') {
        var f = [].slice.call(el.querySelectorAll('button')), first = f[0], lastF = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastF.focus(); }
        else if (!e.shiftKey && document.activeElement === lastF) { e.preventDefault(); first.focus(); }
      }
    });
    document.addEventListener('touchstart', function (e) { if (el && !el.hidden) x0 = e.touches[0].clientX; }, { passive: true });
    document.addEventListener('touchend', function (e) {
      if (x0 == null || !el || el.hidden) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    }, { passive: true });
    return { close: close };
  })();

  /* ---------------- razgledanje i akcije ---------------- */
  function viewHref() { return S.vDay && S.vTime ? viberHref(t('msgView', { name: D.name, d: longDate(S.vDay), t: S.vTime })) : '#'; }
  function viewing() {
    if (!has.view) return '';
    return '<div id="view" class="view-block"><div class="sec-head">' + '<p class="eyebrow">' + esc(t('viewEyebrow')) + '</p>' + splitTitle(t('viewTitle')) + '<p class="lead">' + esc(t('viewLead')) + '</p></div>' +
      '<div class="card view-card reveal">' +
      '<div class="field"><span>' + esc(t('viewDay')) + '</span><div class="view-cal" id="vcal-body">' + calBody('view') + '</div></div>' +
      '<div class="field"><span id="vt-l">' + esc(t('viewTime')) + '</span><div class="chips" role="group" aria-labelledby="vt-l">' + D.viewing.times.map(function (x) { return '<button type="button" class="chip" data-vtime="' + esc(x) + '" aria-pressed="' + (S.vTime === x) + '">' + ic('clock') + esc(x) + '</button>'; }).join('') + '</div></div>' +
      '<p class="view-need' + (S.vDay && S.vTime ? ' ok' : '') + '" id="view-need" aria-live="polite">' + ic(S.vDay && S.vTime ? 'check' : 'eye') + '<span>' + esc(viewNeedText()) + '</span></p>' +
      '<a class="btn btn-viber' + (S.vDay && S.vTime ? '' : ' is-locked') + '" id="view-send" href="' + esc(viewHref()) + '"' + (S.vDay && S.vTime ? '' : ' aria-disabled="true"') + '>' + ic('viber') + esc(t('viewSend')) + '</a>' +
      '</div></div>';
  }
  function viewNeedText() { return S.vDay ? longDate(S.vDay) + (S.vTime ? ', ' + S.vTime : '') : t('viewNeed'); }
  function updateView() {
    document.querySelectorAll('[data-vtime]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-vtime') === S.vTime)); });
    var ok = !!(S.vDay && S.vTime), a = document.getElementById('view-send'), n = document.getElementById('view-need');
    n.innerHTML = ic(ok ? 'check' : 'eye') + '<span>' + esc(viewNeedText()) + '</span>';
    n.classList.toggle('ok', ok);
    a.classList.toggle('is-locked', !ok);
    a.setAttribute('href', viewHref());
    if (ok) a.removeAttribute('aria-disabled'); else a.setAttribute('aria-disabled', 'true');
  }
  function offersBlock() {
    if (!offers.length) return '';
    return '<div id="offers" class="offers-block"><div class="sec-head"><p class="eyebrow">' + esc(t('offersEyebrow')) + '</p>' + splitTitle(t('offersTitle')) + (D.offersLead ? '<p class="lead">' + esc(L(D.offersLead)) + '</p>' : '') + '</div>' +
      '<ul class="offers">' + offers.map(function (o, i) {
        var d = parse(o.date);
        return '<li class="offer reveal" style="--d:' + i + '"><span class="offer-date"><b>' + d.getDate() + '</b><small>' + esc(t('months')[d.getMonth()].slice(0, 3)) + '</small></span>' +
          '<span class="offer-txt"><b>' + esc(t('days')[d.getDay()]) + '</b><small>' + esc(longDate(o.date, true)) + (o.note ? ' · ' + esc(L(o.note)) : '') + '</small></span>' +
          '<span class="offer-pct">−' + o.discount + '%</span>' +
          '<button type="button" class="icon-btn" data-pick-date="' + o.date + '" aria-label="' + esc(t('pickOffer') + ': ' + longDate(o.date)) + '">' + ic('arrow') + '</button></li>';
      }).join('') + '</ul></div>';
  }
  function viewSection() {
    var v = viewing(), o = offersBlock();
    if (!v && !o) return '';
    return '<section class="sec" id="' + (v ? 'viewing' : 'offers-sec') + '"><div class="wrap view-grid">' + v + o + '</div></section>';
  }

  /* ---------------- proslave i doček ---------------- */
  function events() {
    if (!has.events) return '';
    var ny = '';
    if (nyActive()) {
      var N = D.newYear;
      ny = '<div class="ny reveal"><div><p class="eyebrow">' + esc(t('nyEyebrow')) + ' · ' + esc(longDate(N.date, true)) + '</p><h3 style="margin-top:10px">' + esc(L(N.title)) + '</h3><p style="margin-top:10px">' + esc(L(N.text)) + '</p>' +
        (N.includes && N.includes.length ? '<ul style="margin-top:16px">' + N.includes.map(function (x) { return '<li>' + ic('spark') + esc(L(x)) + '</li>'; }).join('') + '</ul>' : '') + '</div>' +
        '<div class="ny-side">' + (N.price ? '<p class="ny-price">' + esc(price(N.price)) + '<small>' + esc(t('nyPerPerson')) + '</small></p>' : '') +
        '<a class="btn btn-gold" href="' + esc(viberHref(t('msgNY', { title: L(N.title) }))) + '">' + ic('glass') + esc(t('nyBook')) + '</a></div></div>';
    }
    return '<section class="sec sec-alt" id="events"><div class="wrap">' + head(t('eventsEyebrow'), t('eventsTitle'), t('eventsLead')) +
      (D.events && D.events.length ? '<ul class="events">' + D.events.map(function (e, i) {
        return '<li class="event reveal" style="--d:' + i + '"><span class="ev-ic">' + ic(e.icon) + '</span><h3>' + esc(L(e.title)) + '</h3><p>' + esc(L(e.text)) + '</p>' +
          '<button type="button" class="btn btn-line btn-small" data-ask-type="' + esc(e.type || 'other') + '">' + esc(t('askEvent')) + '</button></li>';
      }).join('') + '</ul>' : '') + ny + '</div></section>';
  }

  /* ---------------- usluge, utisci, pitanja ---------------- */
  function services() {
    if (!has.services) return '';
    return '<section class="sec" id="services"><div class="wrap">' + head(t('servicesEyebrow'), t('servicesTitle'), t('servicesLead'), true) +
      '<ul class="services">' + D.services.map(function (s, i) { return '<li class="service reveal" style="--d:' + (i % 4) + '">' + ic(s.icon) + '<span>' + esc(L(s.label)) + '</span></li>'; }).join('') + '</ul></div></section>';
  }
  function reviews() {
    if (!has.reviews) return '';
    return '<section class="sec sec-dark" id="reviews" style="--prev-bg:var(--bg)"><div class="wrap">' + head(t('reviewsEyebrow'), t('reviewsTitle'), D.demo ? t('reviewsDemo') : '', true) +
      carUi(D.reviews.length, true) + '<ul class="reviews" data-track>' + D.reviews.map(function (r, i) {
        return '<li class="review reveal" style="--d:' + i + '"><blockquote>' + esc(L(r.text)) + '</blockquote><p><b>' + esc(r.names) + '</b>' + (r.from ? ' · ' + esc(L(r.from)) : '') + '</p></li>';
      }).join('') + '</ul></div></section>';
  }
  function faq() {
    if (!has.faq) return '';
    return '<section class="sec" id="faq"><div class="wrap">' + head(t('faqEyebrow'), t('faqTitle'), '', true) +
      '<div class="faq">' + D.faq.map(function (f, i) {
        return '<details class="faq-i reveal" style="--d:' + (i % 3) + '"><summary>' + esc(L(f.q)) + '<span class="faq-plus" aria-hidden="true">' + ic('plus') + '</span></summary><p class="faq-a">' + esc(L(f.a)) + '</p></details>';
      }).join('') + '</div></div></section>';
  }

  /* ---------------- lokacija i kontakt ---------------- */
  function mapQuery() { return D.location.mapQuery || L(D.location.address); }
  function mapSvg() {
    return '<svg viewBox="0 0 600 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<rect class="mp-land" width="600" height="420"/>' +
      '<path class="mp-water" d="M250 -10C230 60 300 110 280 180S190 270 230 330 330 380 320 430H380C390 380 300 330 290 300S350 220 350 170 290 60 310 -10Z"/>' +
      '<path class="mp-road" d="M-10 250C120 240 200 210 300 215S480 250 610 230"/><path class="mp-road" d="M120 -10C140 120 160 260 120 430"/>' +
      '<path class="mp-road2" d="M300 215C380 160 450 120 610 100M450 430C440 330 420 260 420 240M-10 90C90 110 170 120 230 100"/>' +
      '<path class="mp-road2" d="M285 140L345 150" stroke-width="7"/>' +
      '<text class="mp-label" x="330" y="128">Stari most</text><text class="mp-label" x="30" y="275">M17</text>' +
      '<circle class="mp-pulse" cx="380" cy="235" r="26"/>' +
      '<path class="mp-pin" d="M380 238c-12-14-20-24-20-34a20 20 0 0 1 40 0c0 10-8 20-20 34z"/><circle cx="380" cy="204" r="7" fill="#fff"/>' +
      '<text x="408" y="200" style="font:600 22px var(--serif);fill:var(--ink)">' + esc(D.name) + '</text></svg>';
  }
  function locationSec() {
    if (!has.location) return '';
    var Lc = D.location, q = encodeURIComponent(mapQuery());
    return '<section class="sec sec-alt" id="location"><div class="wrap">' + head(t('locationEyebrow'), t('locationTitle')) +
      '<div class="loc-grid"><div class="map reveal" id="map">' + (S.mapOn ? mapFrame() : mapSvg() +
      '<div class="map-actions"><button type="button" class="btn btn-dark btn-small" data-map>' + ic('pin') + esc(t('showMap')) + '</button>' +
      '<a class="btn btn-gold btn-small" href="https://www.google.com/maps/dir/?api=1&amp;destination=' + q + '" target="_blank" rel="noopener">' + ic('nav') + esc(t('navigate')) + '</a></div>') + '</div>' +
      '<div class="loc-side reveal" style="--d:1"><p class="addr">' + ic('pin') + '<span>' + esc(L(Lc.address)) + '</span></p>' +
      (Lc.distances && Lc.distances.length ? '<ul class="dists">' + Lc.distances.map(function (x) { return '<li>' + ic(x.icon || 'pin') + '<span>' + esc(L(x.place)) + '</span><b>' + esc(L(x.time)) + '</b></li>'; }).join('') + '</ul>' : '') +
      (S.mapOn ? '<a class="btn btn-gold" href="https://www.google.com/maps/dir/?api=1&amp;destination=' + q + '" target="_blank" rel="noopener">' + ic('nav') + esc(t('navigate')) + '</a>' : '') +
      '</div></div></div></section>';
  }
  function mapFrame() {
    return '<iframe title="' + esc(t('locationTitle')) + '" src="https://maps.google.com/maps?q=' + encodeURIComponent(mapQuery()) + '&amp;z=14&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>';
  }
  function contactSec() {
    var C = D.contact, items = [];
    if (C.phone) items.push(['phone', t('call'), C.phone, phoneHref(), false]);
    if (C.viber) items.push(['viber', t('viber'), C.viber, viberHref(''), false]);
    if (C.whatsapp) items.push(['whatsapp', t('whatsapp'), '+' + C.whatsapp, waHref(''), true]);
    if (C.email) items.push(['mail', t('email'), C.email, 'mailto:' + C.email, false]);
    if (C.instagram) items.push(['insta', t('instagram'), '@' + C.instagram, 'https://instagram.com/' + C.instagram, true]);
    if (C.facebook) items.push(['facebook', t('facebook'), C.facebook, 'https://facebook.com/' + C.facebook, true]);
    return '<section class="sec" id="contact"><div class="wrap">' + head(t('contactEyebrow'), t('contactTitle'), t('contactLead')) +
      '<ul class="contacts">' + items.map(function (x, i) {
        return '<li class="reveal" style="--d:' + (i % 3) + '"><a class="contact-card" href="' + esc(x[3]) + '"' + (x[4] ? ' target="_blank" rel="noopener"' : '') + '>' + ic(x[0]) + '<span><b>' + esc(x[1]) + '</b><small>' + esc(x[2]) + '</small></span></a></li>';
      }).join('') + '</ul>' +
      (C.hours ? '<p class="hours">' + ic('clock') + esc(L(C.hours)) + '</p>' : '') + '</div></section>';
  }
  function footer() {
    return '<div class="wrap foot-in">' + '<span class="brand-mono foot-mono" aria-hidden="true">' + esc(D.name.charAt(0)) + '</span>' +
      '<h2>' + esc(L(D.title)) + '</h2><p class="muted">' + esc(L(D.tagline)) + '</p>' +
      (D.location ? '<p class="muted small">' + esc(L(D.location.address)) + ' · <a href="' + esc(phoneHref()) + '">' + esc(D.contact.phone) + '</a></p>' : '') +
      (D.guestPage ? '<p class="small"><a href="' + esc(guestExample()) + '">' + esc(t('gLink')) + '</a></p>' : '') +
      (D.demo ? '<p class="demo-note">' + esc(L(D.demoNote) || t('demoNote')) + '</p>' : '') +
      '<p class="muted small">© ' + today.getFullYear() + ' ' + esc(L(D.title)) + '. ' + esc(t('rights')) + '</p>' +
      (D.credit ? '<p class="muted small">' + esc(t('madeBy')) + ': <a href="' + esc(D.credit.url) + '" target="_blank" rel="noopener">' + esc(D.credit.name) + '</a></p>' : '') +
      '</div>';
  }
  /* primjer stranice za goste: prva slobodna subota za ~8 mjeseci */
  function guestExample() {
    var d = new Date(today.getFullYear(), today.getMonth() + 8, 1);
    for (var i = 0; i < 60 && (d.getDay() !== 6 || isBusy(iso(d))); i++) d.setDate(d.getDate() + 1);
    return 'gosti.html?par=' + encodeURIComponent('Amra & Kenan') + '&datum=' + iso(d) + '&mladenci=1';
  }
  function dock() {
    return '<a href="' + esc(phoneHref()) + '">' + ic('phone') + '<span>' + esc(t('call')) + '</span></a>' +
      (D.contact.viber ? '<a class="dock-viber" href="' + esc(viberHref('')) + '">' + ic('viber') + '<span>' + esc(t('viber')) + '</span></a>' : '<a href="' + esc(waHref('')) + '">' + ic('whatsapp') + '<span>WhatsApp</span></a>') +
      '<a class="dock-cta" href="#date">' + ic('calendar') + '<span>' + esc(t('dockDate')) + '</span></a>';
  }
  function toTop() {
    return '<button type="button" class="to-top" aria-label="' + esc(t('toTop')) + '"><svg class="to-top-ring" viewBox="0 0 50 50" aria-hidden="true"><circle cx="25" cy="25" r="22"/><circle class="prog" cx="25" cy="25" r="22"/></svg>' + ic('up') + '</button>';
  }

  /* ---------------- vodič (meni) ---------------- */
  function freeSatSix() { var n = 0; for (var i = 0; i < Math.min(6, MONTHS); i++) n += freeSaturdays(i); return n; }
  function guideTiles() {
    var minP = Math.min.apply(null, (D.menus || []).map(function (m) { return m.price || Infinity; }));
    var tiles = [
      { id: 'date', ic: 'calendar', label: t('dateTitle'), meta: plural(t('gmDate'), freeSatSix()), feat: true },
      has.halls && { id: 'halls', ic: 'hall', label: t('nav.halls'), meta: t('gmHalls', { n: Math.max.apply(null, D.halls.map(function (h) { return h.seated; })) }) },
      has.menus && { id: 'menus', ic: 'dish', label: t('nav.menus'), meta: isFinite(minP) ? t('gmMenus', { p: money(minP), c: D.currency || 'KM' }) : t('onRequest') },
      has.gallery && { id: 'gallery', ic: 'image', label: t('nav.gallery'), meta: plural(t('gmGallery'), D.gallery.length) },
      has.view && { id: 'view', ic: 'eye', label: t('viewEyebrow'), meta: t('gmView') },
      offers.length && { id: 'offers', ic: 'tag', label: t('offersEyebrow'), meta: plural(t('gmOffers'), offers.length) },
      has.events && { id: 'events', ic: 'glass', label: t('nav.events'), meta: nyActive() ? L(D.newYear.title) : t('eventsLead') },
      has.faq && { id: 'faq', ic: 'chat', label: t('faqEyebrow'), meta: plural(t('gmFaq'), D.faq.length) },
      has.location && { id: 'location', ic: 'pin', label: t('nav.location'), meta: L(D.location.address) },
      { id: 'contact', ic: 'phone', label: t('nav.contact'), meta: D.contact.phone }
    ].filter(Boolean);
    return tiles.map(function (x, i) {
      return '<li style="--i:' + i + '"><a class="gd-tile' + (x.feat ? ' gd-feat' : '') + '" href="#' + x.id + '" data-go="' + x.id + '">' +
        '<span class="gd-num" aria-hidden="true">' + pad(i + 1) + '</span><span class="gd-ic">' + ic(x.ic) + '</span>' +
        '<span class="gd-txt"><b>' + esc(x.label) + '</b><small>' + esc(x.meta) + '</small></span>' +
        '<span class="gd-here">' + esc(t('guideHere')) + '</span>' + (x.feat ? ic('arrow', 'gd-go') : '') + '</a></li>';
    }).join('');
  }
  function guideHtml() {
    var quick = '<a class="gd-q" href="' + esc(phoneHref()) + '">' + ic('phone') + esc(t('call')) + '</a>' +
      (D.contact.viber ? '<a class="gd-q" href="' + esc(viberHref('')) + '">' + ic('viber') + 'Viber</a>' : '') +
      (D.contact.whatsapp ? '<a class="gd-q" href="' + esc(waHref('')) + '" target="_blank" rel="noopener">' + ic('whatsapp') + 'WhatsApp</a>' : '');
    return '<div class="guide-in"><div class="guide-top"><span class="brand">' + brandMark() + '<span class="brand-name">' + esc(D.name) + '</span></span>' +
      '<button type="button" class="menu-btn is-x" data-guide-close aria-label="' + esc(t('menuClose')) + '"><span class="mb-lines" aria-hidden="true"><i></i><i></i></span></button></div>' +
      '<div class="guide-grid"><div class="guide-side"><p class="eyebrow">' + esc(t('guideEyebrow', { name: D.name })) + '</p><h2 class="guide-h" id="guide-t">' + esc(t('guideTitle')) + '</h2></div>' +
      '<ul class="gd-tiles">' + guideTiles() + '</ul>' +
      '<div class="guide-side guide-extra"><p class="guide-label">' + esc(t('guideQuick')) + '</p><div class="gd-quick">' + quick + '</div>' +
      (LANGS.length > 1 ? '<p class="guide-label">' + esc(t('langLabel')) + '</p>' + langSeg() : '') + '</div></div></div>';
  }
  var Guide = (function () {
    var el = null, last = null, isOpen = false;
    function build() {
      el = document.getElementById('guide');
      if (!el) { el = document.createElement('div'); el.id = 'guide'; el.className = 'guide'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'guide-t'); el.hidden = true; document.body.appendChild(el); }
      el.innerHTML = guideHtml();
      markHere();
    }
    function origin(btn) {
      var r = btn ? btn.getBoundingClientRect() : { left: window.innerWidth - 40, top: 30, width: 0, height: 0 };
      el.style.setProperty('--ox', Math.round(r.left + r.width / 2) + 'px');
      el.style.setProperty('--oy', Math.round(r.top + r.height / 2) + 'px');
    }
    function open(instant) {
      if (isOpen) return;
      isOpen = true;
      if (!instant) last = document.activeElement;
      var btn = document.querySelector('.topbar .menu-btn');
      origin(btn);
      el.hidden = false;
      el.classList.toggle('instant', !!instant || reduced);
      root.classList.add('guide-open');
      document.body.classList.add('locked');
      if (btn) btn.setAttribute('aria-expanded', 'true');
      if (instant) el.classList.add('open');
      else requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('open'); }); });
      setTimeout(function () { var c = el.querySelector('[data-guide-close]'); if (c) c.focus({ preventScroll: true }); }, instant ? 0 : 60);
    }
    function close(noFocus) {
      if (!isOpen) return;
      isOpen = false;
      var btn = document.querySelector('.topbar .menu-btn');
      if (btn) { btn.setAttribute('aria-expanded', 'false'); origin(btn); }
      el.classList.remove('open', 'instant');
      root.classList.remove('guide-open');
      document.body.classList.remove('locked');
      setTimeout(function () { if (!isOpen) el.hidden = true; }, reduced ? 0 : 700);
      if (!noFocus) {
        var back = last && last !== document.body && document.contains(last) ? last : btn;
        if (back) back.focus({ preventScroll: true });
      }
    }
    function markHere() {
      if (!el) return;
      el.querySelectorAll('.gd-tile').forEach(function (a) {
        var id = a.getAttribute('data-go'), cur = Spy.current;
        a.classList.toggle('is-here', id === cur || (id === 'view' && cur === 'viewing'));
      });
    }
    document.addEventListener('click', function (e) {
      if (e.target.closest('.topbar .menu-btn')) { open(false); return; }
      if (!isOpen) return;
      if (e.target.closest('[data-guide-close]')) { close(); return; }
      var tile = e.target.closest('[data-go]') || e.target.closest('.gd-q');
      if (tile && tile.hasAttribute('data-go')) {
        e.preventDefault();
        var id = tile.getAttribute('data-go');
        close(true);
        setTimeout(function () { goTo(id, true); }, reduced ? 0 : 380);
      }
    });
    document.addEventListener('keydown', function (e) {
      if (!isOpen) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'Tab') {
        var f = [].slice.call(el.querySelectorAll('a[href], button')).filter(function (x) { return x.offsetParent !== null; });
        var first = f[0], lastF = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastF.focus(); }
        else if (!e.shiftKey && document.activeElement === lastF) { e.preventDefault(); first.focus(); }
      }
    });
    return { build: build, open: open, close: close, markHere: markHere, isOpen: function () { return isOpen; } };
  })();
  function goTo(id, focusHead) {
    var target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    if (focusHead) {
      var h = target.querySelector('h2');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    }
  }

  /* ---------------- aktivni link u meniju ---------------- */
  var Spy = (function () {
    var obs = null, api = { current: 'top', start: start, update: update };
    function update() {
      var cur = api.current === 'viewing' ? '' : api.current;
      document.querySelectorAll('.topnav a').forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + cur); });
      var nav = document.querySelector('.topnav'), pill = nav && nav.querySelector('.topnav-pill'), act = nav && nav.querySelector('a.is-active');
      if (pill) {
        if (act) { pill.style.width = act.offsetWidth + 'px'; pill.style.transform = 'translateX(' + act.offsetLeft + 'px)'; pill.style.opacity = '1'; }
        else pill.style.opacity = '0';
      }
      Guide.markHere();
    }
    function start() {
      if (obs) obs.disconnect();
      if (!('IntersectionObserver' in window)) return;
      obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { api.current = en.target.id; update(); } });
      }, { rootMargin: '-45% 0px -50% 0px' });
      document.querySelectorAll('#top, #main section.sec[id], #view, #offers').forEach(function (s) { obs.observe(s); });
    }
    window.addEventListener('resize', update);
    return api;
  })();

  /* ---------------- pojavljivanje pri skrolu ---------------- */
  var revealObs = null;
  function reveal() {
    var els = document.querySelectorAll('.reveal, .sec-head, .arch-img');
    if (reduced || !('IntersectionObserver' in window)) { els.forEach(function (x) { x.classList.add('in'); }); return; }
    if (revealObs) revealObs.disconnect();
    revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); revealObs.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    els.forEach(function (x) { if (!x.classList.contains('in')) revealObs.observe(x); });
  }

  /* ---------------- skrol: traka napretka, dugme na vrh ----------------
   * Varijable se postavljaju samo na male elemente (ne na <html>), da skrol ostane gladak. */
  var flags = {}, ticking = false, M = null;
  function setFlag(name, on) { if (flags[name] !== on) { flags[name] = on; root.classList.toggle(name, on); } }
  /* mjere stranice se čitaju samo kad se nešto promijeni (ne pri svakom pomaku), da skrol ne računa raspored */
  function measure() {
    M = {
      vh: window.innerHeight, max: Math.max(1, document.documentElement.scrollHeight - window.innerHeight),
      heroH: (document.getElementById('top') || {}).offsetHeight || window.innerHeight,
      bar: document.getElementById('topbar'), ring: document.querySelector('.to-top-ring .prog'), hi: document.querySelector('.hero-in')
    };
  }
  if ('ResizeObserver' in window) new ResizeObserver(function () { M = null; }).observe(document.body);
  window.addEventListener('resize', function () { M = null; });
  function onScroll() {
    ticking = false;
    if (!M) measure();
    var y = window.scrollY, p = Math.min(1, y / M.max);
    if (M.bar) M.bar.style.setProperty('--progress', p.toFixed(4));
    if (M.ring) M.ring.style.strokeDashoffset = (138.2 * (1 - p)).toFixed(1);
    setFlag('scrolled', y > 40);
    setFlag('past-hero', y > M.heroH * 0.55);
    setFlag('show-top', y > M.vh * 1.4);
    var gone = y > M.heroH;
    if (flags.heroGone !== gone) { flags.heroGone = gone; var hero = document.getElementById('top'); if (hero) hero.classList.toggle('is-gone', gone); }
    if (!reduced && M.hi && (y < M.heroH || !flags.heroDone)) {
      var k = Math.min(1, y / (M.heroH * 0.8));
      flags.heroDone = y >= M.heroH;
      M.hi.style.opacity = (1 - k * 0.9).toFixed(3); M.hi.style.transform = 'translateY(' + (Math.min(y, M.heroH) * 0.18).toFixed(1) + 'px)';
    }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } });

  /* ---------------- dropdown ---------------- */
  function ddOpen(box, focusSel) {
    document.querySelectorAll('.dd.is-open').forEach(function (o) { if (o !== box) ddClose(o); });
    var list = box.querySelector('.dd-list'), btn = box.querySelector('.dd-btn');
    box.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); list.hidden = false;
    requestAnimationFrame(function () { list.classList.add('open'); });
    if (focusSel) { var s = list.querySelector('[aria-selected="true"]') || list.querySelector('li'); if (s) s.focus({ preventScroll: true }); }
  }
  function ddClose(box, focusBtn) {
    var list = box.querySelector('.dd-list'), btn = box.querySelector('.dd-btn');
    box.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); list.classList.remove('open'); list.hidden = true;
    if (focusBtn) btn.focus({ preventScroll: true });
  }
  function ddPick(box, li) {
    var id = box.getAttribute('data-dd'), v = li.getAttribute('data-v');
    box.querySelectorAll('li').forEach(function (x) { x.setAttribute('aria-selected', String(x === li)); });
    box.querySelector('.dd-val').textContent = li.querySelector('span').firstChild.textContent;
    if (id === 'hall') S.hall = v; else if (id === 'menu') S.menu = v;
    ddClose(box, true);
    updateEstimate(); updateNeed();
  }
  function setDD(id, v) {
    var box = document.querySelector('[data-dd="' + id + '"]');
    if (!box) return;
    var li = box.querySelector('li[data-v="' + v + '"]');
    if (li) { box.querySelectorAll('li').forEach(function (x) { x.setAttribute('aria-selected', String(x === li)); }); box.querySelector('.dd-val').textContent = li.querySelector('span').firstChild.textContent; }
  }

  /* ---------------- događaji ---------------- */
  function setGuests(n) {
    n = Math.round(+n || G.start);
    n = Math.max(G.min, Math.min(G.max, n));
    S.guests = n;
    var a = document.getElementById('f-guests'), r = document.getElementById('f-range');
    if (a && document.activeElement !== a) a.value = n;
    if (r) r.value = n;
    updateEstimate(); updateNeed();
  }
  function setType(k) {
    S.type = k;
    document.querySelectorAll('[data-type]').forEach(function (b) { var on = b.getAttribute('data-type') === k; b.setAttribute('aria-checked', String(on)); b.setAttribute('tabindex', on ? '0' : '-1'); });
    updateNeed();
  }
  document.addEventListener('click', function (e) {
    var b;
    if ((b = e.target.closest('[data-lang]'))) { setLang(b.getAttribute('data-lang')); return; }
    if ((b = e.target.closest('[data-car]'))) { var tr = b.closest('.car-ui').nextElementSibling, it = tr.children[0]; tr.__user = true; tr.scrollBy({ left: +b.getAttribute('data-car') * (it ? it.offsetWidth + 14 : tr.clientWidth * 0.8), behavior: reduced ? 'auto' : 'smooth' }); return; }
    if ((b = e.target.closest('[data-ms]'))) { var st = document.querySelector('.month-strip'); st.scrollBy({ left: +b.getAttribute('data-ms') * st.clientWidth * 0.75, behavior: reduced ? 'auto' : 'smooth' }); return; }
    if ((b = e.target.closest('[data-month]'))) { S.month = +b.getAttribute('data-month'); renderCal(); return; }
    if ((b = e.target.closest('[data-cal]'))) {
      var kd = b.getAttribute('data-kind') || 'date', C = CAL[kd], dir = b.getAttribute('data-cal');
      C.set(Math.max(0, Math.min(C.max() - 1, C.get() + +dir))); renderAny(kd);
      var nb = document.querySelector('[data-cal="' + dir + '"][data-kind="' + kd + '"]'); if (nb && !nb.disabled) nb.focus({ preventScroll: true });
      return;
    }
    if ((b = e.target.closest('.cal-day[data-vdate]'))) {
      S.vDay = b.getAttribute('data-vdate'); renderVCal(); updateView();
      var nv = document.querySelector('.cal-day[data-vdate="' + S.vDay + '"]'); if (nv) nv.focus({ preventScroll: true });
      return;
    }
    if ((b = e.target.closest('.cal-day'))) { var ds = b.getAttribute('data-date'); selectDate(ds); var nd = document.querySelector('.cal-day[data-date="' + ds + '"]'); if (nd) nd.focus({ preventScroll: true }); return; }
    if ((b = e.target.closest('[data-type]'))) { setType(b.getAttribute('data-type')); return; }
    if ((b = e.target.closest('[data-step]'))) { setGuests(S.guests + +b.getAttribute('data-step') * G.step); return; }
    if ((b = e.target.closest('[data-extra]'))) {
      var x = b.getAttribute('data-extra'); S.extras[x] = !S.extras[x];
      b.setAttribute('aria-pressed', String(!!S.extras[x])); b.querySelector('.ic').outerHTML = ic(S.extras[x] ? 'check' : 'plus');
      updateEstimate(); updateNeed(); return;
    }
    if ((b = e.target.closest('.dd-btn'))) { var box = b.closest('.dd'); if (box.classList.contains('is-open')) ddClose(box); else ddOpen(box, false); return; }
    if ((b = e.target.closest('.dd-list li'))) { ddPick(b.closest('.dd'), b); return; }
    if (!e.target.closest('.dd')) document.querySelectorAll('.dd.is-open').forEach(function (o) { ddClose(o); });
    if ((b = e.target.closest('[data-send]'))) {
      if (b.classList.contains('is-locked')) {
        e.preventDefault();
        var err = document.getElementById('form-err');
        if (!S.date) { err.textContent = t('needDateMsg'); goTo('date'); }
        else { err.textContent = t('needNameMsg'); var f = document.getElementById(S.name.trim().length < 2 ? 'f-name' : 'f-phone'); if (f) f.focus(); }
      }
      return;
    }
    if ((b = e.target.closest('[data-pick-hall]'))) { S.hall = b.getAttribute('data-pick-hall'); setDD('hall', S.hall); updateEstimate(); updateNeed(); goTo('date'); return; }
    if ((b = e.target.closest('[data-pick-menu]'))) { S.menu = b.getAttribute('data-pick-menu'); setDD('menu', S.menu); updateEstimate(); updateNeed(); goTo('date'); return; }
    if ((b = e.target.closest('[data-pick-date]'))) { selectDate(b.getAttribute('data-pick-date'), true); return; }
    if ((b = e.target.closest('[data-ask-type]'))) { setType(b.getAttribute('data-ask-type')); goTo('date'); return; }
    if ((b = e.target.closest('[data-gcat]'))) { filterGallery(b.getAttribute('data-gcat')); return; }
    if ((b = e.target.closest('[data-vtime]'))) { S.vTime = b.getAttribute('data-vtime'); updateView(); return; }
    if ((b = e.target.closest('#view-send'))) { if (b.classList.contains('is-locked')) { e.preventDefault(); var vn = document.getElementById('view-need'); vn.classList.remove('bump'); void vn.offsetWidth; vn.style.color = '#a23a1a'; setTimeout(function () { vn.style.color = ''; }, 1600); } return; }
    if ((b = e.target.closest('[data-map]'))) {
      S.mapOn = true;
      var m = document.getElementById('map'); m.innerHTML = mapFrame();
      var side = document.querySelector('.loc-side');
      if (side && !side.querySelector('.btn')) side.insertAdjacentHTML('beforeend', '<a class="btn btn-gold" href="https://www.google.com/maps/dir/?api=1&amp;destination=' + encodeURIComponent(mapQuery()) + '" target="_blank" rel="noopener">' + ic('nav') + esc(t('navigate')) + '</a>');
      return;
    }
    if ((b = e.target.closest('.to-top'))) { window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); var br = document.querySelector('.brand'); if (br) br.focus({ preventScroll: true }); return; }
  });
  document.addEventListener('input', function (e) {
    var id = e.target.id;
    if (id === 'f-name') S.name = e.target.value;
    else if (id === 'f-phone') S.phone = e.target.value;
    else if (id === 'f-msg') S.msg = e.target.value;
    else if (id === 'f-range') { setGuests(e.target.value); var a = document.getElementById('f-guests'); if (a) a.value = S.guests; return; }
    else if (id === 'f-guests') { if (e.target.value !== '') { S.guests = Math.max(1, Math.min(G.max, Math.round(+e.target.value) || G.min)); var r = document.getElementById('f-range'); if (r) r.value = S.guests; updateEstimate(); } }
    else return;
    updateNeed();
  });
  document.addEventListener('change', function (e) { if (e.target.id === 'f-guests') { setGuests(e.target.value); e.target.value = S.guests; } });
  document.addEventListener('submit', function (e) { e.preventDefault(); });
  document.addEventListener('keydown', function (e) {
    var t0 = e.target;
    /* dropdown tastaturom */
    var box = t0.closest && t0.closest('.dd');
    if (box) {
      if (t0.classList.contains('dd-btn') && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); ddOpen(box, true); return; }
      if (t0.tagName === 'LI') {
        var items = [].slice.call(box.querySelectorAll('li')), i = items.indexOf(t0);
        if (e.key === 'ArrowDown') { e.preventDefault(); items[Math.min(items.length - 1, i + 1)].focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); items[Math.max(0, i - 1)].focus(); }
        else if (e.key === 'Home') { e.preventDefault(); items[0].focus(); }
        else if (e.key === 'End') { e.preventDefault(); items[items.length - 1].focus(); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ddPick(box, t0); }
        else if (e.key === 'Escape' || e.key === 'Tab') { if (e.key === 'Escape') e.preventDefault(); ddClose(box, e.key === 'Escape'); }
        return;
      }
      if (e.key === 'Escape' && box.classList.contains('is-open')) { ddClose(box, true); return; }
    }
    /* vrsta proslave: strelice kao radio grupa */
    if (t0.hasAttribute && t0.hasAttribute('data-type') && /Arrow(Left|Right|Up|Down)/.test(e.key)) {
      e.preventDefault();
      var all = [].slice.call(document.querySelectorAll('[data-type]')), j = all.indexOf(t0);
      var nx = all[(j + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + all.length) % all.length];
      setType(nx.getAttribute('data-type')); nx.focus();
      return;
    }
    /* kalendar: strelice pomjeraju dan (oba kalendara) */
    if (t0.classList && t0.classList.contains('cal-day') && /Arrow(Left|Right|Up|Down)/.test(e.key)) {
      e.preventDefault();
      var kind = t0.hasAttribute('data-vdate') ? 'view' : 'date', C = CAL[kind];
      var step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
      var d = parse(t0.getAttribute(C.attr));
      for (var n = 0; n < 60; n++) {
        d.setDate(d.getDate() + step);
        var s = iso(d), off = (d.getFullYear() - today.getFullYear()) * 12 + d.getMonth() - today.getMonth();
        if (off < 0 || off >= C.max()) return;
        if (C.ok(s)) {
          if (off !== C.get()) { C.set(off); renderAny(kind); }
          var el = document.querySelector('.cal-day[' + C.attr + '="' + s + '"]'); if (el) el.focus();
          return;
        }
      }
    }
  });

  /* brojke na prvom ekranu odbroje do vrijednosti */
  function countUp() {
    document.querySelectorAll('.hero [data-count]').forEach(function (b) {
      var to = +b.getAttribute('data-count'); b.removeAttribute('data-count');
      if (reduced || to < 10) return;
      b.textContent = '0';
      setTimeout(function () {
        var t0 = performance.now();
        (function step(now) {
          var k = Math.min(1, (now - t0) / 1400), e = 1 - Math.pow(1 - k, 3);
          b.textContent = String(Math.round(to * e));
          if (k < 1) requestAnimationFrame(step);
        })(t0);
      }, 1300);
    });
  }
  /* prvi ekran blago prati miš (samo računar) */
  if (!reduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var px = 0, py = 0, praf = 0;
    document.addEventListener('pointermove', function (e) {
      if (window.scrollY > window.innerHeight) return;
      px = e.clientX / window.innerWidth - 0.5; py = e.clientY / window.innerHeight - 0.5;
      if (!praf) praf = requestAnimationFrame(function () {
        praf = 0;
        var a = document.querySelector('.hero-art'); if (a) a.style.transform = 'translate3d(' + (px * -14).toFixed(1) + 'px,' + (py * -10).toFixed(1) + 'px,0)';
        var d = document.querySelector('.hero-dust'); if (d) d.style.transform = 'translate3d(' + (px * 18).toFixed(1) + 'px,' + (py * 12).toFixed(1) + 'px,0)';
      });
    }, { passive: true });
  }

  /* ---------------- crtanje ---------------- */
  function render() {
    root.lang = lang;
    if (D.theme) Object.keys(D.theme).forEach(function (k) { root.style.setProperty('--' + k, D.theme[k]); });
    document.title = L(D.title) + ' | ' + t('nav.date') + ', ' + t('nav.halls') + ', ' + t('nav.menus');
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', L(D.tagline));
    var sk = document.querySelector('.skip'); if (sk) sk.textContent = t('skip');
    document.getElementById('topbar').innerHTML = topbar();
    document.getElementById('top').innerHTML = hero();
    document.getElementById('main').innerHTML = booking() + halls() + menus() + gallery() + viewSection() + events() + services() + reviews() + faq() + locationSec() + contactSec();
    document.getElementById('foot').innerHTML = footer();
    document.getElementById('dock').innerHTML = dock();
    document.getElementById('dock').setAttribute('aria-label', t('guideQuick'));
    var tt = document.getElementById('to-top-wrap');
    if (!tt) { tt = document.createElement('div'); tt.id = 'to-top-wrap'; document.body.appendChild(tt); }
    tt.innerHTML = toTop();
    Guide.build();
    updateEstimate(); updateNeed();
    bindStrip();
    stripToActive(false);
    carousels();
    animGate();
    countUp();
    reveal();
    Spy.start();
    flags = {}; M = null; onScroll();
  }
  function setLang(l) {
    if (l === lang || LANGS.indexOf(l) < 0) return;
    lang = l;
    try { localStorage.setItem('salon-lang', l); } catch (e) { /* privatni mod */ }
    var y = window.scrollY, wasOpen = Guide.isOpen();
    if (wasOpen) Guide.close(true);
    lastTotal = null;
    render();
    window.scrollTo(0, y);
    document.querySelectorAll('.reveal, .sec-head, .arch-img').forEach(function (x) {
      var r = x.getBoundingClientRect();
      if (r.top < window.innerHeight) x.classList.add('in');
    });
    if (wasOpen) Guide.open(true);
    var focusBtn = document.querySelector((wasOpen ? '#guide' : '.topbar') + ' [data-lang="' + l + '"]');
    if (focusBtn) focusBtn.focus({ preventScroll: true });
  }

  /* ---------------- Google Kalendar (preko Workera, vidi README) ---------------- */
  function loadBusy() {
    var url = D.availability && D.availability.ics;
    if (!url || !window.fetch) return;
    fetch(url, { headers: { accept: 'application/json' } }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (j) {
      var list = Array.isArray(j) ? j : (j && j.busy) || [];
      var added = 0;
      list.forEach(function (s) { if (/^\d{4}-\d{2}-\d{2}$/.test(s) && !busy[s]) { busy[s] = 1; added++; } });
      if (!added) return;
      offers = offers.filter(function (o) { return !busy[o.date]; });
      if (S.date && busy[S.date]) S.date = null;
      var y = window.scrollY; render(); window.scrollTo(0, y);
    }).catch(function () { /* kalendar ostaje sa ručno upisanim terminima */ });
  }

  render();
  loadBusy();
  if (location.hash && location.hash.length > 1) {
    var tgt = document.getElementById(location.hash.slice(1));
    if (tgt) setTimeout(function () { tgt.scrollIntoView(); }, 0);
  }
})();
