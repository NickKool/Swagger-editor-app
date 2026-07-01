import { Auth } from 'firebase/auth';
import { vi } from 'vitest';

export const mockOnAuthStateChanged = vi.fn();
export const mockSignOut = vi.fn(() => Promise.resolve());
export const mockGetAuth = vi.fn(() => ({}) as Auth);

vi.mock('firebase/auth', () => ({
  getAuth: mockGetAuth,
  onAuthStateChanged: mockOnAuthStateChanged,
  signOut: mockSignOut,
}));
