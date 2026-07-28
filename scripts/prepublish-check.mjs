import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
let assertions = 0;

function check(condition, message) {
  assertions += 1;
  if (!condition) failures.push(message);
}

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function loadJson(file) {
  try {
    return JSON.parse(read(file));
  } catch (error) {
    failures.push(`${file} is not valid JSON: ${error.message}`);
    return null;
  }
}

function stripQuery(value) {
  return value.split(/[?#]/, 1)[0];
}

function localAssetReferences(html) {
  const refs = [];
  const pattern = /\b(?:href|src)=["']([^"'<>]+)["']/gi;
  let match;
  while ((match = pattern.exec(html))) {
    const value = match[1];
    if (
      value.startsWith("#") ||
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("mailto:") ||
      value.startsWith("tel:") ||
      value.startsWith("data:")
    ) continue;
    refs.push(stripQuery(value));
  }
  return refs;
}

function applicationJson(html, id, file) {
  const pattern = new RegExp(
    `<script[^>]+id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/script>`,
    "i",
  );
  const match = html.match(pattern);
  check(Boolean(match), `${file} is missing application data #${id}`);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch (error) {
    failures.push(`${file} contains malformed #${id} JSON: ${error.message}`);
    return null;
  }
}

function pngDimensions(file) {
  const buffer = fs.readFileSync(path.join(root, file));
  check(buffer.length >= 24, `${file} is too small to be a valid PNG`);
  check(buffer.subarray(1, 4).toString() === "PNG", `${file} is not a valid PNG`);
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

const htmlFiles = ["index.html", "maria.html"];
const requiredPages = ["page-home", "page-itinerary", "page-logistics", "page-emergency", "page-food", "page-map"];
const weekdayLabels = [
  "Mon · Sept 7",
  "Tue · Sept 8",
  "Wed · Sept 9",
  "Thu · Sept 10",
  "Fri · Sept 11",
  "Sat · Sept 12",
  "Sun · Sept 13",
  "Mon · Sept 14",
  "Tue · Sept 15",
  "Wed · Sept 16",
  "Thu · Sept 17",
];

for (const file of htmlFiles) {
  const html = read(file);
  check(/<!doctype html>/i.test(html), `${file} is missing its HTML doctype`);
  check(/<meta[^>]+name=["']viewport["']/i.test(html), `${file} is missing its mobile viewport`);
  check(html.includes('href="#page-map"'), `${file} has no link to Map & Near Me`);
  check(html.includes('id="map-search-input"'), `${file} is missing map search`);
  check(html.includes('id="map-search-clear"'), `${file} is missing the map search clear control`);
  check(html.includes('id="map-city-filter"'), `${file} is missing the map city filter`);
  check(html.includes('id="map-category-filter"'), `${file} is missing the map category filter`);
  check(html.includes("document.body.dataset.mapData"), `${file} home search does not load the curated map dataset`);
  check(html.includes("trip-map-pending-search"), `${file} home search cannot hand a selected location to the map`);
  check(html.includes("escapeSearchHtml"), `${file} home search does not safely render map results`);
  for (const id of [
    "kickoff-alert",
    "kickoff-dismiss",
    "home-next-up",
    "home-next-countdown",
    "home-next-title",
    "home-next-time",
    "home-events",
    "currency-tool",
    "currency-amount",
    "currency-code",
    "currency-result",
    "currency-meta",
    "outstanding-todos",
  ]) {
    check(html.includes(`id="${id}"`), `${file} is missing interactive guide element #${id}`);
  }

  for (const page of requiredPages) {
    check(html.includes(`id="${page}"`), `${file} is missing required section #${page}`);
  }
  for (const readinessText of [
    "French cheat sheet →",
    "Emergency &amp; help →",
    "+44 20 7499 9000",
    "+33 1 43 12 22 22",
    "+1 202 501 4444",
    "Travel insurance",
    "Transit quick card · 2026 fares",
    "£8.90",
    "£44.70",
    "€2.55",
    "€2.05",
    "€14",
    "€12.30",
    "€32.40",
  ]) {
    check(html.includes(readinessText), `${file} is missing Batch 2 travel-readiness content: ${readinessText}`);
  }
  for (const label of weekdayLabels) {
    check(html.includes(label), `${file} is missing or has changed the date label “${label}”`);
  }
  for (const asset of localAssetReferences(html)) {
    check(fs.existsSync(path.join(root, asset)), `${file} references missing local asset: ${asset}`);
  }

  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]);
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  check(duplicates.length === 0, `${file} contains duplicate HTML IDs: ${duplicates.join(", ")}`);

  const homeEvents = applicationJson(html, "home-events", file);
  if (homeEvents) {
    check(Array.isArray(homeEvents) && homeEvents.length >= 11, `${file} needs timed events across all trip days`);
    let previous = 0;
    for (const [index, event] of homeEvents.entries()) {
      const timestamp = Date.parse(event.at);
      check(Number.isFinite(timestamp), `${file} home event ${index} has an invalid date`);
      check(timestamp >= Date.parse("2026-09-07T00:00:00") && timestamp < Date.parse("2026-09-18T00:00:00"), `${file} home event ${index} falls outside the trip`);
      check(timestamp >= previous, `${file} home events are not chronological`);
      check(typeof event.title === "string" && event.title.trim(), `${file} home event ${index} has no title`);
      previous = timestamp;
    }
  }
}

const maria = read("maria.html");
const mariaRestrictedTerms = [
  "Witness for the Prosecution",
  "Perle Noire",
  "Sainte-Chapelle concert",
  "Palais Garnier",
];
for (const term of mariaRestrictedTerms) {
  check(!maria.toLowerCase().includes(term.toLowerCase()), `maria.html exposes surprise item: ${term}`);
}

const privateDetailLines = maria
  .split("\n")
  .filter((line) => /(booking reference|booking ref|confirmation number|stay confirmation|pnr:|confirmation:)/i.test(line));
for (const line of privateDetailLines) {
  const containsPlaceholder = /\[stored privately\]|stored separately|stored privately/i.test(line);
  const looksLikeRealCode = /(?:booking reference|booking ref|confirmation number|stay confirmation|pnr:|confirmation:)[^<\n]{0,80}\b[A-Z0-9-]{6,}\b/i.test(
    line.replace(/<[^>]+>/g, " "),
  );
  check(!looksLikeRealCode || containsPlaceholder, "maria.html may contain a real booking or confirmation code");
}

const approvedCategories = new Set([
  "attractions",
  "food",
  "coffee",
  "drinks",
  "shopping",
  "art",
  "icecream",
  "afternoontea",
  "hotel",
]);
const mapFiles = ["map-places-index.json", "map-places-maria.json"];
const maps = mapFiles.map((file) => ({ file, data: loadJson(file) }));

for (const { file, data } of maps) {
  if (!data) continue;
  check(Array.isArray(data), `${file} must contain an array`);
  const seenTitles = new Set();
  const seenQueries = new Set();
  for (const [index, place] of data.entries()) {
    const label = `${file}[${index}]`;
    check(typeof place.title === "string" && place.title.trim(), `${label} has no title`);
    check(typeof place.query === "string" && place.query.trim(), `${label} has no map query`);
    check(approvedCategories.has(place.category), `${label} has unsupported category: ${place.category}`);
    check(Number.isFinite(place.lat) && place.lat >= -90 && place.lat <= 90, `${label} has invalid latitude`);
    check(Number.isFinite(place.lng) && place.lng >= -180 && place.lng <= 180, `${label} has invalid longitude`);
    check(typeof place.address === "string" && place.address.trim(), `${label} has no address`);
    check(Array.isArray(place.tags) && place.tags.length >= 1, `${label} needs at least one searchable specialty tag`);
    check((place.tags || []).every((tag) => typeof tag === "string" && tag.trim()), `${label} has an invalid specialty tag`);

    const titleKey = place.title.trim().toLowerCase();
    const queryKey = place.query.trim().toLowerCase();
    check(!seenTitles.has(titleKey), `${file} contains duplicate title: ${place.title}`);
    check(!seenQueries.has(queryKey), `${file} contains duplicate map query: ${place.query}`);
    seenTitles.add(titleKey);
    seenQueries.add(queryKey);
  }
  const market = data.find((place) => place.title === "Marché des Enfants Rouges");
  check(Boolean(market), `${file} is missing Marché des Enfants Rouges`);
  if (market) {
    check(market.category === "food", `${file} assigns Marché des Enfants Rouges to the wrong category`);
    check(market.tags.includes("food market"), `${file} is missing Marché des Enfants Rouges specialty tags`);
  }
  const carette = data.find((place) => place.title === "Carette");
  check(Boolean(carette), `${file} is missing Carette`);
  if (carette) {
    check(carette.category === "afternoontea", `${file} assigns Carette to the wrong category`);
    check(carette.tags.includes("hot chocolate"), `${file} is missing Carette specialty tags`);
  }
}

if (maps.every(({ data }) => Array.isArray(data))) {
  const jack = maps[0].data;
  const mariaMap = maps[1].data;
  check(jack.length === mariaMap.length, "Jack and Maria map datasets have different place counts");
  const signature = (place) => `${place.title}|${place.query}|${place.category}|${place.lat}|${place.lng}`;
  const jackSignatures = jack.map(signature).sort();
  const mariaSignatures = mariaMap.map(signature).sort();
  check(
    JSON.stringify(jackSignatures) === JSON.stringify(mariaSignatures),
    "Jack and Maria map datasets have drifted apart",
  );
}

const manifests = [
  ["manifest.json", "index.html"],
  ["manifest-maria.json", "maria.html"],
];
for (const [file, expectedStart] of manifests) {
  const manifest = loadJson(file);
  if (!manifest) continue;
  check(stripQuery(manifest.start_url || "").endsWith(expectedStart), `${file} has the wrong start_url`);
  check(manifest.display === "standalone", `${file} should use standalone display mode`);
  check(Array.isArray(manifest.icons) && manifest.icons.length >= 2, `${file} should define install icons`);
  for (const icon of manifest.icons || []) {
    check(fs.existsSync(path.join(root, stripQuery(icon.src))), `${file} references missing icon: ${icon.src}`);
  }
}

for (const [file, expected] of [
  ["favicon-32.png", 32],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
]) {
  const size = pngDimensions(file);
  check(size.width === expected && size.height === expected, `${file} should be ${expected}×${expected}`);
}

const mapScript = read("guide-map-v2.js");
try {
  new Function(mapScript);
} catch (error) {
  failures.push(`guide-map-v2.js has a syntax error: ${error.message}`);
}
check(mapScript.includes("typeof L==='undefined'"), "guide-map-v2.js has no offline fallback when Leaflet is unavailable");
for (const requiredBehavior of [
  "navigator.geolocation",
  "Location permission was declined",
  "The saved place map could not be loaded",
  "No curated places match",
  "function searchText",
  "function searchScore",
  "function searchMatches",
  "function consumePendingSearch",
  "trip-map-pending-search",
  "function escapeHtml",
  "map-search-clear",
  "p.tags||[]",
]) {
  check(mapScript.includes(requiredBehavior), `guide-map-v2.js is missing negative-state handling: ${requiredBehavior}`);
}
check(!mapScript.includes("matches “'+query+'”"), "guide-map-v2.js inserts an unescaped search query into HTML");
const mapCss = read("guide-map.css");
for (const file of htmlFiles) {
  const html = read(file);
  check(html.includes('id="menu-toggle"'), `${file} is missing the mobile-menu state control`);
  check(html.includes('id="scrim"'), `${file} is missing the mobile-menu scrim`);
}
check(
  /\.menu-toggle-checkbox:checked\s*~\s*\.shell\s+\.sidebar/.test(read("index.html")) &&
    /\.menu-toggle-checkbox:checked\s*~\s*\.shell\s+\.sidebar/.test(read("maria.html")),
  "The mobile sidebar has no verified open-state rule",
);
check(
  /\.menu-toggle-checkbox:checked\s*~\s*\.shell\s+\.scrim/.test(read("index.html")) &&
    /\.menu-toggle-checkbox:checked\s*~\s*\.shell\s+\.scrim/.test(read("maria.html")),
  "The mobile menu scrim has no verified open-state rule",
);
check(
  /#trip-map\{[^}]*position:relative[^}]*z-index:0[^}]*overflow:hidden/.test(mapCss),
  "guide-map.css is missing map containment rules",
);

const homeScript = read("home-intelligence.js");
try {
  new Function(homeScript);
} catch (error) {
  failures.push(`home-intelligence.js has a syntax error: ${error.message}`);
}
for (const behavior of [
  "__TRIP_COMPANION_TEST_NOW__",
  "testDate",
  "aria-current",
  "is-today",
  "setInterval",
  "sessionStorage",
  "Schedule unavailable",
]) {
  check(homeScript.includes(behavior), `home-intelligence.js is missing required behavior: ${behavior}`);
}
const homeCss = read("home-intelligence.css");
for (const selector of [".home-next-up", ".kickoff-alert", ".home-day.is-today", ".today-badge"]) {
  check(homeCss.includes(selector), `home-intelligence.css is missing required style: ${selector}`);
}
const readinessCss = read("travel-readiness.css");
for (const selector of [".readiness-grid", ".readiness-alert", ".transit-card", ".transit-columns"]) {
  check(readinessCss.includes(selector), `travel-readiness.css is missing required style: ${selector}`);
}
for (const scriptFile of ["trip-tools.js", "service-worker.js"]) {
  const script = read(scriptFile);
  try {
    new Function(script);
  } catch (error) {
    failures.push(`${scriptFile} has a syntax error: ${error.message}`);
  }
}
const toolsScript = read("trip-tools.js");
for (const behavior of [
  "trip-fx-rates",
  "api.frankfurter.dev",
  "localStorage",
  "trip-todos-",
  "serviceWorker.register",
  "text.textContent",
]) {
  check(toolsScript.includes(behavior), `trip-tools.js is missing required behavior: ${behavior}`);
}
check(!toolsScript.includes("text.innerHTML=task.text"), "trip-tools.js renders custom task text as unsafe HTML");
const serviceWorker = read("service-worker.js");
check(
  serviceWorker.includes("trip-companion-20260727-7"),
  "service-worker.js has not advanced to the Batch 4 cache version",
);
for (const asset of [
  "./index.html",
  "./maria.html",
  "./trip-tools.css",
  "./trip-tools.js",
  "./map-places-index.json",
  "./map-places-maria.json",
]) {
  check(serviceWorker.includes(`'${asset}'`), `service-worker.js does not cache ${asset}`);
}
for (const behavior of ["install", "activate", "fetch", "caches.match", "ignoreSearch:true"]) {
  check(serviceWorker.includes(behavior), `service-worker.js is missing offline behavior: ${behavior}`);
}
check(!serviceWorker.includes("return cached||network"), "service-worker.js still serves stale assets before checking the network");
check(
  /if\(match\)\{[\s\S]{0,140}removeItem\('trip-map-pending-search'\)/.test(mapScript),
  "guide-map-v2.js clears the Home search handoff before its map place is available",
);
const toolsCss = read("trip-tools.css");
for (const selector of [".currency-tool", ".todo-tools", ".todo-progress", ".offline-status"]) {
  check(toolsCss.includes(selector), `trip-tools.css is missing required style: ${selector}`);
}
for (const file of htmlFiles) {
  const html = read(file);
  check(html.includes("speechSynthesis"), `${file} is missing French phrase audio support`);
  check(html.includes('data-french="') || html.includes("data-french="), `${file} has no playable French phrases`);
}

if (failures.length) {
  console.error(`\nPre-publish QA failed: ${failures.length} issue(s) across ${assertions} checks.\n`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Pre-publish QA passed: ${assertions} checks.`);
console.log("Validated both guides, map datasets, privacy boundaries, dates, assets, manifests, and negative states.");
