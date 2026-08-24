CREATE TABLE public.billingo_invoice_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  order_number text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'webhook',
  status text NOT NULL DEFAULT 'success',
  billingo_invoice_id integer,
  invoice_number text,
  error_code text,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.billingo_invoice_logs TO authenticated;
GRANT ALL ON public.billingo_invoice_logs TO service_role;

ALTER TABLE public.billingo_invoice_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view invoice logs"
ON public.billingo_invoice_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX billingo_invoice_logs_created_at_idx ON public.billingo_invoice_logs (created_at DESC);
CREATE INDEX billingo_invoice_logs_order_id_idx ON public.billingo_invoice_logs (order_id);