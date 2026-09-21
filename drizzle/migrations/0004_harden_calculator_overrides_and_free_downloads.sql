-- 1) free_download_requests: admin-only reads (was admin OR user role)
DROP POLICY IF EXISTS "Admins can view free download requests" ON public.free_download_requests;
CREATE POLICY "Admins can view free download requests"
ON public.free_download_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

REVOKE SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.free_download_requests FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.free_download_requests FROM authenticated;
GRANT SELECT ON public.free_download_requests TO authenticated;
GRANT ALL ON public.free_download_requests TO service_role;

-- 2) calculator_overrides: re-assert column-scoped public reads, drop write grants
REVOKE ALL ON public.calculator_overrides FROM anon;
REVOKE ALL ON public.calculator_overrides FROM authenticated;
GRANT SELECT (key, html, script, updated_at) ON public.calculator_overrides TO anon;
GRANT SELECT (key, html, script, updated_at) ON public.calculator_overrides TO authenticated;
GRANT ALL ON public.calculator_overrides TO service_role;