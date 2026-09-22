-- Both override tables are read server-side with the trusted client only,
-- so anonymous/authenticated blanket reads are no longer needed.
DROP POLICY IF EXISTS "Anyone can read calculator overrides" ON public.calculator_overrides;
DROP POLICY IF EXISTS "product_price_overrides_public_read" ON public.product_price_overrides;

REVOKE SELECT ON public.calculator_overrides FROM anon;
REVOKE SELECT ON public.product_price_overrides FROM anon;

GRANT ALL ON public.calculator_overrides TO service_role;
GRANT ALL ON public.product_price_overrides TO service_role;

COMMENT ON TABLE public.calculator_overrides IS 'Server-read only (service role). Public calculator markup is delivered through the getCalculatorOverride server function.';
COMMENT ON TABLE public.product_price_overrides IS 'Server-read only (service role). Public prices are delivered through readProductOverrides.';
