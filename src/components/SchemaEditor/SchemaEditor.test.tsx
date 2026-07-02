import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SchemaEditor from './SchemaEditor';
import { useOpenApiSchemaStore } from '@/stores/OpenApiSchema.store';
import { useAuth } from '@/context/AuthContext';

type StoreState = {
  spec: string;
  format: 'json' | 'yaml';
  isValid: boolean;
  setSpec: ReturnType<typeof vi.fn>;
  toggleFormat: ReturnType<typeof vi.fn>;
};

type AuthContextType = ReturnType<typeof useAuth>;

vi.mock('@/stores/OpenApiSchema.store', () => {
  const mockStore = (selector: (state: StoreState) => unknown) => selector(mockStore.currentState);
  mockStore.currentState = {
    spec: 'openapi: 3.0.0',
    format: 'yaml',
    isValid: true,
    setSpec: vi.fn(),
    toggleFormat: vi.fn(),
  } as StoreState;
  return {
    useOpenApiSchemaStore: mockStore,
  };
});

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@uiw/react-codemirror', () => ({
  default: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea data-testid="codemirror" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

vi.mock('@codemirror/lang-json', () => ({ json: vi.fn() }));
vi.mock('@codemirror/lang-yaml', () => ({ yaml: vi.fn() }));
vi.mock('./EditorTheme', () => ({ editorDarkTheme: {} }));

vi.mock('@/components/ToggleIndicator/ToggleIndicator', () => ({
  default: ({
    indicatorContent,
    disabled,
    onClick,
  }: {
    indicatorContent: React.ReactNode;
    disabled: boolean;
    onClick: () => void;
  }) => (
    <button data-testid="toggle-indicator" disabled={disabled} onClick={onClick}>
      {indicatorContent}
    </button>
  ),
}));

vi.mock('@/components/SaveSchemaButton/SaveSchemaButton', () => ({
  default: () => <button data-testid="save-button" />,
}));

describe('SchemaEditor', () => {
  const setMockState = (state: Partial<StoreState>) => {
    const store = useOpenApiSchemaStore as unknown as { currentState: StoreState };
    store.currentState = { ...store.currentState, ...state };
  };

  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
    } as unknown as AuthContextType);
    setMockState({
      spec: 'openapi: 3.0.0',
      format: 'yaml',
      isValid: true,
      setSpec: vi.fn(),
      toggleFormat: vi.fn(),
    });
  });

  it('should render spec value inside codemirror editor', () => {
    setMockState({ spec: '{"openapi": "3.0.0"}' });

    render(<SchemaEditor />);

    const editor = screen.getByTestId('codemirror');
    expect(editor).toHaveValue('{"openapi": "3.0.0"}');
  });

  it('should call setSpec when editor content changes', () => {
    const setSpecMock = vi.fn();
    setMockState({ setSpec: setSpecMock });

    render(<SchemaEditor />);

    const editor = screen.getByTestId('codemirror');
    fireEvent.change(editor, { target: { value: 'new changes' } });

    expect(setSpecMock).toHaveBeenCalledWith('new changes');
  });

  it('should display uppercase text of store format layout type', () => {
    setMockState({ format: 'json' });

    render(<SchemaEditor />);

    expect(screen.getByText('JSON')).toBeInTheDocument();
  });

  it('should call toggleFormat when click trigger occurs', () => {
    const toggleFormatMock = vi.fn();
    setMockState({ toggleFormat: toggleFormatMock });

    render(<SchemaEditor />);

    fireEvent.click(screen.getByTestId('toggle-indicator'));
    expect(toggleFormatMock).toHaveBeenCalled();
  });

  it('should disable toggle element when schema contains errors', () => {
    setMockState({ isValid: false });

    render(<SchemaEditor />);

    const toggle = screen.getByTestId('toggle-indicator');
    expect(toggle).toBeDisabled();
  });

  it('should hide save button when user session profile is absent', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
    } as unknown as AuthContextType);

    render(<SchemaEditor />);

    expect(screen.queryByTestId('save-button')).not.toBeInTheDocument();
  });

  it('should display save button when valid user session profile exists', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: '1' },
    } as unknown as AuthContextType);

    render(<SchemaEditor />);

    expect(screen.getByTestId('save-button')).toBeInTheDocument();
  });
});
