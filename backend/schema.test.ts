import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const sql = await readFile(new URL('./schema.sql', import.meta.url), 'utf8');
const example = JSON.parse(await readFile(new URL('./homepage.example.json', import.meta.url), 'utf8'));

test('PostgreSQL schema enforces singleton, full content contract, read-only public roles, and safe reruns', async () => {
  const db = new PGlite();
  try {
    await db.exec('CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN BYPASSRLS;');
    await db.exec(sql);
    const exists = await db.query<{ present: boolean }>("SELECT to_regclass('public.homepage_content') IS NOT NULL AS present");
    assert.equal(exists.rows[0].present, true, 'migration must create the homepage table');
    await db.query('INSERT INTO public.homepage_content(id, content) VALUES ($1, $2)', ['home', example]);
    await assert.rejects(db.query('INSERT INTO public.homepage_content(id, content) VALUES ($1, $2)', ['other', example]));

    for (const change of [
      (x: any) => { x.hero.ctaHref = '/register'; },
      (x: any) => { x.journey.items.reverse(); },
      (x: any) => { delete x.about; },
      (x: any) => { x.privateKey = 'must not be public'; },
      (x: any) => { x.hero.description = '<script>bad</script>'; },
      (x: any) => { x.contentStatus = 'approved'; x.notice = ''; },
      (x: any) => { x.notice = ''; },
      (x: any) => { x.about.description = 'a'.repeat(2001); },
      (x: any) => { x.hero.title = '\t\n'; },
      (x: any) => { x.notice = '\r\n\t'; },
    ]) {
      const invalid = structuredClone(example); change(invalid);
      await assert.rejects(db.query('UPDATE public.homepage_content SET content = $1 WHERE id = $2', [invalid, 'home']));
    }

    for (const role of ['anon', 'authenticated']) {
      await db.exec(`SET ROLE ${role}`);
      const rows = await db.query<{ id: string; content: any }>('SELECT id, content FROM public.homepage_content');
      assert.equal(rows.rows.length, 1); assert.equal(rows.rows[0].id, 'home');
      assert.equal(rows.rows[0].content.hero.ctaHref, '#journey');
      for (const action of [
        "INSERT INTO public.homepage_content(id, content) VALUES ('probe', '{}')",
        "UPDATE public.homepage_content SET updated_at = now() WHERE id = 'home'",
        "DELETE FROM public.homepage_content WHERE id = 'home'",
        'TRUNCATE public.homepage_content',
      ]) await assert.rejects(db.exec(action), /permission denied/);
      await db.exec('RESET ROLE');
    }

    // If an unrelated migration accidentally grants writes, RLS still blocks them.
    await db.exec('GRANT UPDATE, DELETE ON public.homepage_content TO anon; SET ROLE anon;');
    const attempted = await db.query("UPDATE public.homepage_content SET updated_at = now() WHERE id = 'home' RETURNING id");
    assert.equal(attempted.rows.length, 0);
    const deleted = await db.query("DELETE FROM public.homepage_content WHERE id = 'home' RETURNING id");
    assert.equal(deleted.rows.length, 0);
    await db.exec('RESET ROLE');

    await db.exec(sql);
    const after = await db.query<{ content: any }>("SELECT content FROM public.homepage_content WHERE id = 'home'");
    assert.deepEqual(after.rows[0].content, example, 'rerunning migration must not replace content');
    await db.exec('SET ROLE anon');
    await assert.rejects(db.exec("UPDATE public.homepage_content SET updated_at = now()"), /permission denied/);
    await db.exec('RESET ROLE; SET ROLE service_role;');
    const updated = structuredClone(example); updated.hero.title = 'Updated example title';
    await db.query("UPDATE public.homepage_content SET content = $1 WHERE id = 'home'", [updated]);
    await db.exec('RESET ROLE; SET ROLE anon;');
    const visible = await db.query<{ content: any }>("SELECT content FROM public.homepage_content WHERE id = 'home'");
    assert.equal(visible.rows[0].content.hero.title, 'Updated example title');
  } finally { await db.close(); }
});
