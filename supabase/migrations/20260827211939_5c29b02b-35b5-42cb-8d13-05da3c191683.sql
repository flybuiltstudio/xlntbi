CREATE TABLE public.coupon_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  environment text NOT NULL DEFAULT 'live',
  outcome text NOT NULL DEFAULT 'invalid',
  reason_code text NOT NULL DEFAULT 'unknown',
  message text NOT NULL DEFAULT '',
  detail text,
  email text,
  order_number text,
  amount integer,
  price_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.coupon_attempts TO authenticated;
GRANT ALL ON public.coupon_attempts TO service_role;

ALTER TABLE public.coupon_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view coupon attempts"
ON public.coupon_attempts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX coupon_attempts_created_at_idx ON public.coupon_attempts (created_at DESC);

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS coupon_code text,
  ADD COLUMN IF NOT EXISTS discount_amount integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS original_amount integer;