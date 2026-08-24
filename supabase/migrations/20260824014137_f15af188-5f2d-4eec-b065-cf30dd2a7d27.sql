alter table public.orders
  add column if not exists billingo_invoice_id integer,
  add column if not exists billingo_invoice_number text;

comment on column public.orders.billingo_invoice_id is 'Billingo számla azonosító (idempotencia: ha ki van töltve, már számlázva van)';
comment on column public.orders.billingo_invoice_number is 'Billingo számla sorszáma';