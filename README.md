# Family Builders — Walk-in Lead CRM

Internal CRM for Family Builders & Developers (Karachi, Pakistan) to log and manage walk-in client leads. Single-page app with login and dashboard (add lead form + leads table).

## Tech stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database & Auth:** Supabase
- **Export:** xlsx (SheetJS)

## Setup

1. **Clone and install**
   ```bash
   cd "walk in leads fbd"
   npm install
   ```

2. **Create a Supabase project**
   - Go to [supabase.com](https://supabase.com) and create a project.
   - In the SQL Editor, run the schema from the project (see Database schema below).

3. **Environment**
   - Copy `.env.example` to `.env.local`.
   - Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your Supabase project (Settings → API).

4. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Database schema

Run this in the Supabase SQL Editor:

```sql
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  first_name TEXT NOT NULL,
  last_name TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  cnic TEXT,
  interest TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','hot','warm','cold')),
  tags TEXT[] DEFAULT '{}',
  budget TEXT,
  source TEXT DEFAULT 'walk-in',
  followup_date DATE,
  notes TEXT,
  salesperson_email TEXT,
  salesperson_name TEXT
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can select" ON leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert" ON leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update" ON leads FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete" ON leads FOR DELETE TO authenticated USING (true);
```

**Important:** Run the RLS script so each salesperson sees only their own dashboard (their leads) and admin sees everyone's dashboard (all leads). In SQL Editor, run the contents of `supabase/rls-leads.sql`. This replaces the leads SELECT policy so users see only rows where `salesperson_email` = their email, and admin (`admin@thefamilybuilders.com`) sees all; it also restricts DELETE to admin only.

Then run the profiles schema (for admin vs member roles): see `supabase/profiles.sql` in the repo, or run:

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member','admin'))
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
-- Optional: trigger so new signups get role 'member'. To make someone admin: INSERT INTO profiles (id, role) VALUES ('user-uuid', 'admin') ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

## Adding salesperson accounts

1. In Supabase: **Authentication → Users → Add user**.
2. Enter email and password (or use magic link).
3. **Admin vs member:** Only users with `role = 'admin'` in the `profiles` table can see the Dashboard tab; others see only "Add Lead". To make a user admin, in SQL Editor run: `INSERT INTO profiles (id, role) VALUES ('user-uuid-from-auth', 'admin') ON CONFLICT (id) DO UPDATE SET role = 'admin';`

## Deploy (Vercel)

1. Push the repo to GitHub.
2. In [Vercel](https://vercel.com), import the repo.
3. Add env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Deploy.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — run ESLint
