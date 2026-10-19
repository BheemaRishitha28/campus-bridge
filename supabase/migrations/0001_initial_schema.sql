-- University Placement & Department No-Dues Portal
-- Apply to a fresh development Supabase project. Review security policies before production.

create extension if not exists pgcrypto;

create type public.app_role as enum ('placement_admin', 'student');
create type public.drive_status as enum ('planned', 'open', 'in_progress', 'completed', 'cancelled');
create type public.application_stage as enum (
  'registered', 'eligibility_verified', 'shortlisted', 'assessment_completed',
  'interview_in_progress', 'selected', 'offer_received', 'joined', 'rejected', 'withdrawn'
);
create type public.clearance_status as enum ('pending', 'cleared', 'not_applicable', 'rejected');

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'student',
  roll_number text unique,
  full_name text not null,
  department_id uuid references public.departments(id),
  program text,
  year_of_study smallint check (year_of_study between 1 and 6),
  section text,
  graduation_year integer check (graduation_year between 2000 and 2100),
  university_email text,
  cgpa numeric(4,2) check (cgpa between 0 and 10),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_profile_fields check (role <> 'student' or roll_number is not null)
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  website text,
  created_at timestamptz not null default now()
);

create table public.recruitment_drives (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  title text not null,
  job_role text not null,
  eligible_department_ids uuid[] not null default '{}',
  eligible_graduation_years integer[] not null default '{}',
  min_cgpa numeric(4,2) check (min_cgpa between 0 and 10),
  max_active_backlogs integer check (max_active_backlogs >= 0),
  skills text[] not null default '{}',
  registration_deadline timestamptz,
  stages text[] not null default array['Registered','Eligibility Verified','Shortlisted','Assessment','Interview','Outcome'],
  location text,
  package_lpa numeric(8,2) check (package_lpa >= 0),
  tier text check (tier in ('regular','dream','super_dream')),
  status public.drive_status not null default 'planned',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id),
  drive_id uuid not null references public.recruitment_drives(id),
  stage public.application_stage not null default 'registered',
  eligibility_note text,
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  outcome_updated_by uuid references public.profiles(id),
  unique(student_id, drive_id)
);

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id),
  offer_reference text,
  package_lpa numeric(8,2) check (package_lpa >= 0),
  currency text not null default 'INR',
  offer_date date,
  accepted boolean,
  joined_at date,
  created_at timestamptz not null default now(),
  unique(application_id, offer_reference)
);

create table public.clearance_categories (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  mandatory boolean not null default true,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.student_clearances (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id),
  category_id uuid not null references public.clearance_categories(id),
  status public.clearance_status not null default 'pending',
  remarks text,
  pending_requirement text,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now(),
  unique(student_id, category_id)
);

create table public.clearance_audit_log (
  id uuid primary key default gen_random_uuid(),
  clearance_id uuid not null references public.student_clearances(id),
  student_id uuid not null references public.profiles(id),
  category_id uuid not null references public.clearance_categories(id),
  changed_by uuid not null references public.profiles(id),
  old_status public.clearance_status,
  new_status public.clearance_status not null,
  old_remarks text,
  new_remarks text,
  changed_at timestamptz not null default now()
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id),
  verification_token_hash text not null unique,
  issued_by uuid not null references public.profiles(id),
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  snapshot jsonb not null
);

create table public.import_batches (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id),
  file_name text not null,
  status text not null check (status in ('previewed','committed','failed','cancelled')),
  total_rows integer not null default 0,
  valid_rows integer not null default 0,
  invalid_rows integer not null default 0,
  duplicate_rows integer not null default 0,
  created_at timestamptz not null default now(),
  committed_at timestamptz
);

create table public.import_row_errors (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.import_batches(id) on delete cascade,
  row_number integer not null,
  roll_number text,
  error_code text not null,
  message text not null
);

create index profiles_department_batch_idx on public.profiles(department_id, graduation_year);
create index applications_student_idx on public.applications(student_id);
create index applications_drive_stage_idx on public.applications(drive_id, stage);
create index clearances_student_status_idx on public.student_clearances(student_id, status);
create index audit_student_time_idx on public.clearance_audit_log(student_id, changed_at desc);

-- Helper functions. SECURITY DEFINER functions must have a fixed search_path.
create or replace function public.current_app_role()
returns public.app_role
language sql stable security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_placement_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce(public.current_app_role() = 'placement_admin', false)
$$;

-- Profile self-read; admins may read all profiles. Students cannot change their role/roll number via this policy.
alter table public.departments enable row level security;
alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.recruitment_drives enable row level security;
alter table public.applications enable row level security;
alter table public.offers enable row level security;
alter table public.clearance_categories enable row level security;
alter table public.student_clearances enable row level security;
alter table public.clearance_audit_log enable row level security;
alter table public.certificates enable row level security;
alter table public.import_batches enable row level security;
alter table public.import_row_errors enable row level security;

create policy "authenticated users read departments" on public.departments
for select to authenticated using (true);

create policy "students read own profile, admins read all" on public.profiles
for select to authenticated using (id = auth.uid() or public.is_placement_admin());

create policy "admins insert profiles" on public.profiles
for insert to authenticated with check (public.is_placement_admin());

create policy "admins update profiles" on public.profiles
for update to authenticated using (public.is_placement_admin()) with check (public.is_placement_admin());

create policy "authenticated read companies" on public.companies
for select to authenticated using (true);
create policy "admins manage companies" on public.companies
for all to authenticated using (public.is_placement_admin()) with check (public.is_placement_admin());

create policy "authenticated read open and relevant drives" on public.recruitment_drives
for select to authenticated using (status in ('open','in_progress') or public.is_placement_admin());
create policy "admins manage drives" on public.recruitment_drives
for all to authenticated using (public.is_placement_admin()) with check (public.is_placement_admin());

create policy "students read own applications, admins all" on public.applications
for select to authenticated using (student_id = auth.uid() or public.is_placement_admin());
create policy "students apply for self, admins manage" on public.applications
for insert to authenticated with check (student_id = auth.uid() or public.is_placement_admin());
create policy "admins update applications" on public.applications
for update to authenticated using (public.is_placement_admin()) with check (public.is_placement_admin());

create policy "students read own offers, admins all" on public.offers
for select to authenticated using (
  public.is_placement_admin() or exists (
    select 1 from public.applications a where a.id = application_id and a.student_id = auth.uid()
  )
);
create policy "admins manage offers" on public.offers
for all to authenticated using (public.is_placement_admin()) with check (public.is_placement_admin());

create policy "authenticated read active clearance categories" on public.clearance_categories
for select to authenticated using (active or public.is_placement_admin());
create policy "admins manage clearance categories" on public.clearance_categories
for all to authenticated using (public.is_placement_admin()) with check (public.is_placement_admin());

create policy "students read own clearances, admins all" on public.student_clearances
for select to authenticated using (student_id = auth.uid() or public.is_placement_admin());
create policy "admins manage clearances" on public.student_clearances
for all to authenticated using (public.is_placement_admin()) with check (public.is_placement_admin());

create policy "admins read audit logs" on public.clearance_audit_log
for select to authenticated using (public.is_placement_admin());
create policy "admins insert audit logs" on public.clearance_audit_log
for insert to authenticated with check (public.is_placement_admin() and changed_by = auth.uid());

create policy "students read own certificate metadata, admins all" on public.certificates
for select to authenticated using (student_id = auth.uid() or public.is_placement_admin());
create policy "admins manage certificates" on public.certificates
for all to authenticated using (public.is_placement_admin()) with check (public.is_placement_admin());

create policy "admins read import batches" on public.import_batches
for select to authenticated using (public.is_placement_admin());
create policy "admins manage import batches" on public.import_batches
for all to authenticated using (public.is_placement_admin()) with check (public.is_placement_admin());
create policy "admins read import errors" on public.import_row_errors
for select to authenticated using (public.is_placement_admin());
create policy "admins manage import errors" on public.import_row_errors
for all to authenticated using (public.is_placement_admin()) with check (public.is_placement_admin());

-- NOTE: This is a security baseline, not a final security audit.
-- For production, add immutable audit triggers, stricter field-level profile update handling,
-- secure RPCs for role assignment/import commit/certificate issue, and automated RLS tests.
