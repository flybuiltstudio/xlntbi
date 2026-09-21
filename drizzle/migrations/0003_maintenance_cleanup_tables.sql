-- Expired download/demo links get closed (not deleted) by the weekly cleanup job.
ALTER TABLE public.demo_requests ADD COLUMN IF NOT EXISTS closed_at timestamptz;
ALTER TABLE public.order_downloads ADD COLUMN IF NOT EXISTS closed_at timestamptz;
ALTER TABLE public.free_download_requests ADD COLUMN IF NOT EXISTS closed_at timestamptz;

-- Audit trail of manually deleted (never paid) orders.
CREATE TABLE IF NOT EXISTS public.deleted_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL,
  product_name text NOT NULL,
  tier_label text,
  quantity integer NOT NULL DEFAULT 1,
  total_price integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'HUF',
  email text,
  billing_name text,
  payment_status text,
  payment_provider text,
  order_created_at timestamptz,
  deleted_at timestamptz NOT NULL DEFAULT now(),
  deleted_by uuid,
  deleted_by_email text,
  reason text
);

GRANT SELECT ON public.deleted_orders TO authenticated;
GRANT ALL ON public.deleted_orders TO service_role;
ALTER TABLE public.deleted_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read deleted orders" ON public.deleted_orders;
CREATE POLICY "Admins can read deleted orders"
ON public.deleted_orders
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Monthly statistics close: frozen per-product totals of finished months.
CREATE TABLE IF NOT EXISTS public.monthly_stats_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL,
  month integer NOT NULL,
  product_slug text NOT NULL,
  product_name text NOT NULL DEFAULT '',
  views integer NOT NULL DEFAULT 0,
  orders_count integer NOT NULL DEFAULT 0,
  paid_count integer NOT NULL DEFAULT 0,
  revenue bigint NOT NULL DEFAULT 0,
  closed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (year, month, product_slug)
);

GRANT SELECT ON public.monthly_stats_snapshots TO authenticated;
GRANT ALL ON public.monthly_stats_snapshots TO service_role;
ALTER TABLE public.monthly_stats_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read monthly snapshots" ON public.monthly_stats_snapshots;
CREATE POLICY "Admins can read monthly snapshots"
ON public.monthly_stats_snapshots
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));