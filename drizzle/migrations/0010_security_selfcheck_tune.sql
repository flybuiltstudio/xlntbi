-- Tune the self-check: in this project every public table carries default
-- anon/authenticated grants, and "RLS on, no policy" means fully locked
-- (service_role only) which is intentional. Report only real exposure.
CREATE OR REPLACE FUNCTION public.security_selfcheck()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
WITH no_rls AS (
  SELECT 'no_rls:' || c.relname AS finding_key,
         'no_rls' AS finding_type,
         'Nincs bekapcsolva a soralapú védelem (RLS): ' || c.relname AS detail
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity
),
anon_readable AS (
  SELECT DISTINCT
         'anon_policy:' || c.relname,
         'anon_policy',
         'Bejelentkezés nélkül olvasható tábla (anon SELECT szabály): ' || c.relname
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  JOIN pg_policy p ON p.polrelid = c.oid
  WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity
    AND p.polpermissive
    AND p.polcmd::text IN ('r', '*')
    AND (p.polroles = '{0}'::oid[] OR 'anon' = ANY (
      SELECT pg_get_userbyid(r) FROM unnest(p.polroles) r
    ))
    AND has_table_privilege('anon', c.oid, 'SELECT')
),
anon_writable AS (
  SELECT DISTINCT
         'anon_write:' || c.relname || ':' || p.polcmd::text,
         'anon_write',
         'Bejelentkezés nélkül írható tábla (' || p.polcmd::text || '): ' || c.relname
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  JOIN pg_policy p ON p.polrelid = c.oid
  WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity
    AND p.polpermissive
    AND p.polcmd::text IN ('w', 'd', '*')
    AND (p.polroles = '{0}'::oid[] OR 'anon' = ANY (
      SELECT pg_get_userbyid(r) FROM unnest(p.polroles) r
    ))
),
public_buckets AS (
  SELECT 'public_bucket:' || b.id,
         'public_bucket',
         'Nyilvános tároló: ' || b.id
  FROM storage.buckets b
  WHERE b.public
),
unsafe_functions AS (
  SELECT 'func_search_path:' || p.proname,
         'func_search_path',
         'SECURITY DEFINER függvény fixált search_path nélkül: ' || p.proname
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.prosecdef
    AND (p.proconfig IS NULL OR NOT EXISTS (
      SELECT 1 FROM unnest(p.proconfig) cfg WHERE cfg LIKE 'search_path=%'
    ))
),
insecure_cron AS (
  SELECT 'cron_no_secret:' || j.jobname,
         'cron_no_secret',
         'Időzített feladat hitelesítő fejléc nélkül hív végpontot: ' || j.jobname
  FROM cron.job j
  WHERE j.active
    AND j.command ILIKE '%net.http_post%'
    AND j.command NOT ILIKE '%x-cron-secret%'
),
all_findings AS (
  SELECT * FROM no_rls
  UNION ALL SELECT * FROM anon_readable
  UNION ALL SELECT * FROM anon_writable
  UNION ALL SELECT * FROM public_buckets
  UNION ALL SELECT * FROM unsafe_functions
  UNION ALL SELECT * FROM insecure_cron
)
SELECT COALESCE(
  jsonb_agg(jsonb_build_object(
    'finding_key', finding_key,
    'finding_type', finding_type,
    'detail', detail
  ) ORDER BY finding_type, finding_key),
  '[]'::jsonb
)
FROM all_findings;
$$;

REVOKE ALL ON FUNCTION public.security_selfcheck() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.security_selfcheck() TO service_role;