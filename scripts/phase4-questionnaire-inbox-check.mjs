import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const exists = relative => fs.existsSync(path.join(root, relative));
let checks = 0;
const check = (condition, message) => { checks += 1; assert.ok(condition, message); };

const migrationPath = 'supabase/migrations/20260812_create_questionnaire_submissions.sql';
const functionPath = 'supabase/functions/questionnaire-submit/index.ts';
check(exists(migrationPath), 'Missing private questionnaire inbox migration');
check(exists(functionPath), 'Missing questionnaire submission function');

const migration = read(migrationPath);
const handler = read(functionPath);
const script = read('questionnaire/questionnaire.js');
const readme = read('supabase/PHASE-4A-SETUP.md');

check(migration.includes('create schema if not exists private'), 'Inbox is not isolated in a private schema');
check(migration.includes('private.questionnaire_submissions'), 'Inbox table is missing');
check(migration.includes('revoke all on table private.questionnaire_submissions from public'), 'Public access to questionnaire inbox was not revoked');
check(handler.includes("Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')"), 'Function does not keep the service key server-side');
check(!script.includes('SUPABASE_SERVICE_ROLE_KEY'), 'Service role key was exposed to the public questionnaire');
check(handler.includes("allowedOrigins"), 'Function does not restrict browser origins');
check(handler.includes("request.method !== 'POST'"), 'Function accepts unexpected request methods');
check(handler.includes('content-length'), 'Function does not cap incoming payload size');
check(handler.includes('validQuestionnaire'), 'Function does not validate questionnaire payloads');
check(handler.includes('sensitiveFieldsProvided === false'), 'Function does not enforce the sensitive-data boundary');
check(script.includes("fetch(SUBMIT_ENDPOINT"), 'Questionnaire does not invoke the submission endpoint');
check(script.includes('passesPrivacyCheck'), 'Questionnaire can send without its privacy check');
check(readme.includes('Do not add a service-role key'), 'Setup instructions do not protect the secret key');

console.log(`Phase 4A questionnaire inbox QA passed: ${checks} checks.`);
