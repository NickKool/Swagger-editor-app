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
  },
  { dark: true },
);
