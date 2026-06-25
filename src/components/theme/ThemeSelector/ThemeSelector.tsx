'use client';

import { Moon, Sun, LaptopMinimal } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeSelector() {
  const { setTheme } = useTheme();

  const t = useTranslations('components.ThemeSelector');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">{t('selectTheme')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t('selectTheme')}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => setTheme('light')}>
          <div className="flex items-center gap-2">
            <Sun />
            <span>{t('light')}</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <div className="flex items-center gap-2">
            <Moon />
            <span>{t('dark')}</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <div className="flex items-center gap-2">
            <LaptopMinimal />
            <span>{t('system')}</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
