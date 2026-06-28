import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signOut: vi.fn(() => Promise.resolve()),
}));

vi.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
}));

const TestingConsumerComponent = () => {
  const { user, logout } = useAuth();
  return (
    <div>
      <span data-testid="user-email">{user ? user.email : 'Guest'}</span>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

describe('AuthContext and AuthProvider', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    const mockRouter: Partial<ReturnType<typeof useRouter>> = {
      push: mockPush,
    };

    vi.mocked(useRouter).mockReturnValue(mockRouter as ReturnType<typeof useRouter>);
    vi.mocked(usePathname).mockReturnValue('/');
  });

  it('should render the loading spinner initially while verifying session', () => {
    vi.mocked(onAuthStateChanged).mockImplementation(() => vi.fn());

    render(
      <AuthProvider>
        <div data-testid="child-content">App Ready</div>
      </AuthProvider>,
    );

    expect(screen.getByText('Preparing workspace...')).toBeInTheDocument();
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
  });

  it('should render children elements when user is a guest (not authenticated)', async () => {
    vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
      (callback as (user: null) => void)(null);
      return vi.fn();
    });

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

    vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
      (callback as (user: User) => void)(mockUser as User);
      return vi.fn();
    });

    vi.mocked(usePathname).mockReturnValue('/en/register');

    render(
      <AuthProvider>
        <TestingConsumerComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
  });

  it('should successfully call Firebase signOut API when logging out', async () => {
    const mockUser: Partial<User> = { email: 'developer@openapi.io', uid: '999' };

    vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
      (callback as (user: User) => void)(mockUser as User);
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestingConsumerComponent />
      </AuthProvider>,
    );

    const logoutButton = screen.getByTestId('logout-btn');
    logoutButton.click();

    expect(signOut).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});
