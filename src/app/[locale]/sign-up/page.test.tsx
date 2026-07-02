import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SignUpPage from './page';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => `pages.Auth.${key}`,
}));

vi.mock('@/lib/validate', () => ({
  validateEmail: vi.fn(),
  validatePassword: vi.fn(),
}));

import { validateEmail, validatePassword } from '@/lib/validate';

describe('SignUpPage Component Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully render the sign-up form with all initial inputs', () => {
    render(<SignUpPage />);

    expect(screen.getByText('pages.Auth.register.title')).toBeInTheDocument();

    expect(screen.getByPlaceholderText('pages.Auth.placeholders.email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('pages.Auth.placeholders.password')).toBeInTheDocument();

    expect(screen.queryByText('pages.Auth.errors.invalidEmail')).not.toBeInTheDocument();
    expect(screen.queryByText('pages.Auth.errors.invalidPassword')).not.toBeInTheDocument();
  });

  it('should display validation error block elements when user inputs invalid data', () => {
    vi.mocked(validateEmail).mockReturnValue(false);
    vi.mocked(validatePassword).mockReturnValue(false);

    render(<SignUpPage />);

    const emailInput = screen.getByPlaceholderText('pages.Auth.placeholders.email');
    const passwordInput = screen.getByPlaceholderText('pages.Auth.placeholders.password');
    const submitButton = screen.getByRole('button', { name: 'pages.Auth.buttons.register' });

    fireEvent.change(emailInput, { target: { value: 'invalid-email-format' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('pages.Auth.errors.invalidEmail')).toBeInTheDocument();
    expect(screen.getByText('pages.Auth.errors.invalidPassword')).toBeInTheDocument();
  });

  it('should clear error state messages on the fly when user updates input text to valid structure', () => {
    vi.mocked(validateEmail).mockReturnValue(false);

    render(<SignUpPage />);

    const emailInput = screen.getByPlaceholderText('pages.Auth.placeholders.email');
    const submitButton = screen.getByRole('button', { name: 'pages.Auth.buttons.register' });

    fireEvent.change(emailInput, { target: { value: 'wrong-text' } });
    fireEvent.click(submitButton);
    expect(screen.getByText('pages.Auth.errors.invalidEmail')).toBeInTheDocument();

    vi.mocked(validateEmail).mockReturnValue(true);
    fireEvent.change(emailInput, { target: { value: 'correct@example.com' } });

    expect(screen.queryByText('pages.Auth.errors.invalidEmail')).not.toBeInTheDocument();
  });
});
