import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import LocaleLayout from './layout';
import { mockGetMessages } from '@/__mocks__/next-intl-server';
import { mockNotFound } from '@/__mocks__/next-navigation';

vi.mock('@/components/Header/Header', () => ({
  default: () => <div data-testid="mock-header">Header</div>,
}));

vi.mock('@/components/Footer/Footer', () => ({
  default: () => <div data-testid="mock-footer">Footer</div>,
}));

vi.mock('@/components/ui/sonner', () => ({
  Toaster: () => <div data-testid="mock-toaster">Toaster</div>,
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

    const header = screen.getByTestId('mock-header');
    const footer = screen.getByTestId('mock-footer');
    const toaster = screen.getByTestId('mock-toaster');

    expect(authProvider).toContainElement(header);
    expect(authProvider).toContainElement(footer);
    expect(authProvider).toContainElement(toaster);

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
