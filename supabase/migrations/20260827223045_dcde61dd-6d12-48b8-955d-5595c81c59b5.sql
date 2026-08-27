ALTER TABLE public.admin_coupons
  ADD COLUMN IF NOT EXISTS last_synced_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS stripe_active boolean,
  ADD COLUMN IF NOT EXISTS times_redeemed integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'admin';

-- Deduplicate before adding the uniqueness guarantee (keep the newest row).
DELETE FROM public.admin_coupons a
USING public.admin_coupons b
WHERE a.environment = b.environment
  AND upper(a.code) = upper(b.code)
  AND (a.created_at, a.id) < (b.created_at, b.id);

ALTER TABLE public.admin_coupons
  ADD CONSTRAINT admin_coupons_env_code_key UNIQUE (environment, code);