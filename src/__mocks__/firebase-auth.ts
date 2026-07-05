import { Auth, UserCredential } from 'firebase/auth';
import { vi } from 'vitest';

export const mockOnAuthStateChanged = vi.fn();
export const mockSignOut = vi.fn(() => Promise.resolve());
export const mockGetAuth = vi.fn(() => ({}) as Auth);
export const mockCreateUserWithEmailAndPassword = vi.fn(() =>
  Promise.resolve({} as UserCredential),
);

vi.mock('firebase/auth', () => ({
  getAuth: mockGetAuth,
  onAuthStateChanged: mockOnAuthStateChanged,
  signOut: mockSignOut,
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
}));
