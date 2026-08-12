# Questionnaire-to-guide handoff

This folder defines the boundary between a completed traveler questionnaire and a new Trip Companion guide.

The questionnaire should produce one reviewed handoff file matching `questionnaire-handoff.example.json`. It is a planning brief, not a public webpage.

## Required workflow

1. Collect traveler answers.
2. Review ambiguous, contradictory, or safety-sensitive answers with the traveler.
3. Remove payment details, passport data, ticket barcodes, and unnecessary confirmation numbers.
4. Save the reviewed handoff inside the new trip folder.
5. Copy `templates/blank-trip/` into `trips/<trip-id>/`.
6. Use the handoff to plan destination research and fill the new trip configuration.
7. Keep research claims sourced and dated.
8. Separate public content from private or traveler-specific content.
9. Preview and test before publishing.

The handoff intentionally records preferences, constraints, confirmed logistics, and unanswered questions. It must never become a dumping ground for sensitive documents.
