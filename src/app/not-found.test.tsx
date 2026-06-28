import { describe, it, expect, vi, beforeEach } from 'vitest';
import GlobalNotFound from './not-found';
import { routing } from '@/i18n/routing';
import { NEXT_LOCALE_COOKIE_KEY } from '@/constants/сookies';
import { mockCookieGet } from '@/__mocks__/next-headers';
import { mockRedirect } from '@/__mocks__/next-navigation';

describe('GlobalNotFound Component', () => {
  beforeEach(() => {
    vi.mocked(routing).defaultLocale = 'en';
  });

  it('should redirect to last used cookie locale if it is valid', async () => {
    mockCookieGet.mockReturnValue({ value: 'ru' });

    await GlobalNotFound();

    expect(mockCookieGet).toHaveBeenCalledWith(NEXT_LOCALE_COOKIE_KEY);
    expect(mockRedirect).toHaveBeenCalledWith('/ru/404');
  });

  it('should redirect to default locale if cookie locale is invalid', async () => {
    mockCookieGet.mockReturnValue({ value: 'invalid-locale' });

    await GlobalNotFound();

    expect(mockRedirect).toHaveBeenCalledWith(`/${routing.defaultLocale}/404`);
  });

  it('should redirect to default locale if cookie is missing', async () => {
    mockCookieGet.mockReturnValue(undefined);

    await GlobalNotFound();

    expect(mockRedirect).toHaveBeenCalledWith(`/${routing.defaultLocale}/404`);
  });
});
