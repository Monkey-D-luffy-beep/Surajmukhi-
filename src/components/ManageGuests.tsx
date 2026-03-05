// src/components/ManageGuests.tsx
// Pre-event guest list management — add, edit, remove guests
import React, { useState } from 'react';
import type { Guest } from '../data/guests';
import {
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
  collection,
} from 'firebase/firestore';
import { db } from '../firebase';

interface ManageGuestsProps {
  guests: Guest[];
  onBack: () => void;
}

const COLLECTION = 'guests';

const TYPE_COLORS: Record<string, string> = {
  Guest: 'bg-blue-100 text-blue-700 border-blue-200',
  Longform: 'bg-purple-100 text-purple-700 border-purple-200',
  Influencers: 'bg-orange-100 text-orange-700 border-orange-200',
};

// ── Inline Edit Row ──────────────────────────────────
function EditRow({
  guest,
  onSave,
  onCancel,
}: {
  guest: Partial<Guest> & { id?: string };
  onSave: (data: Partial<Guest>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(guest.name ?? '');
  const [phone, setPhone] = useState(guest.phone ?? '');
  const [email, setEmail] = useState(guest.email ?? '');
  const [tickets, setTickets] = useState(guest.tickets ?? 1);
  const [plusOne, setPlusOne] = useState(guest.plusOne ?? false);
  const [type, setType] = useState<'Guest' | 'Longform' | 'Influencers'>(
    guest.type ?? 'Guest'
  );
  const [category, setCategory] = useState(guest.category ?? '');
  const [notes, setNotes] = useState(guest.notes ?? '');

  return (
    <div className="bg-sunflower-50 border border-sunflower-200 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-sunflower-400 focus:border-sunflower-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Phone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-sunflower-400 focus:border-sunflower-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-sunflower-400 focus:border-sunflower-400 focus:outline-none"
          />
        </div>
        <div>
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
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-sunflower-400 focus:border-sunflower-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Type
          </label>
          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value as 'Guest' | 'Longform' | 'Influencers')
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white focus:ring-2 focus:ring-sunflower-400 focus:border-sunflower-400 focus:outline-none"
          >
            <option value="Guest">Guest</option>
            <option value="Longform">Longform</option>
            <option value="Influencers">Influencers</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Category
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Simar, TTP"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-sunflower-400 focus:border-sunflower-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-gray-600 mt-5">
            <input
              type="checkbox"
              checked={plusOne}
              onChange={(e) => setPlusOne(e.target.checked)}
              className="w-4 h-4 rounded text-sunflower-500 focus:ring-sunflower-400"
            />
            Has Plus One
          </label>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Notes
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-sunflower-400 focus:border-sunflower-400 focus:outline-none"
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (!name.trim()) return;
            const data: Record<string, any> = {
              name: name.trim(),
              tickets,
              plusOne,
              type,
            };
            if (phone.trim()) data.phone = phone.trim();
            if (email.trim()) data.email = email.trim();
            if (category.trim()) data.category = category.trim();
            if (notes.trim()) data.notes = notes.trim();
            onSave(data);
          }}
          disabled={!name.trim()}
          className="flex-1 py-2 rounded-lg bg-sunflower-500 text-white text-sm font-semibold hover:bg-sunflower-600 disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────
export default function ManageGuests({ guests, onBack }: ManageGuestsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const sorted = [...guests].sort((a, b) => {
    const numA = parseInt(a.id) || 0;
    const numB = parseInt(b.id) || 0;
    if (numA && numB) return numA - numB;
    return a.name.localeCompare(b.name);
  });

  const totalTickets = guests.reduce((sum, g) => sum + g.tickets, 0);

  const handleUpdate = async (id: string, data: Partial<Guest>) => {
    try {
      const ref = doc(db, COLLECTION, id);
      await updateDoc(ref, data);
      setEditingId(null);
      showToast(`✓ ${data.name} updated`);
    } catch (err) {
      console.error('Update failed:', err);
      showToast('Failed to update');
    }
  };

  const handleAdd = async (data: Partial<Guest>) => {
    try {
      const docData: Record<string, any> = {
        ...data,
        checkedIn: false,
        checkedInAt: null,
        checkedInBy: null,
        addedOnSite: false,
      };
      await addDoc(collection(db, COLLECTION), docData);
      setAddingNew(false);
      showToast(`✓ ${data.name} added`);
    } catch (err) {
      console.error('Add failed:', err);
      showToast('Failed to add');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
      setDeleteConfirm(null);
      showToast(`✓ ${name} removed`);
    } catch (err) {
      console.error('Delete failed:', err);
      showToast('Failed to remove');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm font-medium text-sunflower-700"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Event Mode
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-900">
              🌻 Manage Guests
            </h1>
          </div>
          <div className="w-20" />
        </div>
        {/* Summary */}
        <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
          <span>
            <strong>{guests.length}</strong> guests
          </span>
          <span>
            <strong>{totalTickets}</strong> total tickets
          </span>
          <span>
            🎟 avg{' '}
            {guests.length > 0
              ? (totalTickets / guests.length).toFixed(1)
              : 0}
          </span>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-16 inset-x-0 z-50 flex justify-center">
          <div className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
            {toast}
          </div>
        </div>
      )}

      {/* Guest list */}
      <div className="px-4 pt-3 space-y-2">
        {sorted.map((guest) =>
          editingId === guest.id ? (
            <EditRow
              key={guest.id}
              guest={guest}
              onSave={(data) => handleUpdate(guest.id, data)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={guest.id}
              className="bg-white rounded-xl border border-gray-200 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-400 font-mono">
                      #{guest.id}
                    </span>
                    <h3 className="font-semibold text-sm text-gray-900 truncate">
                      {guest.name}
                    </h3>
                    {guest.plusOne && (
                      <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1 py-0.5 rounded font-medium">
                        +1
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                        TYPE_COLORS[guest.type] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {guest.type}
                    </span>
                    <span className="text-[10px] font-bold bg-sunflower-100 text-sunflower-800 px-1.5 py-0.5 rounded">
                      🎟 {guest.tickets}
                    </span>
                    {guest.category && (
                      <span className="text-[10px] text-gray-400">
                        {guest.category}
                      </span>
                    )}
                    {guest.phone && (
                      <span className="text-[10px] text-gray-400">
                        📞 {guest.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setEditingId(guest.id);
                      setAddingNew(false);
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                    title="Edit"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  {deleteConfirm === guest.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(guest.id, guest.name)}
                        className="px-2 py-1 rounded bg-red-500 text-white text-xs font-medium"
                      >
                        Remove
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-2 py-1 rounded bg-gray-200 text-gray-600 text-xs font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(guest.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                      title="Remove"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        )}

        {/* Add new guest form */}
        {addingNew && (
          <EditRow
            guest={{}}
            onSave={(data) => handleAdd(data)}
            onCancel={() => setAddingNew(false)}
          />
        )}
      </div>

      {/* Floating add button */}
      {!addingNew && (
        <button
          onClick={() => {
            setAddingNew(true);
            setEditingId(null);
          }}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full
                     bg-sunflower-500 text-white shadow-lg
                     hover:bg-sunflower-600 active:bg-sunflower-700
                     flex items-center justify-center text-3xl
                     transition-all duration-150"
          aria-label="Add guest"
        >
          +
        </button>
      )}
    </div>
  );
}
