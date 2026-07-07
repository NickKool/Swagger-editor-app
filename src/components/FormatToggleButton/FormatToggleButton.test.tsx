import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import FormatToggleButton from './FormatToggleButton';
import { useOpenApiSchemaStore } from '@/stores/OpenApiSchema';
import { mockTranslate } from '@/__mocks__/next-intl';
import { OpenApiSchemaStoreState } from '@/stores/OpenApiSchema.types';

vi.mock('@/stores/OpenApiSchema', () => ({
  useOpenApiSchemaStore: vi.fn(),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    disabled,
    onClick,
    className,
    title,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
    title?: string;
  }) => (
    <button
      data-testid="ui-button"
      disabled={disabled}
      onClick={onClick}
      className={className}
      title={title}
    >
      {children}
    </button>
  ),
}));

const MOCK_MESSAGES: Record<string, string> = {
  title: 'Toggle format',
} as const;

mockTranslate.mockImplementation((k: string) => MOCK_MESSAGES[k]);

describe('FormatToggleButton', () => {
  const toggleFormatMock = vi.fn();

  const MOCK_STORE_STATE: OpenApiSchemaStoreState = {
    format: 'yaml',
    isValid: true,
    toggleFormat: toggleFormatMock,
    spec: '',
    error: null,
    parsedSpec: null,
    hasInitialized: false,
    isLoading: false,
    initializeSchema: vi.fn(),
    setSpec: vi.fn(),
    validateAndParseSpec: vi.fn(),
  };

  it('should render currently active uppercase format text indicator and button with translation title attribute', () => {
    vi.mocked(useOpenApiSchemaStore).mockImplementation((selector) => selector(MOCK_STORE_STATE));

    render(<FormatToggleButton />);

    expect(screen.getByText('YAML')).toBeInTheDocument();

    const button = screen.getByTestId('ui-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('title', MOCK_MESSAGES['title']);
    expect(button).not.toBeDisabled();
  });

  it('should trigger target store update mechanism when active component receives layout click action', async () => {
    const user = userEvent.setup();

    vi.mocked(useOpenApiSchemaStore).mockImplementation((selector) =>
      selector({ ...MOCK_STORE_STATE, format: 'json' }),
    );

    render(<FormatToggleButton />);

    expect(screen.getByText('JSON')).toBeInTheDocument();

    await user.click(screen.getByTestId('ui-button'));
    expect(toggleFormatMock).toHaveBeenCalledTimes(1);
  });

  it('should explicitly lock actionable element interaction pipelines down when current state validation check fails', async () => {
    const user = userEvent.setup();

    vi.mocked(useOpenApiSchemaStore).mockImplementation((selector) =>
      selector({ ...MOCK_STORE_STATE, isValid: false }),
    );

    render(<FormatToggleButton />);

    const button = screen.getByTestId('ui-button');
    expect(button).toBeDisabled();

    await user.click(button);

    expect(toggleFormatMock).not.toHaveBeenCalled();
  });
});
