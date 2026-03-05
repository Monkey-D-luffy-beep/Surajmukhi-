# Event Check-In App — README

> **Mobile-first, offline-capable guest check-in for live events**  
> 2 devices · real-time sync · works on bad WiFi · 32 guests pre-loaded

---

## ⚡ Quick Start (15 minutes)

### Step 1 — Firebase Project (5 min)
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it (e.g. `event-checkin-2025`)
3. Disable Google Analytics (not needed)
4. Go to **Firestore Database** → **Create database** → Start in **test mode**
5. Choose a region close to you → **Enable**
6. Go to **Project Settings** → **Your Apps** → **</> Web** → Register app
7. Copy the `firebaseConfig` values

### Step 2 — Local Setup (5 min)
```bash
git clone <this-repo>
cd event-checkin-app
npm install

# Copy env template and fill in Firebase values
cp .env.example .env.local
# Edit .env.local with your Firebase config values
```

### Step 3 — Seed Guest Data (2 min)
```bash
# Download service account from Firebase Console >
# Project Settings > Service Accounts > Generate new private key
# Save as service-account.json in project root
# (DO NOT commit this file — it's in .gitignore)

npm run seed
# Output: "✅ Done! 32 guests in Firestore."
```

### Step 4 — Deploy (3 min)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # choose dist as public dir, yes to SPA
npm run deploy
# Output: "Hosting URL: https://your-project.web.app"
```

### Step 5 — Pre-Event Device Setup
1. Open the URL on **both phones on good WiFi**
2. Let it fully load (caches everything)
3. Name each device when prompted ("Gate 1", "Gate 2")
4. Test: check in one guest on Phone 1 → verify it goes green on Phone 2
5. You're ready!

---

## 📱 How to Use

| Action | How |
|--------|-----|
| Find a guest | Type name or phone number in search bar |
| Check in | Tap the blue **CHECK IN** button |
| Walk-in not on list | Search their name → tap "Add [name] as walk-in" |
| See who's left | Tap **Remaining** tab |
| See who's in | Tap **Checked In** tab |

---

## 🔄 Offline Mode

If internet drops:
- ✅ Search still works (in-memory)
- ✅ Check-ins still work (queued locally)
- ✅ All previous data still visible
- ⏳ Other device won't sync until internet returns
- 🔴 Orange banner shows "Working offline"

When internet returns → everything syncs automatically.

---

## 📂 File Overview

| File | Purpose |
|------|---------|
| `MASTER_PROMPT.md` | Paste into Copilot to build the whole app |
| `PRD.md` | Product requirements and user stories |
| `ARCHITECTURE.md` | Technical decisions and data flow diagrams |
| `src/data/guests.ts` | All 32 guests pre-parsed, ready to seed |
| `src/firebase.ts` | Firebase init with offline persistence |
| `src/hooks/useGuests.ts` | Real-time Firestore subscription + mutations |
| `src/hooks/useSearch.ts` | In-memory regex search |
| `scripts/seedFirestore.ts` | One-time data import |
| `firestore.rules` | Firestore security rules |
| `vite.config.ts` | Vite + PWA plugin config |
| `firebase.json` | Firebase hosting config |
| `.env.example` | Environment variables template |

---

## 🆘 Troubleshooting

**"Seed script fails"**
→ Make sure `service-account.json` is in root, or set `GOOGLE_APPLICATION_CREDENTIALS` env var

**"App shows no guests"**
→ Check `.env.local` has correct `VITE_FIREBASE_PROJECT_ID`
→ Check Firestore console shows 32 documents in `guests` collection

**"Changes on Device A not showing on Device B"**
→ Both devices need internet for sync
→ Firestore rules must allow read (`allow read: if true`)

**"App not working offline"**
→ Must have loaded on WiFi at least once
→ Check browser supports IndexedDB (all modern browsers do)

---

## 🛡 Security Note

This MVP uses open Firestore rules (`allow read, write: if true`).  
This is fine for a one-day event with staff you trust.  
After the event, either delete the Firestore database or update rules to deny all access.
