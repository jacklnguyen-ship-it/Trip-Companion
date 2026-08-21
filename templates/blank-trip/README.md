# Blank trip template

Copy this entire folder to `trips/<trip-id>/` when beginning a new traveler guide.

1. Save the completed questionnaire handoff inside the new trip folder.
2. Fill in `trip-config.js` from the handoff.
3. Add researched itinerary days to `trip-data.json` using the shared data schema.
4. Add researched places to `map-places.json`.
5. Develop reference content without editing another trip.
6. Give every traveler-facing version an explicit visibility profile and separate data file when necessary.
7. Add its own manifest and keep its service worker inside the trip folder.
8. Run the repository tests before previewing or publishing.

`trip-data.json` follows `../../engine/trip-data.schema.json`. Never place surprise or sensitive content in a shared public data file and rely on browser-only hiding.
