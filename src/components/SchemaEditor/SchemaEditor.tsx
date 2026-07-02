'use client';

import { useTheme } from 'next-themes';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { yaml } from '@codemirror/lang-yaml';
import { ArrowDownUp } from 'lucide-react';

import { useOpenApiSchemaStore } from '@/stores/OpenApiSchema.store';
import ToggleIndicator from '@/components/ToggleIndicator/ToggleIndicator';
import { editorDarkTheme } from './EditorTheme';
import SaveSchemaButton from '../SaveSchemaButton/SaveSchemaButton';
import { useAuth } from '@/context/AuthContext';

export default function SchemaEditor() {
  const { user } = useAuth();

  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === 'dark' ? 'dark' : 'light';

  const spec = useOpenApiSchemaStore((state) => state.spec);
  const setSpec = useOpenApiSchemaStore((state) => state.setSpec);
  const format = useOpenApiSchemaStore((state) => state.format);
  const toggleFormat = useOpenApiSchemaStore((state) => state.toggleFormat);
  const isValid = useOpenApiSchemaStore((state) => state.isValid);

  const extensions = format === 'json' ? [json(), editorDarkTheme] : [yaml(), editorDarkTheme];

  return (
    <div className="w-full h-full overflow-hidden flex flex-col bg-background">
      <div className="flex flex-row gap-2 p-2 w-full shrink-0 border-b bg-muted/30">
        <ToggleIndicator
          indicatorContent={<span className="w-[48px] text-center">{format.toUpperCase()}</span>}
          buttonContent={<ArrowDownUp className="h-4 w-4" />}
          disabled={!isValid}
          onClick={() => toggleFormat()}
          buttonSide="right"
        />
        {user && <SaveSchemaButton />}
      </div>

      <div className="flex-1 w-full min-h-0 overflow-hidden relative">
        <CodeMirror
          value={spec}
          height="100%"
          extensions={extensions}
          onChange={(value: string) => setSpec(value)}
          theme={theme}
          className="absolute inset-0 w-full h-full text-sm overflow-hidden"
        />
      </div>
    </div>
  );
}
