-- Run this in Supabase SQL Editor to enforce:
-- - Each salesperson sees only their own dashboard (leads where salesperson_email = their email).
-- - Admin (admin@thefamilybuilders.com) sees everyone's dashboard (all leads).
-- - Only admin can delete leads.

DROP POLICY IF EXISTS "Auth users can select" ON leads;

CREATE POLICY "Users see own leads or admin sees all" ON leads
FOR SELECT TO authenticated
USING (
  salesperson_email = (auth.jwt() ->> 'email')
  OR (auth.jwt() ->> 'email') = 'admin@thefamilybuilders.com'
);

DROP POLICY IF EXISTS "Auth users can delete" ON leads;

CREATE POLICY "Only admin can delete leads" ON leads
FOR DELETE TO authenticated
USING ((auth.jwt() ->> 'email') = 'admin@thefamilybuilders.com');
