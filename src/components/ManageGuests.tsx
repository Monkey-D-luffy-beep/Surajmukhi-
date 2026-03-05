// src/components/ManageGuests.tsx
// Pre-event guest list management — spreadsheet-style table UI
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

const TYPE_BG: Record<string, string> = {
  Guest: 'bg-blue-50 text-blue-700',
  Longform: 'bg-purple-50 text-purple-700',
  Influencers: 'bg-orange-50 text-orange-700',
};

// ── Edit / Add Modal ──────────────────────────────────
function EditModal({
  guest,
  onSave,
  onCancel,
  title,
}: {
  guest: Partial<Guest> & { id?: string };
  onSave: (data: Record<string, any>) => void;
  onCancel: () => void;
  title: string;
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
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-sunflower-400 focus:border-sunflower-400 focus:outline-none" autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-sunflower-400 focus:border-sunflower-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-sunflower-400 focus:border-sunflower-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tickets</label>
                <input type="number" inputMode="numeric" min={1} max={20} value={tickets}
                  onChange={(e) => setTickets(Number(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-sunflower-400 focus:border-sunflower-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
                <select value={type} onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white focus:ring-2 focus:ring-sunflower-400 focus:border-sunflower-400 focus:outline-none">
                  <option value="Guest">Guest</option>
                  <option value="Longform">Longform</option>
                  <option value="Influencers">Influencers</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Simar, TTP"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-sunflower-400 focus:border-sunflower-400 focus:outline-none" />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <input type="checkbox" checked={plusOne} onChange={(e) => setPlusOne(e.target.checked)}
                    className="w-4 h-4 rounded text-sunflower-500 focus:ring-sunflower-400" />
                  Plus +1
                </label>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-sunflower-400 focus:border-sunflower-400 focus:outline-none" />
            </div>
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={onCancel}
              className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={() => {
                if (!name.trim()) return;
                const data: Record<string, any> = { name: name.trim(), tickets, plusOne, type };
                if (phone.trim()) data.phone = phone.trim();
                else data.phone = '';
                if (email.trim()) data.email = email.trim();
                else data.email = '';
                if (category.trim()) data.category = category.trim();
                else data.category = '';
                if (notes.trim()) data.notes = notes.trim();
                else data.notes = '';
                onSave(data);
              }}
              disabled={!name.trim()}
              className="flex-1 py-2.5 rounded-lg bg-sunflower-500 text-white text-sm font-bold hover:bg-sunflower-600 disabled:opacity-50">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component — Spreadsheet-style table ──────────────
export default function ManageGuests({ guests, onBack }: ManageGuestsProps) {
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const sorted = [...guests].sort((a, b) => {
    const numA = parseInt(a.id) || 9999;
    const numB = parseInt(b.id) || 9999;
    return numA - numB;
  });

  const totalTickets = guests.reduce((sum, g) => sum + (g.tickets || 1), 0);

  const handleUpdate = async (id: string, data: Record<string, any>) => {
    try {
      await updateDoc(doc(db, COLLECTION, id), data);
      setEditingGuest(null);
      showToast('✓ Updated');
    } catch (err) {
      console.error('Update failed:', err);
      showToast('❌ Update failed');
    }
  };

  const handleAdd = async (data: Record<string, any>) => {
    try {
      const maxId = guests.reduce((max, g) => {
        const n = parseInt(g.id);
        return !isNaN(n) && n > max ? n : max;
      }, 0);
      const docData: Record<string, any> = {
        ...data,
        id: String(maxId + 1),
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
      showToast('❌ Add failed');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
      setDeleteConfirm(null);
      showToast(`✓ ${name} removed`);
    } catch (err) {
      console.error('Delete failed:', err);
      showToast('❌ Remove failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Sticky Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <button onClick={onBack}
            className="flex items-center gap-1 text-sm font-semibold text-sunflower-700 hover:text-sunflower-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Event Mode
          </button>
          <h1 className="text-lg font-bold text-gray-900">🌻 Manage Guests</h1>
          <button onClick={() => { setAddingNew(true); setEditingGuest(null); }}
            className="text-sm font-bold bg-sunflower-500 text-white px-3 py-1.5 rounded-lg hover:bg-sunflower-600 active:bg-sunflower-700">
            + Add
          </button>
        </div>

        {/* Summary bar — BIG total tickets */}
        <div className="flex items-center justify-around mt-3 bg-sunflower-50 rounded-xl py-3 px-4 border border-sunflower-200">
          <div className="text-center">
            <span className="text-3xl font-extrabold text-sunflower-700">{totalTickets}</span>
            <span className="block text-[11px] font-bold text-sunflower-600 uppercase tracking-wider">Total Tickets</span>
          </div>
          <div className="h-10 w-px bg-sunflower-200" />
          <div className="text-center">
            <span className="text-2xl font-bold text-gray-700">{guests.length}</span>
            <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Guests</span>
          </div>
          <div className="h-10 w-px bg-sunflower-200" />
          <div className="text-center">
            <span className="text-2xl font-bold text-gray-700">
              {(totalTickets / (guests.length || 1)).toFixed(1)}
            </span>
            <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Avg/Guest</span>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 inset-x-0 z-50 flex justify-center pointer-events-none">
          <div className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg">{toast}</div>
        </div>
      )}

      {/* Spreadsheet Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[640px]">
          <thead className="bg-gray-100 sticky top-[140px] z-10">
            <tr className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-2 px-2 text-center w-10">#</th>
              <th className="py-2 px-2">Name</th>
              <th className="py-2 px-2 text-center w-14">🎟</th>
              <th className="py-2 px-2 text-center w-10">+1</th>
              <th className="py-2 px-2 w-20">Type</th>
              <th className="py-2 px-2 w-16">Cat.</th>
              <th className="py-2 px-2 w-24">Phone</th>
              <th className="py-2 px-2 text-center w-16">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((guest, idx) => (
              <tr
                key={guest.id}
                className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-sunflower-50/50 transition-colors`}
              >
                <td className="py-2 px-2 text-center text-xs text-gray-400 font-mono">
                  {parseInt(guest.id) || '—'}
                </td>
                <td className="py-2 px-2 font-medium text-gray-900 whitespace-nowrap">
                  {guest.name}
                  {guest.notes && (
                    <span className="text-[10px] text-gray-400 ml-1">({guest.notes})</span>
                  )}
                </td>
                <td className="py-2 px-2 text-center">
                  <span className="inline-block min-w-[24px] text-center font-bold text-sunflower-700 bg-sunflower-100 rounded px-1.5 py-0.5 text-xs">
                    {guest.tickets}
                  </span>
                </td>
                <td className="py-2 px-2 text-center text-xs">
                  {guest.plusOne ? '✓' : '—'}
                </td>
                <td className="py-2 px-2">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${TYPE_BG[guest.type] ?? 'bg-gray-100 text-gray-600'}`}>
                    {guest.type}
                  </span>
                </td>
                <td className="py-2 px-2 text-xs text-gray-500 truncate max-w-[60px]">
                  {guest.category || '—'}
                </td>
                <td className="py-2 px-2 text-xs text-gray-500 whitespace-nowrap">
                  {guest.phone || '—'}
                </td>
                <td className="py-2 px-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => { setEditingGuest(guest); setAddingNew(false); }}
                      className="p-1 rounded hover:bg-gray-200 text-gray-500"
                      title="Edit"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {deleteConfirm === guest.id ? (
                      <div className="flex gap-0.5">
                        <button onClick={() => handleDelete(guest.id, guest.name)}
                          className="px-1.5 py-0.5 rounded bg-red-500 text-white text-[10px] font-bold">
                          Yes
                        </button>
                        <button onClick={() => setDeleteConfirm(null)}
                          className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 text-[10px] font-bold">
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(guest.id)}
                        className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                        title="Remove"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingGuest && (
        <EditModal
          guest={editingGuest}
          title={`Edit: ${editingGuest.name}`}
          onSave={(data) => handleUpdate(editingGuest.id, data)}
          onCancel={() => setEditingGuest(null)}
        />
      )}

      {/* Add Modal */}
      {addingNew && (
        <EditModal
          guest={{}}
          title="Add New Guest"
          onSave={(data) => handleAdd(data)}
          onCancel={() => setAddingNew(false)}
        />
      )}

      {/* Floating add button */}
      <button
        onClick={() => { setAddingNew(true); setEditingGuest(null); }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full
                   bg-sunflower-500 text-white shadow-lg
                   hover:bg-sunflower-600 active:bg-sunflower-700
                   flex items-center justify-center text-3xl
                   transition-all duration-150"
        aria-label="Add guest"
      >
        +
      </button>
    </div>
  );
}
