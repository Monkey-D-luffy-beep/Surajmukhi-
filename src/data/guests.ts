// src/data/guests.ts
// Pre-seeded guest list — 38 guests (corrected ticket counts from spreadsheet)
// Run scripts/seed-web.mjs once before the event to push this to Firestore

export interface Guest {
  id: string;
  name: string;
  plusOne: boolean;
  email?: string;
  phone?: string;
  tickets: number;
  type: 'Guest' | 'Longform' | 'Influencers';
  category?: string;
  checkedIn: boolean;
  checkedInAt?: any; // Firestore Timestamp — undefined in seed data
  checkedInBy?: string;
  addedOnSite: boolean;
  notes?: string;
}

export const INITIAL_GUESTS: Omit<Guest, 'checkedIn' | 'checkedInAt' | 'checkedInBy' | 'addedOnSite'>[] = [
  { id: '1', name: 'Bharat Joshi', plusOne: false, phone: '98181 23232', tickets: 1, type: 'Guest', category: 'Simar' },
  { id: '2', name: 'Pranav Chouhan', plusOne: false, email: 'Chouhan.pranav90@gmail.com', phone: '95528 77711', tickets: 1, type: 'Guest', category: 'Simar' },
  { id: '3', name: 'Sambhav Jain', plusOne: false, email: 'sambhav@grapdes.com', phone: '8668094117', tickets: 1, type: 'Guest', category: 'Simar' },
  { id: '4', name: 'Meghalii Gupta', plusOne: false, phone: '98734 12587', tickets: 1, type: 'Guest', category: 'Simar' },
  { id: '5', name: 'Ravi Karothiya', plusOne: false, email: 'Ravi.karothiya@yatra.com', phone: '96542 26323', tickets: 1, type: 'Guest', category: 'Simar' },
  { id: '6', name: 'Sonam Kalra', plusOne: true, phone: '98100 38926', tickets: 2, type: 'Guest', category: 'Simar' },
  { id: '7', name: 'Neelima Dalmia Adhar', plusOne: true, tickets: 2, type: 'Guest', category: 'Simar' },
  { id: '8', name: 'Anjali Garg', plusOne: false, tickets: 1, type: 'Longform' },
  { id: '9', name: 'Arjun Bahl', plusOne: true, tickets: 2, type: 'Longform' },
  { id: '10', name: 'Anju Modi', plusOne: true, tickets: 4, type: 'Longform' },
  { id: '11', name: 'Ambika Seth & Rahul Khanna', plusOne: true, tickets: 3, type: 'Longform', notes: 'Joint entry' },
  { id: '12', name: 'Priya Paul', plusOne: false, tickets: 1, type: 'Longform' },
  { id: '13', name: 'Geet Nagi', plusOne: true, tickets: 2, type: 'Longform' },
  { id: '14', name: 'Kallie Purie', plusOne: true, tickets: 2, type: 'Longform' },
  { id: '15', name: 'William Dalrymple', plusOne: true, tickets: 5, type: 'Longform' },
  { id: '16', name: 'Divjyot Singh', plusOne: true, tickets: 2, type: 'Longform' },
  { id: '17', name: 'Sahil Marwaha', plusOne: false, tickets: 1, type: 'Longform' },
  { id: '18', name: 'Koni Kapur', plusOne: false, tickets: 1, type: 'Longform' },
  { id: '19', name: 'Amrita Kapoor', plusOne: true, tickets: 2, type: 'Longform' },
  { id: '20', name: 'Minaswinee', plusOne: false, tickets: 1, type: 'Longform' },
  { id: '21', name: 'Neena Berry', plusOne: true, tickets: 2, type: 'Longform' },
  { id: '22', name: 'Nitya Bharany', plusOne: true, tickets: 2, type: 'Longform' },
  { id: '23', name: 'Manish Baheti', plusOne: true, tickets: 2, type: 'Longform' },
  { id: '24', name: 'Karan Torani', plusOne: false, tickets: 5, type: 'Longform' },
  { id: '25', name: 'Mohammad Anas', plusOne: false, tickets: 1, type: 'Influencers', category: 'Longform' },
  { id: '26', name: 'Ria Chopra', plusOne: true, tickets: 2, type: 'Influencers', category: 'Longform' },
  { id: '27', name: 'Payal Puri', plusOne: false, tickets: 1, type: 'Longform' },
  { id: '28', name: 'Alexandra Knowles', plusOne: false, tickets: 1, type: 'Guest', category: 'Simar' },
  { id: '29', name: 'Bilal Chisty', plusOne: false, tickets: 1, type: 'Guest', category: 'Simar' },
  { id: '30', name: 'Nirvaan Sawhney', plusOne: false, tickets: 1, type: 'Guest', category: 'Simar' },
  { id: '31', name: 'Simran Sawhney', plusOne: false, tickets: 1, type: 'Guest', category: 'Simar' },
  { id: '32', name: 'Arjun Soin', plusOne: false, tickets: 1, type: 'Guest', category: 'Simar' },
  { id: '33', name: 'Tuheena Raj', plusOne: true, tickets: 2, type: 'Guest', category: 'Simar' },
  { id: '34', name: 'Shah Umair', plusOne: true, phone: '9709249795', tickets: 2, type: 'Influencers', category: 'TTP' },
  { id: '35', name: 'Ashray Arora', plusOne: false, tickets: 1, type: 'Guest', category: 'Simar' },
  { id: '36', name: 'Nikita Arora', plusOne: false, tickets: 1, type: 'Guest', category: 'Simar' },
  { id: '37', name: 'Akanksha Singh', plusOne: false, tickets: 1, type: 'Guest', category: 'Simar' },
  { id: '38', name: 'Col Chaturvedi', plusOne: true, tickets: 2, type: 'Guest', category: 'Simar' },
];

// Full guest objects ready for Firestore seeding
export const SEED_GUESTS: Guest[] = INITIAL_GUESTS.map((g) => ({
  ...g,
  checkedIn: false,
  checkedInAt: undefined,
  checkedInBy: undefined,
  addedOnSite: false,
}));
