import { defineRouting } from 'next-intl/routing';
import { APP_LOCALES } from './locales';

export const routing = defineRouting({
  locales: APP_LOCALES,
  defaultLocale: 'en',
});
