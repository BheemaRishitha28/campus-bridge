# Setup and Initialization

## 1. Install tools
Install Node.js LTS, Git, and VS Code. Create a Supabase project.

## 2. Install app dependencies
```bash
npm install
```

## 3. Configure environment
Copy `.env.example` to `.env.local` and fill:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (publishable/anon key only)

Never put the service-role key in a browser app.

## 4. Initialize database
Run `supabase/migrations/0001_initial_schema.sql` in a fresh development Supabase project's SQL editor. Review any warnings and confirm all tables have RLS enabled.

For a CLI workflow, install the Supabase CLI, run `supabase init`, link your project, then apply migrations using the supported CLI commands for your installed version.

## 5. Create users
Create a student and a placement-admin user through Supabase Auth. Insert matching `profiles` records using the Auth UUIDs. Role assignment must be an admin-only operation; do not let public sign-up select `placement_admin`.

The SQL starter's demo seed only adds departments, categories, and companies. Add synthetic student profiles only after you have created their Auth users or have a secure development-only seeding method. Never invent a UUID reference to a missing `auth.users` row.

## 6. Run
```bash
npm run dev
```

## 7. Validate build
```bash
npm run build
npm test
```

## 8. Deployment
Deploy frontend to a static hosting provider and configure environment variables and Auth redirect URLs. Run database migrations before deploying the corresponding frontend. Use a separate Supabase project for local/dev, staging, and production.
