'use client';

import { useState, useTransition } from 'react';
import { useLocale } from 'next-intl';

import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { type AppLocale } from '@/i18n/locales';

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleToggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  const setLocaleAndClose = (newLocale: AppLocale) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
    setIsOpen(false);
  };

  return (
    <div className="relative w-20 z-50">
      <button
        className="w-full bg-gray-400 rounded-md disabled:opacity-50"
        onClick={handleToggleOpen}
        disabled={isPending}
      >
        {isPending ? '...' : locale.toUpperCase()}
      </button>
      <ul
        className="absolute top-full right-0 w-full p-1 my-1 flex-col gap-0.5 rounded-lg bg-gray-600 data-[open=false]:hidden data-[open=true]:flex"
        data-open={isOpen}
      >
        {routing.locales
          .filter((loc) => loc !== locale)
          .map((loc) => (
            <li className="flex" key={loc}>
              <button
                className="w-full hover:bg-gray-500 rounded-md px-2"
                onClick={() => setLocaleAndClose(loc)}
              >
                {loc.toUpperCase()}
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
}
