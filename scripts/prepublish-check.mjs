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
  check(html.includes('id="map-city-filter"'), `${file} is missing the map city filter`);
  check(html.includes('id="map-category-filter"'), `${file} is missing the map category filter`);
  for (const id of [
    "kickoff-alert",
    "kickoff-dismiss",
    "home-next-up",
    "home-next-countdown",
    "home-next-title",
    "home-next-time",
    "home-events",
  ]) {
    check(html.includes(`id="${id}"`), `${file} is missing Batch 1 home element #${id}`);
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

    const titleKey = place.title.trim().toLowerCase();
    const queryKey = place.query.trim().toLowerCase();
    check(!seenTitles.has(titleKey), `${file} contains duplicate title: ${place.title}`);
    check(!seenQueries.has(queryKey), `${file} contains duplicate map query: ${place.query}`);
    seenTitles.add(titleKey);
    seenQueries.add(queryKey);
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

const mapScript = read("guide-map.js");
for (const requiredBehavior of [
  "navigator.geolocation",
  "Location permission was declined",
  "The saved place map could not be loaded",
  "No curated places match",
]) {
  check(mapScript.includes(requiredBehavior), `guide-map.js is missing negative-state handling: ${requiredBehavior}`);
}
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

if (failures.length) {
  console.error(`\nPre-publish QA failed: ${failures.length} issue(s) across ${assertions} checks.\n`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Pre-publish QA passed: ${assertions} checks.`);
console.log("Validated both guides, map datasets, privacy boundaries, dates, assets, manifests, and negative states.");
