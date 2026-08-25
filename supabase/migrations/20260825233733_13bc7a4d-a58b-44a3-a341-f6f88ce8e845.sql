ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS license_sent_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS license_key text;