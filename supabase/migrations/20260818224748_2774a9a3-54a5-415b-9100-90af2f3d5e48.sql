CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number text NOT NULL UNIQUE,
  product_slug text NOT NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price integer NOT NULL,
  total_price integer NOT NULL,
  currency text NOT NULL DEFAULT 'HUF',
  billing_name text NOT NULL,
  company_name text,
  tax_number text,
  country text NOT NULL,
  postal_code text NOT NULL,
  city text NOT NULL,
  address_line text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  note text,
  status text NOT NULL DEFAULT 'new',
  payment_status text NOT NULL DEFAULT 'unpaid',
  payment_provider text,
  payment_reference text,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE INDEX orders_ip_created_idx ON public.orders (ip_address, created_at DESC);
CREATE INDEX orders_created_idx ON public.orders (created_at DESC);

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();