import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignUpPage from './page';

import { mockTranslate } from '@/__mocks__/next-intl';
import { mockPush } from '@/__mocks__/i18n-navigation';
import { mockCreateUserWithEmailAndPassword } from '@/__mocks__/firebase-auth';

import type { UserCredential } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

import { toast } from 'sonner';
import { validateEmail, validatePassword } from '@/lib/validate';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/lib/validate', () => ({
  validateEmail: vi.fn(),
  validatePassword: vi.fn(),
}));

describe('SignUpPage Component Workflow', () => {
  beforeEach(() => {
    mockTranslate.mockImplementation((key: string) => `pages.Auth.${key}`);
    mockPush.mockClear();
    mockCreateUserWithEmailAndPassword.mockClear();
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

  it('should process form submission successfully when all inputs are valid', async () => {
    vi.mocked(validateEmail).mockReturnValue(true);
    vi.mocked(validatePassword).mockReturnValue(true);
    mockCreateUserWithEmailAndPassword.mockResolvedValue({} as UserCredential);

    render(<SignUpPage />);

    const emailInput = screen.getByPlaceholderText('pages.Auth.placeholders.email');
    const passwordInput = screen.getByPlaceholderText('pages.Auth.placeholders.password');
    const submitButton = screen.getByRole('button', { name: 'pages.Auth.buttons.register' });

    fireEvent.change(emailInput, { target: { value: 'correct@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'ValidPassword123!' } });
    fireEvent.click(submitButton);

    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'correct@example.com',
      'ValidPassword123!',
    );

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    expect(screen.getByRole('button', { name: 'pages.Auth.buttons.register' })).toBeInTheDocument();

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'pages.Auth.register.toastSuccess',
        expect.objectContaining({
          description: 'pages.Auth.register.toastDescription',
          position: 'top-center',
        }),
      );
    });

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('should render explicit error block messages when backend email already exists', async () => {
    vi.mocked(validateEmail).mockReturnValue(true);
    vi.mocked(validatePassword).mockReturnValue(true);

    const backendError = new FirebaseError(
      'auth/email-already-in-use',
      'The email address is already in use.',
    );
    mockCreateUserWithEmailAndPassword.mockRejectedValue(backendError);

    render(<SignUpPage />);

    const emailInput = screen.getByPlaceholderText('pages.Auth.placeholders.email');
    const submitButton = screen.getByRole('button', { name: 'pages.Auth.buttons.register' });

    fireEvent.change(emailInput, { target: { value: 'duplicate@openapi.io' } });
    fireEvent.click(submitButton);

    const emailErrorBlock = await screen.findByText('pages.Auth.errors.emailInUse');
    expect(emailErrorBlock).toBeInTheDocument();
  });

  it('should map FirebaseError correctly when email format is explicitly invalid on backend', async () => {
    vi.mocked(validateEmail).mockReturnValue(true);
    vi.mocked(validatePassword).mockReturnValue(true);

    const backendError = new FirebaseError('auth/invalid-email', 'Invalid email format.');
    mockCreateUserWithEmailAndPassword.mockRejectedValue(backendError);

    render(<SignUpPage />);

    const emailInput = screen.getByPlaceholderText('pages.Auth.placeholders.email');
    const submitButton = screen.getByRole('button', { name: 'pages.Auth.buttons.register' });

    fireEvent.change(emailInput, { target: { value: 'bad-format@openapi.io' } });
    fireEvent.click(submitButton);

    const emailErrorBlock = await screen.findByText('pages.Auth.errors.adlyFormattedEmail');
    expect(emailErrorBlock).toBeInTheDocument();
  });

  it('should map FirebaseError correctly when chosen password is flags as weak on backend', async () => {
    vi.mocked(validateEmail).mockReturnValue(true);
    vi.mocked(validatePassword).mockReturnValue(true);

    const backendError = new FirebaseError('auth/weak-password', 'Weak password.');
    mockCreateUserWithEmailAndPassword.mockRejectedValue(backendError);

    render(<SignUpPage />);

    const passwordInput = screen.getByPlaceholderText('pages.Auth.placeholders.password');
    const submitButton = screen.getByRole('button', { name: 'pages.Auth.buttons.register' });

    fireEvent.change(passwordInput, { target: { value: '12345' } });
    fireEvent.click(submitButton);

    const passwordErrorBlock = await screen.findByText('pages.Auth.errors.weakPassword');
    expect(passwordErrorBlock).toBeInTheDocument();
  });

  it('should clear password error state messages on the fly when user updates input text to valid structure', () => {
    vi.mocked(validatePassword).mockReturnValue(false);

    render(<SignUpPage />);

    const passwordInput = screen.getByPlaceholderText('pages.Auth.placeholders.password');
    const submitButton = screen.getByRole('button', { name: 'pages.Auth.buttons.register' });

    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.click(submitButton);
    expect(screen.getByText('pages.Auth.errors.invalidPassword')).toBeInTheDocument();

    vi.mocked(validatePassword).mockReturnValue(true);
    fireEvent.change(passwordInput, { target: { value: 'ValidPassword123!' } });
    expect(screen.queryByText('pages.Auth.errors.invalidPassword')).not.toBeInTheDocument();
  });
  it('should trigger generic toast.error message for unhandled FirebaseError codes', async () => {
    vi.mocked(validateEmail).mockReturnValue(true);
    vi.mocked(validatePassword).mockReturnValue(true);

    const unexpectedFirebaseError = new FirebaseError(
      'auth/internal-error',
      'Server isolated error.',
    );
    mockCreateUserWithEmailAndPassword.mockRejectedValue(unexpectedFirebaseError);

    render(<SignUpPage />);

    const emailInput = screen.getByPlaceholderText('pages.Auth.placeholders.email');
    const submitButton = screen.getByRole('button', { name: 'pages.Auth.buttons.register' });

    fireEvent.change(emailInput, { target: { value: 'user@openapi.io' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'pages.Auth.errors.registrationError',
        expect.objectContaining({
          description: 'Server isolated error.',
          position: 'top-center',
        }),
      );
    });
  });

  it('should fallback to standard JavaScript Error message handling in final catch block', async () => {
    vi.mocked(validateEmail).mockReturnValue(true);
    vi.mocked(validatePassword).mockReturnValue(true);

    const nativeJavaScriptError = new Error('Network runtime exception');
    mockCreateUserWithEmailAndPassword.mockRejectedValue(nativeJavaScriptError);

    render(<SignUpPage />);

    const emailInput = screen.getByPlaceholderText('pages.Auth.placeholders.email');
    const submitButton = screen.getByRole('button', { name: 'pages.Auth.buttons.register' });

    fireEvent.change(emailInput, { target: { value: 'native@openapi.io' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'pages.Auth.errors.registrationError',
        expect.objectContaining({
          description: 'Network runtime exception',
          position: 'top-center',
        }),
      );
    });
  });
});
