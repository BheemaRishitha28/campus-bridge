-- ============================================================================
-- Migration: 0003_interviews_and_verifications.sql
-- Description: Creates Interview Management, College ID Verification Requests,
--              and External College Dues Portal receipt tables with RLS policies.
-- ============================================================================

-- 1. INTERVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
    drive_id UUID REFERENCES public.recruitment_drives(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    job_role TEXT NOT NULL,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_roll TEXT NOT NULL,
    round_number INTEGER NOT NULL DEFAULT 1,
    round_name TEXT NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 45,
    mode TEXT NOT NULL CHECK (mode IN ('online', 'offline')),
    meet_link TEXT,
    venue TEXT,
    interviewer_name TEXT,
    instructions TEXT,
    student_acknowledgment TEXT NOT NULL DEFAULT 'pending' CHECK (student_acknowledgment IN ('pending', 'acknowledged', 'reschedule_requested')),
    reschedule_reason TEXT,
    outcome TEXT NOT NULL DEFAULT 'pending' CHECK (outcome IN ('pending', 'cleared', 'rejected', 'absent', 'rescheduled')),
    feedback TEXT,
    score NUMERIC(5, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_interviews_student_id ON public.interviews(student_id);
CREATE INDEX IF NOT EXISTS idx_interviews_drive_id ON public.interviews(drive_id);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_date ON public.interviews(scheduled_date);

-- Enable RLS
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

-- Students can view only their own scheduled interviews
CREATE POLICY "Students can view own interviews"
    ON public.interviews FOR SELECT
    USING (
        student_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'placement_admin'
        )
    );

-- Students can update attendance acknowledgment on their own interviews
CREATE POLICY "Students can acknowledge own interviews"
    ON public.interviews FOR UPDATE
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

-- Placement administrators can manage all interviews
CREATE POLICY "Admins full management on interviews"
    ON public.interviews FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'placement_admin'
        )
    );

-- 2. COLLEGE ID VERIFICATION REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.college_id_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('student', 'faculty')),
    full_name TEXT NOT NULL,
    university_email TEXT NOT NULL,
    roll_or_emp_id TEXT NOT NULL,
    department_code TEXT NOT NULL,
    program TEXT,
    year_of_study INTEGER,
    cgpa NUMERIC(4, 2),
    id_card_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewer_name TEXT,
    reviewer_remarks TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_verifications_status ON public.college_id_verifications(status);
CREATE INDEX IF NOT EXISTS idx_verifications_email ON public.college_id_verifications(university_email);
CREATE INDEX IF NOT EXISTS idx_verifications_roll ON public.college_id_verifications(roll_or_emp_id);

-- Enable RLS
ALTER TABLE public.college_id_verifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own verification request
CREATE POLICY "Users can view own verification request"
    ON public.college_id_verifications FOR SELECT
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'placement_admin'
        )
    );

-- Users can submit their own verification request
CREATE POLICY "Users can submit own verification request"
    ON public.college_id_verifications FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Administrators can review and update all verification requests
CREATE POLICY "Admins can review verifications"
    ON public.college_id_verifications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'placement_admin'
        )
    );

-- 3. EXTERNAL DUES CONFIG & RECEIPTS TABLE
CREATE TABLE IF NOT EXISTS public.external_dues_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portal_name TEXT NOT NULL DEFAULT 'Official State University Payment Gateway (SBI Collect)',
    portal_url TEXT NOT NULL DEFAULT 'https://www.onlinesbi.sbi/sbicollect/icollecthome.htm',
    instructions TEXT NOT NULL,
    support_email TEXT NOT NULL DEFAULT 'accounts.feecell@campus.edu',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.external_payment_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_roll TEXT NOT NULL,
    category_id UUID REFERENCES public.clearance_categories(id) ON DELETE CASCADE,
    category_name TEXT NOT NULL,
    transaction_ref TEXT NOT NULL,
    amount_paid NUMERIC(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    receipt_filename TEXT,
    receipt_preview_url TEXT,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'verified', 'rejected')),
    faculty_remarks TEXT,
    verified_by TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    verified_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payment_receipts_student ON public.external_payment_receipts(student_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_status ON public.external_payment_receipts(status);

ALTER TABLE public.external_payment_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view and submit own payment receipts"
    ON public.external_payment_receipts FOR ALL
    USING (
        student_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'placement_admin'
        )
    );

-- End of migration 0003
