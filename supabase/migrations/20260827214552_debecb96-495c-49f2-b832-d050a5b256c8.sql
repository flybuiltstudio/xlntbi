CREATE TABLE public.admin_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  environment text NOT NULL CHECK (environment IN ('sandbox','live')),
  expires_at timestamptz,
  discount_type text NOT NULL CHECK (discount_type IN ('percent','amount')),
  percent_off integer,
  amount_off integer,
  currency text NOT NULL DEFAULT 'huf',
  product_slugs text[] NOT NULL DEFAULT '{}',
  all_products boolean NOT NULL DEFAULT true,
  max_redemptions integer,
  min_amount integer,
  stripe_coupon_id text NOT NULL,
  stripe_promotion_code_id text NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  disabled_at timestamptz,
  UNIQUE (code, environment)
);

GRANT SELECT ON public.admin_coupons TO authenticated;
GRANT ALL ON public.admin_coupons TO service_role;

ALTER TABLE public.admin_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin coupons"
  ON public.admin_coupons
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX admin_coupons_env_code_idx ON public.admin_coupons (environment, code);