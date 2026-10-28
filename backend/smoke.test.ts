import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runSmoke } from './smoke.ts';

const example = JSON.parse(await readFile(new URL('./homepage.example.json', import.meta.url), 'utf8'));
const env = { SUPABASE_URL: 'https://a.supabase.co', SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test_only' };

test('hosted API verification succeeds only after valid public content and three denied write probes', async () => {
  const peer: typeof fetch = async (url, init) => {
    const target = new URL(String(url));
    if (init?.method === 'GET') return Response.json([{ id: 'home', content: example, updated_at: '2026-10-29T00:00:00Z' }]);
    // A regression targeting home instead of a probe must fail this test.
    if (init?.method !== 'POST') assert.equal(target.searchParams.get('id'), 'eq.__gcc_permission_probe__');
    else assert.equal(JSON.parse(String(init.body)).id, '__gcc_permission_probe__');
    return new Response('', { status: 403 });
  };
  assert.match(await runSmoke(env, peer), /public read.*writes denied/i);
});

test('a missing content record cannot be reported as a healthy homepage', async () => {
  await assert.rejects(runSmoke(env, async () => Response.json([])), /homepage/i);
});

test('a write permission regression fails verification without touching the home record', async () => {
  const peer: typeof fetch = async (_url, init) => init?.method === 'GET'
    ? Response.json([{ id: 'home', content: example, updated_at: '2026-10-29T00:00:00Z' }])
    : new Response(null, { status: 204 });
  await assert.rejects(runSmoke(env, peer), /write/i);
});

test('schema rejection is not misreported as denied write permission', async () => {
  const peer: typeof fetch = async (_url, init) => init?.method === 'GET'
    ? Response.json([{ id: 'home', content: example, updated_at: '2026-10-29T00:00:00Z' }])
    : new Response('invalid singleton', { status: 400 });
  await assert.rejects(runSmoke(env, peer), /write/i);
});

test('the public API verifier refuses a privileged secret key', async () => {
  await assert.rejects(runSmoke({ ...env, SUPABASE_PUBLISHABLE_KEY: 'sb_secret_must_not_use' }), /publishable key/i);
});
