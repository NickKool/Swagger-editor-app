import { vi } from 'vitest';

export const mockCookieGet = vi.fn();
export const mockCookieGetAll = vi.fn(() => []);
export const mockCookieHas = vi.fn(() => false);
export const mockCookieSet = vi.fn();
export const mockCookieDelete = vi.fn();

vi.mock('next/headers', () => {
  return {
    cookies: vi.fn(async () => ({
      get: mockCookieGet,
      getAll: mockCookieGetAll,
      has: mockCookieHas,
      set: mockCookieSet,
      delete: mockCookieDelete,
    })),
  };
});
