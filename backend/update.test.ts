import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { runUpdate } from './update.ts';

test('default command validates the example without network access or credentials', async () => {
  const noNetwork: typeof fetch = async () => { throw new Error('NETWORK_NOT_ALLOWED'); };
  assert.match(await runUpdate(['homepage.example.json'], {}, noNetwork), /valid.*no remote/i);
});

test('explicit apply refuses missing credentials', async () => {
  await assert.rejects(runUpdate(['homepage.example.json', '--apply'], {}), /SUPABASE_URL/);
});

test('unknown command flags and missing files cannot silently publish', async () => {
  for (const args of [[], ['--aply'], ['homepage.example.json', '--force'], ['one.json', 'two.json'], ['--apply', '--apply', 'homepage.example.json']]) {
    await assert.rejects(runUpdate(args, {}), /usage/i);
  }
});

test('malformed and oversized files are rejected before any remote action', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'gcc-content-'));
  try {
    const bad = join(dir, 'bad.json'); await writeFile(bad, '{ broken');
    await assert.rejects(runUpdate([bad, '--apply'], {}), /JSON/i);
    const big = join(dir, 'big.json'); await writeFile(big, ' '.repeat(65537));
    await assert.rejects(runUpdate([big], {}), /64 KiB/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('the executable CLI returns failure for invalid args and success for dry-run', () => {
  const bad = spawnSync(process.execPath, ['update.ts', '--unknown'], { encoding: 'utf8' });
  assert.equal(bad.status, 1); assert.match(bad.stderr, /usage/i);
  const good = spawnSync(process.execPath, ['update.ts', 'homepage.example.json'], { encoding: 'utf8' });
  assert.equal(good.status, 0); assert.match(good.stdout, /no remote/i);
});
