# Phase 0 — Production Baseline

Baseline recorded: 2026-08-11

Repository: `jacklnguyen-ship-it/Trip-Companion`

Branch: `main`

Verified production commit before Phase 0 work: `83e435d719b28ee526612f6759906e2f5011aa5a`

## Production entry points

- Jack: `index.html`
- Maria: `maria.html`
- GitHub Pages base: `https://jacklnguyen-ship-it.github.io/Trip-Companion/`
- Install manifests: `manifest.json` and `manifest-maria.json`
- Offline worker: `service-worker.js`

The root files remain the live production site during Phase 0. No multi-trip restructuring is included in this baseline.

## Runtime dependency inventory

### Shared presentation and interaction

- `final-polish.css` / `final-polish.js` — accessibility and final UI behavior
- `nav-upgrade.css` — navigation refinements
- `home-intelligence.css` / `home-intelligence.js` — current day and next-event logic
- `today-glance.css` / `today-glance.js` — compact itinerary views
- `quick-actions.js` — context shortcuts
- `floating-shortcuts.css` / `floating-shortcuts.js` — persistent navigation, audio, and currency tools
- `travel-readiness.css` — readiness and emergency presentation
- `daily-transit.css` / `daily-transit.js` — first-stop transit cards
- `packing-checklist.css` / `packing-checklist.js` — locally saved packing state
- `trip-tools.css` / `trip-tools.js` — currency, tasks, and offline registration
- `claim-organizer.css` / `claim-organizer.js` — locally stored receipts and claims
- `private-vault.css` / `private-vault.js` — encrypted, device-local private records
- `french-audio-v2.js` — French phrase speech controls

### Maps

- `guide-map.css`
- `guide-map-v2.js`
- `map-places-index.json`
- `map-places-maria.json`
- `leaflet/` — vendored Leaflet runtime, CSS, and marker images

`guide-map.js` remains in the repository but is not referenced by the current production HTML files. Preserve it until the future engine restructure confirms it is obsolete.

### Install and offline assets

- `service-worker.js`
- `manifest.json`
- `manifest-maria.json`
- `apple-touch-icon.png`
- `favicon-32.png`
- `icon-192.png`
- `icon-512.png`
- `.nojekyll`

### Quality assurance

- `package.json`
- `scripts/prepublish-check.mjs`
- `scripts/negative-self-test.mjs`
- `.github/workflows/prepublish-qa.yml`

The GitHub workflow runs the full pre-publish test suite on pushes to `main` and on pull requests.

## Maria surprise and privacy boundary

Maria's public guide and every runtime file it loads must not reveal:

- Witness for the Prosecution
- County Hall
- Sainte-Chapelle concert
- Palais Garnier
- Perle Noire

Generic phrases such as “evening plans,” “special last night out,” and “dress nicely” are approved when they do not identify a surprise venue or performance.

The following are intentionally present only in Jack's map dataset:

- `County Hall — Witness for the Prosecution`
- `Sainte-Chapelle — Evening Concert`
- `Palais Garnier — Perle Noire`

Public files must not contain real confirmation numbers, payment-card numbers, ticket barcodes, passport details, or receipt images. Sensitive records belong only in the encrypted device-local vault or another approved private system.

## Data ownership and local-only storage

- Packing checklist state: browser local storage
- Outstanding task state: browser local storage
- Currency cache: browser local storage
- Claims and receipt files: browser IndexedDB
- Private vault: encrypted browser IndexedDB

These records are not stored in GitHub and do not automatically synchronize between devices. Clearing website data can remove them unless an encrypted backup has been downloaded.

## Restoration procedure

The authoritative source is Git history plus two local backup artifacts stored outside the live repository in the project `backups/` folder.

- `Trip-Companion-production-83e435d.tar.gz` — exact archive of the pre-Phase-0 production commit. SHA-256: `12fd004e6e3b142e851ed9fb7334be436eae24841d9adde8ed49f6000cae4bcb`. This preserves the site exactly as it existed, including the issues found by the newer Phase 0 checks.
- `Trip-Companion-phase0-candidate-20260811.tar.gz` — exact archive of the tracked Phase 0 candidate files. SHA-256: `3dc30c2aa72ec046cb4eba0b54ae1cf5660296e719c64013afba309d51481340`. It was extracted into a fresh temporary directory and passed the complete test suite there.

1. Identify the desired known-good commit.
2. Create a recovery branch from that commit; do not overwrite `main` immediately.
3. Run `npm test` on the recovery branch.
4. Preview both HTML guides at desktop and mobile widths.
5. Verify map loading and the offline service-worker cache.
6. Merge or deploy the recovery branch only after verification.

The preferred Phase 0 functional restoration point is commit `71a161c904cff852664b6ddd23816f2244008e21`. The earlier commit `83e435d719b28ee526612f6759906e2f5011aa5a` remains the exact pre-Phase-0 reference.

## Required pre-publish checks

Run:

```sh
npm test
```

The suite verifies:

- Both guide entry points and required pages
- Local CSS, JavaScript, JSON, manifest, icon, and Leaflet dependencies
- Service-worker coverage of HTML dependencies
- Date and weekday labels
- Map data structure, coordinates, categories, tags, and approved Jack-only pins
- Maria surprise boundaries across her HTML and loaded runtime assets
- Common privacy leaks and unsafe rendering patterns
- Vault and claim organizer local-only behavior
- Manifest and icon validity
- Accessibility essentials and negative states
- Forty-seven intentional failure scenarios

## Scope note

The tracked `maria-2.0/` experiment is outside the current live production entry points. Preserve it during Phase 0, but do not use it as the source for production or the planned multi-trip restructure.
