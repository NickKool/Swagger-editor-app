import { vi } from 'vitest';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

export const mockInitializeApp = vi.fn(() => ({ name: '[DEFAULT]' }) as FirebaseApp);
export const mockGetApps = vi.fn(() => [] as FirebaseApp[]);
export const mockGetApp = vi.fn(() => ({ name: '[DEFAULT]' }) as FirebaseApp);

vi.mock('firebase/app', () => ({
  initializeApp: mockInitializeApp,
  getApps: mockGetApps,
  getApp: mockGetApp,
}));

export const mockOnAuthStateChanged = vi.fn();
export const mockSignOut = vi.fn(() => Promise.resolve());
export const mockGetAuth = vi.fn(() => ({}) as Auth);

vi.mock('firebase/auth', () => ({
  getAuth: mockGetAuth,
  onAuthStateChanged: mockOnAuthStateChanged,
  signOut: mockSignOut,
}));

export const mockGetFirestore = vi.fn(() => ({}) as Firestore);

vi.mock('firebase/firestore', () => ({
  getFirestore: mockGetFirestore,
}));
