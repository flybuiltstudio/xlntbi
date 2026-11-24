REVOKE EXECUTE ON FUNCTION public.security_autofix(jsonb, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.security_autofix(jsonb, text) TO service_role;