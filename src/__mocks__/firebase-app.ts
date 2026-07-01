import { vi } from 'vitest';
import type { FirebaseApp } from 'firebase/app';

export const mockInitializeApp = vi.fn(() => ({ name: '[DEFAULT]' }) as FirebaseApp);
export const mockGetApps = vi.fn(() => [] as FirebaseApp[]);
export const mockGetApp = vi.fn(() => ({ name: '[DEFAULT]' }) as FirebaseApp);

vi.mock('firebase/app', () => ({
  initializeApp: mockInitializeApp,
  getApps: mockGetApps,
  getApp: mockGetApp,
}));
