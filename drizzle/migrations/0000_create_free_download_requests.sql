CREATE TABLE public.free_download_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug text NOT NULL,
  product_name text NOT NULL,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  token text NOT NULL UNIQUE,
  download_count integer NOT NULL DEFAULT 0,
  max_downloads integer NOT NULL DEFAULT 10,
  expires_at timestamptz NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_downloaded_at timestamptz
);

GRANT SELECT ON public.free_download_requests TO authenticated;
GRANT ALL ON public.free_download_requests TO service_role;

ALTER TABLE public.free_download_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view free download requests"
ON public.free_download_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'user'));

CREATE INDEX free_download_requests_created_idx
ON public.free_download_requests (created_at DESC);

CREATE INDEX free_download_requests_rate_idx
ON public.free_download_requests (ip_address, created_at DESC);