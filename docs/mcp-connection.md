# MCP Connection

MCP (Model Context Protocol) is optional and is not required for the core portal. Use it only if a supported AI coding assistant or development client needs structured access to approved tools/resources.

## Safe development setup
1. Decide the exact MCP server and the data it needs.
2. Prefer local development resources or a dedicated test Supabase project.
3. Give the MCP server the minimum permissions needed.
4. Never paste production service-role keys into prompts or commit them.
5. Do not give an AI agent unrestricted access to student records or privileged database operations.
6. Require human approval before destructive schema changes, bulk imports, clearance approvals, certificate issuance, or production deployment.
7. Keep tool logs free of credentials and sensitive student data.

## Supabase MCP
If using an official Supabase MCP integration, follow the current Supabase documentation for supported clients, authentication, and configuration. Names and setup commands may change; do not copy old commands from an unverified tutorial. Start with a development project and read-only access where possible.

## What MCP may help with
- Inspecting schema and migrations in a dev project.
- Reviewing query plans or test failures.
- Drafting migrations for human review.
- Running approved test workflows.

## What MCP must not do by default
- Bypass RLS.
- Export all real student records to a model.
- Approve clearances or issue certificates without an authorised human workflow.
- Run unreviewed destructive SQL in production.
