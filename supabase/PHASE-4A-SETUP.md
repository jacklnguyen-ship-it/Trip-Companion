# Phase 4A — Questionnaire inbox setup

This folder makes the public questionnaire submit a reviewed, non-sensitive planning brief to the Trip Companion development project.

## What this does

- Stores submissions in `private.questionnaire_submissions`, not a public table.
- Allows only the `questionnaire-submit` Edge Function to write submissions.
- Permits requests from the Trip Companion GitHub Pages origin.
- Keeps passport details, payment details, ticket barcodes, and confirmation numbers out of the questionnaire flow.

## One-time Supabase dashboard steps

1. In the **SQL Editor**, run `migrations/20260812_create_questionnaire_submissions.sql`.
2. In **Edge Functions**, create a function named `questionnaire-submit` and deploy `functions/questionnaire-submit/index.ts`.
3. Do not add a service-role key to GitHub Pages or to any HTML/JavaScript file. Supabase supplies it only inside the deployed Edge Function.
4. Test by submitting a sample questionnaire; then use the SQL Editor to confirm that a new row appears in `private.questionnaire_submissions`.

The publishable key appears in the public questionnaire by design. It is not a database password and cannot read this private table.
