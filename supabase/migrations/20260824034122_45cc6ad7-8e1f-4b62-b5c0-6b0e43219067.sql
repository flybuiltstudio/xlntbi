create table public.calculator_overrides (
  key text primary key,
  html text not null,
  script text not null default '',
  file_name text not null default '',
  updated_by uuid,
  updated_at timestamp with time zone not null default now()
);

grant select on public.calculator_overrides to anon, authenticated;
grant all on public.calculator_overrides to service_role;

alter table public.calculator_overrides enable row level security;

create policy "Anyone can read calculator overrides"
  on public.calculator_overrides
  for select
  to anon, authenticated
  using (true);