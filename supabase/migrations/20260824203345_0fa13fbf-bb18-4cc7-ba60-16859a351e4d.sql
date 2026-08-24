CREATE TABLE public.product_placements (
  slug TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID
);

GRANT SELECT ON public.product_placements TO anon;
GRANT SELECT ON public.product_placements TO authenticated;
GRANT ALL ON public.product_placements TO service_role;

ALTER TABLE public.product_placements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_placements_public_read" ON public.product_placements
  FOR SELECT TO anon, authenticated USING (true);