import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { validateHomepage, projectUrl, publishHomepage } from './content.ts';

const example = JSON.parse(await readFile(new URL('./homepage.example.json', import.meta.url), 'utf8'));
const copy = () => structuredClone(example);

test('valid content preserves the frontend hero, about and ordered journey contract', () => {
  const result = validateHomepage(copy());
  assert.ok(result, 'validated content must be returned');
  assert.equal(result.schemaVersion, 1);
  assert.equal(result.hero.ctaHref, '#journey');
  assert.deepEqual(result.journey.items.map((x: { href: string }) => x.href), ['/learn', '/apply', '/grow']);
  assert.equal(result.contentStatus, 'example');
});

for (const [name, change] of [
  ['empty hero', (x: any) => { x.hero.title = '  '; }],
  ['missing about', (x: any) => { delete x.about; }],
  ['unknown field', (x: any) => { x.secret = 'never serve this'; }],
  ['nested unknown field', (x: any) => { x.hero.token = 'private'; }],
  ['missing journey item', (x: any) => { x.journey.items.pop(); }],
  ['wrong order', (x: any) => { x.journey.items.reverse(); }],
  ['external route', (x: any) => { x.journey.items[0].href = 'https://elsewhere.test'; }],
  ['false schema version', (x: any) => { x.schemaVersion = 2; }],
  ['missing example notice', (x: any) => { x.notice = ''; }],
  ['invalid status', (x: any) => { x.contentStatus = 'maybe'; }],
  ['markup', (x: any) => { x.hero.title = '<script>alert(1)</script>'; }],
  ['oversized text', (x: any) => { x.about.description = 'a'.repeat(2001); }],
  ['unreviewed placeholder marked approved', (x: any) => { x.contentStatus = 'approved'; x.notice = ''; }],
] as const) {
  test(`invalid content is rejected: ${name}`, () => {
    const data = copy(); change(data);
    assert.throws(() => validateHomepage(data));
  });
}

test('JSON null and non-object inputs fail with a useful validation error', () => {
  for (const data of [null, [], 1, 'hello']) assert.throws(() => validateHomepage(data), /content/i);
});

test('approved plain content is accepted after removing every placeholder', () => {
  const data = JSON.parse(JSON.stringify(example), (_key, value) => typeof value === 'string' ? value.replaceAll(/\[[^\]]*\]/g, 'Teks yang disetujui PO') : value);
  data.contentStatus = 'approved'; data.notice = '';
  const result = validateHomepage(data);
  assert.ok(result, 'approved content must be returned');
  assert.equal(result.contentStatus, 'approved');
});

test('project URLs are HTTPS Supabase project origins, never credential-bearing or arbitrary destinations', () => {
  assert.equal(projectUrl('https://abcdefghijklmnopqrst.supabase.co/'), 'https://abcdefghijklmnopqrst.supabase.co');
  for (const url of ['http://abcdefghijklmnopqrst.supabase.co', 'https://attacker.test', 'https://a.supabase.co@attacker.test', 'https://a.supabase.co/path', 'https://a.supabase.co?key=secret', 'https://user:pass@a.supabase.co']) {
    assert.throws(() => projectUrl(url));
  }
});

test('publishing stores one complete validated document with no secret in the body', async () => {
  let received: any;
  const server = createServer(async (req, res) => {
    let raw = ''; for await (const chunk of req) raw += chunk;
    received = { url: req.url, method: req.method, key: req.headers.apikey, prefer: req.headers.prefer, body: JSON.parse(raw) };
    res.writeHead(201, { 'Content-Type': 'application/json' }); res.end(JSON.stringify([{ id: 'home' }]));
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const port = (server.address() as { port: number }).port;
    const realFetch: typeof fetch = (url, init) => {
      const remote = new URL(String(url));
      return fetch(`http://127.0.0.1:${port}${remote.pathname}${remote.search}`, init);
    };
    await publishHomepage(copy(), { SUPABASE_URL: 'https://abcdefghijklmnopqrst.supabase.co', SUPABASE_SECRET_KEY: 'sb_secret_only_for_this_test' }, realFetch);
    assert.ok(received, 'remote content update must reach the HTTP boundary');
    assert.equal(received.method, 'POST');
    assert.equal(received.url, '/rest/v1/homepage_content?on_conflict=id');
    assert.equal(received.key, 'sb_secret_only_for_this_test');
    assert.match(received.prefer, /resolution=merge-duplicates/);
    assert.equal(received.body.id, 'home');
    assert.equal(received.body.content.hero.ctaHref, '#journey');
    assert.equal(JSON.stringify(received.body).includes('sb_secret_'), false);
  } finally { await new Promise<void>(resolve => server.close(() => resolve())); }
});

test('invalid content and publishable keys cannot initiate a write', async () => {
  const forbiddenFetch: typeof fetch = async () => { throw new Error('NETWORK SHOULD NOT BE REACHED'); };
  await assert.rejects(publishHomepage(null, {}, forbiddenFetch), /content/i);
  await assert.rejects(publishHomepage(copy(), { SUPABASE_URL: 'https://a.supabase.co', SUPABASE_SECRET_KEY: 'sb_publishable_wrong_role' }, forbiddenFetch), /secret key/i);
});

test('remote failures never echo response bodies or credentials', async () => {
  const hostileFetch: typeof fetch = async () => new Response('sb_secret_do_not_print arbitrary database internals', { status: 500 });
  await assert.rejects(
    publishHomepage(copy(), { SUPABASE_URL: 'https://a.supabase.co', SUPABASE_SECRET_KEY: 'sb_secret_only_for_this_test' }, hostileFetch),
    (error: Error) => /500/.test(error.message) && !/sb_secret|database internals/.test(error.message),
  );
});

test('array statuses are rejected before contacting the remote update endpoint', async () => {
  for (const status of [['example'], ['approved']]) {
    const data = copy(); data.contentStatus = status;
    const neverSend: typeof fetch = async () => { throw new Error('UNEXPECTED_NETWORK'); };
    assert.throws(() => validateHomepage(data), /contentStatus/);
    await assert.rejects(publishHomepage(data, { SUPABASE_URL: 'https://a.supabase.co', SUPABASE_SECRET_KEY: 'sb_secret_only_for_this_test' }, neverSend), /contentStatus/);
  }
});
