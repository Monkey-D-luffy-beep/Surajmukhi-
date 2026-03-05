// src/hooks/useSearch.ts
// Pure in-memory search with fuzzy matching — ZERO network calls, instant results

import { useMemo } from 'react';
import type { Guest } from '../data/guests';

export type TabFilter = 'all' | 'remaining' | 'checkedIn';

/**
 * Simple fuzzy distance: how many chars in `query` must be changed to match `target`.
 * Uses Levenshtein distance. Returns Infinity if too far apart.
 */
function levenshtein(a: string, b: string): number {
  const la = a.length;
  const lb = b.length;
  if (la === 0) return lb;
  if (lb === 0) return la;
  // Don't compute for very different-length strings
  if (Math.abs(la - lb) > 3) return Infinity;

  const dp: number[][] = Array.from({ length: la + 1 }, () => Array(lb + 1).fill(0));
  for (let i = 0; i <= la; i++) dp[i][0] = i;
  for (let j = 0; j <= lb; j++) dp[0][j] = j;

  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,     // deletion
        dp[i][j - 1] + 1,     // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return dp[la][lb];
}

/**
 * Check if query fuzzy-matches any word in name.
 * Returns best (lowest) distance found, or Infinity if no close match.
 * Threshold: max 2 edits for queries ≥ 3 chars.
 */
function fuzzyNameMatch(name: string, query: string): number {
  if (query.length < 2) return Infinity;
  const qLower = query.toLowerCase();
  const words = name.toLowerCase().split(/\s+/);
  let best = Infinity;

  for (const word of words) {
    // Compare query against the same-length prefix of the word
    const slice = word.slice(0, Math.max(qLower.length, word.length));
    const dist = levenshtein(qLower, slice);
    if (dist < best) best = dist;
    // Also compare against full word
    const dist2 = levenshtein(qLower, word);
    if (dist2 < best) best = dist2;
  }

  // Also check full name
  const fullDist = levenshtein(qLower, name.toLowerCase());
  if (fullDist < best) best = fullDist;

  // Threshold: allow up to 2 edits
  const maxDist = qLower.length <= 3 ? 1 : 2;
  return best <= maxDist ? best : Infinity;
}

export function useSearch(
  guests: Guest[],
  query: string,
  tab: TabFilter
): Guest[] {
  return useMemo(() => {
    // Step 1: Apply tab filter
    let filtered = guests;
    if (tab === 'remaining') filtered = guests.filter((g) => !g.checkedIn);
    if (tab === 'checkedIn') filtered = guests.filter((g) => g.checkedIn);

    // Step 2: Apply search query
    if (!query.trim()) {
      // No query — sort: unchecked first, then by name
      return [...filtered].sort((a, b) => {
        if (a.checkedIn !== b.checkedIn) return a.checkedIn ? 1 : -1;
        return a.name.localeCompare(b.name);
      });
    }

    const q = query.trim();
    const qSafe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let regex: RegExp;
    try {
      regex = new RegExp(q, 'i');
    } catch {
      regex = new RegExp(qSafe, 'i');
    }

    // Score each guest for ranking: lower score = better match
    const scored = filtered
      .map((guest) => {
        const nameLower = guest.name.toLowerCase();
        const qLower = q.toLowerCase();
        const phoneClean = guest.phone?.replace(/\s/g, '') ?? '';
        const phone = guest.phone ?? '';
        const email = guest.email ?? '';

        let score = Infinity; // no match

        // --- Exact / prefix / contains matches (best scores) ---
        if (nameLower === qLower) score = 0;                                    // exact
        else if (nameLower.startsWith(qLower)) score = 1;                       // starts with
        else if (nameLower.split(' ').some(w => w.startsWith(qLower))) score = 2; // word starts with
        else if (regex.test(guest.name)) score = 3;                             // contains

        // --- Phone matches ---
        if (score > 1) {
          if (phoneClean === q || phone === q) score = Math.min(score, 1);
          else if (phoneClean.startsWith(q) || phone.startsWith(q)) score = Math.min(score, 2);
          else if (regex.test(phoneClean) || regex.test(phone)) score = Math.min(score, 4);
        }

        // --- Email matches ---
        if (score > 3 && email && regex.test(email)) score = Math.min(score, 5);

        // --- Fuzzy match (nina → neena, saurav → sourav) ---
        if (score === Infinity) {
          const fuzzyDist = fuzzyNameMatch(guest.name, q);
          if (fuzzyDist < Infinity) {
            // Score 6-7 based on distance (close fuzzy = 6, further = 7)
            score = 6 + Math.min(fuzzyDist, 1);
          }
        }

        return { guest, score };
      })
      .filter((x) => x.score < Infinity);

    // Sort: best score first, then unchecked before checked, then alphabetical
    return scored
      .sort((a, b) => {
        if (a.score !== b.score) return a.score - b.score;
        if (a.guest.checkedIn !== b.guest.checkedIn) return a.guest.checkedIn ? 1 : -1;
        return a.guest.name.localeCompare(b.guest.name);
      })
      .map((x) => x.guest);
  }, [guests, query, tab]);
}
