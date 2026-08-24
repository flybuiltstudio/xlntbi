-- Tighten the public read surface of calculator_overrides:
-- anonymous and signed-in visitors only need the display columns
-- (key, html, script, updated_at). Hide file_name and updated_by
-- (admin user id) via column-level privileges.

revoke select on public.calculator_overrides from anon, authenticated;

grant select (key, html, script, updated_at) on public.calculator_overrides to anon;
grant select (key, html, script, updated_at) on public.calculator_overrides to authenticated;

-- service_role keeps full access (table-level grant already in place).
-- RLS policy ("Anyone can read calculator overrides") is unchanged and still applies.
