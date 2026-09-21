-- 1) Hide internal admin user ids (updated_by) from public/anonymous readers
REVOKE SELECT (updated_by) ON public.product_price_overrides FROM anon, authenticated;
REVOKE SELECT (updated_by) ON public.product_content_overrides FROM anon, authenticated;
REVOKE SELECT (updated_by) ON public.product_placements FROM anon, authenticated;
REVOKE SELECT (updated_by) ON public.product_category_order FROM anon, authenticated;

-- 2) Explicit admin-only storage policies for the private export bucket
DROP POLICY IF EXISTS "database_export admin read" ON storage.objects;
CREATE POLICY "database_export admin read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'database_export_15_09_26' AND public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "database_export admin insert" ON storage.objects;
CREATE POLICY "database_export admin insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'database_export_15_09_26' AND public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "database_export admin update" ON storage.objects;
CREATE POLICY "database_export admin update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'database_export_15_09_26' AND public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (bucket_id = 'database_export_15_09_26' AND public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "database_export admin delete" ON storage.objects;
CREATE POLICY "database_export admin delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'database_export_15_09_26' AND public.has_role(auth.uid(), 'admin'::app_role));
