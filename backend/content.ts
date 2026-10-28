export interface HomepageContent {
  schemaVersion: 1;
  contentStatus: 'example' | 'approved';
  notice: string;
  hero: { title: string; description: string; ctaLabel: 'Explore GCC'; ctaHref: '#journey' };
  about: { title: string; description: string };
  journey: {
    title: string; description: string;
    items: { slug: 'learn' | 'apply' | 'grow'; label: 'Learn' | 'Apply' | 'Grow'; description: string; href: '/learn' | '/apply' | '/grow' }[];
  };
}

function object(input: unknown, keys: string[], path: string): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error(`Invalid content: ${path} must be an object.`);
  const value = input as Record<string, unknown>;
  if (Object.keys(value).length !== keys.length || keys.some(key => !Object.hasOwn(value, key))) {
    throw new Error(`Invalid content: ${path} has missing or unexpected fields.`);
  }
  return value;
}

function text(input: unknown, path: string, allowEmpty = false): string {
  // oxlint-disable-next-line no-control-regex -- Intentionally reject non-printing input; tab, LF and CR remain valid.
  if (typeof input !== 'string' || (!allowEmpty && !input.trim()) || input.length > 2000 || /[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(input)) {
    throw new Error(`Invalid content: ${path} must be plain text of at most 2000 characters.`);
  }
  return input;
}

export function validateHomepage(input: unknown): HomepageContent {
  const root = object(input, ['schemaVersion', 'contentStatus', 'notice', 'hero', 'about', 'journey'], 'root');
  if (root.schemaVersion !== 1 || (root.contentStatus !== 'example' && root.contentStatus !== 'approved')) throw new Error('Invalid content: schemaVersion or contentStatus.');
  text(root.notice, 'notice', root.contentStatus === 'approved');
  const hero = object(root.hero, ['title', 'description', 'ctaLabel', 'ctaHref'], 'hero');
  text(hero.title, 'hero.title'); text(hero.description, 'hero.description');
  if (hero.ctaLabel !== 'Explore GCC' || hero.ctaHref !== '#journey') throw new Error('Invalid content: hero CTA must target #journey with label Explore GCC.');
  const about = object(root.about, ['title', 'description'], 'about');
  text(about.title, 'about.title'); text(about.description, 'about.description');
  const journey = object(root.journey, ['title', 'description', 'items'], 'journey');
  text(journey.title, 'journey.title'); text(journey.description, 'journey.description');
  if (!Array.isArray(journey.items) || journey.items.length !== 3) throw new Error('Invalid content: journey needs exactly Learn, Apply, Grow.');
  const routes = [['learn', 'Learn', '/learn'], ['apply', 'Apply', '/apply'], ['grow', 'Grow', '/grow']];
  journey.items.forEach((item, index) => {
    const stage = object(item, ['slug', 'label', 'description', 'href'], `journey.items[${index}]`);
    const [slug, label, href] = routes[index];
    if (stage.slug !== slug || stage.label !== label || stage.href !== href) throw new Error(`Invalid content: journey.items[${index}] has the wrong route, label, or order.`);
    text(stage.description, `journey.items[${index}].description`);
  });
  const serialized = JSON.stringify(root);
  if (Buffer.byteLength(serialized, 'utf8') > 65536) throw new Error('Invalid content: document exceeds 64 KiB.');
  let placeholder = false;
  JSON.stringify(root, (_key, value) => {
    if (typeof value === 'string' && /\[[^\]]+\]/.test(value)) placeholder = true;
    return value;
  });
  if (root.contentStatus === 'approved' && placeholder) throw new Error('Invalid content: approved copy still contains placeholders.');
  return structuredClone(root) as unknown as HomepageContent;
}

export function projectUrl(input: string): string {
  let url: URL;
  try { url = new URL(input); } catch { throw new Error('SUPABASE_URL must be an HTTPS Supabase project origin.'); }
  if (url.protocol !== 'https:' || !/^[a-z0-9-]+\.supabase\.co$/.test(url.hostname) || url.port || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('SUPABASE_URL must be an HTTPS Supabase project origin, without credentials, path, query, or fragment.');
  }
  return url.origin;
}

export async function publishHomepage(content: unknown, env: Record<string, string | undefined>, send: typeof fetch = fetch): Promise<void> {
  const validated = validateHomepage(content);
  const base = projectUrl(env.SUPABASE_URL ?? '');
  const key = env.SUPABASE_SECRET_KEY ?? '';
  if (!/^sb_secret_[A-Za-z0-9_-]{8,}$/.test(key)) throw new Error('A Supabase secret key is required in SUPABASE_SECRET_KEY; never use a publishable key for updates.');
  let response: Response;
  try {
    response = await send(`${base}/rest/v1/homepage_content?on_conflict=id`, {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15000),
      headers: { apikey: key, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify({ id: 'home', content: validated }),
    });
  } catch { throw new Error('Homepage update could not be confirmed. Check connection/project availability, then read the current record before retrying.'); }
  if (!response.ok) throw new Error(`Homepage update failed (HTTP ${response.status}). Check schema, project key, and permissions; response details are hidden.`);
  let rows: unknown;
  try { rows = await response.json(); } catch { throw new Error('Homepage update returned an unexpected response; verify the current record before retrying.'); }
  if (!Array.isArray(rows) || rows.length !== 1 || rows[0]?.id !== 'home') throw new Error('Homepage update returned an unexpected record; verify the project before retrying.');
}
