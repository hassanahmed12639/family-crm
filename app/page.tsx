import { createServerClient } from '@/lib/supabase-server';
import { isAdmin } from '@/lib/admin';
import LoginForm from '@/components/LoginForm';
import Dashboard from '@/components/Dashboard';
import SetupRequired from '@/components/SetupRequired';

export default async function Home() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url?.trim() || !key?.trim()) {
    return <SetupRequired />;
  }

  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <LoginForm />;

  const admin = isAdmin(user.email ?? '');

  return <Dashboard user={user} isAdmin={admin} />;
}
