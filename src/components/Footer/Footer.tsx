'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';

import lightGhLogo from '@/../public/light-gh-logo.webp';
import darkGhLogo from '@/../public/dark-gh-logo.webp';

import { AUTHORS } from '@/constants/authors';
import Image from 'next/image';
import { useMounted } from '@/hooks/useMounted';

export default function Footer() {
  const t = useTranslations('components.Footer');
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  const logo = !mounted ? lightGhLogo : resolvedTheme === 'dark' ? lightGhLogo : darkGhLogo;

  return (
    <footer className="border-t fixed bottom-0  w-full px-10 py-5 flex justify-between">
      <Link href="/about" className="hover:underline">
        {t('about')}
      </Link>

      <div className="flex gap-4">
        <span>{t('developed')}</span>
        {AUTHORS.map((author) => (
          <a
            key={author.link}
            href={author.link}
            className="hover:underline flex gap-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>{author.name}</span>
            <Image src={logo} alt="gh-logo" width={25} height={25}></Image>
          </a>
        ))}
      </div>

      <span>2026 ©</span>
    </footer>
  );
}
