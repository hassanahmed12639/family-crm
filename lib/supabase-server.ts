import { createServerClient as createSSRClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createServerClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      'Missing Supabase env: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    );
  }
  const cookieStore = cookies();
  return createSSRClient(
    url,
    key,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            const isAuthCookie = name.includes('auth-token');
            const persistentOptions = isAuthCookie
              ? { ...options, maxAge: 60 * 60 * 24 * 30, path: '/', sameSite: 'lax' as const }
              : options;
            cookieStore.set({ name, value, ...persistentOptions });
          } catch {
            // ignore in Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // ignore in Server Components
          }
        },
      },
    }
  );
};
