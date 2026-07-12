import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logApiRequest } from './analytics';

import { auth, db } from '@/lib/firebase';
import { addDoc, collection, CollectionReference, DocumentReference } from 'firebase/firestore';
import { toast } from 'sonner';

vi.mock('@/lib/firebase', () => ({
  db: { type: 'firestore-instance' },
  auth: {
    currentUser: null,
  },
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('Analytics Utility Module Service Spec', () => {
  const mockT = vi.fn((key: string) => `translated_${key}`);

  beforeEach(() => {
    vi.clearAllMocks();
    (auth as { currentUser: unknown }).currentUser = null;
  });

  it('should completely abort execution and write nothing if currentUser is not authorized', async () => {
    (auth as { currentUser: unknown }).currentUser = null;

    await logApiRequest({
      method: 'GET',
      url: 'https://petstore.com',
      statusCode: 200,
      duration: 120,
      t: mockT,
    });

    expect(collection).not.toHaveBeenCalled();
    expect(addDoc).not.toHaveBeenCalled();
  });

  it('should successfully compute string byte sizes via TextEncoder and log all metrics to Firestore', async () => {
    (auth as { currentUser: unknown }).currentUser = { uid: 'user-uid-test-123' };

    const mockCollectionRef = { path: 'history' } as CollectionReference;
    vi.mocked(collection).mockReturnValue(mockCollectionRef);
    vi.mocked(addDoc).mockResolvedValue({ id: 'new-doc-id-999' } as DocumentReference);

    const requestBody = '{"name": "Jack"}';
    const responseBody = '{"status": "Привет"}';

    await logApiRequest({
      method: 'POST',
      url: 'https://swagger.io',
      statusCode: 201,
      duration: 345,
      requestBody,
      responseBody,
      errorDetails: 'No error, created successfully.',
      t: mockT,
    });

    expect(collection).toHaveBeenCalledWith(db, 'history');

    expect(addDoc).toHaveBeenCalledWith(
      mockCollectionRef,
      expect.objectContaining({
        userId: 'user-uid-test-123',
        method: 'POST',
        url: 'https://swagger.io',
        statusCode: 201,
        duration: 345,
        requestSize: 16,
        responseSize: 26,
        errorDetails: 'No error, created successfully.',
        timestamp: expect.any(Number),
      }),
    );
  });

  it('should silently catch database infrastructure failures and trigger localized error toast notifications', async () => {
    (auth as { currentUser: unknown }).currentUser = { uid: 'user-uid-test-123' };

    vi.mocked(addDoc).mockRejectedValue(new Error('Firestore operation timed out'));

    await logApiRequest({
      method: 'GET',
      url: 'https://swagger.io',
      statusCode: 400,
      duration: 85,
      t: mockT,
    });

    expect(toast.error).toHaveBeenCalledWith('translated_toastErrorTitle', {
      description: 'translated_toastErrorDesc',
      position: 'top-center',
    });
  });
});
