// src/components/ManageGuests.tsx
// Excel-like inline-editable spreadsheet for pre-event guest management
import React, { useState, useRef, useEffect } from 'react';
import type { Guest } from '../data/guests';
import {
  doc,
  deleteDoc,
  updateDoc,
  setDoc,
  collection,
} from 'firebase/firestore';
import { db } from '../firebase';

interface ManageGuestsProps {
  guests: Guest[];
  onBack: () => void;
}

const COLL = 'guests';

// ── Editable Cell ─────────────────────────────────────
function EditableCell({
  value,
  onChange,
  type = 'text',
  className = '',
  placeholder = '',
  min,
  max,
}: {
  value: string | number;
  onChange: (val: string) => void;
  type?: 'text' | 'number' | 'tel' | 'email';
  className?: string;
  placeholder?: string;
  min?: number;
  max?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  if (!editing) {
    return (
      <span
        onClick={() => setEditing(true)}
        className={`cursor-pointer hover:bg-sunflower-100 px-1 py-0.5 rounded block truncate min-h-[20px] ${className}`}
        title="Click to edit"
      >
        {value || <span className="text-gray-300">{placeholder || '—'}</span>}
      </span>
    );
  }

  return (
    <input
      ref={ref}
      type={type}
      inputMode={type === 'number' ? 'numeric' : type === 'tel' ? 'tel' : undefined}
      value={draft}
      min={min}
      max={max}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        setEditing(false);
        if (draft !== String(value)) onChange(draft);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          setEditing(false);
          if (draft !== String(value)) onChange(draft);
        }
        if (e.key === 'Escape') {
          setEditing(false);
          setDraft(String(value));
        }
      }}
      className={`w-full px-1 py-0.5 rounded border border-sunflower-400 text-sm focus:outline-none focus:ring-1 focus:ring-sunflower-400 bg-white ${className}`}
    />
  );
}

// ── Select Cell ───────────────────────────────────────
function SelectCell({
  value,
  options,
  onChange,
  className = '',
}: {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`bg-transparent text-xs border-0 cursor-pointer hover:bg-sunflower-100 rounded px-0 py-0.5 focus:outline-none focus:ring-1 focus:ring-sunflower-400 ${className}`}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

// ── Checkbox Cell ─────────────────────────────────────
function CheckCell({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4 rounded text-sunflower-500 focus:ring-sunflower-400 cursor-pointer"
    />
  );
}

// ── New Row ──────────────────────────────────────────
function NewRow({
  nextId,
  onSave,
  onCancel,
}: {
  nextId: number;
  onSave: (data: Record<string, any>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [tickets, setTickets] = useState('1');
  const [plusOne, setPlusOne] = useState(false);
  const [type, setType] = useState('Guest');
  const [category, setCategory] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const save = () => {
    if (!name.trim()) return;
    const data: Record<string, any> = {
      name: name.trim(),
      tickets: parseInt(tickets) || 1,
      plusOne,
      type,
    };
    if (phone.trim()) data.phone = phone.trim();
    if (email.trim()) data.email = email.trim();
    if (category.trim()) data.category = category.trim();
    onSave(data);
  };

  return (
    <tr className="bg-green-50 border-2 border-green-300">
      <td className="py-1.5 px-2 text-center text-xs text-gray-400 font-mono">{nextId}</td>
      <td className="py-1.5 px-2">
        <input ref={nameRef} type="text" value={name} onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onCancel(); }}
          placeholder="Guest name *"
          className="w-full px-1 py-0.5 rounded border border-green-400 text-sm focus:outline-none focus:ring-1 focus:ring-green-400 bg-white" />
      </td>
      <td className="py-1.5 px-2 text-center">
        <input type="number" value={tickets} min={1} max={20} onChange={(e) => setTickets(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
          className="w-12 px-1 py-0.5 rounded border border-green-400 text-sm text-center focus:outline-none focus:ring-1 focus:ring-green-400 bg-white" />
      </td>
      <td className="py-1.5 px-2 text-center">
        <input type="checkbox" checked={plusOne} onChange={(e) => setPlusOne(e.target.checked)}
          className="w-4 h-4 rounded text-sunflower-500 focus:ring-sunflower-400" />
      </td>
      <td className="py-1.5 px-2">
        <select value={type} onChange={(e) => setType(e.target.value)}
          className="text-xs border border-green-400 rounded px-1 py-0.5 bg-white focus:outline-none">
          <option value="Guest">Guest</option>
          <option value="Longform">Longform</option>
          <option value="Influencers">Influencers</option>
        </select>
      </td>
      <td className="py-1.5 px-2">
        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
          placeholder="Cat."
          className="w-full px-1 py-0.5 rounded border border-green-400 text-xs focus:outline-none bg-white" />
      </td>
      <td className="py-1.5 px-2">
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
          placeholder="Phone"
          className="w-full px-1 py-0.5 rounded border border-green-400 text-xs focus:outline-none bg-white" />
      </td>
      <td className="py-1.5 px-2">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
          placeholder="Email"
          className="w-full px-1 py-0.5 rounded border border-green-400 text-xs focus:outline-none bg-white" />
      </td>
      <td className="py-1.5 px-2 text-center">
        <div className="flex gap-0.5 justify-center">
          <button onClick={save} disabled={!name.trim()}
            className="px-2 py-0.5 rounded bg-green-500 text-white text-[10px] font-bold disabled:opacity-40 hover:bg-green-600">
            ✓
          </button>
          <button onClick={onCancel}
            className="px-2 py-0.5 rounded bg-gray-200 text-gray-600 text-[10px] font-bold hover:bg-gray-300">
            ✕
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Main Component ───────────────────────────────────
export default function ManageGuests({ guests, onBack }: ManageGuestsProps) {
  const [addingNew, setAddingNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const sorted = [...guests].sort((a, b) => {
    const na = parseInt(a.id) || 9999;
    const nb = parseInt(b.id) || 9999;
    return na - nb;
  });

  const totalTickets = guests.reduce((sum, g) => sum + (g.tickets || 1), 0);

  // Direct inline field update
  const patchField = async (id: string, field: string, value: any) => {
    try {
      await updateDoc(doc(db, COLL, id), { [field]: value });
    } catch (err) {
      console.error(`Failed to update ${field}:`, err);
      showToast(`❌ Failed to save`);
    }
  };

  const handleAdd = async (data: Record<string, any>) => {
    try {
      const maxId = guests.reduce((max, g) => {
        const n = parseInt(g.id);
        return !isNaN(n) && n > max ? n : max;
      }, 0);
      const nextId = String(maxId + 1);
      const docData: Record<string, any> = {
        ...data,
        checkedIn: false,
        checkedInAt: null,
        checkedInBy: null,
        addedOnSite: false,
      };
      await setDoc(doc(db, COLL, nextId), docData);
      setAddingNew(false);
      showToast(`✓ ${data.name} added (#${nextId})`);
    } catch (err) {
      console.error('Add failed:', err);
      showToast('❌ Add failed');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteDoc(doc(db, COLL, id));
      setDeleteConfirm(null);
      showToast(`✓ ${name} removed`);
    } catch (err) {
      console.error('Delete failed:', err);
      showToast('❌ Remove failed');
    }
  };

  const nextId = guests.reduce((max, g) => {
    const n = parseInt(g.id);
    return !isNaN(n) && n > max ? n : max;
  }, 0) + 1;

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
            Back
          </button>
          <h1 className="text-lg font-bold text-gray-900">🌻 Guest Sheet</h1>
          <button onClick={() => setAddingNew(true)}
            className="text-sm font-bold bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 active:bg-green-700">
            + Row
          </button>
        </div>

        {/* Big Totals */}
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
            <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Avg</span>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-1.5">
          Click any cell to edit · Enter to save · Esc to cancel
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 inset-x-0 z-50 flex justify-center pointer-events-none">
          <div className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg">{toast}</div>
        </div>
      )}

      {/* Spreadsheet Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[720px] border-collapse">
          <thead className="bg-gray-100 sticky top-[152px] z-10 border-b-2 border-gray-300">
            <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-2 px-2 text-center w-8 border-r border-gray-200">#</th>
              <th className="py-2 px-2 min-w-[140px] border-r border-gray-200">Name</th>
              <th className="py-2 px-2 text-center w-12 border-r border-gray-200">🎟</th>
              <th className="py-2 px-2 text-center w-8 border-r border-gray-200">+1</th>
              <th className="py-2 px-2 w-20 border-r border-gray-200">Type</th>
              <th className="py-2 px-2 w-16 border-r border-gray-200">Category</th>
              <th className="py-2 px-2 w-24 border-r border-gray-200">Phone</th>
              <th className="py-2 px-2 w-32 border-r border-gray-200">Email</th>
              <th className="py-2 px-2 text-center w-12">Del</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((g, idx) => (
              <tr key={g.id}
                className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'} hover:bg-sunflower-50/40 border-b border-gray-100`}>
                {/* # */}
                <td className="py-1 px-2 text-center text-[10px] text-gray-400 font-mono border-r border-gray-100">
                  {parseInt(g.id) || '·'}
                </td>
                {/* Name */}
                <td className="py-1 px-1 border-r border-gray-100">
                  <EditableCell
                    value={g.name}
                    onChange={(v) => patchField(g.id, 'name', v.trim())}
                    className="text-xs font-medium text-gray-900"
                  />
                </td>
                {/* Tickets */}
                <td className="py-1 px-1 text-center border-r border-gray-100">
                  <EditableCell
                    value={g.tickets}
                    type="number"
                    min={1}
                    max={20}
                    onChange={(v) => patchField(g.id, 'tickets', parseInt(v) || 1)}
                    className="text-xs font-bold text-sunflower-700 text-center"
                  />
                </td>
                {/* Plus One */}
                <td className="py-1 px-2 text-center border-r border-gray-100">
                  <CheckCell
                    checked={g.plusOne ?? false}
                    onChange={(v) => patchField(g.id, 'plusOne', v)}
                  />
                </td>
                {/* Type */}
                <td className="py-1 px-1 border-r border-gray-100">
                  <SelectCell
                    value={g.type}
                    options={['Guest', 'Longform', 'Influencers']}
                    onChange={(v) => patchField(g.id, 'type', v)}
                  />
                </td>
                {/* Category */}
                <td className="py-1 px-1 border-r border-gray-100">
                  <EditableCell
                    value={g.category || ''}
                    placeholder="—"
                    onChange={(v) => patchField(g.id, 'category', v.trim())}
                    className="text-xs text-gray-500"
                  />
                </td>
                {/* Phone */}
                <td className="py-1 px-1 border-r border-gray-100">
                  <EditableCell
                    value={g.phone || ''}
                    type="tel"
                    placeholder="—"
                    onChange={(v) => patchField(g.id, 'phone', v.trim())}
                    className="text-xs text-gray-500"
                  />
                </td>
                {/* Email */}
                <td className="py-1 px-1 border-r border-gray-100">
                  <EditableCell
                    value={g.email || ''}
                    type="email"
                    placeholder="—"
                    onChange={(v) => patchField(g.id, 'email', v.trim())}
                    className="text-xs text-gray-500"
                  />
                </td>
                {/* Delete */}
                <td className="py-1 px-2 text-center">
                  {deleteConfirm === g.id ? (
                    <div className="flex gap-0.5 justify-center">
                      <button onClick={() => handleDelete(g.id, g.name)}
                        className="px-1.5 py-0.5 rounded bg-red-500 text-white text-[9px] font-bold">
                        Yes
                      </button>
                      <button onClick={() => setDeleteConfirm(null)}
                        className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 text-[9px] font-bold">
                        No
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(g.id)}
                      className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {/* New row (inline, at bottom of table) */}
            {addingNew && (
              <NewRow
                nextId={nextId}
                onSave={handleAdd}
                onCancel={() => setAddingNew(false)}
              />
            )}
          </tbody>
        </table>
      </div>

      {/* Floating add row button */}
      {!addingNew && (
        <button
          onClick={() => setAddingNew(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full
                     bg-green-500 text-white shadow-lg
                     hover:bg-green-600 active:bg-green-700
                     flex items-center justify-center text-3xl
                     transition-all duration-150"
          aria-label="Add new row"
        >
          +
        </button>
      )}
    </div>
  );
}
