# Phase 0 — Safety Checklist

## Completed and published

- [x] Confirm the live checkout is on `main` and synchronized with `origin/main`.
- [x] Record the production commit and public entry points.
- [x] Inventory shared runtime, map, PWA, icon, and QA dependencies.
- [x] Document Maria's surprise-content boundary.
- [x] Document sensitive-data and local-storage boundaries.
- [x] Remove discovered direct surprise references from Maria's public guide.
- [x] Expand surprise checks across Maria's loaded JavaScript and JSON assets.
- [x] Recognize the curated Sunday Roast map category.
- [x] Verify the three additional Jack map pins are the approved surprises.
- [x] Verify every local HTML dependency is included in the offline cache.
- [x] Verify every cached asset exists.
- [x] Run positive pre-publish checks.
- [x] Run negative self-tests.
- [x] Document a non-destructive restoration procedure.
- [x] Create and checksum a restorable local backup.

- [x] Review the Phase 0 repository changes.
- [x] Commit and push the Phase 0 baseline to `main`.
- [x] Confirm the pre-publish GitHub Actions workflow passes on the pushed commit.
- [x] Mark commit `71a161c904cff852664b6ddd23816f2244008e21` as the preferred functional restoration point.

Live GitHub Pages verification is recorded separately after the Pages deployment completes.

## Before every future production update

- [ ] Pull the latest `main` branch.
- [ ] Confirm the working tree contains no unrelated changes.
- [ ] Run `npm test`.
- [ ] Test Jack's and Maria's versions independently.
- [ ] Verify Maria's surprise-safe wording and map data.
- [ ] Check mobile navigation, dialogs, maps, and fixed controls.
- [ ] Confirm service-worker cache coverage when assets or paths change.
- [ ] Commit a focused change with a clear message.
- [ ] Verify GitHub Pages after deployment.
