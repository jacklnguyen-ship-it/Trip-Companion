import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const allowedOrigins = new Set([
  'https://jacklnguyen-ship-it.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

function corsHeaders(request: Request) {
  const origin = request.headers.get('origin') ?? '';
  return {
    'Access-Control-Allow-Origin': allowedOrigins.has(origin) ? origin : 'https://jacklnguyen-ship-it.github.io',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

function json(body: Record<string, unknown>, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } });
}

function validQuestionnaire(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const brief = value as Record<string, unknown>;
  if (brief.schemaVersion !== 2 || !brief.trip || !brief.travelers || !brief.privacy) return false;
  return (brief.privacy as Record<string, unknown>).sensitiveFieldsProvided === false;
}

Deno.serve(async (request) => {
  const headers = corsHeaders(request);
  if (request.method === 'OPTIONS') return new Response('ok', { headers });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, headers);
  const origin = request.headers.get('origin');
  if (origin && !allowedOrigins.has(origin)) return json({ error: 'Origin not allowed' }, 403, headers);
  if (Number(request.headers.get('content-length') ?? 0) > 100000) return json({ error: 'Planning brief is too large' }, 413, headers);

  let body: { questionnaire?: unknown; source?: unknown };
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400, headers); }
  if (!validQuestionnaire(body.questionnaire)) return json({ error: 'Invalid planning brief' }, 400, headers);

  const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', { auth: { persistSession: false } });
  const source = typeof body.source === 'string' && body.source.length <= 80 ? body.source : 'trip-companion-questionnaire';
  const { error } = await supabase.from('questionnaire_submissions').insert({ questionnaire: body.questionnaire, source });
  if (error) { console.error('Questionnaire insert failed', error.code); return json({ error: 'Unable to save planning brief' }, 500, headers); }
  return json({ received: true }, 201, headers);
});
