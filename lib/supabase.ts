import { createBrowserClient } from '@supabase/ssr';

const THIRTY_DAYS = 60 * 60 * 24 * 30;

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        maxAge: THIRTY_DAYS,
        path: '/',
        sameSite: 'lax',
      },
    }
  );
