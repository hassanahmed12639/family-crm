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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            <img
              src="/logo.png"
              alt="Family Builders"
              className="h-7 sm:h-8 w-auto object-contain min-w-0"
            />
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="hidden sm:flex items-center gap-2 min-w-0">
                <div
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-900 text-white flex items-center justify-center font-semibold text-xs sm:text-sm shrink-0"
                  aria-hidden
                >
                  {initial}
                </div>
                <span className="text-xs sm:text-sm text-gray-700 truncate max-w-[100px] sm:max-w-[200px]">
                  {emailDisplay}
                </span>
                {isAdmin && (
                  <span className="bg-blue-900 text-white text-xs px-2 py-0.5 rounded-full font-semibold shrink-0">
                    ADMIN
                  </span>
                )}
              </div>
              <div className="flex sm:hidden w-8 h-8 rounded-full bg-blue-900 text-white items-center justify-center font-semibold text-xs shrink-0">
                {initial}
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm transition-colors bg-white hover:bg-gray-50 shrink-0 touch-manipulation"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <header className="bg-blue-900 py-6 sm:py-10 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <span className="inline-block px-2.5 py-1 rounded text-xs font-semibold text-blue-300 bg-blue-900/60 uppercase tracking-wider">
            Walk-in Lead Management
          </span>
          <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white mt-2 leading-tight">
            {isAdmin
              ? 'Welcome, Admin — Family Builders & Developers'
              : `Welcome back, ${displayName}`}
          </h1>
          <p className="text-blue-200 text-xs sm:text-sm mt-1">
            Log walk-in inquiries and manage follow-ups in one place.
          </p>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-w-0">
          <div className="flex gap-4 sm:gap-6 min-w-0">
            <button
              type="button"
              onClick={() => setTab('form')}
              className={`py-3 sm:py-4 text-xs sm:text-sm font-semibold border-b-2 -mb-px transition-colors shrink-0 touch-manipulation ${
                tab === 'form'
                  ? 'text-blue-900 border-blue-900'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Add Lead
            </button>
            <button
              type="button"
              onClick={() => setTab('dashboard')}
              className={`py-3 sm:py-4 text-xs sm:text-sm font-semibold border-b-2 -mb-px transition-colors shrink-0 touch-manipulation ${
                tab === 'dashboard'
                  ? 'text-blue-900 border-blue-900'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
                Dashboard
              </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 min-w-0">
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
          className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl shadow-xl font-semibold text-sm text-white transition-all ${
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
