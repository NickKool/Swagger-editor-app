import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FirebaseApp } from 'firebase/app';

vi.mock('firebase/app', () => {
  return {
    initializeApp: vi.fn(() => ({ name: '[DEFAULT]' })),
    getApps: vi.fn(() => []),
    getApp: vi.fn(() => ({ name: '[DEFAULT]' })),
  };
});

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
}));

describe('Firebase Client Initialization', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('should initialize Firebase from scratch when no apps are running', async () => {
    const { getApps, initializeApp } = await import('firebase/app');

    vi.mocked(getApps).mockReturnValue([]);

    await import('./firebase');

    expect(initializeApp).toHaveBeenCalledTimes(1);
  });

  it('should reuse the existing app instance and NOT call initializeApp again', async () => {
    const { getApps, initializeApp, getApp } = await import('firebase/app');

    const mockApp: Partial<FirebaseApp> = { name: '[DEFAULT]' };

    vi.mocked(getApps).mockReturnValue([mockApp as FirebaseApp]);

    await import('./firebase');

    expect(initializeApp).toHaveBeenCalledTimes(0);
    expect(getApp).toHaveBeenCalledTimes(1);
  });
});
