import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should initialize Firebase from scratch when no apps are running and API key is present', async () => {
    const { getApps, initializeApp } = await import('firebase/app');

    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'AIzaSyFakeKey123';

    vi.mocked(getApps).mockReturnValue([]);

    await import('./firebase');

    expect(initializeApp).toHaveBeenCalledTimes(1);
  });

  it('should fallback to build placeholder key during static build prerendering if key is missing', async () => {
    const { getApps, initializeApp } = await import('firebase/app');

    delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    vi.mocked(getApps).mockReturnValue([]);

    await import('./firebase');

    expect(initializeApp).toHaveBeenCalledTimes(1);
    expect(initializeApp).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'BUILD_PLACEHOLDER',
      }),
    );
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
