import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import Header from './Header';
import { mockTranslate } from '@/__mocks__/next-intl';
import type { User } from 'firebase/auth';
import { useAuth } from '@/context/AuthContext';

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

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const MOCK_MESSAGES: Record<string, string> = {
  about: 'About Us',
  signIn: 'Sign In',
  signUp: 'Sign Up',
  history: 'History',
  signOut: 'Sign Out',
} as const;

describe('Header Component', () => {
  const mockLogout = vi.fn(() => Promise.resolve());

  beforeEach(() => {
    mockTranslate.mockImplementation((k: string) => MOCK_MESSAGES[k]);

    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      logout: mockLogout,
    });
  });

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

  it('should render correct navigation components for a guest user', () => {
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

    expect(screen.queryByRole('link', { name: MOCK_MESSAGES['history'] })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: MOCK_MESSAGES['signOut'] }),
    ).not.toBeInTheDocument();
  });

  it('should render private navigation controls and handle logout operation for authenticated users', () => {
    const fakeUser: Partial<User> = { email: 'developer@openapi.io', uid: 'abc-123' };

    vi.mocked(useAuth).mockReturnValue({
      user: fakeUser as User,
      loading: false,
      logout: mockLogout,
    });

    render(<Header />);

    expect(screen.getByRole('link', { name: MOCK_MESSAGES['about'] })).toBeInTheDocument();

    expect(screen.queryByRole('link', { name: MOCK_MESSAGES['signIn'] })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: MOCK_MESSAGES['signUp'] })).not.toBeInTheDocument();

    const historyLink = screen.getByRole('link', { name: MOCK_MESSAGES['history'] });
    expect(historyLink).toBeInTheDocument();
    expect(historyLink).toHaveAttribute('href', '/history');

    const signOutButton = screen.getByRole('button', { name: 'Sign Out' });
    expect(signOutButton).toBeInTheDocument();

    fireEvent.click(signOutButton);
    expect(mockLogout).toHaveBeenCalledTimes(1);
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
