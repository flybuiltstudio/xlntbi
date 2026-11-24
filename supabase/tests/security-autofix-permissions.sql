-- Only the private server caller may execute automatic security changes.
DO $$
BEGIN
  IF has_function_privilege('anon', 'public.security_autofix(jsonb,text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'Anonymous callers must not execute security autofix';
  END IF;
END;
$$;

DO $$
BEGIN
  IF has_function_privilege('authenticated', 'public.security_autofix(jsonb,text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'Signed-in callers must not execute security autofix directly';
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT has_function_privilege('service_role', 'public.security_autofix(jsonb,text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'Private server execution must remain allowed';
  END IF;
END;
$$;