import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import LocaleLayout from './layout';
import { mockGetMessages } from '@/__mocks__/next-intl-server';
import { mockNotFound } from '@/__mocks__/next-navigation';

vi.mock('@/components/LanguageSelector/LanguageSelector', () => ({
  default: () => <div data-testid="mock-language-selector">LanguageSelector</div>,
}));

vi.mock('@/components/theme/ThemeSelector/ThemeSelector', () => ({
  default: () => <div data-testid="mock-theme-selector">ThemeSelector</div>,
}));

vi.mock('@/context/AuthContext', () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="mock-auth-provider">{children}</div>
  ),
}));

describe('LocaleLayout Component', () => {
  it('should successfully render layout with children and components when locale is valid', async () => {
    mockGetMessages.mockResolvedValue({ welcome: 'Hello' });
    const params = Promise.resolve({ locale: 'en' });

    const result = await LocaleLayout({
      children: <main data-testid="layout-children">App Content</main>,
      params,
    });

    render(result);

    const authProvider = screen.getByTestId('mock-auth-provider');
    expect(authProvider).toBeInTheDocument();

    const langSelector = screen.getByTestId('mock-language-selector');
    const themeSelector = screen.getByTestId('mock-theme-selector');
    expect(authProvider).toContainElement(langSelector);
    expect(authProvider).toContainElement(themeSelector);

    const mainContent = screen.getByTestId('layout-children');
    expect(mainContent).toBeInTheDocument();
    expect(mainContent).toHaveTextContent('App Content');
    expect(authProvider).toContainElement(mainContent);
  });

  it('should trigger notFound execution when locale is invalid', async () => {
    const params = Promise.resolve({ locale: 'invalid-locale' });

    await expect(
      LocaleLayout({
        children: <div>Content</div>,
        params,
      }),
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(mockNotFound).toHaveBeenCalled();
  });
});
