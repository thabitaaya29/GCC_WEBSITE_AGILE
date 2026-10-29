-- GCC homepage schema v1. Run in Supabase SQL Editor as the project owner.
-- Transactional and repeatable; creates no content and never replaces a record.
BEGIN;

CREATE OR REPLACE FUNCTION public.gcc_json_has_keys(value jsonb, expected text[])
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = '' AS $$
  SELECT CASE WHEN jsonb_typeof(value) = 'object' THEN
    value ?& expected AND (SELECT count(*) FROM jsonb_object_keys(value)) = cardinality(expected)
  ELSE false END;
$$;

CREATE OR REPLACE FUNCTION public.gcc_plain_text(value jsonb, allow_empty boolean DEFAULT false)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = '' AS $$
  SELECT coalesce(jsonb_typeof(value) = 'string'
    AND (allow_empty OR length(regexp_replace(value #>> '{}', '[[:space:]]', '', 'g')) > 0)
    AND length(value #>> '{}') <= 2000
    AND (value #>> '{}') !~ '[<>]'
    AND regexp_replace(value #>> '{}', E'[\n\r\t]', '', 'g') !~ '[[:cntrl:]]', false);
$$;

CREATE OR REPLACE FUNCTION public.gcc_homepage_valid(doc jsonb)
RETURNS boolean LANGUAGE plpgsql IMMUTABLE SET search_path = '' AS $$
DECLARE
  stage jsonb;
  part jsonb;
  i integer;
  slugs text[] := ARRAY['learn', 'apply', 'grow'];
  labels text[] := ARRAY['Learn', 'Apply', 'Grow'];
BEGIN
  IF NOT coalesce(public.gcc_json_has_keys(doc, ARRAY['schemaVersion','contentStatus','notice','hero','about','journey'])
    AND doc->'schemaVersion' = '1'::jsonb
    AND doc->>'contentStatus' IN ('example','approved')
    AND public.gcc_plain_text(doc->'notice', doc->>'contentStatus' = 'approved')
    AND octet_length(doc::text) <= 65536, false) THEN RETURN false; END IF;
  IF NOT coalesce(public.gcc_json_has_keys(doc->'hero', ARRAY['title','description','ctaLabel','ctaHref'])
    AND public.gcc_plain_text(doc#>'{hero,title}') AND public.gcc_plain_text(doc#>'{hero,description}')
    AND doc#>>'{hero,ctaLabel}' = 'Explore GCC' AND doc#>>'{hero,ctaHref}' = '#journey'
    AND public.gcc_json_has_keys(doc->'about', ARRAY['title','description'])
    AND public.gcc_plain_text(doc#>'{about,title}') AND public.gcc_plain_text(doc#>'{about,description}')
    AND public.gcc_json_has_keys(doc->'journey', ARRAY['title','description','items'])
    AND public.gcc_plain_text(doc#>'{journey,title}') AND public.gcc_plain_text(doc#>'{journey,description}')
    AND jsonb_typeof(doc#>'{journey,items}') = 'array', false) THEN RETURN false; END IF;
  IF jsonb_array_length(doc#>'{journey,items}') <> 3 THEN RETURN false; END IF;
  FOR i IN 0..2 LOOP
    stage := doc#>'{journey,items}'->i;
    IF NOT coalesce(public.gcc_json_has_keys(stage, ARRAY['slug','label','description','href'])
      AND stage->>'slug' = slugs[i+1] AND stage->>'label' = labels[i+1]
      AND stage->>'href' = '/' || slugs[i+1]
      AND public.gcc_plain_text(stage->'description'), false) THEN RETURN false; END IF;
  END LOOP;
  IF doc->>'contentStatus' = 'approved' THEN
    FOR part IN SELECT jsonb_path_query(doc, '$.** ? (@.type() == "string")') LOOP
      IF (part #>> '{}') ~ E'\\[[^\\]]+\\]' THEN RETURN false; END IF;
    END LOOP;
  END IF;
  RETURN true;
END;
$$;

CREATE TABLE IF NOT EXISTS public.homepage_content (
  id text PRIMARY KEY CHECK (id = 'home'),
  content jsonb NOT NULL CHECK (public.gcc_homepage_valid(content)),
  updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.homepage_content IS 'GCC public homepage only; never store credentials or personal data here.';

CREATE OR REPLACE FUNCTION public.gcc_homepage_timestamp()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  NEW.updated_at := clock_timestamp();
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS gcc_homepage_timestamp ON public.homepage_content;
CREATE TRIGGER gcc_homepage_timestamp BEFORE INSERT OR UPDATE ON public.homepage_content
FOR EACH ROW EXECUTE FUNCTION public.gcc_homepage_timestamp();

ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.homepage_content FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON TABLE public.homepage_content TO anon, authenticated;
GRANT ALL ON TABLE public.homepage_content TO service_role;
DROP POLICY IF EXISTS gcc_homepage_public_read ON public.homepage_content;
CREATE POLICY gcc_homepage_public_read ON public.homepage_content
  FOR SELECT TO anon, authenticated USING (id = 'home');
-- No INSERT/UPDATE/DELETE policy for browser users.

REVOKE ALL ON FUNCTION public.gcc_json_has_keys(jsonb, text[]) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gcc_plain_text(jsonb, boolean) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gcc_homepage_valid(jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gcc_homepage_timestamp() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.gcc_json_has_keys(jsonb, text[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.gcc_plain_text(jsonb, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.gcc_homepage_valid(jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.gcc_homepage_timestamp() TO service_role;

NOTIFY pgrst, 'reload schema';
COMMIT;
