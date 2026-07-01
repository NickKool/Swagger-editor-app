import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { FirebaseApp } from 'firebase/app';
import { mockInitializeApp, mockGetApps, mockGetApp } from '@/__mocks__/firebase-app';

describe('Firebase Client Initialization', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should initialize Firebase from scratch when no apps are running and API key is present', async () => {
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'AIzaSyFakeKey123';
    mockGetApps.mockReturnValue([]);

    await import('./firebase');

    expect(mockInitializeApp).toHaveBeenCalledTimes(1);
  });

  it('should fallback to build placeholder key during static build prerendering if key is missing', async () => {
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = '';
    mockGetApps.mockReturnValue([]);

    await import('./firebase');

    expect(mockInitializeApp).toHaveBeenCalledTimes(1);
    expect(mockInitializeApp).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'BUILD_PLACEHOLDER',
        projectId: 'BUILD_PLACEHOLDER_ID',
      }),
    );
  });

  it('should reuse the existing app instance and NOT call initializeApp again', async () => {
    const mockApp: Partial<FirebaseApp> = { name: '[DEFAULT]' };
    mockGetApps.mockReturnValue([mockApp as FirebaseApp]);

    await import('./firebase');

    expect(mockInitializeApp).toHaveBeenCalledTimes(0);
    expect(mockGetApp).toHaveBeenCalledTimes(1);
  });
});
