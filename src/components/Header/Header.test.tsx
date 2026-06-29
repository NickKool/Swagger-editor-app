import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import Header from './Header';

vi.mock('@/../public/logo.webp', () => ({
  default: { src: '/mock-logo.webp', height: 70, width: 70 },
}));

describe('Header component', () => {
  test('render logo-link to main page', () => {
    render(<Header />);

    const logoImg = screen.getByAltText('Logo');
    expect(logoImg).toBeInTheDocument();

    const logoLink = logoImg.closest('a');
    expect(logoLink).toHaveAttribute('href', '/');
  });

  test('correctly navigation buttons with correctly href attributes', () => {
    render(<Header />);

    const aboutLink = screen.getByRole('link', { name: 'about' });
    expect(aboutLink).toHaveAttribute('href', '/about');

    const signInLink = screen.getByRole('link', { name: 'signIn' });
    expect(signInLink).toHaveAttribute('href', '/sign-in');

    const signUpLink = screen.getByRole('link', { name: 'signUp' });
    expect(signUpLink).toHaveAttribute('href', '/sign-up');
  });
});
