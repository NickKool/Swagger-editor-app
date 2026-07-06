import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import SignInPage from './page';

// 1. Импортируем моки из глобальной инфраструктуры проекта
import { mockTranslate } from '@/__mocks__/next-intl';
import { mockPush } from '@/__mocks__/i18n-navigation';
import { mockSignInWithEmailAndPassword } from '@/__mocks__/firebase-auth';

import { FirebaseError } from 'firebase/app';
import type { UserCredential } from 'firebase/auth';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/lib/validate', () => ({
  validateEmail: vi.fn(),
}));

import { toast } from 'sonner';
import { validateEmail } from '@/lib/validate';

describe('SignInPage Component Workflow', () => {
  beforeEach(() => {
    mockTranslate.mockImplementation((key: string) => `pages.Auth.${key}`);
    mockPush.mockClear();
    mockSignInWithEmailAndPassword.mockClear();
  });

  it('should successfully render the sign-in form with all initial inputs', () => {
    render(<SignInPage />);

    expect(screen.getByText('pages.Auth.login.title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('pages.Auth.placeholders.email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('pages.Auth.placeholders.password')).toBeInTheDocument();

    expect(screen.queryByText('pages.Auth.errors.invalidEmail')).not.toBeInTheDocument();
    expect(screen.queryByText('pages.Auth.errors.requiredPassword')).not.toBeInTheDocument();
  });

  it('should display validation errors when fields are empty or invalid', () => {
    vi.mocked(validateEmail).mockReturnValue(false);

    render(<SignInPage />);

    const emailInput = screen.getByPlaceholderText('pages.Auth.placeholders.email');
    const submitButton = screen.getByRole('button', { name: 'pages.Auth.buttons.signIn' });

    fireEvent.change(emailInput, { target: { value: 'bad-email' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('pages.Auth.errors.invalidEmail')).toBeInTheDocument();
    expect(screen.getByText('pages.Auth.errors.requiredPassword')).toBeInTheDocument();
  });

  it('should clear errors on the fly when user updates fields input data', () => {
    vi.mocked(validateEmail).mockReturnValue(false);

    render(<SignInPage />);

    const emailInput = screen.getByPlaceholderText('pages.Auth.placeholders.email');
    const passwordInput = screen.getByPlaceholderText('pages.Auth.placeholders.password');
    const submitButton = screen.getByRole('button', { name: 'pages.Auth.buttons.signIn' });

    fireEvent.change(emailInput, { target: { value: 'bad-email' } });
    fireEvent.click(submitButton);
    expect(screen.getByText('pages.Auth.errors.invalidEmail')).toBeInTheDocument();
    expect(screen.getByText('pages.Auth.errors.requiredPassword')).toBeInTheDocument();

    vi.mocked(validateEmail).mockReturnValue(true);
    fireEvent.change(emailInput, { target: { value: 'correct@example.com' } });
    expect(screen.queryByText('pages.Auth.errors.invalidEmail')).not.toBeInTheDocument();

    fireEvent.change(passwordInput, { target: { value: 'mypassword' } });
    expect(screen.queryByText('pages.Auth.errors.requiredPassword')).not.toBeInTheDocument();
  });

  it('should process authentication successfully when valid credentials are submitted', async () => {
    vi.mocked(validateEmail).mockReturnValue(true);
    mockSignInWithEmailAndPassword.mockResolvedValue({} as UserCredential);

    render(<SignInPage />);

    const emailInput = screen.getByPlaceholderText('pages.Auth.placeholders.email');
    const passwordInput = screen.getByPlaceholderText('pages.Auth.placeholders.password');
    const submitButton = screen.getByRole('button', { name: 'pages.Auth.buttons.signIn' });

    fireEvent.change(emailInput, { target: { value: 'user@openapi.io' } });
    fireEvent.change(passwordInput, { target: { value: 'ValidPassword123!' } });
    fireEvent.click(submitButton);

    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'user@openapi.io',
      'ValidPassword123!',
    );

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    // Сверяем точную структуру: заголовок — login.title, описание — login.toastSuccess [ТЗ]
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'pages.Auth.login.title',
        expect.objectContaining({
          description: 'pages.Auth.login.toastSuccess',
          position: 'top-center',
        }),
      );
    });

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('should map invalid credential FirebaseError onto input error element block', async () => {
    vi.mocked(validateEmail).mockReturnValue(true);

    const credentialError = new FirebaseError('auth/invalid-credential', 'Invalid credentials.');
    mockSignInWithEmailAndPassword.mockRejectedValue(credentialError);

    render(<SignInPage />);

    const emailInput = screen.getByPlaceholderText('pages.Auth.placeholders.email');
    const passwordInput = screen.getByPlaceholderText('pages.Auth.placeholders.password');
    const submitButton = screen.getByRole('button', { name: 'pages.Auth.buttons.signIn' });

    fireEvent.change(emailInput, { target: { value: 'user@openapi.io' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong-password' } });
    fireEvent.click(submitButton);

    const credentialsErrorBlock = await screen.findByText('pages.Auth.errors.invalidCredentials');
    expect(credentialsErrorBlock).toBeInTheDocument();
  });

  it('should trigger toast.error alert popup for auth/too-many-requests FirebaseError', async () => {
    vi.mocked(validateEmail).mockReturnValue(true);

    const lockError = new FirebaseError('auth/too-many-requests', 'Too many requests.');
    mockSignInWithEmailAndPassword.mockRejectedValue(lockError);

    render(<SignInPage />);

    const emailInput = screen.getByPlaceholderText('pages.Auth.placeholders.email');
    const passwordInput = screen.getByPlaceholderText('pages.Auth.placeholders.password');
    const submitButton = screen.getByRole('button', { name: 'pages.Auth.buttons.signIn' });

    fireEvent.change(emailInput, { target: { value: 'user@openapi.io' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Сверяем точные ключи локализации из дампа! [2.1]
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'pages.Auth.errors.accountLockedTitle',
        expect.objectContaining({
          description: 'pages.Auth.errors.accountLockedDesc',
          position: 'top-center',
        }),
      );
    });
  });

  it('should fallback to generic toast.error for unexpected FirebaseError codes', async () => {
    vi.mocked(validateEmail).mockReturnValue(true);

    const unexpectedError = new FirebaseError('auth/internal-error', 'Server error.');
    mockSignInWithEmailAndPassword.mockRejectedValue(unexpectedError);

    render(<SignInPage />);

    const emailInput = screen.getByPlaceholderText('pages.Auth.placeholders.email');
    const passwordInput = screen.getByPlaceholderText('pages.Auth.placeholders.password');
    const submitButton = screen.getByRole('button', { name: 'pages.Auth.buttons.signIn' });

    fireEvent.change(emailInput, { target: { value: 'user@openapi.io' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Сверяем точные мультиязычные префиксы для неожиданных кодов Firebase [2.1]
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'pages.Auth.errors.authFailedTitle',
        expect.objectContaining({
          description: 'Server error.',
          position: 'top-center',
        }),
      );
    });
  });

  it('should fallback to standard JavaScript Error object handling in catch block', async () => {
    vi.mocked(validateEmail).mockReturnValue(true);

    const nativeError = new Error('Runtime error exception');
    mockSignInWithEmailAndPassword.mockRejectedValue(nativeError);

    render(<SignInPage />);

    const emailInput = screen.getByPlaceholderText('pages.Auth.placeholders.email');
    const passwordInput = screen.getByPlaceholderText('pages.Auth.placeholders.password');
    const submitButton = screen.getByRole('button', { name: 'pages.Auth.buttons.signIn' });

    fireEvent.change(emailInput, { target: { value: 'user@openapi.io' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Сверяем точные ключи для нативных ошибок JS из внешнего catch [2.1]
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'pages.Auth.errors.loginFailedTitle',
        expect.objectContaining({
          description: 'Runtime error exception',
          position: 'top-center',
        }),
      );
    });
  });
});
