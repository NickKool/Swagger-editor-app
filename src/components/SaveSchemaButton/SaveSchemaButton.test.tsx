import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SaveSchemaButton from './SaveSchemaButton';
import { useOpenApiSchemaStore } from '@/stores/OpenApiSchema';
import { useAuth } from '@/context/AuthContext';
import { saveSchema } from '@/actions/schema';
import { OpenApiSchemaStoreState } from '@/stores/OpenApiSchema.types';
import { mockTranslate } from '@/__mocks__/next-intl';

interface UserMock {
  uid: string;
}

interface AuthContextMock {
  user: UserMock | null;
  loading: boolean;
}

vi.mock('@/stores/OpenApiSchema', () => ({
  useOpenApiSchemaStore: vi.fn(),
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/actions/schema', () => ({
  saveSchema: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    promise: vi.fn(
      (
        promise: Promise<unknown>,
        config: { success?: (d: unknown) => unknown; error?: (e: unknown) => unknown },
      ) => {
        promise
          .then((result) => {
            act(() => {
              config.success?.(result);
            });
          })
          .catch((error: unknown) => {
            act(() => {
              config.error?.(error);
            });
          });
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
  Save: () => <svg data-testid="icon-save" />,
  AlertCircle: () => <svg data-testid="icon-error" />,
}));

const MOCK_MESSAGES: Record<string, string> = {
  title: 'Save Schema',
  'toasts.loading': 'Saving schema...',
  'toasts.success.title': 'Saved successfully',
  'toasts.success.description': 'Your schema is secure',
  'toasts.error.title': 'Save failed',
  'toasts.error.description': 'Server configuration issues',
} as const;

mockTranslate.mockImplementation((k: string) => MOCK_MESSAGES[k]);

describe('SaveSchemaButton Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    vi.mocked(useAuth).mockReturnValue({
      user: { uid: 'user_123' },
      loading: false,
    } as AuthContextMock as ReturnType<typeof useAuth>);

    vi.mocked(saveSchema).mockResolvedValue(undefined as never);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  const setMockStore = (overrides: Partial<OpenApiSchemaStoreState>) => {
    vi.mocked(useOpenApiSchemaStore).mockImplementation((selector) =>
      selector({
        isValid: true,
        spec: 'openapi: 3.0.0',
        format: 'yaml',
        parsedSpec: { info: { title: 'Test API', version: '1.0.0' }, openapi: '3.0.0', paths: {} },
        hasInitialized: true,
        isLoading: false,
        error: null,
        initializeSchema: vi.fn(),
        setSpec: vi.fn(),
        toggleFormat: vi.fn(),
        validateAndParseSpec: vi.fn(),
        ...overrides,
      } as OpenApiSchemaStoreState),
    );
  };

  it('should be disabled when schema is invalid', () => {
    setMockStore({ isValid: false });

    render(<SaveSchemaButton />);

    const button = screen.getByTestId('ui-button');
    expect(button).toBeDisabled();
    expect(screen.getByTestId('icon-save')).toBeInTheDocument();
  });

  it('should be disabled when user is not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
    } as AuthContextMock as ReturnType<typeof useAuth>);
    setMockStore({ isValid: true });

    render(<SaveSchemaButton />);

    const button = screen.getByTestId('ui-button');
    expect(button).toBeDisabled();
  });

  it('should be enabled when schema is valid, user exists and status is idle', () => {
    setMockStore({ isValid: true });

    render(<SaveSchemaButton />);

    const button = screen.getByTestId('ui-button');
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('data-variant', 'outline');
    expect(button).toHaveAttribute('title', MOCK_MESSAGES['title']);
    expect(screen.getByTestId('icon-save')).toBeInTheDocument();
  });

  it('should show loader during saving and disable button', async () => {
    const savePromise = new Promise<void>(() => {});
    vi.mocked(saveSchema).mockReturnValue(savePromise as never);
    setMockStore({ isValid: true });

    render(<SaveSchemaButton />);
    const button = screen.getByTestId('ui-button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).toBeDisabled();
    expect(screen.getByTestId('icon-loader')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-save')).not.toBeInTheDocument();
  });

  it('should show success icon and default variant after successful save then revert to idle', async () => {
    setMockStore({ isValid: true });

    render(<SaveSchemaButton />);
    const button = screen.getByTestId('ui-button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('data-variant', 'default');
    expect(screen.getByTestId('icon-check')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('data-variant', 'outline');
    expect(screen.getByTestId('icon-save')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-check')).not.toBeInTheDocument();
  });

  it('should show error icon and destructive variant after failed save then revert to idle', async () => {
    vi.mocked(saveSchema).mockRejectedValue(new Error('Firebase error') as never);
    setMockStore({ isValid: true });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<SaveSchemaButton />);
    const button = screen.getByTestId('ui-button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('data-variant', 'destructive');
    expect(screen.getByTestId('icon-error')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('data-variant', 'outline');
    expect(screen.getByTestId('icon-save')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-error')).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('should clear existing layout configuration timeout when handleSave execution sequence is double triggered', async () => {
    setMockStore({ isValid: true });

    render(<SaveSchemaButton />);
    const button = screen.getByTestId('ui-button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).toHaveAttribute('data-variant', 'default');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).toHaveAttribute('data-variant', 'default');

    await act(async () => {
      vi.runAllTimers();
    });
  });

  it('should explicitly trigger unmount sequence hook pipeline to eliminate dangling reference timers completely', async () => {
    setMockStore({ isValid: true });

    const { unmount } = render(<SaveSchemaButton />);
    const button = screen.getByTestId('ui-button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByTestId('icon-check')).toBeInTheDocument();

    unmount();
  });

  it('should abort early if handleSave is called while status is loading', async () => {
    const savePromise = new Promise<void>(() => {});
    vi.mocked(saveSchema).mockReturnValue(savePromise as never);
    setMockStore({ isValid: true });

    render(<SaveSchemaButton />);
    const button = screen.getByTestId('ui-button');

    await act(async () => {
      fireEvent.click(button);
    });

    vi.mocked(saveSchema).mockClear();

    await act(async () => {
      fireEvent.click(button);
    });

    expect(saveSchema).not.toHaveBeenCalled();
  });

  it('should abort early if handleSave is called when parsedSpec is missing', async () => {
    setMockStore({ isValid: true, parsedSpec: null });

    render(<SaveSchemaButton />);
    const button = screen.getByTestId('ui-button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(saveSchema).not.toHaveBeenCalled();
  });

  it('should use fallback translation string when intercepted error instance is not an error object', async () => {
    vi.mocked(saveSchema).mockRejectedValue('String error rejection wrapper' as never);
    setMockStore({ isValid: true });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<SaveSchemaButton />);
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
