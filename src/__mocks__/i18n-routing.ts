import { vi } from 'vitest';

vi.mock('@/i18n/routing', () => ({
  routing: {
    locales: ['en', 'ru'],
  },
}));
