# Blank trip template

Copy this entire folder to `trips/<trip-id>/` when beginning a new traveler guide.

1. Save the completed questionnaire handoff inside the new trip folder.
2. Fill in `trip-config.js` from the handoff.
3. Add researched places to `map-places.json`.
4. Develop the itinerary and reference content without editing another trip.
5. Give every traveler-facing version an explicit visibility profile.
6. Add its own manifest and keep its service worker inside the trip folder.
7. Run the repository tests before previewing or publishing.

The template is deliberately small. Phase 2 will make the full production engine render structured itinerary and guide data directly.
