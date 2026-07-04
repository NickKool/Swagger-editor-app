import { describe, it, expect, vi } from 'vitest';
import { EditorView } from '@codemirror/view';
import { editorDarkTheme } from './EditorTheme';

vi.mock('@codemirror/view', () => ({
  EditorView: {
    theme: vi.fn((spec, options) => ({ spec, options })),
  },
}));

describe('editorDarkTheme', () => {
  it('should initialize with dark theme configuration option enabled', () => {
    expect(EditorView.theme).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ dark: true }),
    );
  });

  it('should apply transparent background resets for main view structures', () => {
    const mockTheme = editorDarkTheme as unknown as {
      spec: Record<string, Record<string, string>>;
    };

    expect(mockTheme.spec['&']).toEqual({
      backgroundColor: 'transparent !important',
    });
    expect(mockTheme.spec['.cm-content']).toEqual({
      backgroundColor: 'transparent !important',
    });
  });

  it('should apply auto scroll overflow settings to scroller targets', () => {
    const mockTheme = editorDarkTheme as unknown as {
      spec: Record<string, Record<string, string>>;
    };

    expect(mockTheme.spec['.cm-scroller']).toEqual({
      overflow: 'auto',
    });
  });

  it('should map design system design tokens to editor gutter components', () => {
    const mockTheme = editorDarkTheme as unknown as {
      spec: Record<string, Record<string, string>>;
    };

    expect(mockTheme.spec['.cm-gutters']).toEqual({
      backgroundColor: 'var(--popover) !important',
      color: 'var(--muted-foreground) !important',
      borderRight: '1px solid var(--border) !important',
    });
  });

  it('should assign active tracking backdrop variables for current gutter line highlights', () => {
    const mockTheme = editorDarkTheme as unknown as {
      spec: Record<string, Record<string, string>>;
    };

    expect(mockTheme.spec['.cm-activeLineGutter']).toEqual({
      backgroundColor: 'var(--muted) !important',
    });
  });
});
