// src/hooks/useGuests.ts
import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Guest } from '../data/guests';

const COLLECTION = 'guests';

// Device name — set once on first launch, stored in localStorage
export function getDeviceName(): string {
  const stored = localStorage.getItem('deviceName');
  if (stored) return stored;
  const name = prompt('Name this device (e.g. "Gate 1"):') ?? 'Device 1';
  localStorage.setItem('deviceName', name);
  return name;
}

export interface GuestStats {
  total: number;
  checkedIn: number;
  remaining: number;
  walkIns: number;
}

export interface UseGuestsReturn {
  guests: Guest[];
  loading: boolean;
  isOnline: boolean;
  checkIn: (id: string) => Promise<void>;
  undoCheckIn: (id: string) => Promise<void>;
  addGuest: (data: Partial<Guest>) => Promise<string>;
  stats: GuestStats;
}

export function useGuests(): UseGuestsReturn {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Track online/offline status
  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  // Real-time Firestore subscription
  // onSnapshot fires immediately from IndexedDB cache (offline), then from server
  useEffect(() => {
    const q = query(collection(db, COLLECTION), orderBy('id'));
    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: false },
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          ...(doc.data() as Guest),
          id: doc.id,
        }));
        setGuests(data);
        setLoading(false);
      },
      (error) => {
        console.error('Firestore subscription error:', error);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  // Check in a guest — works offline (queued and synced later)
  const checkIn = async (id: string) => {
    const deviceName = getDeviceName();
    const ref = doc(db, COLLECTION, id);
    await updateDoc(ref, {
      checkedIn: true,
      checkedInAt: serverTimestamp(),
      checkedInBy: deviceName,
    });
  };

  // Undo check-in (in case of mistake)
  const undoCheckIn = async (id: string) => {
    const ref = doc(db, COLLECTION, id);
    await updateDoc(ref, {
      checkedIn: false,
      checkedInAt: null,
      checkedInBy: null,
    });
  };

  // Add a walk-in guest and immediately check them in
  const addGuest = async (data: Partial<Guest>): Promise<string> => {
    const deviceName = getDeviceName();
    // Build doc — Firestore rejects undefined values, so only include defined fields
    const doc_data: Record<string, any> = {
      name: data.name?.trim() || 'Unknown',
      plusOne: data.plusOne ?? false,
      tickets: data.tickets ?? 1,
      type: data.type ?? 'Guest',
      checkedIn: true,
      checkedInAt: serverTimestamp(),
      checkedInBy: deviceName,
      addedOnSite: true,
    };
    // Only add optional fields if they have values
    if (data.phone) doc_data.phone = data.phone;
    if (data.email) doc_data.email = data.email;
    if (data.category) doc_data.category = data.category;
    if (data.notes) doc_data.notes = data.notes;

    const docRef = await addDoc(collection(db, COLLECTION), doc_data);
    return docRef.id;
  };

  const stats: GuestStats = {
    total: guests.length,
    checkedIn: guests.filter((g) => g.checkedIn).length,
    remaining: guests.filter((g) => !g.checkedIn).length,
    walkIns: guests.filter((g) => g.addedOnSite).length,
  };

  return { guests, loading, isOnline, checkIn, undoCheckIn, addGuest, stats };
}
