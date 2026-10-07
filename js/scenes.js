/*
 * Ilustracije za demo (SVG). Boje dolaze iz CSS varijabli (--sc-*), pa se mijenjaju sa temom salona.
 * Za pravog klijenta umjesto { scene: '...' } stavljaš { image: 'assets/img/x.webp' }.
 */
(function () {
  'use strict';
  var n = 0;
  function uid(p) { n += 1; return p + n; }

  function svg(inner, defs, cls) {
    return '<svg class="scene ' + (cls || '') + '" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' +
      '<defs>' + defs + '</defs>' + inner + '</svg>';
  }
  function glowDef(id, color) {
    return '<radialGradient id="' + id + '"><stop offset="0" stop-color="' + color + '" stop-opacity=".95"/><stop offset=".35" stop-color="' + color + '" stop-opacity=".35"/><stop offset="1" stop-color="' + color + '" stop-opacity="0"/></radialGradient>';
  }
  /* luster: niz kristala u krugovima */
  function chandelier(x, y, s, glowId) {
    var out = '<g class="sc-chand" transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<circle r="120" fill="url(#' + glowId + ')" class="sc-twinkle"/>' +
      '<path d="M0 -200V-40" class="sc-wire"/>' +
      '<ellipse rx="70" ry="16" cy="-30" class="sc-goldline"/>' +
      '<ellipse rx="48" ry="11" cy="0" class="sc-goldline"/>';
    for (var i = 0; i < 9; i++) {
      var a = (i / 9) * Math.PI * 2, cx = Math.cos(a) * 66, cy = -30 + Math.sin(a) * 15;
      out += '<path d="M' + cx.toFixed(1) + ' ' + cy.toFixed(1) + 'v' + (22 + (i % 3) * 8) + '" class="sc-crystal"/><circle cx="' + cx.toFixed(1) + '" cy="' + (cy + 26 + (i % 3) * 8).toFixed(1) + '" r="3.2" class="sc-bead"/>';
    }
    for (var j = 0; j < 7; j++) {
      var b = (j / 7) * Math.PI * 2, dx = Math.cos(b) * 44, dy = Math.sin(b) * 10;
      out += '<path d="M' + dx.toFixed(1) + ' ' + dy.toFixed(1) + 'v' + (18 + (j % 2) * 10) + '" class="sc-crystal"/>';
    }
    out += '<path d="M0 0v52" class="sc-crystal"/><circle cy="58" r="5" class="sc-bead"/></g>';
    return out;
  }
  /* okrugli sto sa stolnjakom, cvijećem i svijećom */
  function table(x, y, w) {
    var h = w * 0.26;
    return '<g transform="translate(' + x + ' ' + y + ')">' +
      '<ellipse cx="0" cy="' + (h * 1.9) + '" rx="' + (w * 0.55) + '" ry="' + (h * 0.35) + '" class="sc-shadow"/>' +
      '<path d="M' + (-w / 2) + ' 0 Q' + (-w / 2) + ' ' + (h * 1.8) + ' ' + (-w * 0.46) + ' ' + (h * 1.9) + 'H' + (w * 0.46) + 'Q' + (w / 2) + ' ' + (h * 1.8) + ' ' + (w / 2) + ' 0z" class="sc-cloth"/>' +
      '<ellipse rx="' + (w / 2) + '" ry="' + h + '" class="sc-clothtop"/>' +
      '<ellipse rx="' + (w * 0.42) + '" ry="' + (h * 0.8) + '" class="sc-runner"/>' +
      '<circle cx="' + (-w * 0.06) + '" cy="' + (-h * 0.35) + '" r="' + (w * 0.07) + '" class="sc-rose"/>' +
      '<circle cx="' + (w * 0.05) + '" cy="' + (-h * 0.45) + '" r="' + (w * 0.06) + '" class="sc-rose2"/>' +
      '<circle cx="' + (w * 0.0) + '" cy="' + (-h * 0.15) + '" r="' + (w * 0.05) + '" class="sc-leaf"/>' +
      '<path d="M' + (w * 0.2) + ' ' + (-h * 0.2) + 'v' + (-h * 0.9) + '" class="sc-candle"/>' +
      '<ellipse cx="' + (w * 0.2) + '" cy="' + (-h * 1.15) + '" rx="' + (w * 0.015) + '" ry="' + (w * 0.03) + '" class="sc-flame"/>' +
      '</g>';
  }
  function chair(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" class="sc-chair"><path d="M-14 0V-46a14 14 0 0 1 28 0V0"/><path d="M-14 -14h28"/></g>';
  }
  function arches(cls, count, y, w, h) {
    var out = '', step = 800 / count;
    for (var i = 0; i < count; i++) {
      var x = i * step + (step - w) / 2;
      out += '<path d="M' + x + ' ' + (y + h) + 'V' + (y + w / 2) + 'a' + (w / 2) + ' ' + (w / 2) + ' 0 0 1 ' + w + ' 0V' + (y + h) + 'z" class="' + cls + '"/>';
    }
    return out;
  }
  function stringLights(d, count, cls) {
    return '<path d="' + d + '" class="sc-wire sc-lightwire"/>';
  }
  function bulbs(points) {
    return points.map(function (p, i) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5" class="sc-bulb' + (i % 3 === 0 ? ' sc-twinkle' : '') + '" style="animation-delay:' + (i % 5) * 0.4 + 's"/>'; }).join('');
  }
  function curvePoints(x0, y0, x1, y1, sag, count) {
    var pts = [];
    for (var i = 1; i < count; i++) {
      var t = i / count, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t + Math.sin(Math.PI * t) * sag;
      pts.push([x.toFixed(1), y.toFixed(1)]);
    }
    return pts;
  }

  var S = {};

  S.grandHall = function () {
    var g = uid('g'), w = uid('w');
    return svg(
      '<rect width="800" height="600" fill="url(#' + w + ')"/>' +
      arches('sc-window', 4, 120, 120, 300) +
      '<path d="M0 420H800V600H0z" class="sc-floor"/>' +
      '<path d="M0 420H800" class="sc-goldline"/>' +
      '<ellipse cx="400" cy="520" rx="220" ry="40" class="sc-dancefloor"/>' +
      chandelier(220, 140, 0.55, g) + chandelier(580, 140, 0.55, g) + chandelier(400, 110, 0.75, g) +
      table(150, 455, 170) + table(650, 455, 170) + table(400, 500, 120) +
      chair(80, 470, .8) + chair(220, 470, .8) + chair(580, 470, .8) + chair(720, 470, .8),
      glowDef(g, 'var(--sc-glow)') + '<linearGradient id="' + w + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sc-wall)"/><stop offset="1" stop-color="var(--sc-wall2)"/></linearGradient>'
    );
  };

  S.nightHall = function () {
    var g = uid('g'), w = uid('w');
    var pts = curvePoints(0, 60, 800, 60, 70, 16).concat(curvePoints(0, 130, 800, 130, 60, 14));
    return svg(
      '<rect width="800" height="600" fill="url(#' + w + ')"/>' +
      '<path d="M0 60 Q400 200 800 60" class="sc-wire sc-lightwire"/><path d="M0 130 Q400 250 800 130" class="sc-wire sc-lightwire"/>' + bulbs(pts) +
      chandelier(400, 120, 0.8, g) +
      '<path d="M0 430H800V600H0z" class="sc-floor-night"/>' +
      '<ellipse cx="400" cy="500" rx="260" ry="55" class="sc-dancefloor-night"/>' +
      '<g class="sc-couple" transform="translate(400 470)"><path d="M-22 40c0-40 6-70 18-80 10 8 14 30 12 80z" class="sc-dress"/><circle cx="-6" cy="-52" r="9" class="sc-skin"/><path d="M2 40V-30c0-10 8-16 14-16s12 6 12 16v70z" class="sc-suit"/><circle cx="16" cy="-58" r="9" class="sc-skin"/></g>' +
      table(130, 480, 150) + table(670, 480, 150),
      glowDef(g, 'var(--sc-glow)') + '<linearGradient id="' + w + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sc-night)"/><stop offset="1" stop-color="var(--sc-night2)"/></linearGradient>',
      'sc-dark'
    );
  };

  S.crystalHall = function () {
    var g = uid('g'), w = uid('w');
    return svg(
      '<rect width="800" height="600" fill="url(#' + w + ')"/>' +
      '<rect x="60" y="90" width="680" height="300" rx="14" class="sc-glasswall"/>' +
      '<path d="M60 330 Q260 270 400 300 T740 280V390H60z" class="sc-river"/>' +
      '<path d="M60 300 L180 210 260 260 360 180 470 250 560 200 740 270V330H60z" class="sc-hill"/>' +
      '<path d="M230 90V390M400 90V390M570 90V390" class="sc-mullion"/>' +
      chandelier(400, 80, 0.5, g) +
      '<path d="M0 420H800V600H0z" class="sc-floor"/>' +
      table(230, 470, 160) + table(570, 470, 160) +
      chair(160, 485, .75) + chair(300, 485, .75) + chair(500, 485, .75) + chair(640, 485, .75),
      glowDef(g, 'var(--sc-glow)') + '<linearGradient id="' + w + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sc-wall)"/><stop offset="1" stop-color="var(--sc-wall2)"/></linearGradient>'
    );
  };

  S.garden = function () {
    var w = uid('w');
    var pts = curvePoints(120, 150, 680, 150, 60, 14);
    return svg(
      '<rect width="800" height="600" fill="url(#' + w + ')"/>' +
      '<circle cx="640" cy="120" r="46" class="sc-moon"/>' +
      '<path d="M0 360 Q200 300 400 340 T800 320V600H0z" class="sc-lawn"/>' +
      '<path d="M120 380V150M680 380V150M110 150H690" class="sc-pergola"/>' +
      '<path d="M120 150 Q400 260 680 150" class="sc-wire sc-lightwire"/>' + bulbs(pts) +
      '<g class="sc-foliage"><circle cx="110" cy="160" r="26"/><circle cx="140" cy="150" r="18"/><circle cx="660" cy="155" r="24"/><circle cx="690" cy="168" r="18"/></g>' +
      table(260, 440, 150) + table(540, 440, 150) +
      '<g class="sc-shrubs"><circle cx="40" cy="400" r="40"/><circle cx="770" cy="390" r="44"/></g>',
      '<linearGradient id="' + w + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sc-dusk)"/><stop offset="1" stop-color="var(--sc-dusk2)"/></linearGradient>',
      'sc-dark'
    );
  };

  S.riverTerrace = function () {
    var w = uid('w');
    return svg(
      '<rect width="800" height="600" fill="url(#' + w + ')"/>' +
      '<circle cx="180" cy="150" r="60" class="sc-sun"/>' +
      '<path d="M0 300 L120 220 220 270 330 190 450 260 560 210 680 250 800 220V340H0z" class="sc-hill"/>' +
      '<path d="M0 330 Q200 300 400 320 T800 310V420H0z" class="sc-river"/>' +
      '<path d="M310 330 Q400 250 490 330" class="sc-bridge"/><path d="M300 330H500" class="sc-bridge"/>' +
      '<path d="M0 420H800V600H0z" class="sc-deck"/>' +
      '<path d="M0 420H800M0 460H800" class="sc-goldline"/>' +
      table(200, 480, 140) + table(600, 480, 140),
      '<linearGradient id="' + w + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sc-sky)"/><stop offset="1" stop-color="var(--sc-sky2)"/></linearGradient>'
    );
  };

  S.tableSet = function () {
    var w = uid('w');
    return svg(
      '<rect width="800" height="600" fill="url(#' + w + ')"/>' +
      '<ellipse cx="400" cy="380" rx="380" ry="190" class="sc-clothtop"/>' +
      '<ellipse cx="400" cy="380" rx="300" ry="140" class="sc-runner"/>' +
      '<circle cx="400" cy="380" r="110" class="sc-plate"/><circle cx="400" cy="380" r="80" class="sc-plate2"/>' +
      '<path d="M400 340c-30 0-30 45 0 45s30-45 0-45z" class="sc-napkin"/>' +
      '<path d="M250 300v170M262 300v170" class="sc-cutlery"/><path d="M540 300v170M552 300c18 20 18 50 0 70" class="sc-cutlery"/>' +
      '<path d="M590 220h40l-4 50a16 16 0 0 1-32 0z" class="sc-wine"/><path d="M610 290v40M596 332h28" class="sc-goldline"/>' +
      '<path d="M650 230h30l-3 40a12 12 0 0 1-24 0z" class="sc-wine2"/>' +
      '<circle cx="200" cy="170" r="34" class="sc-rose"/><circle cx="240" cy="150" r="26" class="sc-rose2"/><circle cx="220" cy="200" r="20" class="sc-leaf"/>' +
      '<rect x="360" y="150" width="80" height="50" rx="4" class="sc-card"/><path d="M380 172h40M388 184h24" class="sc-goldline"/>',
      '<linearGradient id="' + w + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sc-wall2)"/><stop offset="1" stop-color="var(--sc-wall)"/></linearGradient>'
    );
  };

  S.cake = function () {
    var w = uid('w'), g = uid('g');
    return svg(
      '<rect width="800" height="600" fill="url(#' + w + ')"/>' +
      '<circle cx="400" cy="260" r="260" fill="url(#' + g + ')"/>' +
      '<path d="M220 520h360" class="sc-goldline"/><ellipse cx="400" cy="520" rx="170" ry="16" class="sc-plate"/>' +
      '<rect x="270" y="400" width="260" height="120" rx="10" class="sc-cake"/>' +
      '<rect x="310" y="300" width="180" height="100" rx="10" class="sc-cake"/>' +
      '<rect x="345" y="220" width="110" height="80" rx="10" class="sc-cake"/>' +
      '<path d="M270 430c40 20 90 20 130 0s90-20 130 0M310 325c30 16 60 16 90 0s60-16 90 0M345 245c18 12 37 12 55 0s37-12 55 0" class="sc-icing"/>' +
      '<circle cx="380" cy="210" r="18" class="sc-rose"/><circle cx="410" cy="205" r="14" class="sc-rose2"/><circle cx="398" cy="222" r="10" class="sc-leaf"/>' +
      '<circle cx="290" cy="400" r="14" class="sc-rose2"/><circle cx="510" cy="300" r="12" class="sc-rose"/>',
      glowDef(g, 'var(--sc-glow)') + '<linearGradient id="' + w + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sc-wall)"/><stop offset="1" stop-color="var(--sc-wall2)"/></linearGradient>'
    );
  };

  S.arch = function () {
    var w = uid('w'), flowers = '';
    for (var i = 0; i <= 22; i++) {
      var a = Math.PI - (i / 22) * Math.PI, x = 400 + Math.cos(a) * 200, y = 330 - Math.sin(a) * 200;
      flowers += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (14 + (i % 3) * 5) + '" class="' + (['sc-rose', 'sc-rose2', 'sc-leaf', 'sc-bloomw'][i % 4]) + '"/>';
    }
    return svg(
      '<rect width="800" height="600" fill="url(#' + w + ')"/>' +
      '<path d="M200 560V330a200 200 0 0 1 400 0V560" class="sc-archline"/>' + flowers +
      '<circle cx="200" cy="540" r="34" class="sc-leaf"/><circle cx="600" cy="540" r="34" class="sc-leaf"/><circle cx="215" cy="510" r="20" class="sc-rose"/><circle cx="585" cy="510" r="22" class="sc-rose2"/>' +
      '<path d="M300 560h200" class="sc-goldline"/><path d="M0 560H800V600H0z" class="sc-lawn"/>' +
      chair(140, 590, 1) + chair(660, 590, 1),
      '<linearGradient id="' + w + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sc-sky)"/><stop offset="1" stop-color="var(--sc-wall)"/></linearGradient>'
    );
  };

  S.dessertBar = function () {
    var w = uid('w'), items = '';
    for (var i = 0; i < 6; i++) {
      var x = 150 + i * 100;
      items += '<path d="M' + (x - 28) + ' 330h56l-6 22h-44z" class="sc-goldfill"/><circle cx="' + x + '" cy="318" r="' + (16 + (i % 2) * 4) + '" class="' + (i % 2 ? 'sc-rose' : 'sc-macaron') + '"/>';
      items += '<rect x="' + (x - 20) + '" y="400" width="40" height="34" rx="6" class="' + (i % 3 ? 'sc-cake' : 'sc-rose2') + '"/>';
    }
    return svg(
      '<rect width="800" height="600" fill="url(#' + w + ')"/>' +
      arches('sc-window', 3, 60, 150, 220) +
      '<path d="M60 360H740M60 440H740" class="sc-goldline"/>' +
      '<path d="M60 440H740V600H60z" class="sc-cloth"/>' + items,
      '<linearGradient id="' + w + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sc-wall)"/><stop offset="1" stop-color="var(--sc-wall2)"/></linearGradient>'
    );
  };

  /* prvi ekran: sala noću, široka kompozicija */
  S.hero = function () {
    var g = uid('g'), w = uid('w'), v = uid('v');
    var pts = curvePoints(-40, 40, 840, 40, 90, 22).concat(curvePoints(-40, 110, 840, 110, 70, 20));
    return '<svg class="scene scene-hero" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs>' +
      glowDef(g, 'var(--sc-glow)') +
      '<linearGradient id="' + w + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sc-night)"/><stop offset="1" stop-color="var(--sc-night2)"/></linearGradient>' +
      '<radialGradient id="' + v + '" cx=".5" cy=".75" r=".75"><stop offset="0" stop-color="var(--sc-glow)" stop-opacity=".22"/><stop offset="1" stop-color="var(--sc-glow)" stop-opacity="0"/></radialGradient>' +
      '</defs>' +
      '<rect width="800" height="600" fill="url(#' + w + ')"/>' +
      arches('sc-window-night', 5, 150, 100, 280) +
      '<rect width="800" height="600" fill="url(#' + v + ')"/>' +
      '<path d="M-40 40 Q400 220 840 40" class="sc-wire sc-lightwire"/><path d="M-40 110 Q400 250 840 110" class="sc-wire sc-lightwire"/>' + bulbs(pts) +
      chandelier(400, 120, 0.9, g) + chandelier(150, 170, 0.5, g) + chandelier(650, 170, 0.5, g) +
      '<path d="M0 440H800V600H0z" class="sc-floor-night"/>' +
      '<ellipse cx="400" cy="520" rx="300" ry="60" class="sc-dancefloor-night"/>' +
      '</svg>';
  };

  window.SALON_SCENES = S;
})();
