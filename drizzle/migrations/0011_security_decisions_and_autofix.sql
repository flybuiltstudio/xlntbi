-- Remembered decisions for security self-check findings that need a human choice.
CREATE TABLE IF NOT EXISTS public.security_decisions (
  finding_key text PRIMARY KEY,
  finding_type text NOT NULL,
  decision text NOT NULL CHECK (decision IN ('keep', 'fix')),
  detail text,
  decided_at timestamptz NOT NULL DEFAULT now(),
  decided_by uuid
);

GRANT ALL ON public.security_decisions TO service_role;
ALTER TABLE public.security_decisions ENABLE ROW LEVEL SECURITY;

-- Applies the safe automatic fixes, plus the decision-gated ones the admin chose.
-- Storage bucket visibility is handled by the app (Storage API), not here.
CREATE OR REPLACE FUNCTION public.security_autofix(
  _decisions jsonb DEFAULT '{}'::jsonb,
  _cron_token text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $fn$
DECLARE
  finding jsonb;
  ftype text;
  fkey text;
  target text;
  decision text;
  fixed jsonb := '[]'::jsonb;
  skipped jsonb := '[]'::jsonb;
  errors jsonb := '[]'::jsonb;
  rec record;
  new_cmd text;
  url_match text;
BEGIN
  FOR finding IN SELECT * FROM jsonb_array_elements(public.security_selfcheck())
  LOOP
    fkey := finding->>'finding_key';
    ftype := finding->>'finding_type';
    target := split_part(fkey, ':', 2);
    decision := _decisions->>fkey;

    BEGIN
      IF ftype = 'no_rls' THEN
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', target);
        fixed := fixed || jsonb_build_array(jsonb_build_object('finding_key', fkey, 'action', 'RLS bekapcsolva: ' || target));

      ELSIF ftype = 'func_search_path' THEN
        FOR rec IN
          SELECT p.oid, pg_get_function_identity_arguments(p.oid) AS args
          FROM pg_proc p
          JOIN pg_namespace n ON n.oid = p.pronamespace
          WHERE n.nspname = 'public' AND p.proname = target AND p.prosecdef
        LOOP
          EXECUTE format('ALTER FUNCTION public.%I(%s) SET search_path = public', target, rec.args);
        END LOOP;
        fixed := fixed || jsonb_build_array(jsonb_build_object('finding_key', fkey, 'action', 'Fix search_path beállítva: ' || target));

      ELSIF ftype IN ('anon_policy', 'anon_write') THEN
        IF decision = 'fix' THEN
          FOR rec IN
            SELECT p.polname, c.relname
            FROM pg_policy p
            JOIN pg_class c ON c.oid = p.polrelid
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public'
              AND c.relname = target
              AND p.polpermissive
              AND (
                (ftype = 'anon_policy' AND p.polcmd::text IN ('r', '*'))
                OR (ftype = 'anon_write' AND p.polcmd::text IN ('w', 'd', '*'))
              )
              AND (p.polroles = '{0}'::oid[] OR 'anon' = ANY (
                SELECT pg_get_userbyid(r) FROM unnest(p.polroles) r
              ))
          LOOP
            EXECUTE format('DROP POLICY %I ON public.%I', rec.polname, rec.relname);
            fixed := fixed || jsonb_build_array(jsonb_build_object(
              'finding_key', fkey,
              'action', 'Szabály törölve: ' || rec.polname || ' (' || rec.relname || ')'
            ));
          END LOOP;
        ELSE
          skipped := skipped || jsonb_build_array(jsonb_build_object('finding_key', fkey, 'reason', 'döntés: maradjon így'));
        END IF;

      ELSIF ftype = 'cron_no_secret' THEN
        IF decision = 'fix' THEN
          IF _cron_token IS NULL OR length(_cron_token) = 0 THEN
            errors := errors || jsonb_build_array(jsonb_build_object('finding_key', fkey, 'error', 'Hiányzik a feladat-hitelesítő érték.'));
          ELSE
            FOR rec IN
              SELECT jobid, command FROM cron.job WHERE jobname = target
            LOOP
              url_match := (regexp_match(rec.command, '''(https?://[^'']+)'''))[1];
              IF url_match IS NULL THEN
                errors := errors || jsonb_build_array(jsonb_build_object('finding_key', fkey, 'error', 'Nem találom a hívott címet a feladatban.'));
              ELSE
                new_cmd := replace(
                  rec.command,
                  url_match,
                  url_match || CASE WHEN position('?' in url_match) > 0 THEN '&' ELSE '?' END
                    || 'secret=' || _cron_token
                );
                PERFORM cron.alter_job(rec.jobid, command := new_cmd);
                fixed := fixed || jsonb_build_array(jsonb_build_object('finding_key', fkey, 'action', 'Hitelesítés bekapcsolva: ' || target));
              END IF;
            END LOOP;
          END IF;
        ELSE
          skipped := skipped || jsonb_build_array(jsonb_build_object('finding_key', fkey, 'reason', 'döntés: maradjon így'));
        END IF;

      ELSE
        skipped := skipped || jsonb_build_array(jsonb_build_object('finding_key', fkey, 'reason', 'az alkalmazás kezeli'));
      END IF;
    EXCEPTION WHEN OTHERS THEN
      errors := errors || jsonb_build_array(jsonb_build_object('finding_key', fkey, 'error', SQLERRM));
    END;
  END LOOP;

  RETURN jsonb_build_object('fixed', fixed, 'skipped', skipped, 'errors', errors);
END;
$fn$;

REVOKE ALL ON FUNCTION public.security_autofix(jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.security_autofix(jsonb, text) TO service_role;