-- MagentiaKnight HBD: fan upload → admin approve → gallery
-- Separate schema from mild_r; the app only talks to the public.* views below.

create schema if not exists magentia_knight;

create table if not exists magentia_knight.hbd_submissions (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  message text,
  contact_channel text not null
    check (contact_channel in ('x', 'discord')),
  contact_handle text not null,
  card_path text not null,
  card_url text not null,
  avatar_path text,
  avatar_url text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  approved_at timestamptz,
  reviewed_at timestamptz
);

create index if not exists magentia_hbd_submissions_status_created_idx
  on magentia_knight.hbd_submissions (status, created_at desc);

-- RLS on, no anon policies: contact fields stay private
alter table magentia_knight.hbd_submissions enable row level security;

revoke all on schema magentia_knight from anon, authenticated;
grant usage on schema magentia_knight to service_role;
revoke all on magentia_knight.hbd_submissions from anon, authenticated;
grant all on magentia_knight.hbd_submissions to service_role;

-- Storage: public read, service-role write
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'magentia-hbd-uploads',
  'magentia-hbd-uploads',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read magentia-hbd-uploads" on storage.objects;
create policy "Public read magentia-hbd-uploads"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'magentia-hbd-uploads');

drop policy if exists "Service role write magentia-hbd-uploads" on storage.objects;
create policy "Service role write magentia-hbd-uploads"
  on storage.objects
  for all
  to service_role
  using (bucket_id = 'magentia-hbd-uploads')
  with check (bucket_id = 'magentia-hbd-uploads');

-- Admin view (service role only — includes contact fields)
drop view if exists public.magentia_knight_hbd_submissions;
create view public.magentia_knight_hbd_submissions
with (security_invoker = true)
as
select
  id,
  display_name,
  message,
  contact_channel,
  contact_handle,
  card_path,
  card_url,
  avatar_path,
  avatar_url,
  status,
  created_at,
  approved_at,
  reviewed_at
from magentia_knight.hbd_submissions;

revoke all on public.magentia_knight_hbd_submissions from anon, authenticated;
grant all on public.magentia_knight_hbd_submissions to service_role;

-- Public gallery view: approved only, no contact fields.
-- Runs as owner so anon never needs access to the base table.
drop view if exists public.magentia_knight_hbd_wishes_public;
create view public.magentia_knight_hbd_wishes_public
with (security_invoker = false)
as
select
  id,
  display_name,
  message,
  card_url,
  avatar_url,
  status,
  created_at,
  approved_at
from magentia_knight.hbd_submissions
where status = 'approved';

revoke all on public.magentia_knight_hbd_wishes_public from anon, authenticated;
grant select on public.magentia_knight_hbd_wishes_public to anon, authenticated;
grant all on public.magentia_knight_hbd_wishes_public to service_role;

notify pgrst, 'reload schema';
