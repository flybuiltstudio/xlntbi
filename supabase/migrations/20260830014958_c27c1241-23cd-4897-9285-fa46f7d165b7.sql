create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select cron.unschedule('weekly-catalog-audit')
where exists (select 1 from cron.job where jobname = 'weekly-catalog-audit');

select cron.schedule(
  'weekly-catalog-audit',
  '0 3 * * 1',
  $$
  select net.http_post(
    url := 'https://project--aaee68ce-f7c4-4a40-8d55-94b884c56206.lovable.app/api/public/katalogus-audit/cron?environment=live',
    headers := jsonb_build_object(
      'content-type', 'application/json',
      'x-cron-secret', '96a316ff807cbb8a2ad314d0cadafcf2e4fc5b8f64606635'
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);