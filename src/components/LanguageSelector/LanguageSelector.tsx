'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Languages, Loader } from 'lucide-react';

import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { type AppLocale } from '@/i18n/locales';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function LanguageSelector() {
  const [isPending, startTransition] = useTransition();

  const t = useTranslations('components.LanguageSelector');

  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const setLocaleAndClose = (newLocale: AppLocale) => {
    if (locale !== newLocale) {
      startTransition(() => {
        router.replace(pathname, { locale: newLocale });
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-9 unselectable" disabled={isPending}>
          <Languages className="h-4 w-4 text-muted-foreground" />
          <span className="hidden sm:inline">{isPending ? <Loader /> : locale.toUpperCase()}</span>
          <span className="sr-only">{t('selectLanguage')}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>{t('selectLanguage')}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(value) => setLocaleAndClose(value as AppLocale)}
        >
          {routing.locales.map((lang) => (
            <DropdownMenuRadioItem
              key={lang}
              value={lang}
              className="cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span>{lang.toUpperCase()}</span>
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
