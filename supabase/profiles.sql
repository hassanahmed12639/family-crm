-- Run this in Supabase SQL Editor after the leads table.
-- Profiles table: controls who can see the Dashboard tab (admin) vs Add Lead only (member).

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member','admin'))
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

-- New signups get a profile with role 'member'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'member')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- To make a user admin, run (replace USER_UUID with the user's id from Authentication → Users):
-- INSERT INTO profiles (id, role) VALUES ('USER_UUID', 'admin') ON CONFLICT (id) DO UPDATE SET role = 'admin';
