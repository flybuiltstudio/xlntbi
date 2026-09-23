-- Dedup store for the daily security self-check alerts
CREATE TABLE IF NOT EXISTS public.security_alerts_sent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_key text NOT NULL UNIQUE,
  finding_type text NOT NULL,
  detail text,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

GRANT ALL ON public.security_alerts_sent TO service_role;
ALTER TABLE public.security_alerts_sent ENABLE ROW LEVEL SECURITY;

-- Read-only self-check over database security posture. service_role only.
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
rls_no_policy AS (
  SELECT 'rls_no_policy:' || c.relname,
         'rls_no_policy',
         'RLS be van kapcsolva, de nincs egyetlen szabály sem: ' || c.relname
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity
    AND NOT EXISTS (
      SELECT 1 FROM pg_policy p WHERE p.polrelid = c.oid
    )
),
anon_readable AS (
  SELECT 'anon_select:' || c.relname,
         'anon_select',
         'Bejelentkezés nélküli (anon) olvasási jog van a táblán: ' || c.relname
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r'
    AND has_table_privilege('anon', c.oid, 'SELECT')
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
  UNION ALL SELECT * FROM rls_no_policy
  UNION ALL SELECT * FROM anon_readable
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