'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { AUTHORS } from '@/constants/authors';

import lightGhLogo from '@/../public/light-gh-logo.webp';
import darkGhLogo from '@/../public/dark-gh-logo.webp';

export default function Footer() {
  const t = useTranslations('components.Footer');

  return (
    <footer className="border-t w-full px-10 py-5 flex flex-col md:flex-row md:justify-between items-center gap-4 md:gap-0 bg-background text-foreground">
      <Link href="/about" className="hover:underline">
        {t('about')}
      </Link>

      <div className="flex flex-wrap justify-center items-center gap-4">
        <span>{t('developed')}</span>
        {AUTHORS.map((author) => (
          <a
            key={author.name}
            href={author.link}
            className="hover:underline flex gap-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>{author.name}</span>
            <Image
              src={darkGhLogo}
              alt="GitHub"
              width={25}
              height={25}
              className="hidden md:dark:hidden md:block"
            />
            <Image
              src={lightGhLogo}
              alt="GitHub"
              width={25}
              height={25}
              className="hidden md:dark:block"
            />
          </a>
        ))}
      </div>

      <span>2026 ©</span>
    </footer>
  );
}
