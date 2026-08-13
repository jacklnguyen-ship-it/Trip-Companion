-- Phase 4A: locked inbox for completed traveler questionnaires.
-- The table uses the normal public schema so the protected Edge Function can
-- write through Supabase's server API. RLS is enabled with no browser policies,
-- so anonymous and authenticated browser clients cannot read or write it.

create table if not exists public.questionnaire_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'new'
    check (status in ('new', 'reviewing', 'planned', 'archived')),
  source text not null default 'trip-companion-questionnaire',
  questionnaire jsonb not null,
  constraint questionnaire_payload_is_object check (jsonb_typeof(questionnaire) = 'object')
);

alter table public.questionnaire_submissions enable row level security;

comment on table public.questionnaire_submissions is
  'Locked planning briefs submitted through the Trip Companion questionnaire.';

revoke all on table public.questionnaire_submissions from anon, authenticated;
