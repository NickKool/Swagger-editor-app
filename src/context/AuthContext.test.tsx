import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type { User } from 'firebase/auth';
import { mockPush } from '@/__mocks__/i18n-navigation';
import { mockOnAuthStateChanged, mockSignOut } from '@/__mocks__/firebase-auth';
import { mockUseTranslations, mockTranslate } from '@/__mocks__/next-intl';

vi.mock('next-intl', () => ({
  useTranslations: () => mockUseTranslations(),
}));

describe('AuthContext and AuthProvider Workflows', () => {
  beforeEach(() => {
    vi.resetModules();
    mockPush.mockClear();
    mockOnAuthStateChanged.mockReset();
    mockSignOut.mockClear();
    mockTranslate.mockClear();

    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });

  it('should render the loading spinner initially while verifying session', async () => {
    mockOnAuthStateChanged.mockImplementation(() => vi.fn());

    const { default: AuthProvider } = await import('./AuthContext');

    render(
      <AuthProvider>
        <div data-testid="child-content">App Ready</div>
      </AuthProvider>,
    );

    expect(screen.getByText('loading...')).toBeInTheDocument();
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
  });

  it('should render children elements when user is a guest', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      callback(null);
      return vi.fn();
    });

    const { default: AuthProvider } = await import('./AuthContext');

    render(
      <AuthProvider>
        <div data-testid="child-content">App Ready</div>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
    expect(screen.queryByText('loading...')).not.toBeInTheDocument();

    expect(document.cookie).not.toContain('auth-token=');
  });

  it('should write token to secure browser cookies when user successfully authenticates', async () => {
    const mockUser: Partial<User> = {
      email: 'test@example.com',
      uid: '12345',
      getIdToken: vi.fn().mockResolvedValue('fake-firebase-token'),
    };

    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      callback(mockUser as User);
      return vi.fn();
    });

    const { default: AuthProvider, useAuth } = await import('./AuthContext');
    const TestingComponent = () => {
      const { user } = useAuth();
      return <span data-testid="user-email">{user?.email || 'Guest'}</span>;
    };

    render(
      <AuthProvider>
        <TestingComponent />
      </AuthProvider>,
    );

    const userEmailSpan = await screen.findByTestId('user-email');
    expect(userEmailSpan).toHaveTextContent('test@example.com');

    expect(mockUser.getIdToken).toHaveBeenCalledTimes(1);
    expect(document.cookie).toContain('auth-token=fake-firebase-token');
  });

  it('should successfully call Firebase signOut API and wipe session token cookies when logging out', async () => {
    const mockUser: Partial<User> = {
      email: 'developer@openapi.io',
      uid: '999',
      getIdToken: vi.fn().mockResolvedValue('active-token'),
    };

    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      callback(mockUser as User);
      return vi.fn();
    });

    const { default: AuthProvider, useAuth } = await import('./AuthContext');

    const TestingComponent = () => {
      const { logout } = useAuth();
      return (
        <button data-testid="logout-btn" onClick={logout}>
          Logout
        </button>
      );
    };

    render(
      <AuthProvider>
        <TestingComponent />
      </AuthProvider>,
    );

    const logoutButton = await screen.findByTestId('logout-btn');

    document.cookie = 'auth-token=active-token; path=/';

    logoutButton.click();

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    expect(document.cookie).not.toContain('auth-token=active-token');
  });
});
