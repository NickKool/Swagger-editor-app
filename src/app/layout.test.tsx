import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComponentProps } from 'react';
import RootLayout, { metadata } from './layout';
import ThemeProvider from '@/components/theme/ThemeProvider/ThemeProvider';

vi.mock('@/components/theme/ThemeProvider/ThemeProvider', () => ({
  default: ({ children, attribute, defaultTheme }: ComponentProps<typeof ThemeProvider>) => (
    <div
      data-testid="mocked-theme-provider"
      data-attribute={attribute}
      data-default-theme={defaultTheme}
    >
      {children}
    </div>
  ),
}));

describe('RootLayout Component', () => {
  it('should export correct metadata object configurations', () => {
    expect(metadata.title).toBe('Swagger Editor App');
    expect(metadata.description).toContain('Swagger and OpenAPI specification editor');
  });

  it('should successfully render layout tree with mocked fonts and provider', () => {
    render(
      <RootLayout>
        <div data-testid="layout-children">App View</div>
      </RootLayout>,
      { container: document },
    );

    const themeProvider = screen.getByTestId('mocked-theme-provider');
    expect(themeProvider).toBeInTheDocument();
    expect(themeProvider).toHaveAttribute('data-attribute', 'class');
    expect(themeProvider).toHaveAttribute('data-default-theme', 'system');

    const mainContent = screen.getByTestId('layout-children');
    expect(mainContent).toBeInTheDocument();
    expect(mainContent).toHaveTextContent('App View');
  });
});
