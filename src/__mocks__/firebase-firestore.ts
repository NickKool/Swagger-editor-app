import { Firestore } from 'firebase/firestore';
import { vi } from 'vitest';

export const mockGetFirestore = vi.fn(() => ({}) as Firestore);

vi.mock('firebase/firestore', () => ({
  getFirestore: mockGetFirestore,
}));
