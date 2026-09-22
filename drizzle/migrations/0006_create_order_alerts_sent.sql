CREATE TABLE public.order_alerts_sent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL,
  alert_type text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (alert_type, order_number)
);

GRANT ALL ON public.order_alerts_sent TO service_role;

ALTER TABLE public.order_alerts_sent ENABLE ROW LEVEL SECURITY;
