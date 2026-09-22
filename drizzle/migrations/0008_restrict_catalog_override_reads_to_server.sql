DROP POLICY IF EXISTS product_content_overrides_public_read ON public.product_content_overrides;
DROP POLICY IF EXISTS product_category_order_public_read ON public.product_category_order;
DROP POLICY IF EXISTS product_placements_public_read ON public.product_placements;
DROP POLICY IF EXISTS custom_products_public_read ON public.custom_products;
DROP POLICY IF EXISTS custom_categories_public_read ON public.custom_categories;
DROP POLICY IF EXISTS custom_calculators_public_read ON public.custom_calculators;

REVOKE ALL ON public.product_content_overrides FROM anon, authenticated;
REVOKE ALL ON public.product_category_order FROM anon, authenticated;
REVOKE ALL ON public.product_placements FROM anon, authenticated;
REVOKE ALL ON public.custom_products FROM anon, authenticated;
REVOKE ALL ON public.custom_categories FROM anon, authenticated;
REVOKE ALL ON public.custom_calculators FROM anon, authenticated;

GRANT ALL ON public.product_content_overrides TO service_role;
GRANT ALL ON public.product_category_order TO service_role;
GRANT ALL ON public.product_placements TO service_role;
GRANT ALL ON public.custom_products TO service_role;
GRANT ALL ON public.custom_categories TO service_role;
GRANT ALL ON public.custom_calculators TO service_role;