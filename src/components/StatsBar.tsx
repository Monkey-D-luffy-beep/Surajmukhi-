// src/components/StatsBar.tsx
import React from 'react';
import type { GuestStats } from '../hooks/useGuests';

interface StatsBarProps {
  stats: GuestStats;
  isOnline: boolean;
  onManage?: () => void;
}

export default function StatsBar({ stats, isOnline, onManage }: StatsBarProps) {
  const pct = stats.total > 0 ? (stats.checkedIn / stats.total) * 100 : 0;

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      {/* App name + online status + manage button */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌻</span>
          <h1 className="text-lg font-bold text-sunflower-800 tracking-tight">
            Surajmukhi
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {onManage && (
            <button
              onClick={onManage}
              className="text-xs bg-sunflower-100 text-sunflower-700 px-2.5 py-1 rounded-full font-semibold hover:bg-sunflower-200 active:bg-sunflower-300 transition-colors"
            >
              ✏️ Manage
            </button>
          )}
          {stats.walkIns > 0 && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              +{stats.walkIns} walk-in{stats.walkIns > 1 ? 's' : ''}
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
              isOnline
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOnline ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Total Tickets — BIG & prominent */}
      <div className="flex items-center justify-center gap-3 mb-2 bg-sunflower-50 rounded-xl py-2.5 px-4 border border-sunflower-200">
        <span className="text-2xl">🎟</span>
        <div className="text-center">
          <span className="text-3xl font-extrabold text-sunflower-700 tracking-tight">
            {stats.totalTickets}
          </span>
          <span className="block text-[11px] font-semibold text-sunflower-600/80 uppercase tracking-wider -mt-0.5">
            Total Tickets
          </span>
        </div>
        <div className="h-8 w-px bg-sunflower-200" />
        <div className="text-center">
          <span className="text-xl font-bold text-gray-700">
            {stats.total}
          </span>
          <span className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider -mt-0.5">
            Guests
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="font-semibold text-gray-800">
          {stats.checkedIn} / {stats.total} checked in
        </span>
        <span className="text-gray-500 font-medium">
          {stats.remaining} remaining
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background:
              pct === 100
                ? '#22c55e'
                : 'linear-gradient(90deg, #f59e0b, #d97706)',
          }}
        />
      </div>
    </div>
  );
}
