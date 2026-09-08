CREATE TABLE public.product_content_overrides (
  slug text PRIMARY KEY,
  intro text[] NOT NULL DEFAULT '{}',
  features text[] NOT NULL DEFAULT '{}',
  why text,
  summary text,
  meta_title text,
  meta_description text,
  intro_en text[] NOT NULL DEFAULT '{}',
  features_en text[] NOT NULL DEFAULT '{}',
  why_en text,
  summary_en text,
  meta_title_en text,
  meta_description_en text,
  source_file_name text NOT NULL DEFAULT '',
  updated_by uuid,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.product_content_overrides TO anon;
GRANT SELECT ON public.product_content_overrides TO authenticated;
GRANT ALL ON public.product_content_overrides TO service_role;

ALTER TABLE public.product_content_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_content_overrides_public_read"
  ON public.product_content_overrides
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TABLE public.product_price_overrides (
  slug text NOT NULL,
  tier_id text NOT NULL,
  price integer NOT NULL,
  stripe_price_id text,
  synced_sandbox_at timestamp with time zone,
  synced_live_at timestamp with time zone,
  sync_error text,
  updated_by uuid,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (slug, tier_id)
);

GRANT SELECT ON public.product_price_overrides TO anon;
GRANT SELECT ON public.product_price_overrides TO authenticated;
GRANT ALL ON public.product_price_overrides TO service_role;

ALTER TABLE public.product_price_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_price_overrides_public_read"
  ON public.product_price_overrides
  FOR SELECT
  TO anon, authenticated
  USING (true);