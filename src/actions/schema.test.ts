import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchSchema, saveSchema } from './schema';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { OpenAPI } from '@scalar/openapi-types';

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  Timestamp: {
    now: vi.fn(() => ({ toDate: () => new Date('2026-07-06T12:00:00.000Z') })),
  },
}));

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

describe('Schema Server Actions', () => {
  const mockUserId = 'user_abc123';
  const mockDocRef = { id: 'mock-ref' };

  beforeEach(() => {
    vi.mocked(doc).mockReturnValue(mockDocRef as unknown as ReturnType<typeof doc>);
  });

  describe('fetchSchema', () => {
    it('should return a formatted schema document when the document exists', async () => {
      const mockDate = new Date('2026-01-01T10:00:00.000Z');
      const mockFirestoreData = {
        userId: mockUserId,
        name: 'Test API',
        version: '1.2.3',
        formatUsed: 'yaml',
        rawText: 'openapi: 3.0.0',
        updatedAt: {
          toDate: () => mockDate,
        },
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockFirestoreData,
      } as unknown as Awaited<ReturnType<typeof getDoc>>);

      const result = await fetchSchema(mockUserId);

      expect(doc).toHaveBeenCalledWith(db, 'schemas', mockUserId);
      expect(getDoc).toHaveBeenCalledWith(mockDocRef);
      expect(result).toEqual({
        userId: 'user_abc123',
        name: 'Test API',
        version: '1.2.3',
        formatUsed: 'yaml',
        rawText: 'openapi: 3.0.0',
        updatedAt: mockDate.toISOString(),
      });
    });

    it('should fallback to the current timestamp string when updatedAt lacks a toDate method', async () => {
      const mockFirestoreData = {
        userId: mockUserId,
        name: 'Test API',
        updatedAt: null,
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockFirestoreData,
      } as unknown as Awaited<ReturnType<typeof getDoc>>);

      const result = await fetchSchema(mockUserId);

      expect(result).not.toBeNull();
      expect(result?.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should return null when the schema document is not found in the database', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
      } as unknown as Awaited<ReturnType<typeof getDoc>>);

      const result = await fetchSchema(mockUserId);

      expect(result).toBeNull();
    });

    it('should return null on database error', async () => {
      const mockError = new Error('Firestore connection loss');
      vi.mocked(getDoc).mockRejectedValueOnce(mockError);

      const result = await fetchSchema(mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('saveSchema', () => {
    const defaultParams = {
      userId: mockUserId,
      spec: 'openapi: 3.0.0',
      format: 'json',
      parsedSpec: {
        openapi: '3.0.0',
        info: { title: 'Gateway Service', version: '2.0.0' },
        paths: {},
      } as unknown as OpenAPI.Document,
    };

    it('should successfully store a firestore document using parameters parsed from metadata', async () => {
      const mockTimestamp = { toDate: () => new Date() };
      vi.mocked(Timestamp.now).mockReturnValue(mockTimestamp as unknown as Timestamp);
      vi.mocked(setDoc).mockResolvedValueOnce(
        undefined as unknown as Awaited<ReturnType<typeof setDoc>>,
      );

      await saveSchema(defaultParams);

      expect(doc).toHaveBeenCalledWith(db, 'schemas', mockUserId);
      expect(setDoc).toHaveBeenCalledWith(mockDocRef, {
        userId: mockUserId,
        name: 'Gateway Service',
        version: '2.0.0',
        formatUsed: 'json',
        rawText: 'openapi: 3.0.0',
        updatedAt: mockTimestamp,
      });
    });

    it('should substitute internal fallback values when info block segments are missing', async () => {
      const paramsWithoutInfo = {
        ...defaultParams,
        parsedSpec: {
          openapi: '3.0.0',
          paths: {},
        } as unknown as OpenAPI.Document,
      };

      const mockTimestamp = { toDate: () => new Date() };
      vi.mocked(Timestamp.now).mockReturnValue(mockTimestamp as unknown as Timestamp);

      await saveSchema(paramsWithoutInfo);

      expect(setDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          name: 'OpenAPI Spec',
          version: '1.0.0',
        }),
      );
    });
  });
});
