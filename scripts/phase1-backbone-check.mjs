import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const exists = relative => fs.existsSync(path.join(root, relative));
let checks = 0;
const check = (condition, message) => {
  checks += 1;
  assert.ok(condition, message);
};

const required = [
  'engine/guide-map-v2.js',
  'engine/guide-map.css',
  'engine/trip-tools.js',
  'engine/template-shell.js',
  'engine/template-shell.css',
  'engine/leaflet/leaflet.js',
  'engine/leaflet/leaflet.css',
  'trips/index.html',
  'trips/london-paris-2026/index.html',
  'trips/london-paris-2026/maria.html',
  'trips/london-paris-2026/map-places-index.json',
  'trips/london-paris-2026/map-places-maria.json',
  'trips/london-paris-2026/manifest.json',
  'trips/london-paris-2026/manifest-maria.json',
  'trips/london-paris-2026/service-worker.js',
  'templates/blank-trip/index.html',
  'templates/blank-trip/trip-config.js',
  'templates/blank-trip/map-places.json',
  'templates/blank-trip/manifest.json',
  'templates/blank-trip/service-worker.js',
  'questionnaire/questionnaire-handoff.example.json'
];
required.forEach(file => check(exists(file), `Missing Phase 1 file: ${file}`));

const rootIndex = read('index.html');
const rootMaria = read('maria.html');
const tripIndex = read('trips/london-paris-2026/index.html');
const tripMaria = read('trips/london-paris-2026/maria.html');

check(!rootIndex.includes('../../engine/'), 'Production index.html was rewired during safe transition');
check(!rootMaria.includes('../../engine/'), 'Production maria.html was rewired during safe transition');
check(tripIndex.includes('../../engine/guide-map-v2.js?v=20260810-2'), 'Parallel Jack guide does not use shared engine');
check(tripMaria.includes('../../engine/guide-map-v2.js?v=20260810-2'), 'Parallel Maria guide does not use shared engine');
check(tripIndex.includes('data-map-data="map-places-index.json?v=20260731-bourdain"'), 'Parallel Jack map data is not trip-local');
check(tripMaria.includes('data-map-data="map-places-maria.json?v=20260731-bourdain"'), 'Parallel Maria map data is not trip-local');
check(tripIndex.includes("navigator.serviceWorker.register('./service-worker.js')"), 'Parallel Jack service worker is not trip-scoped');
check(tripMaria.includes("navigator.serviceWorker.register('./service-worker.js')"), 'Parallel Maria service worker is not trip-scoped');

const enginePairs = [
  'daily-transit.js', 'daily-transit.css', 'guide-map-v2.js', 'guide-map.css',
  'trip-tools.js', 'trip-tools.css', 'home-intelligence.js', 'home-intelligence.css',
  'today-glance.js', 'today-glance.css', 'quick-actions.js', 'packing-checklist.js',
  'packing-checklist.css', 'floating-shortcuts.js', 'floating-shortcuts.css',
  'final-polish.js', 'final-polish.css', 'french-audio-v2.js', 'private-vault.js',
  'private-vault.css', 'claim-organizer.js', 'claim-organizer.css',
  'travel-readiness.css', 'nav-upgrade.css'
];
enginePairs.forEach(file => check(read(file) === read(`engine/${file}`), `Engine copy differs from production baseline: ${file}`));

const handoff = JSON.parse(read('questionnaire/questionnaire-handoff.example.json'));
['trip', 'travelers', 'budget', 'style', 'interests', 'food', 'priorities', 'planning', 'privacy'].forEach(key => {
  check(Object.hasOwn(handoff, key), `Questionnaire handoff missing ${key}`);
});
check(handoff.schemaVersion === 1, 'Questionnaire handoff schema version is not 1');

const blankPlaces = JSON.parse(read('templates/blank-trip/map-places.json'));
check(Array.isArray(blankPlaces) && blankPlaces.length === 0, 'Blank trip map must start as an empty array');

const worker = read('trips/london-paris-2026/service-worker.js');
check(worker.includes("const CACHE_NAME='trip-companion-london-paris-2026-phase1-1'"), 'Parallel worker cache is not trip-specific');
check(worker.includes("key.indexOf('trip-companion-london-paris-2026-')===0"), 'Parallel worker could delete another trip cache');
check(!worker.includes("keys.filter(key=>key!==CACHE_NAME)"), 'Parallel worker still deletes unrelated caches');

const localAssetPattern = /(?:src|href)="([^"#]+)"/g;
for (const htmlPath of ['trips/london-paris-2026/index.html', 'trips/london-paris-2026/maria.html', 'templates/blank-trip/index.html', 'trips/index.html']) {
  const html = read(htmlPath);
  const directory = path.dirname(path.join(root, htmlPath));
  for (const match of html.matchAll(localAssetPattern)) {
    const reference = match[1].split('?')[0];
    if (/^(?:https?:|tel:|mailto:|data:)/.test(reference)) continue;
    check(fs.existsSync(path.resolve(directory, reference)), `${htmlPath} references missing asset ${reference}`);
  }
}

console.log(`Phase 1 backbone QA passed: ${checks} checks.`);
console.log('Verified safe-transition isolation, shared engine wiring, trip scope, and questionnaire-ready template.');
