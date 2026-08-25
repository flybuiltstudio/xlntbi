CREATE TABLE public.billingo_invoice_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  billingo_invoice_id integer NOT NULL,
  invoice_number text,
  invoice_type text,
  currency text,
  invoice_date date,
  fulfillment_date date,
  payment_method text,
  paid boolean,
  net_total numeric,
  gross_total numeric,
  vat_total numeric,
  vat_labels text[],
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  raw jsonb,
  fetched_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX billingo_invoice_snapshots_invoice_idx
  ON public.billingo_invoice_snapshots (billingo_invoice_id);
CREATE INDEX billingo_invoice_snapshots_order_idx
  ON public.billingo_invoice_snapshots (order_id);

GRANT SELECT ON public.billingo_invoice_snapshots TO authenticated;
GRANT ALL ON public.billingo_invoice_snapshots TO service_role;

ALTER TABLE public.billingo_invoice_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view invoice snapshots"
ON public.billingo_invoice_snapshots
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));