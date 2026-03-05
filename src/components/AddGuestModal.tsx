// src/components/AddGuestModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import type { Guest } from '../data/guests';

interface AddGuestModalProps {
  searchQuery: string;
  onAdd: (data: Partial<Guest>) => Promise<string>;
  onClose: () => void;
}

export default function AddGuestModal({ searchQuery, onAdd, onClose }: AddGuestModalProps) {
  const [name, setName] = useState(searchQuery);
  const [phone, setPhone] = useState('');
  const [tickets, setTickets] = useState(1);
  const [type, setType] = useState<'Guest' | 'Longform' | 'Influencers'>('Guest');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(searchQuery);
    setSubmitting(false);
    setSuccess(false);
    setError('');
    // Small delay to ensure modal is rendered before focusing
    setTimeout(() => nameRef.current?.focus(), 100);
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;

    setSubmitting(true);
    setError('');
    try {
      await onAdd({
        name: name.trim(),
        phone: phone.trim() || undefined,
        tickets,
        type,
        plusOne: false,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to add guest:', err);
      setError('Failed to add guest. Try again.');
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="mx-4 mt-4 p-6 rounded-xl bg-green-50 border border-green-200 text-center animate-pulse">
        <p className="text-3xl mb-2">✓</p>
        <p className="text-green-700 font-semibold text-lg">Added & Checked In</p>
        <p className="text-green-600 text-sm mt-1">{name}</p>
      </div>
    );
  }

  return (
    <div className="mx-4 mt-4 rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-amber-100 border-b border-amber-200">
        <p className="text-sm font-semibold text-amber-800">
          🌻 No guest found — Add as walk-in?
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Name *
          </label>
          <input
            ref={nameRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-base
                       focus:outline-none focus:ring-2 focus:ring-sunflower-400 focus:border-sunflower-400"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Phone (optional)
          </label>
          <input
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="98181 12345"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-base
                       focus:outline-none focus:ring-2 focus:ring-sunflower-400 focus:border-sunflower-400"
          />
        </div>

        {/* Tickets + Type row */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Tickets
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={20}
              value={tickets}
              onChange={(e) => setTickets(Number(e.target.value) || 1)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-base
                         focus:outline-none focus:ring-2 focus:ring-sunflower-400 focus:border-sunflower-400"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-base bg-white
                         focus:outline-none focus:ring-2 focus:ring-sunflower-400 focus:border-sunflower-400"
            >
              <option value="Guest">Guest</option>
              <option value="Longform">Longform</option>
              <option value="Influencers">Influencers</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          {error && (
            <p className="w-full text-red-600 text-xs font-medium text-center mb-1">{error}</p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600
                       hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || submitting}
            className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-white
                       bg-sunflower-500 hover:bg-sunflower-600 active:bg-sunflower-700
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Add & Check In'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
