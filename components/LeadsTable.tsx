'use client';

import { useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import * as XLSX from 'xlsx';
import type { Lead, LeadStatus } from '@/lib/types';

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: 'bg-green-100 text-green-700',
  hot: 'bg-orange-100 text-orange-700',
  warm: 'bg-yellow-100 text-yellow-700',
  cold: 'bg-gray-100 text-gray-600',
};

const SOURCE_MAP: Record<string, string> = {
  'walk-in': 'Walk-in',
  referral: 'Referral',
  'online-website': 'Online',
  'event-exhibition': 'Event',
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

interface LeadsTableProps {
  leads: Lead[];
  onDelete: (id: string) => void;
  onRefresh: () => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
  loading?: boolean;
  isAdmin?: boolean;
}

export default function LeadsTable({
  leads,
  onDelete,
  onRefresh,
  showToast,
  loading = false,
  isAdmin = false,
}: LeadsTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');

  const filtered = useMemo(() => {
    let list = leads;
    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (l) =>
          `${l.first_name} ${l.last_name ?? ''}`.toLowerCase().includes(q) ||
          (l.phone ?? '').toLowerCase().includes(q) ||
          (l.salesperson_name ?? '').toLowerCase().includes(q) ||
          (l.salesperson_email ?? '').toLowerCase().includes(q) ||
          (l.interest ?? '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      list = list.filter((l) => l.status === statusFilter);
    }
    if (sourceFilter !== 'all') {
      list = list.filter((l) => l.source === sourceFilter);
    }
    if (dateFilter) {
      list = list.filter((l) => {
        const d = l.created_at.slice(0, 10);
        return d === dateFilter;
      });
    }
    return list;
  }, [leads, search, statusFilter, sourceFilter, dateFilter]);

  function clearFilters() {
    setSearch('');
    setStatusFilter('all');
    setSourceFilter('all');
    setDateFilter('');
  }

  function handleExport() {
    const rows = filtered.map((l) => ({
      'First Name': l.first_name,
      'Last Name': l.last_name ?? '',
      Phone: l.phone,
      Email: l.email ?? '',
      CNIC: l.cnic ?? '',
      Interest: l.interest ?? '',
      Status: l.status,
      Tags: (l.tags ?? []).join(', '),
      Budget: l.budget ?? '',
      Source: l.source,
      Salesperson: l.salesperson_name ?? l.salesperson_email ?? '',
      'Follow-up Date': l.followup_date ?? '',
      Notes: l.notes ?? '',
      'Date Added': formatDate(l.created_at),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `FamilyBuilders_Leads_${date}.xlsx`);
    showToast('Excel exported', 'success');
  }

  async function handleDelete(id: string) {
    const ok = typeof window !== 'undefined' && window.confirm('Delete this lead?');
    if (!ok) return;
    const supabase = createClient();
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) {
      showToast(error.message, 'error');
      return;
    }
    onDelete(id);
    showToast('Lead deleted', 'success');
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-800">All Walk-in Leads</h2>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <tbody>
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="border-b border-gray-200 last:border-0">
                    <td colSpan={9} className="p-4">
                      <div className="h-6 bg-gray-100 animate-pulse rounded w-full" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-800">
          {isAdmin ? 'All Walk-in Leads' : 'My Walk-in Leads'}
        </h2>
        {isAdmin && (
          <button
            type="button"
            onClick={handleExport}
            className="border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg text-sm transition-colors bg-white hover:bg-gray-50"
          >
            ⬇ Export Excel
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder={isAdmin ? 'Search name, phone, salesperson, interest...' : 'Search name, phone, interest...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[12rem] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">All</option>
          <option value="new">New</option>
          <option value="hot">Hot</option>
          <option value="warm">Warm</option>
          <option value="cold">Cold</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">All</option>
          <option value="walk-in">Walk-in</option>
          <option value="referral">Referral</option>
          <option value="online-website">Online</option>
          <option value="event-exhibition">Event</option>
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        <button
          type="button"
          onClick={clearFilters}
          className="border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg text-sm transition-colors bg-white hover:bg-gray-50"
        >
          Clear
        </button>
        <span className="text-xs text-gray-500 self-center">Showing {filtered.length} leads</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg font-semibold text-gray-900">No leads found</p>
              <p className="text-sm text-gray-500 mt-1">Try adjusting filters or add a new lead.</p>
            </div>
          ) : (
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">
                    Name / Phone
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">
                    Interest
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">
                    Tags
                  </th>
                  {isAdmin && (
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">
                      Salesperson
                    </th>
                  )}
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">
                    Budget
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">
                    Source
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">
                    Date
                  </th>
                  {isAdmin && (
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3 w-20">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900 text-sm">
                        {lead.first_name} {lead.last_name ?? ''}
                      </p>
                      <p className="text-xs text-gray-500">{lead.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{lead.interest ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[lead.status]}`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(lead.tags ?? []).slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full"
                          >
                            {t}
                          </span>
                        ))}
                        {(lead.tags ?? []).length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{(lead.tags ?? []).length - 3} more
                          </span>
                        )}
                        {(lead.tags ?? []).length === 0 && '—'}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {lead.salesperson_name ?? lead.salesperson_email ?? '—'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm text-gray-700">{lead.budget ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {SOURCE_MAP[lead.source] ?? lead.source}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(lead.created_at)}</td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleDelete(lead.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
