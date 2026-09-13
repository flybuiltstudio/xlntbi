CREATE TABLE public.custom_calculators (
  slug text PRIMARY KEY,
  name_hu text NOT NULL,
  name_en text NOT NULL,
  intro_hu text NOT NULL DEFAULT '',
  intro_en text NOT NULL DEFAULT '',
  meta_title_hu text NOT NULL DEFAULT '',
  meta_description_hu text NOT NULL DEFAULT '',
  meta_title_en text NOT NULL DEFAULT '',
  meta_description_en text NOT NULL DEFAULT '',
  html_hu text NOT NULL,
  script_hu text NOT NULL DEFAULT '',
  html_en text NOT NULL,
  script_en text NOT NULL DEFAULT '',
  image_hu_path text,
  image_en_path text,
  position integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.custom_calculators TO anon, authenticated;
GRANT ALL ON public.custom_calculators TO service_role;
ALTER TABLE public.custom_calculators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "custom_calculators_public_read" ON public.custom_calculators FOR SELECT TO anon, authenticated USING (true);