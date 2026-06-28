import { vi } from 'vitest';
import React from 'react';

export const mockTranslate = vi.fn((key: string) => key);
export const mockUseTranslations = vi.fn(() => mockTranslate);
export const mockUseLocale = vi.fn(() => 'en');
export const mockUseMessages = vi.fn(() => ({}));
export const mockUseTimeZone = vi.fn(() => 'UTC');

vi.mock('next-intl', () => ({
  useTranslations: () => mockUseTranslations(),
  useLocale: () => mockUseLocale(),
  useMessages: () => mockUseMessages(),
  useTimeZone: () => mockUseTimeZone(),
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));
