import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Header from './Header';
import { mockTranslate } from '@/__mocks__/next-intl';

const { MOCK_LOGO } = vi.hoisted(() => ({
  MOCK_LOGO: 'logo.webp',
}));

vi.mock('@/../public/logo.webp', () => ({ default: `/${MOCK_LOGO}` }));

vi.mock('@/components/LanguageSelector/LanguageSelector', () => ({
  default: () => <div data-testid="mock-language-selector">LanguageSelector</div>,
}));

vi.mock('@/components/theme/ThemeSelector/ThemeSelector', () => ({
  default: () => <div data-testid="mock-theme-selector">ThemeSelector</div>,
}));

const MOCK_MESSAGES: Record<string, string> = {
  about: 'About Us',
  signIn: 'Sign In',
  signUp: 'Sign Up',
} as const;

mockTranslate.mockImplementation((k: string) => MOCK_MESSAGES[k]);

describe('Header Component', () => {
  it('should render logo-link pointing to the main page', () => {
    render(<Header />);

    const logoImg = screen.getByAltText('Logo');
    expect(logoImg).toBeInTheDocument();
    expect(logoImg).toHaveAttribute('src', expect.stringMatching(MOCK_LOGO));
    expect(logoImg).toHaveAttribute('loading', 'eager');

    const logoLink = logoImg.closest('a');
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('should render correct navigation buttons with correct href attributes', () => {
    render(<Header />);

    const aboutLink = screen.getByRole('link', { name: MOCK_MESSAGES['about'] });
    expect(aboutLink).toBeInTheDocument();
    expect(aboutLink).toHaveAttribute('href', '/about');

    const signInLink = screen.getByRole('link', { name: MOCK_MESSAGES['signIn'] });
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute('href', '/sign-in');

    const signUpLink = screen.getByRole('link', { name: MOCK_MESSAGES['signUp'] });
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink).toHaveAttribute('href', '/sign-up');
  });

  it('should render embedded child selection subcomponents for global locale and layout themes', () => {
    render(<Header />);

    expect(screen.getByTestId('mock-language-selector')).toBeInTheDocument();
    expect(screen.getByTestId('mock-theme-selector')).toBeInTheDocument();
  });

  it('should structuralize header components using underlying landmark html nav layouts', () => {
    render(<Header />);

    const navigationRegions = screen.getAllByRole('navigation');
    expect(navigationRegions).toHaveLength(2);
  });
});
