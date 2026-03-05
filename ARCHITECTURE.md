# ARCHITECTURE.md — Event Check-In App

## System Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    DEVICE A (Gate 1)                    │
│  ┌────────────────────────────────────────────────┐    │
│  │  React App (Vite PWA)                          │    │
│  │  ┌──────────┐  ┌─────────┐  ┌──────────────┐  │    │
│  │  │ SearchBar│  │GuestList│  │ AddGuestModal │  │    │
│  │  └──────────┘  └────┬────┘  └──────┬───────┘  │    │
│  │                     │              │            │    │
│  │  ┌──────────────────▼──────────────▼─────────┐ │    │
│  │  │  useGuests() hook (onSnapshot listener)   │ │    │
│  │  └──────────────────────┬────────────────────┘ │    │
│  │                         │                       │    │
│  │  ┌──────────────────────▼────────────────────┐ │    │
│  │  │  Firestore SDK (with IndexedDB cache)     │ │    │
│  │  │  • Reads → from IndexedDB (offline-first) │ │    │
│  │  │  • Writes → queue in IndexedDB, flush     │ │    │
│  │  └──────────────────────┬────────────────────┘ │    │
│  └─────────────────────────┼──────────────────────┘    │
└────────────────────────────┼────────────────────────────┘
                             │ (WiFi — optional)
                             ▼
               ┌─────────────────────────┐
               │   Firebase Firestore    │
               │   /guests collection    │
               │   (32 documents)        │
               └────────────┬────────────┘
                             │ onSnapshot push
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    DEVICE B (Gate 2)                    │
│          [same architecture as Device A]                │
└─────────────────────────────────────────────────────────┘
```

---

## Offline Strategy

### How it works

Firestore's `enableIndexedDbPersistence()` does three things:

1. **On first load (WiFi):** Downloads all documents and stores them in IndexedDB
2. **On subsequent loads (any connection):** Serves data from IndexedDB immediately
3. **On writes (offline):** Queues the write in IndexedDB, returns success to the app immediately, flushes to server when internet returns

This means the app behaves identically online and offline from the user's perspective.

### What gets cached

- All 32 guest documents
- The schema/structure of the collection
- Any writes made while offline

### What doesn't work offline

- The initial seed (must be done with internet)
- First app load ever (must be done with internet)
- Cross-device sync (obviously needs internet to communicate)

---

## Real-Time Sync

```
Device A checks in "Pranav" (online)
  → updateDoc({checkedIn: true}) fires to Firestore server
  → Firestore notifies Device B via persistent connection
  → Device B's onSnapshot fires
  → Device B's React state updates
  → Pranav's card turns green on Device B
  Total time: < 2 seconds
```

```
Device A checks in "Pranav" (offline)
  → updateDoc() writes to IndexedDB queue
  → App shows green immediately (optimistic UI)
  → [5 minutes later, WiFi returns]
  → Firestore SDK flushes queued write
  → Firestore notifies Device B
  → Device B turns green
  Total offline → sync time: ~100ms after internet returns
```

---

## Data Model

### Firestore Collection: `guests`

```
/guests/{id}
  name:         string    "Pranav Chouhan"
  plusOne:      boolean   false
  email:        string?   "pranav@gmail.com"
  phone:        string?   "95528 77711"
  tickets:      number    1
  type:         string    "Guest" | "Longform" | "Influencers"
  category:     string?   "Simar"
  checkedIn:    boolean   false → true
  checkedInAt:  Timestamp null → serverTimestamp()
  checkedInBy:  string?   "Gate 1"
  addedOnSite:  boolean   false
  notes:        string?
```

### Indexes needed
None — queries are simple equality checks and full collection reads.

---

## Search Algorithm

```typescript
// 1. User types "pra"
// 2. useSearch() runs (memoized, no network)
// 3. Build regex: /pra/i
// 4. Filter guests where:
//    regex.test(guest.name)   → true for "Pranav Chouhan"
//    regex.test(guest.phone)  → false
//    regex.test(guest.email)  → false
// 5. Sort: unchecked first, exact match first
// 6. Return [Pranav Chouhan]
// Total time: < 1ms for 32 guests, < 5ms for 5000 guests
```

---

## Component Tree

```
App
├── OfflineBanner         (shows when navigator.onLine = false)
├── StatsBar              (12 / 32 checked in, progress bar)
├── SearchBar             (auto-focused, clears on Escape)
├── TabBar                (All | Remaining | Checked In)
├── GuestList
│   └── GuestCard[]       (one per filtered guest)
│       └── CheckInButton (optimistic, disables on tap)
└── AddGuestModal         (shows when search = 0 results)
    └── WalkInForm
```

---

## Performance Budget

| Item | Target | How |
|------|--------|-----|
| Initial load (WiFi) | < 3s | Vite code splitting, Firestore cache |
| Initial load (from cache) | < 1s | IndexedDB, service worker |
| Search response | < 50ms | In-memory regex, no debounce |
| Check-in tap → visual | < 100ms | Optimistic UI, local state update |
| Cross-device sync | < 2s online | Firestore onSnapshot |

---

## Firebase Free Tier Usage Estimate

| Operation | Count | Per Day |
|-----------|-------|---------|
| Initial load (reads) | 32 docs × 2 devices | 64 reads |
| onSnapshot updates | ~5 per check-in × 32 guests × 2 devices | ~320 reads |
| Check-in writes | 32 guests × 1 | 32 writes |
| Walk-in adds | ~5 estimated | 5 writes |
| **TOTAL** | | **~400 reads, ~40 writes** |
| **Free Limit** | | **50,000 reads, 20,000 writes** |

✅ Well within free tier limits.

---

## Setup Steps (Developer)

```bash
# 1. Clone / create project
npm create vite@latest event-checkin -- --template react-ts
cd event-checkin
npm install firebase vite-plugin-pwa tailwindcss autoprefixer postcss

# 2. Copy files from this repo into src/
# firebase.ts, hooks/, components/, data/, App.tsx

# 3. Firebase setup
npm install -g firebase-tools
firebase login
firebase init    # select: Firestore, Hosting
# Choose your project or create a new one

# 4. Environment variables
cp .env.example .env.local
# Fill in values from Firebase Console > Project Settings

# 5. Seed data (run once)
npm install -D firebase-admin ts-node dotenv
npm run seed

# 6. Dev server
npm run dev

# 7. Deploy
npm run deploy
```

---

## Known Limitations (MVP)

1. **No auth** — anyone with the URL can check in guests. Acceptable for internal event staff.
2. **No undo history** — undo works per-session but not cross-device
3. **No offline indicator for other device** — if Device B is offline, Device A doesn't know
4. **Last-write-wins** — if both devices check in same person simultaneously, both writes succeed (which is fine — both show checked in)
5. **No QR scanning** — manual search only
