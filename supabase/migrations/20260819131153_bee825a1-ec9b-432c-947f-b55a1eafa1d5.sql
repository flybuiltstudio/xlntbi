ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS tier_id text,
  ADD COLUMN IF NOT EXISTS tier_label text;

CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE public.order_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  order_number text NOT NULL,
  product_slug text NOT NULL,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  token text NOT NULL UNIQUE,
  email text NOT NULL,
  download_count integer NOT NULL DEFAULT 0,
  max_downloads integer NOT NULL DEFAULT 10,
  expires_at timestamptz NOT NULL,
  last_downloaded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_downloads_order_id ON public.order_downloads(order_id);
CREATE INDEX idx_order_downloads_token ON public.order_downloads(token);

GRANT ALL ON public.order_downloads TO service_role;
ALTER TABLE public.order_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view downloads"
  ON public.order_downloads FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view orders"
  ON public.orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, UPDATE ON public.orders TO authenticated;