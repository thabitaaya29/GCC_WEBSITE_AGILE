import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { publishHomepage, validateHomepage } from './content.ts';

export async function runUpdate(args: string[], env: Record<string, string | undefined>, send: typeof fetch = fetch): Promise<string> {
  const files = args.filter(arg => !arg.startsWith('--'));
  const apply = args.filter(arg => arg === '--apply');
  if (files.length !== 1 || apply.length > 1 || args.some(arg => arg.startsWith('--') && arg !== '--apply')) {
    throw new Error('Usage: node update.ts <content.json> [--apply]. Without --apply: validate only, no remote update.');
  }
  let raw: string;
  try {
    const info = await stat(files[0]);
    if (!info.isFile()) throw new Error('Content input must be a regular file.');
    if (info.size > 65536) throw new Error('Content file exceeds 64 KiB.');
    raw = await readFile(files[0], 'utf8');
  } catch (error) {
    if (error instanceof Error && /64 KiB|regular file/.test(error.message)) throw error;
    throw new Error('Content file could not be read. Check its path and permissions.');
  }
  let input: unknown;
  try { input = JSON.parse(raw); } catch { throw new Error('Content file is not valid JSON.'); }
  const content = validateHomepage(input);
  if (!apply.length) return `Valid homepage (${content.contentStatus}); no remote update performed.`;
  await publishHomepage(content, env, send);
  return `Homepage updated (${content.contentStatus}). Verify the public API before the demo.`;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try { console.log(await runUpdate(process.argv.slice(2), process.env)); }
  catch (error) { console.error(error instanceof Error ? error.message : 'Content update failed.'); process.exitCode = 1; }
}
