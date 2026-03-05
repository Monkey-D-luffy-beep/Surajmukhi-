// scripts/seedFirestore.ts
// Run ONCE before the event to populate Firestore with guest data
// Usage: npx ts-node --esm scripts/seedFirestore.ts

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { SEED_GUESTS } from '../src/data/guests.js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config({ path: '.env.local' });

// Option A: Use service account JSON (download from Firebase Console > Project Settings > Service Accounts)
// const serviceAccount = JSON.parse(readFileSync('./service-account.json', 'utf8'));
// initializeApp({ credential: cert(serviceAccount) });

// Option B: Use GOOGLE_APPLICATION_CREDENTIALS env var
initializeApp({
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
});

const db = getFirestore();

async function seed() {
  console.log(`🌱 Seeding ${SEED_GUESTS.length} guests to Firestore...`);
  console.log(`📦 Project: ${process.env.VITE_FIREBASE_PROJECT_ID}`);

  // Firestore batch writes — max 500 per batch
  const BATCH_SIZE = 499;
  let seeded = 0;

  for (let i = 0; i < SEED_GUESTS.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = SEED_GUESTS.slice(i, i + BATCH_SIZE);

    chunk.forEach((guest) => {
      const ref = db.collection('guests').doc(guest.id);
      batch.set(ref, {
        ...guest,
        checkedIn: false,
        checkedInAt: null,
        checkedInBy: null,
        addedOnSite: false,
        createdAt: new Date(),
      });
    });

    await batch.commit();
    seeded += chunk.length;
    console.log(`  ✓ ${seeded}/${SEED_GUESTS.length} guests seeded`);
  }

  console.log(`\n✅ Done! ${SEED_GUESTS.length} guests in Firestore.`);
  console.log(`\nVerify at: https://console.firebase.google.com/project/${process.env.VITE_FIREBASE_PROJECT_ID}/firestore`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
