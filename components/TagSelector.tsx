'use client';

import { useState, useRef, useEffect } from 'react';
import { LEAD_TAGS } from '@/lib/types';

interface TagSelectorProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

export default function TagSelector({ selected, onChange }: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = LEAD_TAGS.filter((tag) =>
    tag.toLowerCase().includes(search.toLowerCase().trim())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggle(tag: string) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  }

  function remove(tag: string, e: React.MouseEvent) {
    e.stopPropagation();
    onChange(selected.filter((t) => t !== tag));
  }

  return (
    <div ref={containerRef} className="relative min-w-0">
      <div
        className="border border-gray-300 rounded-lg p-3 min-h-[52px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white cursor-text min-w-0"
        onClick={() => setOpen(true)}
      >
        <div className="flex flex-wrap gap-2 mb-2">
          {selected.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full"
            >
              {tag}
              <button
                type="button"
                onClick={(e) => remove(tag, e)}
                className="text-blue-400 hover:text-red-500 transition-colors leading-none"
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search or add tags..."
          className="w-full text-sm border-0 p-0 focus:outline-none focus:ring-0 bg-transparent min-w-[120px]"
        />
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No tags match</div>
          ) : (
            filtered.map((tag) => {
              const isSelected = selected.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggle(tag)}
                  className={`w-full px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 flex items-center gap-2 text-left ${
                    isSelected ? 'text-blue-700 font-semibold bg-blue-50' : 'text-gray-700'
                  }`}
                >
                  {isSelected && (
                    <span className="text-blue-600" aria-hidden>✓</span>
                  )}
                  {tag}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
