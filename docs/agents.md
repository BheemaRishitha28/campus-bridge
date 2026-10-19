# Agents, AI Tools, and Contributor Workflow

This file defines how a developer or coding assistant should work in this repository. It is not a runtime AI agent system.

## Non-negotiable instructions
1. Read `README.md`, `docs/prd.md`, `docs/architecture.md`, and `docs/authentication-and-security.md` before changing code.
2. Do not invent features or mark incomplete features as done.
3. Do not replace database-backed behaviour with localStorage or hardcoded success states.
4. Do not expose secrets or add service-role keys to frontend code.
5. Every schema change must include a migration and updated database documentation.
6. Every permission-sensitive feature needs positive and negative tests.
7. Keep UI sample data clearly labelled and separate from production queries.
8. Ask before changing the agreed stack or domain rules.
9. Prefer small, reviewable changes with a clear test plan.
10. Never seed real student data or real credentials.

## Suggested agent roles (human-supervised)
- Product analyst: convert requirements into testable acceptance criteria.
- Frontend engineer: implement accessible React screens and loading/error states.
- Database engineer: migrations, constraints, RLS and query design.
- Security reviewer: role boundaries, IDOR, token privacy, import abuse.
- QA engineer: acceptance fixtures, edge cases, regression suite.
- Demo lead: seed synthetic data and prepare a reproducible walkthrough.

## Change request template
- User problem:
- Requirements:
- Files to change:
- Database changes:
- Security implications:
- Tests to add:
- Acceptance criteria:
- Known limitations:

## Definition of done
- Feature works against persistent database records.
- Access checks are enforced server-side/RLS.
- Loading, empty, validation, and failure states exist.
- Tests pass.
- Documentation is updated.
- No secrets or real student data are committed.
