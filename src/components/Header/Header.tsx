'use client';

import { useTranslations } from 'next-intl';

import LanguageSelector from '../LanguageSelector/LanguageSelector';
import { ThemeSelector } from '../theme/ThemeSelector/ThemeSelector';
import { Button } from '../ui/button';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

import logo from '@/../public/logo.webp';

export default function Header() {
  const t = useTranslations('components.Header');

  return (
    <header className="w-full p-5 flex justify-between items-center border-b sticky top-0">
      <div className="flex gap-4 items-center">
        <Image src={logo} alt="Logo" width={70} height={70} loading="eager" />
        <Button variant="outline">
          <Link href="/about">{t('about')}</Link>
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex gap-2">
          <Button variant="default" className="cursor-pointer">
            <Link href="/sign-in">{t('signIn')}</Link>
          </Button>
          <Button variant="default" className="cursor-pointer">
            <Link href="/sign-up">{t('signUp')}</Link>
          </Button>
        </div>
        <div className="flex gap-2">
          <LanguageSelector />
          <ThemeSelector />
        </div>
      </div>
    </header>
  );
}
