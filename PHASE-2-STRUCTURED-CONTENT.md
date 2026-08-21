# Phase 2 — Structured content proof of concept

## Purpose

Prove that a Trip Companion itinerary can be edited as structured data and rendered by the shared engine instead of being manually repeated through a large HTML file.

## What this increment includes

- A versioned trip-data schema covering trip metadata, days, activities, reservations, notes, links and audience visibility.
- A shared renderer that creates mobile-friendly itinerary cards using safe DOM text rendering.
- September 8, 2026 extracted from London–Paris as the first representative structured day.
- Separate Jack and Maria data files so surprise-safe publishing is enforced at the file boundary.
- A blank `trip-data.json` connected to the new-trip template.
- Offline caching for the structured renderer, data and preview pages.

## Privacy rule

Audience labels control normal personalization, but they are not encryption. Anything that must remain a surprise or private must be omitted from the other traveler's data file entirely. Confirmation numbers, ticket barcodes, passport data and sensitive documents never belong in public structured data.

## Editing workflow

1. Review a questionnaire handoff.
2. Research current logistics and recommendations.
3. Add a day to `trip-data.json` using the standard schema.
4. Use public-safe reservation descriptions; keep sensitive details in the private vault.
5. Create a separate traveler data file if the visible content differs.
6. Run the complete test suite before preview or publication.

## Current boundary

The existing London–Paris guides remain the production experience. The structured preview intentionally contains only one representative day. A later Phase 2 increment can migrate remaining days and reference-guide data after this format is reviewed.

## Completion gate for this increment

- Editing the September 8 data changes both structured previews without editing their HTML.
- The blank template renders an empty structured itinerary without errors.
- Jack and Maria use separate source files with no surprise content in Maria's file.
- Missing or malformed data produces a readable fallback rather than a blank page.
- Production root guides remain unchanged and pass the full regression suite.
