// scripts/seed.mjs
// Plain JS seed script — no TypeScript compilation needed
// Usage: node scripts/seed.mjs

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { config } from 'dotenv';

config({ path: '.env.local' });

initializeApp({
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
});

const db = getFirestore();

const GUESTS = [
  { id: '1', name: 'Bharat Joshi', plusOne: false, phone: '98181 23232', tickets: 1, type: 'Guest', category: 'Simar' },
  { id: '2', name: 'Pranav Chouhan', plusOne: false, email: 'Chouhan.pranav90@gmail.com', phone: '95528 77711', tickets: 1, type: 'Guest', category: 'Simar' },
  { id: '3', name: 'Sambhav Jain', plusOne: false, email: 'sambhav@grapdes.com', phone: '8668094117', tickets: 1, type: 'Guest', category: 'Simar' },
  { id: '4', name: 'Meghalii Gupta', plusOne: false, phone: '98734 12587', tickets: 1, type: 'Guest', category: 'Simar' },
  { id: '5', name: 'Ravi Karothiya', plusOne: false, email: 'Ravi.karothiya@yatra.com', phone: '96542 26323', tickets: 1, type: 'Guest', category: 'Simar' },
  { id: '6', name: 'Sonam Kalra', plusOne: true, phone: '98100 38926', tickets: 2, type: 'Guest', category: 'Simar' },
  { id: '7', name: 'Neelima Dalmia', plusOne: false, notes: 'Adhar', tickets: 1, type: 'Guest', category: 'Simar' },
  { id: '8', name: 'Anjali Garg', plusOne: true, tickets: 1, type: 'Longform' },
  { id: '9', name: 'Arjun Bahl', plusOne: true, tickets: 1, type: 'Longform' },
  { id: '10', name: 'Anju Modi', plusOne: false, tickets: 3, type: 'Longform' },
  { id: '11', name: 'Ambika Seth & Rahul Khanna', plusOne: false, tickets: 1, type: 'Longform', notes: 'Joint entry' },
  { id: '12', name: 'Priya Paul', plusOne: false, tickets: 1, type: 'Longform' },
  { id: '13', name: 'Geet Nagi', plusOne: true, tickets: 1, type: 'Longform' },
  { id: '14', name: 'Kallie Purie', plusOne: true, tickets: 1, type: 'Longform' },
  { id: '15', name: 'William Dalrymple', plusOne: false, tickets: 4, type: 'Longform' },
  { id: '16', name: 'Divjyot Singh', plusOne: true, tickets: 1, type: 'Longform' },
  { id: '17', name: 'Sahil Marwaha', plusOne: false, tickets: 1, type: 'Longform' },
  { id: '18', name: 'Koni Kapur', plusOne: false, tickets: 1, type: 'Longform' },
  { id: '19', name: 'Amrita Kapoor', plusOne: true, tickets: 1, type: 'Longform' },
  { id: '20', name: 'Minaswinee', plusOne: false, tickets: 1, type: 'Longform' },
  { id: '21', name: 'Neena Berry', plusOne: true, tickets: 1, type: 'Longform' },
  { id: '22', name: 'Nitya Bharany', plusOne: true, tickets: 1, type: 'Longform' },
  { id: '23', name: 'Manish Baheti', plusOne: true, tickets: 1, type: 'Longform' },
  { id: '24', name: 'Karan Torani', plusOne: false, tickets: 5, type: 'Longform' },
  { id: '25', name: 'Mohammad Anas', plusOne: false, tickets: 1, type: 'Influencers', category: 'Longform' },
  { id: '26', name: 'Ria Chopra', plusOne: true, tickets: 1, type: 'Influencers', category: 'Longform' },
  { id: '27', name: 'Payal Puri', plusOne: false, tickets: 1, type: 'Longform' },
  { id: '28', name: 'Alexandra Knowles', plusOne: false, tickets: 1, type: 'Guest', category: 'Simar' },
  { id: '29', name: 'Bilal Chisty', plusOne: false, tickets: 1, type: 'Guest', category: 'Simar' },
  { id: '30', name: 'Nirvaan Sawhney', plusOne: false, tickets: 1, type: 'Guest', category: 'Simar' },
  { id: '31', name: 'Simran Sawhney', plusOne: false, tickets: 1, type: 'Guest', category: 'Simar' },
  { id: '32', name: 'Arjun Soin', plusOne: false, tickets: 1, type: 'Guest', category: 'Simar' },
];

async function seed() {
  console.log(`🌻 Seeding ${GUESTS.length} guests to Firestore...`);
  console.log(`📦 Project: ${process.env.VITE_FIREBASE_PROJECT_ID}`);

  const batch = db.batch();

  for (const guest of GUESTS) {
    const ref = db.collection('guests').doc(guest.id);
    batch.set(ref, {
      ...guest,
      checkedIn: false,
      checkedInAt: null,
      checkedInBy: null,
      addedOnSite: false,
      createdAt: new Date(),
    });
  }

  await batch.commit();
  console.log(`\n✅ Done! ${GUESTS.length} guests seeded to Firestore.`);
  console.log(`\nVerify at: https://console.firebase.google.com/project/${process.env.VITE_FIREBASE_PROJECT_ID}/firestore`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
