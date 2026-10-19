-- CampusBridge University Placement & Department No-Dues Intelligence Platform
-- Migration 0002: Enhanced Placement Policies, Notifications, System Audit, & Safe Public Verification

create table if not exists public.placement_policies (
  id uuid primary key default gen_random_uuid(),
  academic_year integer not null unique default 2026,
  regular_max_lpa numeric(6,2) not null default 7.99,
  dream_min_lpa numeric(6,2) not null default 8.00,
  dream_max_lpa numeric(6,2) not null default 14.99,
  super_dream_min_lpa numeric(6,2) not null default 15.00,
  allow_dream_after_regular boolean not null default true,
  allow_super_dream_after_dream boolean not null default true,
  max_offers_allowed integer not null default 3,
  strict_backlog_check boolean not null default true,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null check (type in ('info','success','warning','alert')),
  read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

create table if not exists public.system_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id),
  actor_name text not null,
  actor_role public.app_role not null,
  action text not null,
  target_type text not null,
  target_id text not null,
  old_value text,
  new_value text,
  details text not null,
  timestamp timestamptz not null default now()
);

-- Indexes
create index if not exists notifications_user_idx on public.notifications(user_id, read);
create index if not exists audit_timestamp_idx on public.system_audit_logs(timestamp desc);

-- Enable RLS
alter table public.placement_policies enable row level security;
alter table public.notifications enable row level security;
alter table public.system_audit_logs enable row level security;

-- Policies
create policy "all authenticated read placement policies" on public.placement_policies
for select to authenticated using (true);

create policy "admins manage placement policies" on public.placement_policies
for all to authenticated using (public.is_placement_admin()) with check (public.is_placement_admin());

create policy "users read own notifications" on public.notifications
for select to authenticated using (user_id = auth.uid() or public.is_placement_admin());

create policy "users update own notifications read state" on public.notifications
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "admins read system audit logs" on public.system_audit_logs
for select to authenticated using (public.is_placement_admin());

create policy "admins insert system audit logs" on public.system_audit_logs
for insert to authenticated with check (public.is_placement_admin());

-- Secure Public Verification RPC Function
-- Exposes ONLY safe, sanitized fields to unauthenticated and authenticated clients
create or replace function public.verify_certificate_public(token_hash text)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  cert_rec record;
begin
  select 
    c.id,
    c.verification_token_hash,
    c.issued_at,
    c.revoked_at,
    p.roll_number,
    p.full_name,
    d.name as department_name,
    p.graduation_year,
    issuer.full_name as issuer_name
  into cert_rec
  from public.certificates c
  join public.profiles p on p.id = c.student_id
  left join public.departments d on d.id = p.department_id
  join public.profiles issuer on issuer.id = c.issued_by
  where c.verification_token_hash = token_hash;

  if not found then
    return jsonb_build_object(
      'status', 'not_found',
      'valid', false,
      'message', 'Certificate token not found in the university registry.'
    );
  end if;

  if cert_rec.revoked_at is not null then
    return jsonb_build_object(
      'status', 'revoked',
      'valid', false,
      'message', 'Certificate was officially revoked by university administration.',
      'revoked_at', cert_rec.revoked_at,
      'roll_number', cert_rec.roll_number,
      'department_name', cert_rec.department_name
    );
  end if;

  return jsonb_build_object(
    'status', 'valid',
    'valid', true,
    'message', 'Authentic verified institutional clearance certificate.',
    'roll_number', cert_rec.roll_number,
    'student_name', cert_rec.full_name,
    'department_name', cert_rec.department_name,
    'graduation_year', cert_rec.graduation_year,
    'clearance_date', cert_rec.issued_at,
    'issuer_name', cert_rec.issuer_name,
    'verification_token', cert_rec.verification_token_hash
  );
end;
$$;

-- Grant execution to public anon role
grant execute on function public.verify_certificate_public(text) to anon, authenticated;
