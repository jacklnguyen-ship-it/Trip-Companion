import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const fixtureFiles = [
  "index.html",
  "maria.html",
  "guide-map.css",
  "leaflet/leaflet.css",
  "leaflet/leaflet.js",
  "leaflet/images/layers-2x.png",
  "leaflet/images/layers.png",
  "leaflet/images/marker-icon-2x.png",
  "leaflet/images/marker-icon.png",
  "leaflet/images/marker-shadow.png",
  "guide-map-v2.js",
  "home-intelligence.css",
  "home-intelligence.js",
  "travel-readiness.css",
  "trip-tools.css",
  "trip-tools.js",
  "claim-organizer.css",
  "claim-organizer.js",
  "floating-shortcuts.css",
  "floating-shortcuts.js",
  "private-vault.css",
  "private-vault.js",
  "final-polish.css",
  "final-polish.js",
  "french-audio-v2.js",
  "picnic-companion.css",
  "picnic-companion.js",
  "versailles-expanded-audio.css",
  "versailles-expanded-audio.js",
  "daily-transit.css",
  "daily-transit.js",
  "packing-checklist.css",
  "packing-checklist.js",
  "today-glance.css",
  "today-glance.js",
  "quick-actions.js",
  "nav-upgrade.css",
  "service-worker.js",
  "map-places-index.json",
  "map-places-maria.json",
  "manifest.json",
  "manifest-maria.json",
  "apple-touch-icon.png",
  "favicon-32.png",
  "icon-192.png",
  "icon-512.png",
  "scripts/prepublish-check.mjs",
];

const scenarios = [
  {
    name: "missing asset",
    expected: "references missing local asset",
    mutate(dir) {
      const file = path.join(dir, "index.html");
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("favicon-32.png", "missing-icon.png"));
    },
  },
  {
    name: "malformed map data",
    expected: "is not valid JSON",
    mutate(dir) {
      fs.writeFileSync(path.join(dir, "map-places-index.json"), "{not valid json");
    },
  },
  {
    name: "Maria surprise leak",
    expected: "exposes surprise item",
    mutate(dir) {
      fs.appendFileSync(path.join(dir, "maria.html"), "\n<!-- Witness for the Prosecution -->\n");
    },
  },
  {
    name: "Maria County Hall leak",
    expected: "exposes surprise item",
    mutate(dir) {
      fs.appendFileSync(path.join(dir, "maria.html"), "\n<!-- County Hall -->\n");
    },
  },
  {
    name: "Maria surprise leak in shared runtime",
    expected: "exposes Maria surprise item",
    mutate(dir) {
      fs.appendFileSync(path.join(dir, "packing-checklist.js"), "\n// Sainte-Chapelle concert\n");
    },
  },
  {
    name: "Maria indirect packing clue",
    expected: "indirectly exposes Maria surprise plans",
    mutate(dir) {
      fs.appendFileSync(path.join(dir, "packing-checklist.js"), "\n// evening shows\n");
    },
  },
  {
    name: "unsupported map category",
    expected: "has unsupported category",
    mutate(dir) {
      const file = path.join(dir, "map-places-index.json");
      const places = JSON.parse(fs.readFileSync(file, "utf8"));
      places[0].category = "unknown-category";
      fs.writeFileSync(file, JSON.stringify(places));
    },
  },
  {
    name: "incorrect itinerary date",
    expected: "is missing or has changed the date label",
    mutate(dir) {
      const file = path.join(dir, "index.html");
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("Mon · Sept 7", "Tue · Sept 7"));
    },
  },
  {
    name: "duplicate map place",
    expected: "contains duplicate title",
    mutate(dir) {
      const file = path.join(dir, "map-places-maria.json");
      const places = JSON.parse(fs.readFileSync(file, "utf8"));
      places.push({ ...places[0] });
      fs.writeFileSync(file, JSON.stringify(places));
    },
  },
  {
    name: "malformed home event schedule",
    expected: "contains malformed #home-events JSON",
    mutate(dir) {
      const file = path.join(dir, "index.html");
      const html = fs.readFileSync(file, "utf8");
      fs.writeFileSync(
        file,
        html.replace(
          /(<script type="application\/json" id="home-events">)[\s\S]*?(<\/script>)/,
          "$1{not valid json$2",
        ),
      );
    },
  },
  {
    name: "missing Next Up component",
    expected: "is missing interactive guide element #home-next-up",
    mutate(dir) {
      const file = path.join(dir, "maria.html");
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace('id="home-next-up"', 'id="removed-next-up"'));
    },
  },
  {
    name: "missing emergency page",
    expected: "is missing required section #page-emergency",
    mutate(dir) {
      const file = path.join(dir, "index.html");
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace('id="page-emergency"', 'id="removed-emergency"'));
    },
  },
  {
    name: "missing Paris airport fare",
    expected: "is missing Batch 2 travel-readiness content: €14",
    mutate(dir) {
      const file = path.join(dir, "maria.html");
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replaceAll("€14", "airport fare unavailable"));
    },
  },
  {
    name: "missing Chase claim portal",
    expected: "is missing Batch 2 travel-readiness content: https://www.chasecardbenefits.com",
    mutate(dir) {
      const file = path.join(dir, "index.html");
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replaceAll("https://www.chasecardbenefits.com", "removed-claim-portal"));
    },
  },
  {
    name: "missing private claim organizer",
    expected: "is missing Batch 2 travel-readiness content: Receipt &amp; expense organizer",
    mutate(dir) {
      const file = path.join(dir, "maria.html");
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("Receipt &amp; expense organizer", "Removed organizer"));
    },
  },
  {
    name: "missing floating shortcuts",
    expected: "is missing Batch 2 travel-readiness content: Quick shortcuts",
    mutate(dir) {
      const file = path.join(dir, "index.html");
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace('aria-label="Quick shortcuts"', 'aria-label="Removed shortcuts"'));
    },
  },
  {
    name: "unsafe floating guide names",
    expected: "renders guide names as unsafe HTML",
    mutate(dir) {
      fs.appendFileSync(path.join(dir, "floating-shortcuts.js"), "\ndocument.body.innerHTML='unsafe';\n");
    },
  },
  {
    name: "missing named Chatsworth audio shortcut",
    expected: "is missing the explicit guide name: Chatsworth House",
    mutate(dir) {
      const file = path.join(dir, "floating-shortcuts.js");
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("'Chatsworth House'", "'Audio guide 3'"));
    },
  },
  {
    name: "missing named Versailles audio shortcut",
    expected: "is missing the explicit guide name: Palace of Versailles",
    mutate(dir) {
      const file = path.join(dir, "floating-shortcuts.js");
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("'Palace of Versailles'", "'Audio guide 8'"));
    },
  },
  {
    name: "missing private vault page",
    expected: "is missing required section #page-vault",
    mutate(dir) {
      const file = path.join(dir, "index.html");
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace('id="page-vault"', 'id="removed-page-vault"'));
    },
  },
  {
    name: "missing first-device vault import",
    expected: "is missing Batch 2 travel-readiness content: Import existing encrypted vault",
    mutate(dir) {
      const file = path.join(dir, "maria.html");
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("Import existing encrypted vault", "Removed first-device import"));
    },
  },
  {
    name: "vault network transmission",
    expected: "unexpectedly transmits private vault data",
    mutate(dir) {
      fs.appendFileSync(path.join(dir, "private-vault.js"), "\nfetch('/upload-vault');\n");
    },
  },
  {
    name: "unsafe vault record rendering",
    expected: "renders private records as unsafe HTML",
    mutate(dir) {
      fs.appendFileSync(path.join(dir, "private-vault.js"), "\ndocument.body.innerHTML='unsafe';\n");
    },
  },
  {
    name: "weak vault key derivation",
    expected: "is missing required encrypted-vault behavior: 600000",
    mutate(dir) {
      const file = path.join(dir, "private-vault.js");
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("600000", "1000"));
    },
  },
  {
    name: "surprise leak in vault starter data",
    expected: "exposes a surprise venue in public starter data",
    mutate(dir) {
      fs.appendFileSync(path.join(dir, "private-vault.js"), "\n// Witness for the Prosecution\n");
    },
  },
  {
    name: "missing Carette written guide",
    expected: "is missing Carette’s official Place des Vosges guide entry",
    mutate(dir) {
      const file = path.join(dir, "maria.html");
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replaceAll("https://paris-carette.fr/nos-magasins/place-des-vosges", "removed-carette-official"));
    },
  },
  {
    name: "claim organizer network transmission",
    expected: "unexpectedly transmits private claim data",
    mutate(dir) {
      fs.appendFileSync(path.join(dir, "claim-organizer.js"), "\nfetch('/upload-claim');\n");
    },
  },
  {
    name: "unsafe claim record rendering",
    expected: "renders saved claim data as unsafe HTML",
    mutate(dir) {
      fs.appendFileSync(path.join(dir, "claim-organizer.js"), "\ndocument.body.innerHTML='unsafe';\n");
    },
  },
  {
    name: "missing evacuation preauthorization warning",
    expected: "is missing Batch 2 travel-readiness content: authorized and arranged in advance",
    mutate(dir) {
      const file = path.join(dir, "maria.html");
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replaceAll("authorized and arranged in advance", "arrangement details unavailable"));
    },
  },
  {
    name: "missing currency widget",
    expected: "is missing interactive guide element #currency-tool",
    mutate(dir) {
      const file = path.join(dir, "index.html");
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace('id="currency-tool"', 'id="removed-currency-tool"'));
    },
  },
  {
    name: "unsafe custom task rendering",
    expected: "renders custom task text as unsafe HTML",
    mutate(dir) {
      const file = path.join(dir, "trip-tools.js");
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("text.textContent=task.text", "text.innerHTML=task.text"));
    },
  },
  {
    name: "incomplete offline cache",
    expected: "does not cache ./maria.html",
    mutate(dir) {
      const file = path.join(dir, "service-worker.js");
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("'./maria.html',", "").replace("?'./maria.html':", "?'./missing-maria.html':"));
    },
  },
  {
    name: "missing offline map fallback",
    expected: "has no offline fallback when Leaflet is unavailable",
    mutate(dir) {
      const file = path.join(dir, "guide-map-v2.js");
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("typeof L==='undefined'", "false"));
    },
  },
  {
    name: "missing map clear control",
    expected: "is missing the map search clear control",
    mutate(dir) {
      const file = path.join(dir, "maria.html");
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace('id="map-search-clear"', 'id="removed-map-search-clear"'));
    },
  },
  {
    name: "missing specialty tags",
    expected: "needs at least one searchable specialty tag",
    mutate(dir) {
      const file = path.join(dir, "map-places-index.json");
      const places = JSON.parse(fs.readFileSync(file, "utf8"));
      places[0].tags = [];
      fs.writeFileSync(file, JSON.stringify(places));
    },
  },
  {
    name: "missing curated Paris market",
    expected: "is missing Marché des Enfants Rouges",
    mutate(dir) {
      const file = path.join(dir, "map-places-maria.json");
      const places = JSON.parse(fs.readFileSync(file, "utf8")).filter((place) => place.title !== "Marché des Enfants Rouges");
      fs.writeFileSync(file, JSON.stringify(places));
    },
  },
  {
    name: "unsafe map search rendering",
    expected: "inserts an unescaped search query into HTML",
    mutate(dir) {
      const file = path.join(dir, "guide-map-v2.js");
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("escapeHtml(query)", "query"));
    },
  },
  {
    name: "stale floating shortcuts offline cache",
    expected: "has not advanced to the cross-device vault cache version",
    mutate(dir) {
      const file = path.join(dir, "service-worker.js");
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace(/trip-companion-\d{8}-\d+/, "trip-companion-20260729-4"));
    },
  },
  {
    name: "missing specialty relevance ranking",
    expected: "guide-map-v2.js is missing negative-state handling: function searchScore",
    mutate(dir) {
      const file = path.join(dir, "guide-map-v2.js");
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("function searchScore", "function removedSearchScore"));
    },
  },
  {
    name: "stale-first asset strategy",
    expected: "still serves stale assets before checking the network",
    mutate(dir) {
      const file = path.join(dir, "service-worker.js");
      fs.appendFileSync(file, "\n// return cached||network\n");
    },
  },
  {
    name: "home search missing map data",
    expected: "home search does not load the curated map dataset",
    mutate(dir) {
      const file = path.join(dir, "index.html");
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replaceAll("document.body.dataset.mapData", "'removed-map-data'"));
    },
  },
  {
    name: "home search missing map handoff",
    expected: "home search cannot hand a selected location to the map",
    mutate(dir) {
      const file = path.join(dir, "maria.html");
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replaceAll("trip-map-pending-search", "removed-map-handoff"));
    },
  },
  {
    name: "premature map handoff clearing",
    expected: "clears the Home search handoff before its map place is available",
    mutate(dir) {
      const file = path.join(dir, "guide-map-v2.js");
      const script = fs.readFileSync(file, "utf8");
      fs.writeFileSync(file, script.replace("if(match){\n      try{sessionStorage.removeItem('trip-map-pending-search');}catch(error){}", "try{sessionStorage.removeItem('trip-map-pending-search');}catch(error){}\n    if(match){"));
    },
  },
  {
    name: "missing keyboard skip link",
    expected: "is missing its keyboard skip link",
    mutate(dir) {
      const file = path.join(dir, "index.html");
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace('class="skip-link"', 'class="removed-skip-link"'));
    },
  },
  {
    name: "missing Maria Austen personality",
    expected: "needs four Austen quotation touches",
    mutate(dir) {
      const file = path.join(dir, "maria.html");
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace('class="austen-quote"', 'class="removed-austen-quote"'));
    },
  },
  {
    name: "missing reduced motion support",
    expected: "is missing accessibility behavior: prefers-reduced-motion",
    mutate(dir) {
      const file = path.join(dir, "final-polish.css");
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("prefers-reduced-motion", "removed-reduced-motion"));
    },
  },
  {
    name: "disruptive French audio alert",
    expected: "uses a disruptive browser alert",
    mutate(dir) {
      fs.appendFileSync(path.join(dir, "french-audio-v2.js"), "\nalert('audio error');\n");
    },
  },
  {
    name: "missing Camden Market map pin",
    expected: "is missing Camden Market",
    mutate(dir) {
      const file = path.join(dir, "map-places-maria.json");
      const places = JSON.parse(fs.readFileSync(file, "utf8")).filter((place) => place.title !== "Camden Market");
      fs.writeFileSync(file, JSON.stringify(places));
    },
  },
];

let failed = false;
for (const scenario of scenarios) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "trip-companion-negative-"));
  for (const file of fixtureFiles) {
    const target = path.join(dir, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(root, file), target);
  }

  scenario.mutate(dir);
  const result = spawnSync(process.execPath, ["scripts/prepublish-check.mjs"], {
    cwd: dir,
    encoding: "utf8",
  });
  const output = `${result.stdout}\n${result.stderr}`;
  const detected = result.status !== 0 && output.includes(scenario.expected);
  if (!detected) {
    failed = true;
    console.error(`Negative self-test failed: ${scenario.name}`);
  } else {
    console.log(`Detected as expected: ${scenario.name}`);
  }
  fs.rmSync(dir, { recursive: true, force: true });
}

if (failed) process.exit(1);
console.log(`Negative self-tests passed: ${scenarios.length} intentional failures detected.`);
