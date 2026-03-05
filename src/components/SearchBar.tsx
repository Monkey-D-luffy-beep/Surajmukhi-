// src/components/SearchBar.tsx
import React, { useRef, useEffect } from 'react';

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  resultCount: number;
  totalCount: number;
}

export default function SearchBar({
  query,
  onQueryChange,
  resultCount,
  totalCount,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Cmd/Ctrl+K to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="sticky top-0 z-10 bg-white px-4 py-3 border-b border-gray-200 shadow-sm">
      <div className="relative">
        {/* Search icon */}
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        <input
          ref={inputRef}
          type="search"
          inputMode="search"
          placeholder="Search name, phone, or email…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              onQueryChange('');
              inputRef.current?.blur();
            }
          }}
          className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 bg-gray-50 text-base
                     focus:outline-none focus:ring-2 focus:ring-sunflower-400 focus:border-sunflower-400
                     placeholder-gray-400 transition-all"
        />

        {/* Clear button */}
        {query && (
          <button
            onClick={() => {
              onQueryChange('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center
                       rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 active:bg-gray-400 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Result count */}
      <p className="text-xs text-gray-500 mt-1.5 pl-1">
        {query
          ? `${resultCount} result${resultCount !== 1 ? 's' : ''} found`
          : `${totalCount} guest${totalCount !== 1 ? 's' : ''}`}
        {query && ' · Press Esc to clear'}
      </p>
    </div>
  );
}
