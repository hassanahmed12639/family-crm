'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Lead } from '@/lib/types';
import LeadForm from './LeadForm';
import LeadsTable from './LeadsTable';
import StatsBar from './StatsBar';

interface DashboardProps {
  user: User;
  isAdmin: boolean;
}

export default function Dashboard({ user, isAdmin }: DashboardProps) {
  const router = useRouter();
  const [tab, setTab] = useState<'form' | 'dashboard'>('form');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const loadLeads = useCallback(async () => {
    setLeadsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setLeads((data as Lead[]) ?? []);
    } catch {
      setLeads([]);
    } finally {
      setLeadsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'dashboard') {
      loadLeads();
    }
  }, [tab, loadLeads]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  function handleDelete(id: string) {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }

  function handleLeadSuccess() {
    loadLeads();
  }

  const emailDisplay = user.email ?? '';
  const initial = emailDisplay.charAt(0).toUpperCase();
  const emailPart = emailDisplay.split('@')[0] ?? '';
  const displayName = emailPart
    ? emailPart.charAt(0).toUpperCase() + emailPart.slice(1).toLowerCase()
    : '';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <img
              src="/logo.png"
              alt="Family Builders"
              className="h-8 w-auto object-contain"
            />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-9 h-9 rounded-full bg-blue-900 text-white flex items-center justify-center font-semibold text-sm shrink-0"
                  aria-hidden
                >
                  {initial}
                </div>
                <span className="text-sm text-gray-700 truncate max-w-[140px] sm:max-w-[200px]">
                  {emailDisplay}
                </span>
                {isAdmin && (
                  <span className="bg-blue-900 text-white text-xs px-2 py-0.5 rounded-full font-semibold shrink-0">
                    ADMIN
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg text-sm transition-colors bg-white hover:bg-gray-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <header className="bg-blue-900 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <span className="inline-block px-2.5 py-1 rounded text-xs font-semibold text-blue-300 bg-blue-900/60 uppercase tracking-wider">
            Walk-in Lead Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2">
            {isAdmin
              ? 'Welcome, Admin — Family Builders & Developers'
              : `Welcome back, ${displayName}`}
          </h1>
          <p className="text-blue-200 text-sm mt-1">
            Log walk-in inquiries and manage follow-ups in one place.
          </p>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            <button
              type="button"
              onClick={() => setTab('form')}
              className={`py-4 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                tab === 'form'
                  ? 'text-blue-900 border-blue-900'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              ➕ Add Lead
            </button>
            <button
              type="button"
              onClick={() => setTab('dashboard')}
              className={`py-4 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                tab === 'dashboard'
                  ? 'text-blue-900 border-blue-900'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              📋 Dashboard
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tab === 'form' ? (
          <LeadForm
            user={user}
            showToast={showToast}
            onSuccess={handleLeadSuccess}
          />
        ) : (
          <div className="space-y-6">
            <StatsBar leads={leads} />
            <LeadsTable
              leads={leads}
              onDelete={handleDelete}
              onRefresh={loadLeads}
              showToast={showToast}
              loading={leadsLoading}
              isAdmin={isAdmin}
            />
          </div>
        )}
      </main>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-xl font-semibold text-sm text-white transition-all ${
            toast.type === 'success'
              ? 'bg-blue-900 border-l-4 border-blue-400'
              : 'bg-red-700 border-l-4 border-red-400'
          }`}
          role="alert"
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
