import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

import { NEXT_LOCALE_COOKIE_KEY } from '@/constants/cookies';
import { routing } from './i18n/routing';
import { AppLocale } from './i18n/locales';

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const segments = pathname.split('/');
  const firstSegment = segments[1];

  const supportedLocales = routing.locales;

  if (firstSegment && !supportedLocales.includes(firstSegment as AppLocale)) {
    const lastUsedLocale = request.cookies.get(NEXT_LOCALE_COOKIE_KEY)?.value;
    const targetLocale =
      lastUsedLocale && supportedLocales.includes(lastUsedLocale as AppLocale)
        ? lastUsedLocale
        : routing.defaultLocale;

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${targetLocale}/404`;

    return NextResponse.redirect(redirectUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
