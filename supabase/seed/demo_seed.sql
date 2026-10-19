-- CampusBridge — University Placement & Department No-Dues Intelligence Platform
-- DEMONSTRATION SEED DATA ONLY. Do not apply directly to production.

-- 1. Institutional Departments (CSE, ECE, MECH)
insert into public.departments (id, code, name) values
  ('a0000000-0000-0000-0000-000000000001', 'CSE', 'Computer Science & Engineering'),
  ('a0000000-0000-0000-0000-000000000002', 'ECE', 'Electronics & Communication Engineering'),
  ('a0000000-0000-0000-0000-000000000003', 'MECH', 'Mechanical Engineering')
on conflict (code) do update set name = excluded.name;

-- 2. Clearance Categories
insert into public.clearance_categories (id, code, name, mandatory, active, sort_order) values
  ('b0000000-0000-0000-0000-000000000001', 'LIBRARY', 'Central Library', true, true, 1),
  ('b0000000-0000-0000-0000-000000000002', 'LAB', 'Laboratory & Equipment', true, true, 2),
  ('b0000000-0000-0000-0000-000000000003', 'DEPARTMENT', 'Academic Department', true, true, 3),
  ('b0000000-0000-0000-0000-000000000004', 'PLACEMENT', 'Placement Cell', true, true, 4),
  ('b0000000-0000-0000-0000-000000000005', 'ACCOUNTS', 'Finance & Accounts', true, true, 5),
  ('b0000000-0000-0000-0000-000000000006', 'HOSTEL', 'Hostel & Mess', false, true, 6)
on conflict (code) do update set name = excluded.name, mandatory = excluded.mandatory;

-- 3. Institutional Companies
insert into public.companies (id, name, website) values
  ('c0000000-0000-0000-0000-000000000001', 'Acme Technologies', 'https://acme.example.com'),
  ('c0000000-0000-0000-0000-000000000002', 'Northstar Systems', 'https://northstar.example.com'),
  ('c0000000-0000-0000-0000-000000000003', 'BluePeak Analytics', 'https://bluepeak.example.com'),
  ('c0000000-0000-0000-0000-000000000004', 'Vertex Engineering', 'https://vertex.example.com'),
  ('c0000000-0000-0000-0000-000000000005', 'Greenfield Digital', 'https://greenfield.example.com'),
  ('c0000000-0000-0000-0000-000000000006', 'Apex Semiconductor', 'https://apexsemi.example.com')
on conflict (name) do nothing;

-- 4. Recruitment Drives with Packages and Tiers
insert into public.recruitment_drives (
  id, company_id, title, job_role, min_cgpa, max_active_backlogs, skills, 
  registration_deadline, location, package_lpa, tier, status
) values
  (
    'd0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'Software Development Engineer - I',
    'SDE-1 (Full Stack)',
    7.5,
    0,
    array['React', 'Node.js', 'SQL', 'Algorithms'],
    now() + interval '14 days',
    'Bengaluru, India',
    14.50,
    'dream',
    'in_progress'
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000002',
    'Cloud DevOps Associate',
    'Cloud DevOps Engineer',
    7.0,
    0,
    array['Linux', 'Docker', 'AWS', 'Python'],
    now() + interval '20 days',
    'Hyderabad, India',
    9.20,
    'dream',
    'open'
  ),
  (
    'd0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000003',
    'Quantitative Research Analyst',
    'Quant & AI Researcher',
    8.5,
    0,
    array['Python', 'Linear Algebra', 'Pandas', 'Financial Modeling'],
    now() + interval '25 days',
    'Mumbai, India',
    18.00,
    'super_dream',
    'open'
  ),
  (
    'd0000000-0000-0000-0000-000000000004',
    'c0000000-0000-0000-0000-000000000004',
    'Robotics Hardware & Control Trainee',
    'Mechatronics Engineer',
    6.5,
    1,
    array['CAD', 'C++', 'Microcontrollers'],
    now() + interval '30 days',
    'Pune, India',
    7.20,
    'regular',
    'open'
  ),
  (
    'd0000000-0000-0000-0000-000000000005',
    'c0000000-0000-0000-0000-000000000005',
    'Associate Frontend Developer',
    'Mobile & Web Developer',
    6.0,
    2,
    array['JavaScript', 'HTML/CSS', 'Git'],
    now() - interval '5 days',
    'Chennai, India',
    6.50,
    'regular',
    'completed'
  )
on conflict do nothing;

-- 5. Placement Policy Default
insert into public.placement_policies (
  academic_year, regular_max_lpa, dream_min_lpa, dream_max_lpa, super_dream_min_lpa, 
  allow_dream_after_regular, max_offers_allowed, strict_backlog_check
) values (
  2026, 7.99, 8.00, 14.99, 15.00, true, 3, true
) on conflict (academic_year) do nothing;

-- NOTE FOR DEMO USER PROVISIONING:
-- To link authenticated demo users in Supabase Auth:
-- 1. Create users in Supabase Studio > Authentication > Users (e.g. admin@campusbridge.edu, student.a@campusbridge.edu)
-- 2. Retrieve their generated auth.users UUIDs.
-- 3. Run:
--    insert into public.profiles (id, role, roll_number, full_name, department_id, graduation_year, university_email, cgpa)
--    values ('<AUTH_USER_UUID>', 'placement_admin', 'FAC001', 'Dr. Arvind Sharma', 'a0000000-0000-0000-0000-000000000001', 2026, 'admin@campusbridge.edu', 9.8);
