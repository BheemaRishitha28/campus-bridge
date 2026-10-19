# Debugging Guide

## Vite cannot start
- Confirm Node.js and npm are installed: `node -v`, `npm -v`.
- Run `npm install`.
- Ensure the terminal is in the folder containing `package.json`.
- Check whether the configured port is already in use.

## Supabase is not configured
- Check `.env.local` exists at project root.
- Verify variable names begin with `VITE_`.
- Restart the Vite server after changing environment variables.
- Do not add service-role secrets to `.env.local` for browser use.

## 401 / session is null
- Confirm Auth user exists and email is verified if required.
- Check Supabase URL/key and redirect URLs.
- Confirm a `profiles` row exists for the exact `auth.users.id`.

## 403 / empty results
- Inspect the current user's role in the profile row.
- Check RLS policies and query filters.
- Test with a second student to confirm data isolation.
- Do not “fix” RLS by enabling unrestricted access.

## Duplicate roll number
- Treat database unique constraints as authoritative.
- Return a row-level conflict; never overwrite automatically.
- Check both duplicate rows inside the upload and existing database records.

## Metrics are wrong
- Confirm whether the metric counts offer rows or distinct students.
- Check drive cancellation and application rejection/withdrawal filters.
- Verify batch, department, company and eligibility denominator are consistent.
- Compare with a small hand-calculated fixture.

## No-dues incorrectly shows cleared
- Check all active mandatory categories, including categories with missing clearance rows.
- Ensure the frontend is not trusting a cached client-calculated status.
- Check that `not_applicable` is only set by an authorised approver.
- Add a regression test for one pending category.

## Certificate verification leaks information
- Remove broad public SELECT policies.
- Return a fixed allowlist from the verification function.
- Hash stored tokens and check revocation.
- Never query by roll number in the public verifier.

## Debugging workflow
1. Reproduce with a small test case.
2. Read the exact error and stack trace.
3. Identify the failing layer (UI, network, RLS, SQL, function).
4. Fix the root cause, not only the visible symptom.
5. Add a regression test.
6. Re-run build, unit tests, and the relevant acceptance test.
