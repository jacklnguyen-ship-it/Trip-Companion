# Phase 0 — Safety Checklist

## Completed locally

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

## Still requires explicit publishing approval

- [ ] Review the Phase 0 repository changes.
- [ ] Commit and push the Phase 0 baseline to `main`.
- [ ] Confirm GitHub Actions passes on the pushed commit.
- [ ] Verify both live GitHub Pages entry points after deployment.
- [ ] Mark the pushed Phase 0 commit as the preferred restoration point.

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
