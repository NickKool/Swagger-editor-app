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
  language: 'Language:',
  hamburgerMenu: 'Hamburger Menu',
} as const;

mockTranslate.mockImplementation((k: string) => MOCK_MESSAGES[k]);

const mockLogout = vi.fn(() => Promise.resolve());

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useAuth).mockReturnValue({
    user: null,
    loading: false,
    logout: mockLogout,
  });
});

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

  it('should render correct navigation components for a guest user', () => {
    render(<Header />);

    const aboutLinks = screen.getAllByRole('link', { name: MOCK_MESSAGES['about'] });
    expect(aboutLinks[0]).toBeInTheDocument();
    expect(aboutLinks[0]).toHaveAttribute('href', '/about');

    const signInLinks = screen.getAllByRole('link', { name: MOCK_MESSAGES['signIn'] });
    expect(signInLinks[0]).toBeInTheDocument();
    expect(signInLinks[0]).toHaveAttribute('href', '/sign-in');

    const signUpLinks = screen.getAllByRole('link', { name: MOCK_MESSAGES['signUp'] });
    expect(signUpLinks[0]).toBeInTheDocument();
    expect(signUpLinks[0]).toHaveAttribute('href', '/sign-up');

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

    expect(screen.getAllByRole('link', { name: MOCK_MESSAGES['about'] })[0]).toBeInTheDocument();

    expect(screen.queryByRole('link', { name: MOCK_MESSAGES['signIn'] })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: MOCK_MESSAGES['signUp'] })).not.toBeInTheDocument();

    const historyLinks = screen.getAllByRole('link', { name: MOCK_MESSAGES['history'] });
    expect(historyLinks[0]).toBeInTheDocument();
    expect(historyLinks[0]).toHaveAttribute('href', '/history');

    const signOutButtons = screen.getAllByRole('button', { name: MOCK_MESSAGES['signOut'] });
    expect(signOutButtons[0]).toBeInTheDocument();

    fireEvent.click(signOutButtons[0]);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('should render embedded child selection subcomponents for global locale and layout themes', () => {
    render(<Header />);

    expect(screen.getAllByTestId('mock-language-selector')[0]).toBeInTheDocument();
    expect(screen.getAllByTestId('mock-theme-selector')[0]).toBeInTheDocument();
  });

  it('should structuralize header components using underlying landmark html nav layouts', () => {
    render(<Header />);

    const navigationRegions = screen.getAllByRole('navigation');
    expect(navigationRegions.length).toBeGreaterThanOrEqual(2);
  });

  it('should toggle mobile menu when burger button is clicked', () => {
    render(<Header />);

    const toggleButton = screen.getByRole('button', { name: MOCK_MESSAGES['hamburgerMenu'] });
    expect(screen.queryByText(MOCK_MESSAGES['language'])).not.toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.getByText(MOCK_MESSAGES['language'])).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.queryByText(MOCK_MESSAGES['language'])).not.toBeInTheDocument();
  });

  it('should render and handle mobile buttons correctly for guest users when menu is open', () => {
    render(<Header />);

    const toggleButton = screen.getByRole('button', { name: MOCK_MESSAGES['hamburgerMenu'] });
    fireEvent.click(toggleButton);

    const aboutLinks = screen.getAllByRole('link', { name: MOCK_MESSAGES['about'] });
    expect(aboutLinks).toHaveLength(2);
    expect(aboutLinks[1]).toHaveAttribute('href', '/about');

    const signInLinks = screen.getAllByRole('link', { name: MOCK_MESSAGES['signIn'] });
    expect(signInLinks).toHaveLength(2);
    expect(signInLinks[1]).toHaveAttribute('href', '/sign-in');

    const signUpLinks = screen.getAllByRole('link', { name: MOCK_MESSAGES['signUp'] });
    expect(signUpLinks).toHaveLength(2);
    expect(signUpLinks[1]).toHaveAttribute('href', '/sign-up');
  });

  it('should render and handle mobile buttons correctly for authenticated users when menu is open', () => {
    const fakeUser: Partial<User> = { email: 'developer@openapi.io', uid: 'abc-123' };

    vi.mocked(useAuth).mockReturnValue({
      user: fakeUser as User,
      loading: false,
      logout: mockLogout,
    });

    render(<Header />);

    const toggleButton = screen.getByRole('button', { name: MOCK_MESSAGES['hamburgerMenu'] });
    fireEvent.click(toggleButton);

    const historyLinks = screen.getAllByRole('link', { name: MOCK_MESSAGES['history'] });
    expect(historyLinks).toHaveLength(2);
    expect(historyLinks[1]).toHaveAttribute('href', '/history');

    const signOutButtons = screen.getAllByRole('button', { name: MOCK_MESSAGES['signOut'] });
    expect(signOutButtons).toHaveLength(2);

    fireEvent.click(signOutButtons[1]);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('should close mobile menu automatically when any navigation link inside it is clicked', () => {
    render(<Header />);

    const toggleButton = screen.getByRole('button', { name: MOCK_MESSAGES['hamburgerMenu'] });
    fireEvent.click(toggleButton);
    expect(screen.getByText(MOCK_MESSAGES['language'])).toBeInTheDocument();

    const aboutLinks = screen.getAllByRole('link', { name: MOCK_MESSAGES['about'] });
    fireEvent.click(aboutLinks[1]);

    expect(screen.queryByText(MOCK_MESSAGES['language'])).not.toBeInTheDocument();
  });
});
