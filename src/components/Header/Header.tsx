'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

import LanguageSelector from '@/components/LanguageSelector/LanguageSelector';
import ThemeSelector from '@/components/theme/ThemeSelector/ThemeSelector';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

import { useAuth } from '@/context/AuthContext';

import logo from '@/../public/logo.webp';

export default function Header() {
  const t = useTranslations('components.Header');
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full p-5 flex justify-between items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-foreground">
      <nav className="flex gap-4 items-center">
        <Link href="/">
          <Image src={logo} alt="Logo" width={48} height={48} loading="eager" />
        </Link>
        <Button asChild variant="outline">
          <Link href="/about">{t('about')}</Link>
        </Button>
      </nav>

      <div className="flex gap-4">
        <nav className="flex gap-2">
          {user ? (
            <>
              <Button asChild variant="outline">
                <Link href="/history">{t('history')}</Link>
              </Button>
              <Button variant="destructive" onClick={logout}>
                {t('signOut')}
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="default">
                <Link href="/sign-in">{t('signIn')}</Link>
              </Button>
              <Button asChild variant="default">
                <Link href="/sign-up">{t('signUp')}</Link>
              </Button>
            </>
          )}
        </nav>
        <div className="flex gap-2">
          <LanguageSelector />
          <ThemeSelector />
        </div>
      </div>
    </header>
  );
}
