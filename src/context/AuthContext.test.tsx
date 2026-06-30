import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type { User } from 'firebase/auth';
import { mockPush, usePathname } from '@/__mocks__/i18n-navigation';
import { mockOnAuthStateChanged, mockSignOut } from '@/__mocks__/firebase-app';

describe('AuthContext and AuthProvider Workflows', () => {
  beforeEach(() => {
    vi.resetModules();
    mockPush.mockClear();
    mockOnAuthStateChanged.mockReset();
    mockSignOut.mockClear();
    vi.mocked(usePathname).mockReturnValue('/');
  });

  it('should render the loading spinner initially while verifying session', async () => {
    mockOnAuthStateChanged.mockImplementation(() => vi.fn());

    const { AuthProvider } = await import('./AuthContext');

    render(
      <AuthProvider>
        <div data-testid="child-content">App Ready</div>
      </AuthProvider>,
    );

    expect(screen.getByText('Preparing workspace...')).toBeInTheDocument();
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
  });

  it('should render children elements when user is a guest', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      callback(null);
      return vi.fn();
    });

    const { AuthProvider } = await import('./AuthContext');

    render(
      <AuthProvider>
        <div data-testid="child-content">App Ready</div>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
    expect(screen.queryByText('Preparing workspace...')).not.toBeInTheDocument();
  });

  it('should trigger redirect to root route if authenticated user visits auth pages', async () => {
    const mockUser: Partial<User> = { email: 'test@example.com', uid: '12345' };

    vi.mocked(usePathname).mockReturnValue('/register');

    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      callback(mockUser as User);
      return vi.fn();
    });

    const { AuthProvider, useAuth } = await import('./AuthContext');
    const TestingComponent = () => {
      const { user } = useAuth();
      return <span data-testid="user-email">{user?.email || 'Guest'}</span>;
    };

    render(
      <AuthProvider>
        <TestingComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    const userEmailSpan = await screen.findByTestId('user-email');
    expect(userEmailSpan).toHaveTextContent('test@example.com');
  });

  it('should successfully call Firebase signOut API when logging out', async () => {
    const mockUser: Partial<User> = { email: 'developer@openapi.io', uid: '999' };

    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      callback(mockUser as User);
      return vi.fn();
    });

    const { AuthProvider, useAuth } = await import('./AuthContext');

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
    logoutButton.click();

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});
