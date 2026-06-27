import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ThemeProvider from './ThemeProvider';
import { ComponentProps } from 'react';

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children, attribute, defaultTheme }: ComponentProps<typeof ThemeProvider>) => (
    <div
      data-testid="mock-next-theme-provider"
      data-attribute={attribute}
      data-default-theme={defaultTheme}
    >
      {children}
    </div>
  ),
}));

describe('ThemeProvider Component', () => {
  it('should forward props and render children successfully', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="system">
        <span data-testid="child-element">It's Content</span>
      </ThemeProvider>,
    );

    const provider = screen.getByTestId('mock-next-theme-provider');
    expect(provider).toBeInTheDocument();
    expect(provider).toHaveAttribute('data-attribute', 'class');
    expect(screen.getByTestId('child-element')).toHaveTextContent("It's Content");
  });
});
