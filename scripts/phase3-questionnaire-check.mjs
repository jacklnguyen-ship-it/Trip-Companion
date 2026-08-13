import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const exists = relative => fs.existsSync(path.join(root, relative));
let checks = 0;
const check = (condition, message) => { checks += 1; assert.ok(condition, message); };

const required = [
  'questionnaire/index.html', 'questionnaire/questionnaire.css', 'questionnaire/questionnaire.js',
  'questionnaire/manifest.json', 'questionnaire/service-worker.js', 'questionnaire/questionnaire-handoff.schema.json',
  'PHASE-3-TRAVELER-QUESTIONNAIRE.md'
];
required.forEach(file => check(exists(file), `Missing Phase 3 file: ${file}`));

const html = read('questionnaire/index.html');
const css = read('questionnaire/questionnaire.css');
const script = read('questionnaire/questionnaire.js');
const worker = read('questionnaire/service-worker.js');
const schema = JSON.parse(read('questionnaire/questionnaire-handoff.schema.json'));

const stepNames = ['trip', 'travelers', 'budget', 'style', 'interests', 'food', 'priorities', 'review'];
stepNames.forEach(step => check(html.includes(`data-step="${step}"`), `Questionnaire is missing ${step} step`));
check((html.match(/class="form-step/g) || []).length === 8, 'Questionnaire must have exactly eight steps');

const topics = [
  'destinations', 'startDate', 'endDate', 'travelerCount', 'groupType', 'accessibilityNeeds',
  'totalBudget', 'lodgingLevel', 'pace', 'structure', 'famousVsHidden', 'localVsSightseeing',
  'walkingTolerance', 'transitComfort', 'rankedInterests', 'specialInterests', 'dietaryNeeds',
  'allergies', 'mustTry', 'foodAvoid', 'mustDo', 'maybe', 'avoid', 'specialOccasions', 'dreamTripDescription'
];
topics.forEach(name => check(html.includes(`name="${name}"`), `Questionnaire is missing ${name}`));

check(html.includes('type="date" required'), 'Trip dates are not required');
check(html.includes('type="number" min="1" max="20"'), 'Traveler count is not bounded');
check(html.includes('id="traveler-comparison"'), 'Traveler comparison is missing');
check(html.includes('id="review-summary"'), 'Final review is missing');
check(html.includes('name="privacyConfirmed" required'), 'Privacy confirmation is not required');
check(html.includes('viewport-fit=cover'), 'Questionnaire lacks mobile safe-area viewport support');
check(html.includes('rel="manifest"'), 'Questionnaire is not installable');
check(html.includes("navigator.serviceWorker.register('./service-worker.js')"), 'Questionnaire does not register its service worker');

check(script.includes("localStorage.setItem(STORAGE_KEY"), 'Questionnaire does not save locally');
check(script.includes("localStorage.getItem(STORAGE_KEY"), 'Questionnaire does not resume locally');
check(script.includes("localStorage.removeItem(STORAGE_KEY"), 'Questionnaire cannot clear local data');
check(script.includes("window.addEventListener('pagehide', save)"), 'Questionnaire can lose pending answers during immediate navigation');
check(script.includes("window.addEventListener('beforeunload', save)"), 'Questionnaire can lose pending answers during immediate reload');
check(script.includes("fetch(SUBMIT_ENDPOINT"), 'Questionnaire does not submit through the configured secure endpoint');
check(script.includes("SUPABASE_PUBLISHABLE_KEY"), 'Questionnaire is missing its public submission configuration');
check(!/XMLHttpRequest|sendBeacon|WebSocket/.test(script), 'Questionnaire contains an unexpected network transmission API');
check(script.includes('passesPrivacyCheck'), 'Questionnaire cannot apply its privacy check before submission');
check(script.includes('containsSensitiveData'), 'Questionnaire does not scan submission content for sensitive data');
check(script.includes("new Blob([JSON.stringify(handoff(), null, 2)"), 'Questionnaire does not create a JSON handoff');
check(script.includes("URL.createObjectURL(blob)"), 'Questionnaire does not download locally');
check(script.includes("navigator.clipboard.writeText"), 'Questionnaire cannot copy its summary');
check(script.includes("comparison.hidden = count < 2"), 'Solo-traveler comparison is not conditional');
check(script.includes("value('startDate') > value('endDate')"), 'Questionnaire does not reject reversed dates');
check(script.includes("count < 1 || count > 20"), 'Questionnaire does not validate traveler count');
check(script.includes("containsSensitiveData"), 'Questionnaire does not scan for sensitive content');
for (const term of ['passport', 'credit\\s*card', 'confirmation\\s*', 'booking\\s*', 'ticket\\s*barcode']) {
  check(script.includes(term), `Sensitive-data check is missing ${term}`);
}
check(script.includes("if (!value('privacyConfirmed'))"), 'Download is not blocked before privacy confirmation');
check(script.includes("travelerLabel: 'Traveler 1'"), 'Export does not use generic Traveler 1 label');
check(script.includes("travelerLabel: 'Traveler 2'"), 'Export does not use generic Traveler 2 label');
for (const forbidden of ['email', 'phone', 'passportNumber', 'cardNumber', 'confirmationNumber', 'bookingNumber', 'ticketBarcode', 'privateNotes']) {
  check(!script.includes(forbidden), `Questionnaire export includes forbidden field ${forbidden}`);
}
check(!script.includes('.innerHTML'), 'Questionnaire uses unsafe innerHTML');
check(script.includes('review.replaceChildren'), 'Review is not rendered with safe DOM replacement');

check(schema.properties.schemaVersion.const === 2, 'Questionnaire handoff schema is not version 2');
for (const section of ['trip', 'travelers', 'budget', 'style', 'interests', 'food', 'priorities', 'planning', 'privacy']) {
  check(schema.required.includes(section), `Handoff schema does not require ${section}`);
}
check(schema.properties.trip.properties.destinations.minItems === 1, 'Handoff schema permits no destinations');
check(schema.properties.travelers.properties.count.minimum === 1, 'Handoff schema permits zero travelers');
check(schema.properties.travelers.properties.count.maximum === 20, 'Handoff schema does not cap traveler count');
check(schema.properties.privacy.properties.sensitiveFieldsProvided.const === false, 'Handoff schema permits sensitive fields');
check(schema.properties.travelers.properties.preferenceComparison.items.properties.travelerLabel.enum.length === 2, 'Handoff schema permits arbitrary traveler identity labels');

for (const asset of ['./index.html', './questionnaire.css', './questionnaire.js', './manifest.json', './questionnaire-handoff.schema.json']) {
  check(worker.includes(asset), `Questionnaire offline cache is missing ${asset}`);
}
check(worker.includes("key.indexOf('trip-companion-questionnaire-') === 0"), 'Questionnaire worker can delete unrelated caches');

check(css.includes('font-size:16px'), 'Mobile inputs may trigger iOS focus zoom');
check(css.includes('@media (max-width:42rem)'), 'Questionnaire lacks mobile layout');
check(!css.includes('position:sticky;bottom:'), 'Mobile questionnaire navigation can cover form fields');
check(css.includes('@media (prefers-reduced-motion:reduce)'), 'Questionnaire lacks reduced-motion support');
check(css.includes('.skip-link:focus'), 'Questionnaire skip link is not keyboard accessible');

const rootIndex = read('index.html');
const rootMaria = read('maria.html');
check(!rootIndex.includes('questionnaire/questionnaire.js'), 'Production Jack guide was wired to Phase 3 questionnaire');
check(!rootMaria.includes('questionnaire/questionnaire.js'), 'Production Maria guide was wired to Phase 3 questionnaire');

console.log(`Phase 3 questionnaire QA passed: ${checks} checks.`);
console.log('Verified coverage, safe local draft persistence, privacy-screened handoff and submission, conditional comparison, offline assets, accessibility, and production isolation.');
