import { vi } from 'vitest';

export const mockReplace = vi.fn();
export const mockPush = vi.fn();
export const mockPrefetch = vi.fn();
export const mockBack = vi.fn();
export const mockForward = vi.fn();
export const mockRefresh = vi.fn();
export const mockUsePathname = vi.fn(() => '/mocked-path');

export const useRouter = vi.fn(() => ({
  push: mockPush,
  replace: mockReplace,
  prefetch: mockPrefetch,
  back: mockBack,
  forward: mockForward,
  refresh: mockRefresh,
}));

export const usePathname = mockUsePathname;
export const redirect = vi.fn();

export const Link = vi.fn(({ href, children, ...props }) => {
  const targetHref = typeof href === 'object' ? href.pathname : href;
  return (
    <a href={targetHref} {...props}>
      {children}
    </a>
  );
});

vi.mock('@/i18n/navigation', () => {
  return {
    useRouter,
    usePathname,
    redirect,
    Link,
  };
});
