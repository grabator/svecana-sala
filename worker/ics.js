/*
 * Čita Google Kalendar (.ics) i vraća listu zauzetih dana ['GGGG-MM-DD', ...].
 * Svaki događaj u kalendaru = zauzet dan (cjelodnevni događaj preko više dana zauzme sve te dane).
 * Ponavljajući događaji (RRULE) se ne računaju: svadbe se upisuju kao pojedinačni događaji.
 */
const TZ = 'Europe/Sarajevo';

function localDay(d) {
  // datum u vremenskoj zoni salona (događaj u 23:30 UTC je već sljedeći dan u BiH ljeti)
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

function readDate(line) {
  // DTSTART;VALUE=DATE:20270612  |  DTSTART:20270612T160000Z  |  DTSTART;TZID=Europe/Sarajevo:20270612T170000
  const v = line.slice(line.lastIndexOf(':') + 1).trim();
  const m = v.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/);
  if (!m) return null;
  if (!m[4]) return { day: `${m[1]}-${m[2]}-${m[3]}`, allDay: true };
  if (m[7]) return { day: localDay(new Date(Date.UTC(+m[1], m[2] - 1, +m[3], +m[4], +m[5], +m[6]))), allDay: false };
  return { day: `${m[1]}-${m[2]}-${m[3]}`, allDay: false };
}

function addDays(s, n) {
  const d = new Date(s + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function busyDays(ics, fromDay) {
  const lines = String(ics).replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '').split(/\r?\n/);
  const out = new Set();
  let ev = null;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') ev = {};
    else if (line === 'END:VEVENT') {
      if (ev && ev.start && !ev.cancelled && !ev.free) {
        // događaj sa satnicom (npr. 17:00 do 03:00) zauzme samo dan početka;
        // cjelodnevni zauzme sve dane, a njegov DTEND je "isključiv" (sljedeći dan)
        let end = ev.start.day;
        if (ev.start.allDay && ev.end && ev.end.day > ev.start.day) end = addDays(ev.end.day, -1);
        for (let d = ev.start.day, i = 0; d <= end && i < 31; d = addDays(d, 1), i++) {
          if (!fromDay || d >= fromDay) out.add(d);
        }
      }
      ev = null;
    } else if (ev) {
      if (line.startsWith('DTSTART')) ev.start = readDate(line);
      else if (line.startsWith('DTEND')) ev.end = readDate(line);
      else if (line === 'STATUS:CANCELLED') ev.cancelled = true;
      else if (line === 'TRANSP:TRANSPARENT') ev.free = true; // događaj označen kao "slobodan"
    }
  }
  return [...out].sort();
}
