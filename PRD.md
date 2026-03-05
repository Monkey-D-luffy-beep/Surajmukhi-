# PRD — Event Guest Check-In App
**Version:** 1.0 MVP  
**Date:** 2025  
**Status:** Ready to Build

---

## 1. Problem Statement

Event check-in is slow and chaotic. Staff with paper lists or basic spreadsheets waste 30–60 seconds per guest. With ~32 guests arriving in bursts, this creates queues. The venue has poor internet.

---

## 2. Goals

| Goal | Metric |
|------|--------|
| Fast check-in | < 5 seconds from guest arrival to confirmation |
| Offline resilience | Works with zero internet after first load |
| 2-device sync | Changes on one device visible on other within 2s (when online) |
| Zero data loss | No check-in lost even on bad connectivity |
| Walk-in support | Add unlisted guest in < 15 seconds |

---

## 3. Users

**Primary:** 1–2 event staff at the entrance gate, using personal mobile phones.

**Secondary:** Event organiser reviewing check-in progress remotely (read-only, same app).

---

## 4. User Stories

### Core
- As staff, I can **type a name** and see matching guests instantly so I can check someone in without scrolling
- As staff, I can **type a phone number** and find the guest so I don't need to remember spelling
- As staff, I can **tap CHECK IN** on a guest card and it confirms immediately
- As staff, I can **see the guest is already checked in** (green) if a colleague already processed them
- As staff using Device B, I can **see live updates** from Device A without refreshing

### Walk-ins
- As staff, when a search finds nobody, I see an **"Add as walk-in"** prompt pre-filled with the search text
- As staff, I can add a walk-in with just their name and immediately check them in

### Overview
- As staff, I can **see total progress** at a glance ("12 of 32 checked in")
- As staff, I can **filter to Remaining** to see who hasn't arrived yet
- As staff, I can **filter to Checked In** to verify or find someone who checked in

### Offline
- As staff with no internet, I can **still check people in** and trust it will sync
- As staff, I can **see my connection status** so I know if I'm offline

---

## 5. Features — MVP Scope

### ✅ IN SCOPE
- Real-time search (name + phone, regex)
- One-tap check-in with optimistic UI
- Green/checked state per guest
- Stats bar with progress
- Tab filter: All / Remaining / Checked In
- Add walk-in guest + instant check-in
- 2-device real-time sync via Firestore
- Offline mode (Firestore IndexedDB persistence)
- Offline indicator banner
- Device naming ("Gate 1", "Gate 2")
- PWA — installable on phone home screen
- Pre-seeded guest data (32 guests)

### ❌ OUT OF SCOPE (future)
- QR code scanning
- Email/SMS confirmation to guests
- Admin dashboard / analytics
- Authentication / login
- Multiple events
- CSV import UI

---

## 6. Guest Categories

| Type | Count | Notes |
|------|-------|-------|
| Simar | ~10 | Category A guests |
| Longform | ~20 | Category B, some with +1 |
| Influencers | 2 | Ria Chopra, Mohammad Anas |

---

## 7. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Search latency | < 50ms (in-memory, no network) |
| Offline capability | Full read + write after first load |
| Sync latency | < 2s between devices when online |
| Mobile support | iOS Safari 15+, Android Chrome 90+ |
| Bundle size | < 500KB gzipped |
| Accessibility | All tap targets ≥ 48px |

---

## 8. UI States

### Guest Card States
```
[ UNCHECKED ]                    [ CHECKED IN ]
┌─────────────────────────┐      ┌─────────────────────────┐
│ Pranav Chouhan      [1] │      │ Pranav Chouhan      [1] │  ← green bg
│ 95528 77711   [Guest]   │      │ 95528 77711   [Guest]   │
│                         │      │ ✓ 7:42 PM · Gate 1      │
│         [ CHECK IN ]    │      │                         │
└─────────────────────────┘      └─────────────────────────┘
```

### Search States
```
Query: ""          → Show all guests (unchecked first)
Query: "pra"       → Show "Pranav Chouhan" + any other matches  
Query: "9552"      → Show guest with that phone number
Query: "zzzzz"     → Show "Not found — Add zzzzz as walk-in?" button
```

### Stats Bar
```
┌────────────────────────────────────────┐
│  ✓ 12 checked in    20 remaining       │
│  ████████░░░░░░░░░░░░  37%             │
└────────────────────────────────────────┘
```

---

## 9. Data Flow

```
First Load (WiFi)
  → App fetches all 32 guests from Firestore
  → Firestore SDK caches to IndexedDB
  → onSnapshot listener registered

Check-In (Offline)
  → User taps CHECK IN
  → Optimistic UI: card turns green immediately
  → Firestore write queued in IndexedDB
  → [internet returns] → write fires to server
  → Other device's onSnapshot fires → their card turns green

Check-In (Online)
  → Same flow but Firestore write fires immediately
  → Other device sees update in < 2s
```

---

## 10. Risk & Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Both devices check in same person simultaneously | Low | Firestore is last-write-wins; both will show checked in ✓ |
| No internet at event start | Medium | Pre-load on WiFi before leaving for venue |
| Staff adds wrong person as walk-in | Medium | Name is editable in modal before confirming |
| Firebase free tier exceeded | Very Low | 32 guests × 2 devices × 5 refreshes = ~320 reads. Limit is 50k/day |

---

## 11. Success Criteria

- [ ] Staff can check in a known guest in under 5 seconds
- [ ] 2 devices stay in sync when online
- [ ] App continues working when WiFi drops
- [ ] Walk-in guest can be added and checked in in under 15 seconds
- [ ] Zero check-ins lost due to connectivity
