grant select on public.contact_submissions to authenticated;
grant all on public.contact_submissions to service_role;

create policy "Admins can view contact submissions"
  on public.contact_submissions
  for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'::app_role));