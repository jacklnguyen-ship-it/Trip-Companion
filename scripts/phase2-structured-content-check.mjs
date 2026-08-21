import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const json = relative => JSON.parse(read(relative));
const exists = relative => fs.existsSync(path.join(root, relative));
let checks = 0;
const check = (condition, message) => {
  checks += 1;
  assert.ok(condition, message);
};

const required = [
  'engine/structured-trip.css',
  'engine/structured-trip.js',
  'engine/trip-data.schema.json',
  'trips/london-paris-2026/structured-preview.html',
  'trips/london-paris-2026/structured-preview-maria.html',
  'trips/london-paris-2026/trip-data-index.json',
  'trips/london-paris-2026/trip-data-maria.json',
  'templates/blank-trip/trip-data.json',
  'PHASE-2-STRUCTURED-CONTENT.md'
];
required.forEach(file => check(exists(file), `Missing Phase 2 file: ${file}`));

const schema = json('engine/trip-data.schema.json');
check(schema.properties.schemaVersion.const === 2, 'Trip schema is not version 2');
for (const field of ['id', 'title', 'dateLabel', 'travelerLabel', 'summary']) {
  check(schema.properties.trip.required.includes(field), `Trip schema does not require ${field}`);
}
for (const field of ['id', 'date', 'title', 'activities']) {
  check(schema.properties.days.items.required.includes(field), `Day schema does not require ${field}`);
}

const allowedStatuses = new Set(['considering', 'recommended', 'approved', 'reservation-needed', 'booked', 'rejected', 'backup']);
const idPattern = /^[a-z0-9-]+$/;
function validateData(relative, expectedAudience) {
  const data = json(relative);
  check(data.schemaVersion === 2, `${relative} has the wrong schema version`);
  check(idPattern.test(data.trip.id), `${relative} has an invalid trip id`);
  for (const field of ['title', 'dateLabel', 'travelerLabel', 'summary']) {
    check(typeof data.trip[field] === 'string' && data.trip[field].trim(), `${relative} is missing trip.${field}`);
  }
  check(Array.isArray(data.days), `${relative} days is not an array`);
  const ids = new Set();
  data.days.forEach(day => {
    check(idPattern.test(day.id), `${relative} has an invalid day id`);
    check(!ids.has(day.id), `${relative} has duplicate id ${day.id}`);
    ids.add(day.id);
    check(/^\d{4}-\d{2}-\d{2}$/.test(day.date), `${relative} has an invalid date`);
    check(typeof day.title === 'string' && day.title.trim(), `${relative} has an untitled day`);
    check(Array.isArray(day.activities), `${relative} day activities is not an array`);
    for (const group of ['activities', 'reservations', 'notes']) {
      for (const item of day[group] || []) {
        check(idPattern.test(item.id), `${relative} has invalid ${group} id`);
        check(!ids.has(item.id), `${relative} has duplicate id ${item.id}`);
        ids.add(item.id);
        check(!item.audiences || item.audiences.includes('all') || item.audiences.includes(expectedAudience), `${relative} contains an unreachable audience item`);
        for (const link of item.links || []) check(/^https:\/\//.test(link.url), `${relative} contains a non-HTTPS link`);
        if (group === 'reservations') check(allowedStatuses.has(item.status), `${relative} has invalid reservation status`);
      }
    }
  });
  return data;
}

const jack = validateData('trips/london-paris-2026/trip-data-index.json', 'jack');
const maria = validateData('trips/london-paris-2026/trip-data-maria.json', 'maria');
const blank = validateData('templates/blank-trip/trip-data.json', 'primary');
check(jack.days.length === 1, 'Representative Jack data must contain exactly one proof-of-concept day');
check(maria.days.length === 1, 'Representative Maria data must contain exactly one proof-of-concept day');
check(blank.days.length === 0, 'Blank template must begin without itinerary days');
check(jack.days[0].date === '2026-09-08', 'Representative day is not September 8, 2026');
check(new Date(`${jack.days[0].date}T00:00:00Z`).getUTCDay() === 2, 'September 8, 2026 is not validated as Tuesday');

const surpriseTerms = ['witness for the prosecution', 'county hall', 'sainte-chapelle', 'palais garnier', 'perle noire'];
const mariaText = read('trips/london-paris-2026/trip-data-maria.json').toLowerCase();
surpriseTerms.forEach(term => check(!mariaText.includes(term), `Maria structured data leaks surprise term: ${term}`));
check(!/\b(?:confirmation|booking|order|reference)\s*(?:number|no\.?|#|:)\s*[a-z0-9-]{6,}\b/i.test(mariaText), 'Maria structured data contains a public booking identifier');

const renderer = read('engine/structured-trip.js');
check(renderer.includes("data-structured-trip"), 'Renderer is not scoped to the structured trip root');
check(renderer.includes("fetch(source"), 'Renderer does not load external structured data');
check(renderer.includes("textContent = value"), 'Renderer does not use safe text rendering');
check(!renderer.includes('.innerHTML'), 'Renderer uses unsafe innerHTML');
check(renderer.includes("status.dataset.state = 'error'"), 'Renderer has no readable malformed-data fallback');
check(renderer.includes("data.days.every"), 'Renderer does not reject malformed day records');
check(renderer.includes("/^https:\\/\\//"), 'Renderer does not restrict rendered links to HTTPS');

const jackPreview = read('trips/london-paris-2026/structured-preview.html');
const mariaPreview = read('trips/london-paris-2026/structured-preview-maria.html');
check(jackPreview.includes('data-trip-data="trip-data-index.json?v=20260812-1"'), 'Jack preview is not data-driven');
check(mariaPreview.includes('data-trip-data="trip-data-maria.json?v=20260812-1"'), 'Maria preview is not independently data-driven');
check(jackPreview.includes('data-audience="jack"'), 'Jack preview lacks its audience profile');
check(mariaPreview.includes('data-audience="maria"'), 'Maria preview lacks its audience profile');

const blankHtml = read('templates/blank-trip/index.html');
check(blankHtml.includes('data-trip-data="trip-data.json"'), 'Blank template is not connected to structured data');
check(blankHtml.includes('../../engine/structured-trip.js?v=20260812-1'), 'Blank template does not use the shared renderer');

const worker = read('trips/london-paris-2026/service-worker.js');
for (const asset of ['structured-preview.html', 'structured-preview-maria.html', 'trip-data-index.json', 'trip-data-maria.json', '../../engine/structured-trip.js', '../../engine/structured-trip.css']) {
  check(worker.includes(asset), `Trip offline cache is missing ${asset}`);
}
const blankWorker = read('templates/blank-trip/service-worker.js');
for (const asset of ['trip-data.json', '../../engine/structured-trip.js', '../../engine/structured-trip.css']) {
  check(blankWorker.includes(asset), `Blank template offline cache is missing ${asset}`);
}

const rootIndex = read('index.html');
const rootMaria = read('maria.html');
check(!rootIndex.includes('structured-trip.js'), 'Production index.html was changed to the Phase 2 preview');
check(!rootMaria.includes('structured-trip.js'), 'Production maria.html was changed to the Phase 2 preview');

console.log(`Phase 2 structured-content QA passed: ${checks} checks.`);
console.log('Verified schema, safe rendering, traveler file separation, offline assets, blank-template wiring, and production isolation.');
