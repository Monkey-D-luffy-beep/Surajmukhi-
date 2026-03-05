// src/components/GuestCard.tsx
import React, { useState } from 'react';
import type { Guest } from '../data/guests';
import DeviceBadge from './DeviceBadge';

interface GuestCardProps {
  guest: Guest;
  onCheckIn: (id: string) => Promise<void>;
  onUndoCheckIn: (id: string) => Promise<void>;
}

const TYPE_COLORS: Record<string, string> = {
  Guest: 'bg-blue-100 text-blue-700',
  Longform: 'bg-purple-100 text-purple-700',
  Influencers: 'bg-orange-100 text-orange-700',
};

function formatTime(timestamp: any): string {
  if (!timestamp) return '';
  // Firestore Timestamp has toDate(), plain Date or seconds
  const date = timestamp?.toDate?.() ?? new Date(timestamp.seconds * 1000);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export default function GuestCard({ guest, onCheckIn, onUndoCheckIn }: GuestCardProps) {
  const [loading, setLoading] = useState(false);
  const [confirmUndo, setConfirmUndo] = useState(false);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await onCheckIn(guest.id);
    } catch (err) {
      console.error('Check-in failed:', err);
    }
    // Don't setLoading(false) — the real-time listener will update the card
  };

  const handleUndoTap = () => {
    if (!confirmUndo) {
      setConfirmUndo(true);
      // Auto-dismiss after 3 seconds
      setTimeout(() => setConfirmUndo(false), 3000);
      return;
    }
    handleUndoConfirm();
  };

  const handleUndoConfirm = async () => {
    setLoading(true);
    setConfirmUndo(false);
    try {
      await onUndoCheckIn(guest.id);
    } catch (err) {
      console.error('Undo check-in failed:', err);
    }
    setLoading(false);
  };

  return (
    <div
      className={`mx-4 mb-2 rounded-xl border transition-all duration-300 ${
        guest.checkedIn
          ? 'bg-green-50 border-green-200'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between p-3 gap-3">
        {/* Left: Name + phone */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-base text-gray-900 truncate">
              {guest.name}
            </h3>
            {guest.plusOne && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium">
                +1
              </span>
            )}
            {guest.addedOnSite && (
              <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                Walk-in
              </span>
            )}
          </div>
          {guest.phone && (
            <p className="text-sm text-gray-500 mt-0.5">{guest.phone}</p>
          )}
          {guest.notes && (
            <p className="text-xs text-gray-400 mt-0.5 italic">{guest.notes}</p>
          )}
        </div>

        {/* Center: Badges */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[guest.type] ?? 'bg-gray-100 text-gray-600'}`}>
            {guest.type}
          </span>
          <span className="text-xs font-bold bg-sunflower-100 text-sunflower-800 px-2 py-0.5 rounded-full">
            🎟 {guest.tickets}
          </span>
        </div>

        {/* Right: Check-in button or status */}
        <div className="shrink-0">
          {guest.checkedIn ? (
            <button
              onClick={handleUndoTap}
              disabled={loading}
              className="flex flex-col items-center gap-0.5 min-h-[48px] min-w-[80px] rounded-lg transition-all duration-200"
            >
              {confirmUndo ? (
                <>
                  <span className="text-red-500 text-lg">✕</span>
                  <span className="text-[11px] text-red-600 font-semibold">
                    Tap to Undo
                  </span>
                </>
              ) : (
                <>
                  <span className="text-green-600 text-2xl">✓</span>
                  <span className="text-[10px] text-green-600 font-medium">
                    Checked In
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {guest.checkedInAt ? formatTime(guest.checkedInAt) : ''}
                  </span>
                  {guest.checkedInBy && <DeviceBadge deviceName={guest.checkedInBy} />}
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="min-w-[80px] min-h-[48px] px-4 py-2 rounded-lg font-semibold text-sm
                         bg-sunflower-500 text-white shadow-sm
                         hover:bg-sunflower-600 active:bg-sunflower-700
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-150"
            >
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Check In'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
