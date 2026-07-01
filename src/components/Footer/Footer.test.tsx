import { describe, expect, test, vi } from 'vitest';
import Footer from './Footer';
import { render, screen } from '@testing-library/react';
import { mockUseTheme } from '@/__mocks__/next-themes';
import * as useMountedModule from '@/hooks/useMounted';

vi.mock('@/constants/authors', () => ({
  AUTHORS: [
    { name: 'author1', link: 'https://github.com' },
    { name: 'author2', link: 'https://github.com' },
    { name: 'author3', link: 'https://github.com' },
  ],
}));

vi.mock('@/../public/light-gh-logo.webp', () => ({ default: '/light-logo.webp' }));
vi.mock('@/../public/dark-gh-logo.webp', () => ({ default: '/dark-logo.webp' }));

vi.mock('@/hooks/useMounted', () => ({
  useMounted: vi.fn(),
}));

describe('Footer component', () => {
  test('Correctly render', () => {
    vi.mocked(useMountedModule.useMounted).mockReturnValue(true);
    render(<Footer />);

    const aboutLink = screen.getByRole('link', { name: 'about' });
    expect(aboutLink).toHaveAttribute('href', '/about');
    expect(screen.getByText('2026 ©')).toBeInTheDocument();
  });

  test('Correctly render authors list', () => {
    vi.mocked(useMountedModule.useMounted).mockReturnValue(true);
    render(<Footer />);

    const author1Link = screen.getByRole('link', { name: /author1/ });
    expect(author1Link).toHaveAttribute('href', 'https://github.com');
    expect(author1Link).toHaveAttribute('target', '_blank');
    expect(author1Link).toHaveAttribute('rel', 'noopener noreferrer');

    const author2Link = screen.getByRole('link', { name: /author2/ });
    expect(author2Link).toHaveAttribute('href', 'https://github.com');

    const author3Link = screen.getByRole('link', { name: /author3/ });
    expect(author3Link).toHaveAttribute('href', 'https://github.com');
  });

  test('Render light logo before mount', () => {
    vi.mocked(useMountedModule.useMounted).mockReturnValue(false);
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      resolvedTheme: 'dark',
      themes: ['dark', 'light'],
      setTheme: vi.fn(),
    });

    render(<Footer />);

    const logos = screen.getAllByAltText('gh-logo');
    expect(logos[0]).toHaveAttribute('src', expect.stringContaining('light-logo.webp'));
  });

  test('Render dark logo in light theme', () => {
    vi.mocked(useMountedModule.useMounted).mockReturnValue(true);
    mockUseTheme.mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      themes: ['dark', 'light'],
      setTheme: vi.fn(),
    });

    render(<Footer />);

    const logos = screen.getAllByAltText('gh-logo');
    expect(logos[0]).toHaveAttribute('src', expect.stringContaining('dark-logo.webp'));
  });

  test('Render light logo in dark theme', () => {
    vi.mocked(useMountedModule.useMounted).mockReturnValue(true);
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      resolvedTheme: 'dark',
      themes: ['dark', 'light'],
      setTheme: vi.fn(),
    });

    render(<Footer />);

    const logos = screen.getAllByAltText('gh-logo');
    expect(logos[0]).toHaveAttribute('src', expect.stringContaining('light-logo.webp'));
  });
});
