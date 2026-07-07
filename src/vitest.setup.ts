import '@testing-library/jest-dom/vitest';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

import '@/__mocks__/firebase-app';
import '@/__mocks__/firebase-auth';
import '@/__mocks__/firebase-firestore';
import '@/__mocks__/i18n-locales';
import '@/__mocks__/i18n-navigation';
import '@/__mocks__/i18n-routing';
import '@/__mocks__/next-font-google';
import '@/__mocks__/next-headers';
import '@/__mocks__/next-intl-server';
import '@/__mocks__/next-intl';
import '@/__mocks__/next-navigation';
import '@/__mocks__/next-themes';
import '@/__mocks__/vitest.browser-mocks';

beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

afterAll(() => {
  vi.restoreAllMocks();
});
