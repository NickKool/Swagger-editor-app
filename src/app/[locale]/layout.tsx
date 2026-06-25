import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { isValidAppLocale } from '@/i18n/locales';
import LanguageSelector from '@/components/LanguageSelector/LanguageSelector';
import { ThemeSelector } from '@/components/theme/ThemeSelector/ThemeSelector';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isValidAppLocale(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <header className="flex gap-2 p-2">
        <LanguageSelector />
        <ThemeSelector />
      </header>
      {children}
    </NextIntlClientProvider>
  );
}
