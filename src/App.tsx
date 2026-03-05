// src/App.tsx
import React, { useState, useCallback } from 'react';
import { useGuests } from './hooks/useGuests';
import { useSearch, type TabFilter } from './hooks/useSearch';
import StatsBar from './components/StatsBar';
import SearchBar from './components/SearchBar';
import GuestCard from './components/GuestCard';
import AddGuestModal from './components/AddGuestModal';
import ReportButton from './components/ReportButton';
import ManageGuests from './components/ManageGuests';
import type { Guest } from './data/guests';

const TABS: { key: TabFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'remaining', label: 'Remaining' },
  { key: 'checkedIn', label: 'Checked In' },
];

export default function App() {
  const { guests, loading, isOnline, checkIn, undoCheckIn, addGuest, stats } =
    useGuests();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<TabFilter>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManage, setShowManage] = useState(false);

  const filtered = useSearch(guests, query, tab);

  const noResults = query.trim().length > 0 && filtered.length === 0;

  const handleAdd = useCallback(
    async (data: Partial<Guest>) => {
      try {
        const id = await addGuest(data);
        return id;
      } catch (err) {
        console.error('Add guest failed:', err);
        throw err;
      }
    },
    [addGuest]
  );

  const handleAddClose = useCallback(() => {
    setQuery('');
    setShowAddModal(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-sunflower-50">
        <span className="text-5xl mb-4">🌻</span>
        <p className="text-sunflower-700 font-semibold text-lg">
          Loading Surajmukhi…
        </p>
        <div className="mt-3 w-8 h-8 border-4 border-sunflower-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Management page
  if (showManage) {
    return (
      <ManageGuests guests={guests} onBack={() => setShowManage(false)} />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Stats bar */}
      <StatsBar stats={stats} isOnline={isOnline} onManage={() => setShowManage(true)} />

      {/* Search bar */}
      <SearchBar
        query={query}
        onQueryChange={setQuery}
        resultCount={filtered.length}
        totalCount={stats.total}
      />

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 bg-white px-4">
        {TABS.map(({ key, label }) => {
          const count =
            key === 'all'
              ? stats.total
              : key === 'remaining'
              ? stats.remaining
              : stats.checkedIn;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2.5 text-sm font-medium text-center border-b-2 transition-colors ${
                tab === key
                  ? 'border-sunflower-500 text-sunflower-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}{' '}
              <span
                className={`text-xs ${
                  tab === key ? 'text-sunflower-500' : 'text-gray-400'
                }`}
              >
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Guest list */}
      <div className="pt-2">
        {filtered.map((guest) => (
          <GuestCard
            key={guest.id}
            guest={guest}
            onCheckIn={checkIn}
            onUndoCheckIn={undoCheckIn}
          />
        ))}
      </div>

      {/* No results → show walk-in prompt inline */}
      {noResults && (
        <AddGuestModal
          searchQuery={query}
          onAdd={handleAdd}
          onClose={handleAddClose}
        />
      )}

      {/* Add Guest modal (from FAB) */}
      {showAddModal && !noResults && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center">
          <div className="w-full max-w-lg bg-white rounded-t-2xl animate-slide-up">
            <AddGuestModal
              searchQuery=""
              onAdd={handleAdd}
              onClose={handleAddClose}
            />
          </div>
        </div>
      )}

      {/* Empty state for tabs */}
      {!noResults && filtered.length === 0 && !query && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">🌻</p>
          <p className="font-medium">
            {tab === 'checkedIn'
              ? 'No one checked in yet'
              : tab === 'remaining'
              ? 'Everyone is checked in!'
              : 'No guests found'}
          </p>
        </div>
      )}

      {/* Floating Add Guest button — always visible */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full
                   bg-sunflower-500 text-white shadow-lg
                   hover:bg-sunflower-600 active:bg-sunflower-700
                   flex items-center justify-center text-3xl
                   transition-all duration-150"
        aria-label="Add walk-in guest"
      >
        +
      </button>

      {/* Report download */}
      {!query && (
        <div className="mx-4 mt-4 mb-24">
          <ReportButton guests={guests} />
        </div>
      )}
    </div>
  );
}
