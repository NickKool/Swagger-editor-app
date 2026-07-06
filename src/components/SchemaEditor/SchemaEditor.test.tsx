import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SchemaEditor from './SchemaEditor';
import { useOpenApiSchemaStore } from '@/stores/OpenApiSchema';
import { useAuth } from '@/context/AuthContext';
import { mockTranslate } from '@/__mocks__/next-intl';
import { useTheme } from 'next-themes';

type StoreState = {
  spec: string;
  format: 'json' | 'yaml';
  isLoading: boolean;
  initializeSchema: ReturnType<typeof vi.fn>;
  setSpec: ReturnType<typeof vi.fn>;
};

type AuthContextType = ReturnType<typeof useAuth>;

interface ThemeHookMock {
  resolvedTheme: string;
  theme?: string;
  setTheme?: (theme: string) => void;
  themes?: string[];
}

interface MockCodeMirrorProps {
  value: string;
  onChange: (v: string) => void;
  theme: string;
  extensions: unknown[];
}

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('next-themes', () => ({
  useTheme: vi.fn(() => ({ resolvedTheme: 'light' })),
}));

vi.mock('@/stores/OpenApiSchema', () => {
  const mockStore = (selector: (state: StoreState) => unknown) => selector(mockStore.currentState);
  mockStore.currentState = {
    spec: 'openapi: 3.0.0',
    format: 'yaml',
    isLoading: false,
    initializeSchema: vi.fn().mockResolvedValue(undefined),
    setSpec: vi.fn(),
  } as StoreState;
  return {
    useOpenApiSchemaStore: mockStore,
  };
});

vi.mock('@uiw/react-codemirror', () => ({
  default: ({ value, onChange, theme, extensions }: MockCodeMirrorProps) => (
    <textarea
      data-testid="codemirror"
      data-theme={theme}
      data-extensions-count={extensions?.length || 0}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock('@codemirror/lang-json', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@codemirror/lang-json')>();
  return {
    ...actual,
    json: vi.fn(() => []),
    jsonParseLinter: vi.fn(() => vi.fn(() => [])),
  };
});
vi.mock('@codemirror/lang-yaml', () => ({ yaml: vi.fn(() => 'yaml-extension') }));
vi.mock('@/utils/codemirror-linters', () => ({ yamlLinter: 'yaml-linter-extension' }));

vi.mock('./EditorTheme', () => ({ editorDarkTheme: 'dark-theme-extension' }));

vi.mock('@/components/FormatToggleButton/FormatToggleButton', () => ({
  default: () => <div data-testid="format-toggle-mock" />,
}));

vi.mock('@/components/SaveSchemaButton/SaveSchemaButton', () => ({
  default: () => <button data-testid="save-button" />,
}));

const MOCK_MESSAGES: Record<string, string> = {
  loadingSchema: 'Loading schema...',
} as const;

mockTranslate.mockImplementation((k: string) => MOCK_MESSAGES[k]);

describe('SchemaEditor', () => {
  const setMockState = (state: Partial<StoreState>) => {
    const store = useOpenApiSchemaStore as unknown as { currentState: StoreState };
    store.currentState = { ...store.currentState, ...state };
  };

  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
    } as unknown as AuthContextType);

    vi.mocked(useTheme).mockReturnValue({ resolvedTheme: 'light' } as ThemeHookMock as ReturnType<
      typeof useTheme
    >);

    setMockState({
      spec: 'openapi: 3.0.0',
      format: 'yaml',
      isLoading: false,
      initializeSchema: vi.fn().mockResolvedValue(undefined),
      setSpec: vi.fn(),
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

  it('should call initializeSchema inside useEffect on mount', () => {
    const initializeSchemaMock = vi.fn().mockResolvedValue(undefined);
    setMockState({ initializeSchema: initializeSchemaMock });

    vi.mocked(useAuth).mockReturnValue({
      user: { uid: 'user_999' },
      loading: false,
    } as unknown as AuthContextType);

    render(<SchemaEditor />);

    expect(initializeSchemaMock).toHaveBeenCalledWith(false, 'user_999');
  });

  it('should catch and log errors if initializeSchema fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const mockError = new Error('Failed validation');
    const initializeSchemaMock = vi.fn().mockRejectedValue(mockError);
    setMockState({ initializeSchema: initializeSchemaMock });

    vi.mocked(useAuth).mockReturnValue({
      user: { uid: 'user_999' },
      loading: false,
    } as unknown as AuthContextType);

    render(<SchemaEditor />);

    await vi.waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to initialize schema:', mockError);
    });

    consoleSpy.mockRestore();
  });

  it('should show spinner when auth state or schema layer is loading', () => {
    setMockState({ isLoading: true });

    render(<SchemaEditor />);

    expect(screen.getByText(MOCK_MESSAGES['loadingSchema'])).toBeInTheDocument();
    expect(screen.queryByTestId('codemirror')).not.toBeInTheDocument();
  });

  it('should hide save button when user session profile is absent', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
    } as unknown as AuthContextType);

    render(<SchemaEditor />);

    expect(screen.queryByTestId('save-button')).not.toBeInTheDocument();
  });

  it('should display save button when valid user session profile exists', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: 'user_abc' },
      loading: false,
    } as unknown as AuthContextType);

    render(<SchemaEditor />);

    expect(screen.getByTestId('save-button')).toBeInTheDocument();
  });

  it('should apply dark theme property to code editor when layout resolves dark mode configuration', () => {
    vi.mocked(useTheme).mockReturnValue({ resolvedTheme: 'dark' } as ThemeHookMock as ReturnType<
      typeof useTheme
    >);

    render(<SchemaEditor />);

    const editor = screen.getByTestId('codemirror');
    expect(editor).toHaveAttribute('data-theme', 'dark');
  });

  it('should build and return isolated json extension setup pipeline variant when document format transitions to json style configuration', () => {
    setMockState({ format: 'json' });

    render(<SchemaEditor />);

    const editor = screen.getByTestId('codemirror');
    expect(editor).toHaveAttribute('data-extensions-count', '4');
  });

  it('should build and return isolated yaml extension setup pipeline variant when document format is yaml style configuration', () => {
    setMockState({ format: 'yaml' });

    render(<SchemaEditor />);

    const editor = screen.getByTestId('codemirror');
    expect(editor).toHaveAttribute('data-extensions-count', '4');
  });

  it('should skip schema initialization if authentication is currently loading', () => {
    const initializeSchemaMock = vi.fn().mockResolvedValue(undefined);
    setMockState({ initializeSchema: initializeSchemaMock });

    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
    } as unknown as AuthContextType);

    render(<SchemaEditor />);

    expect(initializeSchemaMock).not.toHaveBeenCalled();
  });
});
