// src/components/ReportButton.tsx
// Downloads a CSV/Excel report of all guests with check-in status
import React, { useState } from 'react';
import type { Guest } from '../data/guests';

interface ReportButtonProps {
  guests: Guest[];
}

function formatTimestamp(ts: any): string {
  if (!ts) return '';
  try {
    const date = ts?.toDate?.() ?? new Date(ts.seconds * 1000);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}

function escapeCSV(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function generateCSV(guests: Guest[]): string {
  const headers = [
    'Sr No',
    'Name',
    'Phone',
    'Email',
    'Type',
    'Category',
    'Tickets',
    'Plus One',
    'Status',
    'Checked In At',
    'Checked In By',
    'Walk-in',
    'Notes',
  ];

  // Sort: checked-in first (by time), then unchecked alphabetically
  const sorted = [...guests].sort((a, b) => {
    if (a.checkedIn !== b.checkedIn) return a.checkedIn ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  const rows = sorted.map((g, i) => {
    return [
      String(i + 1),
      escapeCSV(g.name),
      escapeCSV(g.phone ?? ''),
      escapeCSV(g.email ?? ''),
      g.type,
      g.category ?? '',
      String(g.tickets),
      g.plusOne ? 'Yes' : 'No',
      g.checkedIn ? 'Checked In' : 'Not Arrived',
      formatTimestamp(g.checkedInAt),
      g.checkedInBy ?? '',
      g.addedOnSite ? 'Yes' : 'No',
      escapeCSV(g.notes ?? ''),
    ].join(',');
  });

  // Summary rows at bottom
  const checkedIn = guests.filter((g) => g.checkedIn).length;
  const remaining = guests.filter((g) => !g.checkedIn).length;
  const walkIns = guests.filter((g) => g.addedOnSite).length;
  const totalTickets = guests.reduce((sum, g) => sum + g.tickets, 0);

  rows.push(''); // blank line
  rows.push(`SUMMARY,,,,,,,,,,,,`);
  rows.push(`Total Guests,${guests.length},,,,,,,,,,,`);
  rows.push(`Checked In,${checkedIn},,,,,,,,,,,`);
  rows.push(`Not Arrived,${remaining},,,,,,,,,,,`);
  rows.push(`Walk-ins Added,${walkIns},,,,,,,,,,,`);
  rows.push(`Total Tickets,${totalTickets},,,,,,,,,,,`);

  return [headers.join(','), ...rows].join('\n');
}

function downloadCSV(csv: string, filename: string) {
  // BOM for Excel to recognize UTF-8
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ReportButton({ guests }: ReportButtonProps) {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }).replace(':', '');
    const filename = `Surajmukhi_Report_${dateStr}_${timeStr}.csv`;

    const csv = generateCSV(guests);
    downloadCSV(csv, filename);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const checkedIn = guests.filter((g) => g.checkedIn).length;

  return (
    <button
      onClick={handleDownload}
      className="w-full flex items-center justify-center gap-2 py-3 px-4 
                 bg-white border border-gray-200 rounded-xl shadow-sm
                 text-sm font-medium text-gray-700
                 hover:bg-gray-50 active:bg-gray-100 transition-colors"
    >
      {downloaded ? (
        <>
          <span className="text-green-600">✓</span>
          <span className="text-green-600">Report Downloaded!</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Download Report ({checkedIn}/{guests.length} checked in)</span>
        </>
      )}
    </button>
  );
}
