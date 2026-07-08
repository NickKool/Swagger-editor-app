'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

import LanguageSelector from '@/components/LanguageSelector/LanguageSelector';
import ThemeSelector from '@/components/theme/ThemeSelector/ThemeSelector';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/context/AuthContext';

import logo from '@/../public/logo.webp';

export default function Header() {
  const t = useTranslations('components.Header');
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full p-5 flex gap-4 justify-between items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-foreground">
      <div className="flex items-center">
        <Link href="/" onClick={closeMenu}>
          <Image src={logo} alt="Logo" width={48} height={48} loading="eager" />
        </Link>
      </div>

      <nav className="hidden flex-1 md:flex gap-2 items-center">
        <Button asChild variant="outline">
          <Link href="/about">{t('about')}</Link>
        </Button>
        {user && (
          <Button asChild variant="outline">
            <Link href="/history">{t('history')}</Link>
          </Button>
        )}
      </nav>

      <div className="hidden md:flex items-center gap-4">
        <nav className="flex gap-2">
          {user ? (
            <Button variant="destructive" onClick={logout}>
              {t('signOut')}
            </Button>
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

      <div className="flex md:hidden items-center gap-2">
        <ThemeSelector />
        <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label={t('hamburgerMenu')}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-background border-b p-5 flex flex-col gap-4 md:hidden shadow-lg z-50">
          <nav className="flex flex-col gap-2">
            <Button asChild variant="outline" onClick={closeMenu} className="justify-center">
              <Link href="/about">{t('about')}</Link>
            </Button>
            {user && (
              <Button asChild variant="outline" onClick={closeMenu} className="justify-center">
                <Link href="/history">{t('history')}</Link>
              </Button>
            )}
          </nav>

          <hr className="border-border" />

          <div className="flex flex-col gap-3">
            {user ? (
              <Button
                variant="destructive"
                onClick={() => {
                  logout();
                  closeMenu();
                }}
                className="w-full"
              >
                {t('signOut')}
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="default" onClick={closeMenu}>
                  <Link href="/sign-in">{t('signIn')}</Link>
                </Button>
                <Button asChild variant="default" onClick={closeMenu}>
                  <Link href="/sign-up">{t('signUp')}</Link>
                </Button>
              </div>
            )}
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm text-muted-foreground">{t('language')}</span>
              <LanguageSelector />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
