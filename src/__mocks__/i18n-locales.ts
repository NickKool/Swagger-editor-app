import { vi } from 'vitest';

vi.mock('@/i18n/locales', () => ({
  isValidAppLocale: vi.fn((locale: string) => ['en', 'ru'].includes(locale)),
}));
