CREATE TABLE IF NOT EXISTS public.product_category_order (
  key text NOT NULL PRIMARY KEY,
  sort_order integer NOT NULL DEFAULT 0,
  updated_by uuid,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_category_order TO anon;
GRANT SELECT ON public.product_category_order TO authenticated;
GRANT ALL ON public.product_category_order TO service_role;
ALTER TABLE public.product_category_order ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_category_order_public_read" ON public.product_category_order FOR SELECT TO anon, authenticated USING (true);