# 🎯 MASTER PROMPT — Event Guest Check-In App

> Paste this entire file as your first message to GitHub Copilot Chat, Cursor AI, or Claude.
> It contains everything the AI needs to scaffold the full application in one shot.

---

## CONTEXT

Build a **mobile-first, offline-capable event guest check-in Progressive Web App (PWA)**.

The app will be used by 1–2 staff members on mobile phones to check in ~32 guests at a live event with **unreliable internet**. Speed is the #1 priority. Staff must be able to:
- Search guests instantly by name or phone (regex, in-memory, zero latency)
- Check in a guest with one tap
- Add a walk-in guest not on the list and immediately check them in
- See real-time sync between 2 devices (Device A checks in someone → Device B sees it go green)
- Work fully offline — all check-ins queue locally and sync when internet returns

---

## TECH STACK

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | React + TypeScript + Vite | Fast dev, small bundle |
| Styling | Tailwind CSS | Utility-first, mobile-friendly |
| Database | Firebase Firestore | Free tier, offline persistence, real-time listeners |
| Offline | Firestore `enableIndexedDbPersistence()` | Auto-queues writes, syncs on reconnect |
| PWA | `vite-plugin-pwa` | Installable on phone home screen |
| Hosting | Firebase Hosting (free) | CDN, HTTPS, easy deploy |

**Firebase Spark Plan is FREE** — 50k reads/day, 20k writes/day — more than enough.

---

## GUEST DATA SCHEMA

```typescript
interface Guest {
  id: string;           // "1", "2", ... matches Sr. No
  name: string;
  plusOne: boolean;
  email?: string;
  phone?: string;
  tickets: number;
  type: 'Guest' | 'Longform' | 'Influencers';
  category?: string;    // "Simar" etc
  checkedIn: boolean;
  checkedInAt?: any;    // Firestore Timestamp
  checkedInBy?: string; // "Device A" or "Device B"
  addedOnSite: boolean; // true if added during event day
  notes?: string;
}
```

---

## FILE STRUCTURE TO GENERATE

```
checkin-app/
├── public/
│   └── manifest.json             # PWA manifest
├── src/
│   ├── main.tsx                  # Entry point, register SW
│   ├── App.tsx                   # Root layout, stats bar, tabs
│   ├── firebase.ts               # Firebase init + offline persistence
│   ├── data/
│   │   └── guests.ts             # Seed data array (all 32 guests)
│   ├── hooks/
│   │   ├── useGuests.ts          # Firestore real-time subscription
│   │   └── useSearch.ts          # In-memory regex search
│   ├── components/
│   │   ├── StatsBar.tsx          # "12 / 32 checked in" progress
│   │   ├── SearchBar.tsx         # Auto-focused search input
│   │   ├── GuestCard.tsx         # Individual guest row
│   │   ├── AddGuestModal.tsx     # Walk-in guest form
│   │   └── DeviceBadge.tsx       # Shows which device checked in
├── scripts/
│   └── seedFirestore.ts          # One-time data import script
├── .env.example                  # Firebase config template
├── .env.local                    # Your actual keys (gitignored)
├── vite.config.ts                # Vite + PWA plugin
├── firestore.rules               # Security rules
└── firebase.json                 # Firebase deploy config
```

---

## DETAILED COMPONENT SPECS

### `src/firebase.ts`
```typescript
// Initialize Firebase
// Enable Firestore offline persistence with enableIndexedDbPersistence()
// Export: db (Firestore instance)
// Read config from import.meta.env.VITE_FIREBASE_* variables
```

### `src/hooks/useGuests.ts`
```typescript
// Subscribe to Firestore 'guests' collection via onSnapshot
// Return:
//   guests: Guest[]
//   loading: boolean
//   checkIn: (id: string) => void  → sets checkedIn:true, checkedInAt:serverTimestamp(), checkedInBy: DEVICE_NAME
//   addGuest: (partial: Partial<Guest>) => Promise<string>  → returns new doc id
//   stats: { total: number, checkedIn: number, remaining: number }
// DEVICE_NAME = localStorage.getItem('deviceName') ?? 'Device A'
// Firestore handles offline: writes queue locally, sync on reconnect
```

### `src/hooks/useSearch.ts`
```typescript
// Pure in-memory filter — ZERO network calls
// Input: (guests: Guest[], query: string) => Guest[]
// Regex match against: name, phone, email simultaneously
// "pranav" → case-insensitive match anywhere in name
// "9552" → matches phone numbers containing that string
// Sort order: unchecked first, then alphabetical
// Handle empty/null phone/email gracefully
```

### `src/components/SearchBar.tsx`
```typescript
// Large input, auto-focused on mount (ref + useEffect)
// Clears on Escape key
// Shows live count: "3 of 32 guests"
// inputMode="search" for mobile keyboard
// No search button needed — filters as you type
```

### `src/components/GuestCard.tsx`
```typescript
// Layout:
//   LEFT: Name (bold, large) + phone (small, muted)
//   CENTER: Ticket count badge + Type badge (color coded)
//   RIGHT: CHECK IN button OR green checkmark + time
//
// Colors:
//   Guest → blue badge
//   Longform → purple badge
//   Influencers → orange badge
//
// Checked in state:
//   Card background → green-50
//   Show: ✓ Checked In · [time] · by [Device A/B]
//
// CHECK IN button:
//   Optimistic update — disable immediately on tap
//   Large tap target (min 48px height) for fat fingers
//   Loading spinner while Firestore confirms
```

### `src/components/AddGuestModal.tsx`
```typescript
// Trigger: search returns 0 results
// Show: "No guest found — Add [query] as walk-in?"
// Form fields:
//   Name* (pre-filled from search query)
//   Phone (optional)
//   Tickets (number, default 1)
//   Type (dropdown: Guest / Longform / Influencers)
// On submit:
//   1. addGuest() → creates Firestore doc with addedOnSite: true
//   2. checkIn() → immediately marks them checked in
//   3. Show: "✓ Added & Checked In" confirmation toast
//   4. Close modal, clear search
```

### `src/App.tsx`
```typescript
// Layout:
//   <StatsBar />          → "12 / 32 · 20 remaining" + progress bar
//   <SearchBar />         → always visible, sticky
//   <TabBar />            → All | Remaining | Checked In
//   <GuestList />         → filtered + sorted cards
//
// When query = ""  → show all guests, unchecked first
// When query has results → show filtered list
// When query has 0 results → show <AddGuestModal />
// Keyboard shortcut: Cmd/Ctrl+K focuses search
```

### `scripts/seedFirestore.ts`
```typescript
// One-time script — run before the event
// Import guests array from src/data/guests.ts
// Use Firestore writeBatch() (max 500 per batch)
// Set all checkedIn: false, addedOnSite: false
// Use guest.id as Firestore document ID
// Log: "Seeded 32 guests ✓"
// Usage: npx ts-node --esm scripts/seedFirestore.ts
```

---

## CRITICAL REQUIREMENTS

1. **Offline first** — app must work with zero internet after first load
2. **Speed** — search must feel instant, never debounce more than 50ms
3. **No data loss** — Firestore offline queue ensures check-ins aren't lost
4. **2-device sync** — both devices listen to same Firestore collection via `onSnapshot`
5. **Mobile UX** — all tap targets ≥ 48px, large readable text, no hover-only interactions
6. **Device naming** — on first open, prompt "Name this device (e.g. Gate 1)" → stored in localStorage

---

## ENVIRONMENT VARIABLES (`.env.local`)

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## SEED DATA

The guest data is pre-loaded in `src/data/guests.ts`. See that file.
Run `npx ts-node --esm scripts/seedFirestore.ts` once before the event to push data to Firestore.

---

## DEPLOYMENT (5 minutes)

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Init hosting (select your project)
firebase init hosting

# 4. Build
npm run build

# 5. Deploy
firebase deploy --only hosting

# Done! Share URL with both devices. Open on WiFi first to cache.
```

---

## PRE-EVENT CHECKLIST

- [ ] Firebase project created (console.firebase.google.com)
- [ ] `.env.local` filled with Firebase config
- [ ] `npm run seed` run successfully (check Firestore console for 32 docs)
- [ ] App deployed to Firebase Hosting
- [ ] Both devices open the URL on **good WiFi** (caches everything)
- [ ] Both devices named ("Gate 1", "Gate 2") on first launch
- [ ] Test: check in one guest on Device A → verify it goes green on Device B
- [ ] Test: turn off WiFi → check in someone → turn WiFi back on → verify sync

---

*Now generate all files listed in the FILE STRUCTURE section above, fully implemented.*
