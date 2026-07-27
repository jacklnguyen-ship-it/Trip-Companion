import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const fixtureFiles = [
  "index.html",
  "maria.html",
  "guide-map.css",
  "guide-map.js",
  "home-intelligence.css",
  "home-intelligence.js",
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
    expected: "is missing Batch 1 home element #home-next-up",
    mutate(dir) {
      const file = path.join(dir, "maria.html");
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace('id="home-next-up"', 'id="removed-next-up"'));
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
