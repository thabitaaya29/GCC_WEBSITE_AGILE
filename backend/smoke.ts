import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { projectUrl, validateHomepage } from './content.ts';

export async function runSmoke(env: Record<string, string | undefined>, send: typeof fetch = fetch): Promise<string> {
  const base = projectUrl(env.SUPABASE_URL ?? '');
  const key = env.SUPABASE_PUBLISHABLE_KEY ?? '';
  if (!/^sb_publishable_[A-Za-z0-9_-]{8,}$/.test(key)) throw new Error('A publishable key is required in SUPABASE_PUBLISHABLE_KEY; do not use a secret key.');
  const request = async (suffix: string, method = 'GET', body?: object): Promise<Response> => {
    try {
      return await send(`${base}/rest/v1/homepage_content${suffix}`, {
        method, redirect: 'error', signal: AbortSignal.timeout(15000),
        headers: { apikey: key, 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    } catch { throw new Error('Homepage API unavailable. Check project URL, network, and whether the free project is paused.'); }
  };
  const response = await request('?id=eq.home&select=id,content,updated_at');
  if (!response.ok) throw new Error(`Homepage read failed (HTTP ${response.status}).`);
  let rows: unknown;
  try { rows = await response.json(); } catch { throw new Error('Homepage API returned invalid JSON.'); }
  if (!Array.isArray(rows) || rows.length !== 1 || rows[0]?.id !== 'home' || typeof rows[0].updated_at !== 'string' || !Number.isFinite(Date.parse(rows[0].updated_at))) {
    throw new Error('Homepage content record is missing or invalid. Apply the content file before the demo.');
  }
  const content = validateHomepage(rows[0].content);
  // Never target live content: table constraint permits id=home only.
  for (const method of ['POST', 'PATCH', 'DELETE']) {
    const denied = await request(method === 'POST' ? '' : '?id=eq.__gcc_permission_probe__', method,
      method === 'POST' ? { id: '__gcc_permission_probe__', content: {} } : method === 'PATCH' ? { content: {} } : undefined);
    if (denied.status !== 401 && denied.status !== 403) throw new Error(`Public write permission check failed for ${method} (HTTP ${denied.status}); do not deploy until grants/RLS are repaired.`);
  }
  return `Verified: public read succeeds; public writes denied (POST/PATCH/DELETE). Content status: ${content.contentStatus}.`;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try { console.log(await runSmoke(process.env)); }
  catch (error) { console.error(error instanceof Error ? error.message : 'Homepage verification failed.'); process.exitCode = 1; }
}
