create table if not exists public.product_file_versions (
  product_slug text primary key,
  file_name text not null,
  size bigint,
  uploaded_by uuid,
  uploaded_at timestamptz not null default now()
);

grant all on public.product_file_versions to service_role;
grant select on public.product_file_versions to authenticated;

alter table public.product_file_versions enable row level security;

drop policy if exists "Admins can read product file versions" on public.product_file_versions;
create policy "Admins can read product file versions"
on public.product_file_versions
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));