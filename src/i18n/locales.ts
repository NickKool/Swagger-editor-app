import enMessages from '@/../messages/en.json';
import ruMessages from '@/../messages/ru.json';
import beMessages from '@/../messages/be.json';

export type AppLocaleMessagesType = typeof enMessages;

export const APP_LOCALES = ['en', 'ru', 'be'] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export function isValidAppLocale(value: string): value is AppLocale {
  return (APP_LOCALES as readonly string[]).includes(value);
}

export const APP_LOCALE_MESSAGES_MAP = {
  en: enMessages,
  ru: ruMessages,
  be: beMessages,
} satisfies Record<AppLocale, object>;
