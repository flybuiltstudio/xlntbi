-- Explicit admin-only access control for the private 'termekfajlok' bucket.
-- Service role (server code) bypasses RLS and keeps working; everyone else is denied
-- unless they hold the 'admin' role.

DROP POLICY IF EXISTS "termekfajlok admin read" ON storage.objects;
DROP POLICY IF EXISTS "termekfajlok admin insert" ON storage.objects;
DROP POLICY IF EXISTS "termekfajlok admin update" ON storage.objects;
DROP POLICY IF EXISTS "termekfajlok admin delete" ON storage.objects;

CREATE POLICY "termekfajlok admin read"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'termekfajlok' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "termekfajlok admin insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'termekfajlok' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "termekfajlok admin update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'termekfajlok' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'termekfajlok' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "termekfajlok admin delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'termekfajlok' AND public.has_role(auth.uid(), 'admin'));