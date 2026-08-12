# Phase 1 — Safe-transition backbone

## Purpose

Prepare Trip Companion to support additional travelers and trips without changing the existing production URLs.

The root `index.html` and `maria.html` remain the live London–Paris guides. No redirects are included in this phase.

## Parallel structure

```text
Trip-Companion/
├── engine/                         shared runtime copies
├── trips/
│   ├── index.html                  private preview library
│   └── london-paris-2026/          parallel production copy
├── questionnaire/                  reviewed handoff contract
├── templates/
│   └── blank-trip/                 new-trip starting point
├── index.html                      unchanged production Jack guide
└── maria.html                      unchanged production Maria guide
```

## Safe-transition rules

1. Do not redirect or remove the current root guides before the September 2026 trip.
2. Do not move the root runtime files during the parallel validation period.
3. Treat root production as the restoration source and the trip folder as the Phase 1 preview.
4. Update shared engine files only with a matching production change or an intentional, tested engine change.
5. Keep each trip's manifest, service worker, maps, icons, configuration, and traveler-specific content inside its trip folder.
6. A trip service worker may delete only caches bearing that trip's cache prefix.
7. A completed questionnaire becomes a reviewed handoff file; raw sensitive documents do not belong in it.
8. Publishing the backbone does not make a client trip public automatically.

## New-trip workflow

1. Collect and review questionnaire answers.
2. Copy `templates/blank-trip/` to `trips/<trip-id>/`.
3. Save a privacy-reviewed questionnaire handoff in the new trip folder.
4. Fill `trip-config.js` and begin destination research.
5. Add sourced places and draft a realistic itinerary.
6. Create traveler visibility profiles when content differs between travelers.
7. Add a trip-local manifest and service worker.
8. Run the full repository test suite.
9. Preview privately and obtain traveler approval before publishing.

## Current limitations

- The London–Paris HTML is still monolithic; Phase 2 will separate content from presentation.
- The blank template proves the handoff and folder contract but does not yet render a full itinerary.
- The `trips/` library is a preview surface, not a customer account system.
- Questionnaire answers still require human review and travel research.

## Completion gate

Phase 1 is complete only when:

- Existing root URLs remain functional and unchanged.
- Both parallel London–Paris traveler guides work online and offline.
- Maps, audio, tools, itinerary dialogs, and Maria's privacy boundary pass testing.
- A blank trip can be initialized from the questionnaire handoff without using another trip as source material.
- No Phase 1 files are published until Jack reviews the preview and explicitly approves it.
