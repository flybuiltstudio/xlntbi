CREATE TABLE public.page_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_type text NOT NULL,
  page_key text NOT NULL,
  year integer NOT NULL,
  month integer NOT NULL,
  views integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX page_views_unique_idx
  ON public.page_views (page_type, page_key, year, month);

GRANT SELECT ON public.page_views TO authenticated;
GRANT ALL ON public.page_views TO service_role;

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view page views"
  ON public.page_views FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.increment_page_view(
  _page_type text,
  _page_key text,
  _year integer,
  _month integer
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.page_views (page_type, page_key, year, month, views)
  VALUES (_page_type, _page_key, _year, _month, 1)
  ON CONFLICT (page_type, page_key, year, month)
  DO UPDATE SET views = public.page_views.views + 1, updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.increment_page_view(text, text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_page_view(text, text, integer, integer) TO service_role;