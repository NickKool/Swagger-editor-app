import { describe, expect, it, vi } from 'vitest';
import Footer from './Footer';
import { render, screen } from '@testing-library/react';
import { mockTranslate } from '@/__mocks__/next-intl';

const { MOCK_AUTHORS, MOCK_LIGHT_LOGO, MOCK_DARK_LOGO } = vi.hoisted(() => {
  return {
    MOCK_AUTHORS: [
      { name: 'author1', link: 'https://github.com/profile1' },
      { name: 'author2', link: 'https://github.com/profile2' },
      { name: 'author3', link: 'https://github.com/profile3' },
    ] as const,
    MOCK_LIGHT_LOGO: '/light-logo.webp',
    MOCK_DARK_LOGO: '/dark-logo.webp',
  };
});

vi.mock('@/constants/authors', () => ({
  AUTHORS: MOCK_AUTHORS,
}));

vi.mock('@/../public/light-gh-logo.webp', () => ({ default: MOCK_LIGHT_LOGO }));
vi.mock('@/../public/dark-gh-logo.webp', () => ({ default: MOCK_DARK_LOGO }));

const MOCK_MESSAGES: Record<string, string> = {
  about: 'About Us',
  developed: 'Developed by:',
} as const;

mockTranslate.mockImplementation((k: string) => MOCK_MESSAGES[k]);

describe('Footer Component', () => {
  it('should render about link with correct path', () => {
    render(<Footer />);

    const aboutLink = screen.getByRole('link', { name: MOCK_MESSAGES['about'] });
    expect(aboutLink).toBeInTheDocument();
    expect(aboutLink).toHaveAttribute('href', '/about');
  });

  it('should render development text and current year', () => {
    render(<Footer />);

    expect(screen.getByText(MOCK_MESSAGES['developed'])).toBeInTheDocument();
    expect(screen.getByText('2026 ©')).toBeInTheDocument();
  });

  it('should render all authors with target and rel attributes', () => {
    render(<Footer />);

    const author1Link = screen.getByRole('link', { name: new RegExp(MOCK_AUTHORS[0].name) });
    expect(author1Link).toHaveAttribute('href', MOCK_AUTHORS[0].link);
    expect(author1Link).toHaveAttribute('target', '_blank');
    expect(author1Link).toHaveAttribute('rel', 'noopener noreferrer');

    const author2Link = screen.getByRole('link', { name: new RegExp(MOCK_AUTHORS[1].name) });
    expect(author2Link).toHaveAttribute('href', MOCK_AUTHORS[1].link);
    expect(author2Link).toHaveAttribute('target', '_blank');
    expect(author2Link).toHaveAttribute('rel', 'noopener noreferrer');

    const author3Link = screen.getByRole('link', { name: new RegExp(MOCK_AUTHORS[2].name) });
    expect(author3Link).toHaveAttribute('href', MOCK_AUTHORS[2].link);
    expect(author3Link).toHaveAttribute('target', '_blank');
    expect(author3Link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should render github logo images with responsive dark mode classes', () => {
    render(<Footer />);

    const logos = screen.getAllByRole('img', { name: 'GitHub' });
    expect(logos).toHaveLength(MOCK_AUTHORS.length * 2);

    expect(logos[0]).toHaveClass('hidden md:dark:hidden md:block');

    expect(logos[1]).toHaveClass('hidden md:dark:block');
  });
});
