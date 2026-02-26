'use server';

import { createServerClient } from '@/lib/supabase-server';

export async function getLeads() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
