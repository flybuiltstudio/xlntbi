CREATE TABLE public.newsletter_blocklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  note TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.newsletter_blocklist TO service_role;

ALTER TABLE public.newsletter_blocklist ENABLE ROW LEVEL SECURITY;
