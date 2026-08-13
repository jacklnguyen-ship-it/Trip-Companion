-- Phase 4A: private inbox for completed traveler questionnaires.
-- This table is deliberately in the private schema. Public browser clients
-- cannot read it; the questionnaire-submit Edge Function is the only writer.

create schema if not exists private;

create table if not exists private.questionnaire_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'new'
    check (status in ('new', 'reviewing', 'planned', 'archived')),
  source text not null default 'trip-companion-questionnaire',
  questionnaire jsonb not null,
  constraint questionnaire_payload_is_object check (jsonb_typeof(questionnaire) = 'object')
);

comment on table private.questionnaire_submissions is
  'Private planning briefs submitted through the Trip Companion questionnaire.';

revoke all on schema private from public;
revoke all on table private.questionnaire_submissions from public;
