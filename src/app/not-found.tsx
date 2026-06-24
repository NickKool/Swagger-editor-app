import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import { isValidAppLocale } from '@/i18n/locales';
import { routing } from '@/i18n/routing';
import { NEXT_LOCALE_COOKIE_KEY } from '@/constants/сookies';

export default async function GlobalNotFound() {
  const cookieStore = await cookies();
  const lastUsedLocale = cookieStore.get(NEXT_LOCALE_COOKIE_KEY)?.value;

  const targetLocale =
    lastUsedLocale && isValidAppLocale(lastUsedLocale) ? lastUsedLocale : routing.defaultLocale;

  redirect(`/${targetLocale}/404`);
}
