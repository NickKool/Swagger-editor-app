import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SaveSchemaButton from './SaveSchemaButton';
import { useOpenApiSchemaStore } from '@/stores/OpenApiSchema';
import { OpenApiSchemaStoreState } from '@/stores/OpenApiSchema.types';

type StoreState = Partial<OpenApiSchemaStoreState>;

vi.mock('@/stores/OpenApiSchema.store', () => {
  const mockStore = (selector: (state: StoreState) => unknown) => selector(mockStore.currentState);
  mockStore.currentState = { isValid: true } as StoreState;
  mockStore.getState = () => mockStore.currentState;
  mockStore.setState = vi.fn();
  mockStore.subscribe = vi.fn();
  return {
    useOpenApiSchemaStore: mockStore,
  };
});

vi.mock('lucide-react', () => ({
  Check: () => <svg data-testid="icon-check" />,
  Loader: () => <svg data-testid="icon-loader" />,
  Save: () => <svg data-testid="icon-save" />,
}));

describe('SaveSchemaButton Component', () => {
  const setMockState = (state: StoreState) => {
    const store = useOpenApiSchemaStore as unknown as { currentState: StoreState };
    store.currentState = state;
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should be disabled when schema is invalid', () => {
    setMockState({ isValid: false });

    render(<SaveSchemaButton />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByTestId('icon-save')).toBeInTheDocument();
  });

  it('should be enabled when schema is valid and status is idle', () => {
    setMockState({ isValid: true });

    render(<SaveSchemaButton />);

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
    expect(screen.getByTestId('icon-save')).toBeInTheDocument();
  });

  it('should show loader during saving and disable button', async () => {
    setMockState({ isValid: true });

    render(<SaveSchemaButton />);
    const button = screen.getByRole('button');

    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(screen.getByTestId('icon-loader')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-save')).not.toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
      await vi.advanceTimersByTimeAsync(2000);
    });
  });

  it('should show success icon after saving and revert to idle', async () => {
    setMockState({ isValid: true });

    render(<SaveSchemaButton />);
    const button = screen.getByRole('button');

    fireEvent.click(button);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });

    expect(button).not.toBeDisabled();
    expect(screen.getByTestId('icon-check')).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(screen.getByTestId('icon-save')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-check')).not.toBeInTheDocument();
  });
});
