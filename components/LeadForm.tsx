'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { LeadFormData, LeadStatus } from '@/lib/types';
import TagSelector from './TagSelector';

const SOURCE_OPTIONS = [
  { value: 'walk-in', label: 'Walk-in' },
  { value: 'referral', label: 'Referral' },
  { value: 'online-website', label: 'Online-Website' },
  { value: 'event-exhibition', label: 'Event-Exhibition' },
];

const INITIAL: LeadFormData = {
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
  cnic: '',
  interest: '',
  status: 'new',
  tags: [],
  budget: '',
  source: 'walk-in',
  followup_date: '',
  notes: '',
};

interface LeadFormProps {
  user: User;
  showToast: (msg: string, type: 'success' | 'error') => void;
  onSuccess?: () => void;
}

function formatSalespersonName(email: string): string {
  const part = email.split('@')[0] ?? '';
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

export default function LeadForm({ user, showToast, onSuccess }: LeadFormProps) {
  const [form, setForm] = useState<LeadFormData>(INITIAL);
  const [firstError, setFirstError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof LeadFormData>(key: K, value: LeadFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === 'first_name') setFirstError(null);
    if (key === 'phone') setPhoneError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFirstError(null);
    setPhoneError(null);

    const firstTrim = form.first_name.trim();
    const phoneTrim = form.phone.trim();
    if (!firstTrim) {
      setFirstError('First name is required');
      return;
    }
    if (!phoneTrim) {
      setPhoneError('Phone number is required');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.from('leads').insert({
        first_name: firstTrim,
        last_name: form.last_name.trim() || null,
        phone: phoneTrim,
        email: form.email.trim() || null,
        cnic: form.cnic.trim() || null,
        interest: form.interest.trim() || null,
        status: form.status,
        tags: form.tags.length ? form.tags : [],
        budget: form.budget.trim() || null,
        source: form.source,
        followup_date: form.followup_date || null,
        notes: form.notes.trim() || null,
        salesperson_email: user.email ?? null,
        salesperson_name: user.email ? formatSalespersonName(user.email) : null,
      });
      if (error) {
        showToast(error.message, 'error');
        return;
      }
      showToast('Lead submitted successfully', 'success');
      setForm(INITIAL);
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-bold text-gray-900">New Walk-in Lead</h2>
          <p className="text-sm text-gray-600 mt-1">Fill in the customer details to log this walk-in inquiry</p>
          <div className="h-0.5 w-12 bg-blue-500 mt-2 mb-6" />

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => update('first_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
              {firstError && <p className="mt-1 text-xs text-red-600">{firstError}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => update('last_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="+92 3XX XXXXXXX"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
              {phoneError && <p className="mt-1 text-xs text-red-600">{phoneError}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Project / Interest
              </label>
              <input
                type="text"
                value={form.interest}
                onChange={(e) => update('interest', e.target.value)}
                placeholder="e.g. Property or project interest"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Budget PKR
              </label>
              <input
                type="text"
                value={form.budget}
                onChange={(e) => update('budget', e.target.value)}
                placeholder="e.g. 1.5 Crore"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Lead Source
              </label>
              <select
                value={form.source}
                onChange={(e) => update('source', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {SOURCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Follow-up Date
              </label>
              <input
                type="date"
                value={form.followup_date}
                onChange={(e) => update('followup_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Lead Tags
              </label>
              <TagSelector selected={form.tags} onChange={(tags) => update('tags', tags)} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Lead →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
