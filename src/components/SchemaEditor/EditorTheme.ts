import { EditorView } from '@codemirror/view';

export const editorDarkTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: 'transparent !important',
    },
    '.cm-scroller': {
      overflow: 'auto',
    },
    '.cm-content': {
      backgroundColor: 'transparent !important',
    },
    '.cm-gutters': {
      backgroundColor: 'var(--popover) !important',
      color: 'var(--muted-foreground) !important',
      borderRight: '1px solid var(--border) !important',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'var(--muted) !important',
    },
    '.cm-lintGutter .cm-gutterElement': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 4px',
    },
    '.cm-lintGutter-destructive': {
      color: 'var(--destructive) !important',
    },
    '.cm-tooltip': {
      borderRadius: 'var(--radius) !important',
      backgroundColor: 'var(--popover) !important',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important',
      overflow: 'hidden !important',
    },
    '.cm-tooltip-section': {
      border: 'none !important',
    },
    '.cm-diagnostic': {
      backgroundColor: 'var(--popover) !important',
      border: '1px solid var(--border) !important',
      borderRadius: 'var(--radius) !important',
      padding: '8px 12px !important',
      color: 'var(--popover-foreground) !important',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important',
    },
    '.cm-diagnostic-error': {
      borderLeft: '4px solid var(--destructive) !important',
    },
    '.cm-diagnosticText': {
      fontFamily: 'inherit !important',
      fontSize: '0.875rem !important',
    },
    '.cm-lintGutter .cm-lint-error': {
      content: '""',
      display: 'inline-block',
      width: '8px',
      height: '8px',
      backgroundColor: 'var(--destructive)',
      borderRadius: '50%',
    },
    '.cm-lint-error': {
      backgroundImage: 'none !important',
      borderBottom: '2px dotted var(--destructive) !important',
    },
    '.cm-tooltip-lint': {
      border: 'none !important',
    },
  },
  { dark: true },
);
