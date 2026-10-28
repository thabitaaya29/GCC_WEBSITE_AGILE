# GCC homepage backend — Supabase

Sprint slice: public homepage content for Hero, About, Learn/Apply/Grow. Supabase provides hosted PostgreSQL and the REST API. There is no custom web server to deploy. Frontend layout, routing and components remain owned by the frontend developer.

## Repository compatibility

Checked against `feature/navigation` at `21b007f06c0e3aada37a6288a6cbf5fd9f247bc5`; observed `main` at `354ce69bbcca58c35f066c6c031f2cbaa436c0ae`. At inspection, navbar/routes existed but `/` still rendered HomePlaceholder. The friend's newer local foundation still needs its own commit/PR. This backend folder does not modify root package.json, App.tsx, CSS, navbar, routes or frontend dependencies. Recheck the current branches before merging.

## Setup in Supabase Free

1. Use a team-owned Free project. Account/terms and database password are completed by the owner. Keep the database password private.
2. Review `schema.sql`, paste the complete file into Supabase SQL Editor, and run once as project owner. It is transactional and repeatable: reruns preserve existing content. It creates only GCC homepage objects. It does not insert or publish any copy.
3. Confirm Data API exposes the `public` schema. Read `SUPABASE_URL` and the **publishable** key from Connect / API Keys. The **secret** key is only for the trusted update command. This implementation uses the new `sb_publishable_`/`sb_secret_` keys.
4. In this directory, copy `.env.example` to `.env`, filling values privately. Never paste a secret/database password into chat, frontend, a URL, a screenshot or Git. `.env` is ignored.
5. Run Node.js24.12+ (Node24 LTS recommended). The commands below need no runtime npm dependencies.

```sh
node update.ts homepage.example.json
node --env-file=.env update.ts homepage.example.json --apply
node --env-file=.env smoke.ts
```

The first command validates only: it does not contact Supabase. The second atomically upserts the single `home` document after validating all fields. The third uses **only the publishable key** to check the public read and POST/PATCH/DELETE denial. Its write probes target an invalid ID, never live homepage data. Keep the successful output as integration evidence.

## Content contract v1

`homepage.example.json` is the full editable example. Preserve its structure:

- `schemaVersion: 1`
- `contentStatus: "example" | "approved"`
- `notice`: required and nonempty for examples; display it visibly on the homepage when status is example.
- `hero`: title, description, `ctaLabel: "Explore GCC"`, `ctaHref: "#journey"`.
- `about`: title and description.
- `journey`: title, description, exactly three ordered items with slug/label/description/href: `learn/Learn//learn`, `apply/Apply//apply`, `grow/Grow//grow`.

All strings are plain text, max2000 characters each. Unknown fields, markup, empty required text, wrong links, missing stages, files over64KiB, and examples mislabeled approved are rejected. The example's bracketed copy needs PO review; changing status is not evidence of approval. The maintainer is responsible for actual PO approval. Program details, registration, pricing, quiz and additional pages are out of scope.

For an update, copy the example to `homepage.local.json`, edit its values, validate, then apply. Keep approved, public content changes in a reviewable Git commit if appropriate; do not commit any private data. Keep the previous approved content file in Git so it can be reapplied to restore copy. Database SQL checks also validate the structure, even if someone bypasses the command.

## API handoff to frontend

```http
GET https://<project-ref>.supabase.co/rest/v1/homepage_content?id=eq.home&select=id,content,updated_at
apikey: <publishable-key>
```

Response is an array with one record:

```json
[{"id":"home","content":{"schemaVersion":1,"contentStatus":"example","notice":"...","hero":{},"about":{},"journey":{}},"updated_at":"..."}]
```

The abbreviated response above shows the envelope only. `homepage.example.json` defines every required content field. An empty array means content is not ready, not a successful empty homepage.

Example integration (documentation only; add in the frontend-owned files):

```ts
const base = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const response = await fetch(
  `${base}/rest/v1/homepage_content?id=eq.home&select=id,content,updated_at`,
  { headers: { apikey: key }, signal: AbortSignal.timeout(15000) },
);
if (!response.ok) throw new Error('Konten GCC belum dapat dimuat.');
const rows = await response.json();
if (rows.length !== 1 || rows[0].content?.schemaVersion !== 1) {
  throw new Error('Konten homepage belum tersedia.');
}
const homepage = rows[0].content;
// Render text through React, never dangerouslySetInnerHTML.
// If homepage.contentStatus === 'example', display homepage.notice.
// Handle loading, error + retry; don't hide a failed API request behind dummy data.
```

The navbar stays in App. Hero's anchor still needs frontend `id="journey"` and sticky-navbar offset. Journey routes remain previews. Public keys are intentionally visible: SQL grants and row-level security deny public writes. Secret keys bypass RLS and must stay on the maintainer's machine. Do not use a secret key to check public access.

## Verification

Install dev tools using the committed npm lockfile: `npm ci`. Then:

```sh
npm test
npm run check
npm run content:validate
```

Tests use the real PostgreSQL engine in PGlite for SQL, RLS, grants, singleton validation, and migration reruns; HTTP transport is checked against a local test server. These are **not** proof of a deployed Supabase API. `node --env-file=.env smoke.ts` is the separate hosted verification. Test tools are development-only; runtime scripts use Node built-ins.

Supabase Free has usage quotas and may pause inactive projects. Check the dashboard and restore a paused project before the class demo. No paid plan, auth feature, storage service, realtime feature, or admin UI is needed for this slice. Confirm actual quota/plan in the dashboard; this repository does not activate upgrades.

Sources: [Data API](https://supabase.com/docs/guides/api), [API keys](https://supabase.com/docs/guides/getting-started/api-keys), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [free project pausing](https://supabase.com/docs/guides/platform/free-project-pausing).
