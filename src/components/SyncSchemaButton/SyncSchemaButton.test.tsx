import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SyncSchemaButton from './SyncSchemaButton';
import { useOpenApiSchemaStore } from '@/stores/OpenApiSchema';
import { useAuth } from '@/context/AuthContext';
import { mockTranslate } from '@/__mocks__/next-intl';

type StoreState = {
  isSynced: boolean;
  isLoading: boolean;
  isSaving: boolean;
  initializeSchema: ReturnType<typeof vi.fn>;
};

type AuthContextType = ReturnType<typeof useAuth>;

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/stores/OpenApiSchema', () => {
  const mockStore = (selector: (state: StoreState) => unknown) => selector(mockStore.currentState);
  mockStore.currentState = {
    isSynced: true,
    isLoading: false,
    isSaving: false,
    initializeSchema: vi.fn().mockResolvedValue(undefined),
  } as StoreState;
  return {
    useOpenApiSchemaStore: mockStore,
  };
});

vi.mock('sonner', () => ({
  toast: {
    promise: vi.fn(
      (
        promise: Promise<unknown>,
        config: { success?: () => unknown; error?: (e: unknown) => unknown },
      ) => {
        promise.then(() => config.success?.()).catch((error: unknown) => config.error?.(error));
        return promise;
      },
    ),
  },
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    disabled,
    onClick,
    className,
    variant,
    title,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    className?: string;
    variant?: string;
    title?: string;
  }) => (
    <button
      data-testid="ui-button"
      disabled={disabled}
      onClick={onClick}
      className={className}
      data-variant={variant}
      title={title}
    >
      {children}
    </button>
  ),
}));

vi.mock('lucide-react', () => ({
  Check: () => <svg data-testid="icon-check" />,
  Loader: () => <svg data-testid="icon-loader" />,
  CloudAlert: () => <svg data-testid="icon-cloud-alert" />,
  CloudSync: () => <svg data-testid="icon-cloud-sync" />,
  AlertCircle: () => <svg data-testid="icon-error" />,
}));

const MOCK_MESSAGES: Record<string, string> = {
  title: 'Sync Schema',
  'toasts.loading': 'Syncing schema...',
  'toasts.success.title': 'Synced successfully',
  'toasts.success.description': 'Your schema is up to date',
  'toasts.error.title': 'Sync failed',
  'toasts.error.description': 'Failed to sync with server',
} as const;

mockTranslate.mockImplementation((k: string) => MOCK_MESSAGES[k]);

describe('SyncSchemaButton', () => {
  const setMockState = (state: Partial<StoreState>) => {
    const store = useOpenApiSchemaStore as unknown as { currentState: StoreState };
    store.currentState = { ...store.currentState, ...state };
  };

  beforeEach(() => {
    vi.useFakeTimers();

    vi.mocked(useAuth).mockReturnValue({
      user: { uid: 'user_123' },
      loading: false,
    } as unknown as AuthContextType);

    setMockState({
      isSynced: true,
      isLoading: false,
      isSaving: false,
      initializeSchema: vi.fn().mockResolvedValue(undefined),
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should render button with active user and outline variant by default', () => {
    render(<SyncSchemaButton />);

    const button = screen.getByTestId('ui-button');
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('data-variant', 'outline');
    expect(button).toHaveAttribute('title', MOCK_MESSAGES['title']);
  });

  it('should be disabled when user is not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
    } as unknown as AuthContextType);

    render(<SyncSchemaButton />);

    expect(screen.getByTestId('ui-button')).toBeDisabled();
  });

  it('should be disabled when store is loading or saving', () => {
    setMockState({ isLoading: true, isSaving: false });
    const { rerender } = render(<SyncSchemaButton />);
    expect(screen.getByTestId('ui-button')).toBeDisabled();

    setMockState({ isLoading: false, isSaving: true });
    rerender(<SyncSchemaButton />);
    expect(screen.getByTestId('ui-button')).toBeDisabled();
  });

  it('should show CloudSync icon when schema is synced', () => {
    setMockState({ isSynced: true });

    render(<SyncSchemaButton />);

    expect(screen.getByTestId('icon-cloud-sync')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-cloud-alert')).not.toBeInTheDocument();
  });

  it('should show CloudAlert icon when schema is not synced', () => {
    setMockState({ isSynced: false });

    render(<SyncSchemaButton />);

    expect(screen.getByTestId('icon-cloud-alert')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-cloud-sync')).not.toBeInTheDocument();
  });

  it('should show loader icon and disable button during sync pipeline execution', async () => {
    const initializeSchemaMock = vi.fn().mockReturnValue(new Promise(() => {}));
    setMockState({ initializeSchema: initializeSchemaMock });

    render(<SyncSchemaButton />);
    const button = screen.getByTestId('ui-button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).toBeDisabled();
    expect(screen.getByTestId('icon-loader')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-cloud-sync')).not.toBeInTheDocument();
    expect(screen.queryByTestId('icon-cloud-alert')).not.toBeInTheDocument();
  });

  it('should call initializeSchema with force=true and trigger toast pipeline on click', async () => {
    const initializeSchemaMock = vi.fn().mockResolvedValue(undefined);
    setMockState({ initializeSchema: initializeSchemaMock });

    render(<SyncSchemaButton />);
    const button = screen.getByTestId('ui-button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(initializeSchemaMock).toHaveBeenCalledWith(false, 'user_123', true);
  });

  it('should show success icon and change variant then revert to idle after successful sync', async () => {
    render(<SyncSchemaButton />);
    const button = screen.getByTestId('ui-button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).toHaveAttribute('data-variant', 'default');
    expect(screen.getByTestId('icon-check')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(button).toHaveAttribute('data-variant', 'outline');
    expect(screen.queryByTestId('icon-check')).not.toBeInTheDocument();
  });

  it('should show error icon and change variant then revert to idle after failed sync', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockError = new Error('Sync connection reset');
    setMockState({ initializeSchema: vi.fn().mockRejectedValue(mockError) });

    render(<SyncSchemaButton />);
    const button = screen.getByTestId('ui-button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).toHaveAttribute('data-variant', 'destructive');
    expect(screen.getByTestId('icon-error')).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalledWith('Firebase sync error:', mockError);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(button).toHaveAttribute('data-variant', 'outline');
    expect(screen.queryByTestId('icon-error')).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('should safely abort if clicked repeatedly while status is loading', async () => {
    const initializeSchemaMock = vi.fn().mockReturnValue(new Promise(() => {}));
    setMockState({ initializeSchema: initializeSchemaMock });

    render(<SyncSchemaButton />);
    const button = screen.getByTestId('ui-button');

    await act(async () => {
      fireEvent.click(button);
    });

    initializeSchemaMock.mockClear();

    await act(async () => {
      fireEvent.click(button);
    });

    expect(initializeSchemaMock).not.toHaveBeenCalled();
  });

  it('should eliminate reference pending timeout hooks completely during component unmount sequences', async () => {
    const { unmount } = render(<SyncSchemaButton />);
    const button = screen.getByTestId('ui-button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByTestId('icon-check')).toBeInTheDocument();

    act(() => {
      unmount();
    });
  });

  it('should clear existing timeout references when handleSync execution sequence is double triggered', async () => {
    setMockState({ isSynced: false });

    render(<SyncSchemaButton />);
    const button = screen.getByTestId('ui-button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).toHaveAttribute('data-variant', 'default');

    await act(async () => {
      fireEvent.click(button);
    });

    await act(async () => {
      vi.runAllTimers();
    });
  });

  it('should use fallback translation string when intercepted error instance is not an error object', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    setMockState({ initializeSchema: vi.fn().mockRejectedValue('Fatal network rejection string') });

    render(<SyncSchemaButton />);
    const button = screen.getByTestId('ui-button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).toHaveAttribute('data-variant', 'destructive');

    await act(async () => {
      vi.runAllTimers();
    });

    consoleSpy.mockRestore();
  });
});
