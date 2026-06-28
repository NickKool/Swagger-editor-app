import { vi } from 'vitest';

export const mockReplace = vi.fn();
export const mockPush = vi.fn();
export const mockPrefetch = vi.fn();
export const mockBack = vi.fn();
export const mockForward = vi.fn();
export const mockRefresh = vi.fn();
export const mockRedirect = vi.fn();
export const mockNotFound = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});
export const mockUsePathname = vi.fn(() => '/mocked-path');
export const mockUseParams = vi.fn(() => ({}));
export const mockUseSearchParams = vi.fn(() => new URLSearchParams());
export const mockPermanentRedirect = vi.fn();

export const useRouter = vi.fn(() => ({
  push: mockPush,
  replace: mockReplace,
  prefetch: mockPrefetch,
  back: mockBack,
  forward: mockForward,
  refresh: mockRefresh,
}));

export const usePathname = mockUsePathname;
export const useParams = mockUseParams;
export const useSearchParams = mockUseSearchParams;
export const redirect = mockRedirect;
export const notFound = mockNotFound;
export const permanentRedirect = mockPermanentRedirect;

vi.mock('next/navigation', () => {
  return {
    useRouter,
    usePathname,
    useParams,
    useSearchParams,
    redirect,
    notFound,
    permanentRedirect,
  };
});
