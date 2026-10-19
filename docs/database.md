# CampusBridge — Database Schema & Relational Architecture

## 1. Relational Entity Overview

```text
               +-----------------+
               |   auth.users    |
               +--------+--------+
                        | (1:1 cascade)
               +--------v--------+         +-----------------+
               |    profiles     +--------->   departments   |
               +---+----+----+---+         +-----------------+
                   |    |    |
    +--------------+    |    +-------------------------+
    |                   |                              |
+---v-------------+  +--v------------------+  +--------v-------------+
|  applications   |  |  student_clearances |  |     certificates     |
+---+--------+----+  +--+------------------+  +----------------------+
    |        |          |
    |        |       +--v------------------+
    |        |       | clearance_categories|
    |        |       +---------------------+
    |   +----v----+
    |   | offers  |
    |   +---------+
+---v----------------+
| recruitment_drives |
+---+----------------+
    |
+---v-------+
| companies |
+-----------+
```

## 2. Table Specifications

### `public.departments`
- `id` (UUID, PK)
- `code` (Text, Unique): e.g. `'CSE'`, `'ECE'`, `'MECH'`
- `name` (Text): Full academic title
- `created_at` (Timestamptz)

### `public.profiles`
- `id` (UUID, PK, references `auth.users`)
- `role` (`public.app_role`: `'placement_admin'`, `'student'`)
- `roll_number` (Text, Unique): Institutional roll identifier
- `full_name` (Text)
- `department_id` (UUID, references `departments`)
- `program` (Text): e.g. `'B.Tech'`
- `year_of_study` (Smallint, 1–6)
- `section` (Text)
- `graduation_year` (Integer, 2000–2100)
- `university_email` (Text)
- `cgpa` (Numeric 4,2, 0.00–10.00)
- `active` (Boolean)
- `placement_registered` (Boolean)

### `public.companies`
- `id` (UUID, PK)
- `name` (Text, Unique)
- `website` (Text)
- `created_at` (Timestamptz)

### `public.recruitment_drives`
- `id` (UUID, PK)
- `company_id` (UUID, references `companies`)
- `title` (Text)
- `job_role` (Text)
- `eligible_department_ids` (UUID[])
- `eligible_graduation_years` (Integer[])
- `min_cgpa` (Numeric 4,2)
- `max_active_backlogs` (Integer)
- `skills` (Text[])
- `registration_deadline` (Timestamptz)
- `stages` (Text[])
- `location` (Text)
- `package_lpa` (Numeric 8,2)
- `tier` (Text: `'regular'`, `'dream'`, `'super_dream'`)
- `status` (`public.drive_status`: `'planned'`, `'open'`, `'in_progress'`, `'completed'`, `'cancelled'`)

### `public.applications`
- `id` (UUID, PK)
- `student_id` (UUID, references `profiles`)
- `drive_id` (UUID, references `recruitment_drives`)
- `stage` (`public.application_stage`: `'registered'`, `'eligibility_verified'`, `'shortlisted'`, `'assessment_completed'`, `'interview_in_progress'`, `'selected'`, `'offer_received'`, `'joined'`, `'rejected'`, `'withdrawn'`)
- `eligibility_note` (Text)
- `applied_at` (Timestamptz)
- `updated_at` (Timestamptz)
- **Constraint**: `UNIQUE(student_id, drive_id)`

### `public.offers`
- `id` (UUID, PK)
- `application_id` (UUID, references `applications`)
- `offer_reference` (Text)
- `package_lpa` (Numeric 8,2)
- `currency` (Text, default `'INR'`)
- `offer_date` (Date)
- `accepted` (Boolean)
- `joined_at` (Date)
- **Constraint**: `UNIQUE(application_id, offer_reference)`

### `public.clearance_categories`
- `id` (UUID, PK)
- `code` (Text, Unique): `'LIBRARY'`, `'LAB'`, `'DEPARTMENT'`, `'PLACEMENT'`, `'ACCOUNTS'`, `'HOSTEL'`
- `name` (Text)
- `mandatory` (Boolean, default `true`)
- `active` (Boolean, default `true`)
- `sort_order` (Integer)

### `public.student_clearances`
- `id` (UUID, PK)
- `student_id` (UUID, references `profiles`)
- `category_id` (UUID, references `clearance_categories`)
- `status` (`public.clearance_status`: `'pending'`, `'cleared'`, `'not_applicable'`, `'rejected'`)
- `remarks` (Text)
- `pending_requirement` (Text)
- `updated_by` (UUID, references `profiles`)
- `updated_at` (Timestamptz)
- **Constraint**: `UNIQUE(student_id, category_id)`

### `public.certificates`
- `id` (UUID, PK)
- `student_id` (UUID, references `profiles`)
- `verification_token_hash` (Text, Unique)
- `issued_by` (UUID, references `profiles`)
- `issued_at` (Timestamptz)
- `revoked_at` (Timestamptz, nullable)
- `snapshot` (JSONB)

### `public.placement_policies`
- `id` (UUID, PK)
- `academic_year` (Integer, Unique)
- `regular_max_lpa` (Numeric 6,2)
- `dream_min_lpa` (Numeric 6,2)
- `dream_max_lpa` (Numeric 6,2)
- `super_dream_min_lpa` (Numeric 6,2)
- `allow_dream_after_regular` (Boolean)
- `max_offers_allowed` (Integer)

### `public.notifications`
- `id` (UUID, PK)
- `user_id` (UUID, references `profiles`)
- `title` (Text)
- `message` (Text)
- `type` (Text: `'info'`, `'success'`, `'warning'`, `'alert'`)
- `read` (Boolean)
- `link` (Text)
- `created_at` (Timestamptz)

### `public.system_audit_logs`
- `id` (UUID, PK)
- `actor_id` (UUID, references `profiles`)
- `actor_name` (Text)
- `actor_role` (Text)
- `action` (Text)
- `target_type` (Text)
- `target_id` (Text)
- `old_value` (Text)
- `new_value` (Text)
- `details` (Text)
- `timestamp` (Timestamptz)

### `public.interviews`
- `id` (UUID, PK)
- `application_id` (UUID, references `applications`)
- `drive_id` (UUID, references `recruitment_drives`)
- `company_name` (Text)
- `job_role` (Text)
- `student_id` (UUID, references `profiles`)
- `round_number` (Integer)
- `round_name` (Text)
- `scheduled_date` (Date)
- `scheduled_time` (Time)
- `duration_minutes` (Integer)
- `mode` (Text: `'online'`, `'offline'`)
- `meet_link` (Text)
- `venue` (Text)
- `interviewer_name` (Text)
- `instructions` (Text)
- `student_acknowledgment` (Text: `'pending'`, `'acknowledged'`, `'reschedule_requested'`)
- `reschedule_reason` (Text)
- `outcome` (Text: `'pending'`, `'cleared'`, `'rejected'`, `'absent'`, `'rescheduled'`)
- `feedback` (Text)
- `score` (Numeric 5,2)

### `public.college_id_verifications`
- `id` (UUID, PK)
- `user_id` (UUID, references `auth.users`)
- `type` (Text: `'student'`, `'faculty'`)
- `full_name` (Text)
- `university_email` (Text)
- `roll_or_emp_id` (Text)
- `department_code` (Text)
- `id_card_url` (Text)
- `status` (Text: `'pending'`, `'approved'`, `'rejected'`)
- `reviewer_name` (Text)
- `reviewer_remarks` (Text)
- `submitted_at` (Timestamptz)
- `reviewed_at` (Timestamptz)

### `public.external_payment_receipts`
- `id` (UUID, PK)
- `student_id` (UUID, references `profiles`)
- `category_id` (UUID, references `clearance_categories`)
- `transaction_ref` (Text): DU Reference / UTR Number
- `amount_paid` (Numeric 10,2)
- `payment_date` (Date)
- `receipt_filename` (Text)
- `status` (Text: `'submitted'`, `'verified'`, `'rejected'`)
- `faculty_remarks` (Text)
- `verified_by` (Text)

## 3. Server-Side Clearance Rule

```sql
create or replace function public.is_student_fully_cleared(p_student_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.clearance_categories c
    left join public.student_clearances sc
      on sc.category_id = c.id and sc.student_id = p_student_id
    where c.active and c.mandatory
      and (sc.id is null or sc.status not in ('cleared', 'not_applicable'))
  );
$$;
```
