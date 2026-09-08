CREATE TABLE public.custom_products (
  slug text PRIMARY KEY,
  name text NOT NULL,
  tagline text,
  status text NOT NULL DEFAULT 'available',
  category_key text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  image_path text,
  intro text[] NOT NULL DEFAULT '{}'::text[],
  features text[] NOT NULL DEFAULT '{}'::text[],
  why text,
  summary text,
  meta_title text,
  meta_description text,
  intro_en text[] NOT NULL DEFAULT '{}'::text[],
  features_en text[] NOT NULL DEFAULT '{}'::text[],
  why_en text,
  summary_en text,
  meta_title_en text,
  meta_description_en text,
  tiers jsonb NOT NULL DEFAULT '[]'::jsonb,
  download_file_name text,
  download_storage_path text,
  stripe_product_sandbox text,
  stripe_product_live text,
  stripe_error text,
  source_file_name text NOT NULL DEFAULT '',
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.custom_products TO anon;
GRANT SELECT ON public.custom_products TO authenticated;
GRANT ALL ON public.custom_products TO service_role;

ALTER TABLE public.custom_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY custom_products_public_read ON public.custom_products
  FOR SELECT TO anon, authenticated USING (true);

CREATE TRIGGER update_custom_products_updated_at
  BEFORE UPDATE ON public.custom_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.custom_categories (
  key text PRIMARY KEY,
  title text NOT NULL,
  title_en text NOT NULL,
  image_path text,
  sort_order integer NOT NULL DEFAULT 0,
  bundled boolean NOT NULL DEFAULT false,
  updated_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.custom_categories TO anon;
GRANT SELECT ON public.custom_categories TO authenticated;
GRANT ALL ON public.custom_categories TO service_role;

ALTER TABLE public.custom_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY custom_categories_public_read ON public.custom_categories
  FOR SELECT TO anon, authenticated USING (true);

CREATE TRIGGER update_custom_categories_updated_at
  BEFORE UPDATE ON public.custom_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();