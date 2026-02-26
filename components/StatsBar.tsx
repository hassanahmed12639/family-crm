'use client';

import type { Lead } from '@/lib/types';

interface StatsBarProps {
  leads: Lead[];
}

function todayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function todayEnd() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

export default function StatsBar({ leads }: StatsBarProps) {
  const total = leads.length;
  const hot = leads.filter((l) => l.status === 'hot').length;
  const addedToday = leads.filter((l) => {
    const created = l.created_at;
    return created >= todayStart() && created <= todayEnd();
  }).length;
  const salespersons = new Set(leads.map((l) => l.salesperson_email).filter(Boolean)).size;

  const cards = [
    { icon: '📋', value: total, label: 'Total Leads' },
    { icon: '🔥', value: hot, label: 'Hot Leads' },
    { icon: '📅', value: addedToday, label: 'Added Today' },
    { icon: '👥', value: salespersons, label: 'Salespersons' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 min-w-0">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 min-w-0"
        >
          <p className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">
            {card.value}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">
            {card.label}
          </p>
        </div>
      ))}
    </div>
  );
}
