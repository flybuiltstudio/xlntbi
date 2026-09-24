-- One-time nonces for the weekly catalog audit cron call (replaces the shared secret)
create table if not exists public.cron_call_nonces (
  nonce text primary key,
  job text not null,
  created_at timestamptz not null default now()
);
grant all on public.cron_call_nonces to service_role;
alter table public.cron_call_nonces enable row level security;
-- No policies: only service_role (server code) and the cron job (postgres) can use it.

select cron.unschedule('weekly-catalog-audit')
where exists (select 1 from cron.job where jobname = 'weekly-catalog-audit');

select cron.schedule(
  'weekly-catalog-audit',
  '30 1 * * 0',
  $job$
  with n as (
    insert into public.cron_call_nonces (nonce, job)
    values (encode(extensions.gen_random_bytes(32), 'hex'), 'catalog-audit')
    returning nonce
  )
  select net.http_post(
    url := 'https://project--aaee68ce-f7c4-4a40-8d55-94b884c56206.lovable.app/api/public/katalogus-audit/cron?environment=live',
    headers := jsonb_build_object('content-type', 'application/json', 'x-cron-nonce', (select nonce from n)),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
  $job$
);

-- Per-order random checkout token, only handed to the browser that created the order
alter table public.orders
  add column if not exists checkout_token text not null default encode(extensions.gen_random_bytes(24), 'hex');