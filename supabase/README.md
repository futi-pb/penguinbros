# Supabase Setup

This project includes a baseline SQL migration for the Square checkout + CMS architecture.

## Migration files

- `supabase/migrations/20260311_000001_square_cms_foundation.sql`
- `supabase/migrations/20260311_000002_ops_metrics.sql`

## Apply the migration

1. Ensure your Supabase project is created.
2. Open the SQL editor in Supabase and run the migration file contents.
3. Add environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Required follow-up

- Link `admin_users.auth_user_id` rows to real Supabase Auth users.
- Fill Square location IDs in the `pickup_locations` site setting.
- Review RLS policies for your org's access model before production launch.
