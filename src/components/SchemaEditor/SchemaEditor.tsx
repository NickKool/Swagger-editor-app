'use client';

import { useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { yaml } from '@codemirror/lang-yaml';
import { Loader } from 'lucide-react';
import { useTranslations } from 'next-intl';

import FormatToggleButton from '@/components/FormatToggleButton/FormatToggleButton';
import SaveSchemaButton from '@/components/SaveSchemaButton/SaveSchemaButton';
import { useOpenApiSchemaStore } from '@/stores/OpenApiSchema';
import { useAuth } from '@/context/AuthContext';
import { editorDarkTheme } from './EditorTheme';

export default function SchemaEditor() {
  const t = useTranslations('components.SchemaEditor');
  const { user, loading: authLoading } = useAuth();
  const { resolvedTheme } = useTheme();

  const theme = resolvedTheme === 'dark' ? 'dark' : 'light';

  const spec = useOpenApiSchemaStore((state) => state.spec);
  const setSpec = useOpenApiSchemaStore((state) => state.setSpec);
  const format = useOpenApiSchemaStore((state) => state.format);
  const isSchemaLoading = useOpenApiSchemaStore((state) => state.isLoading);
  const initializeSchema = useOpenApiSchemaStore((state) => state.initializeSchema);

  const extensions = useMemo(() => {
    return format === 'json' ? [json(), editorDarkTheme] : [yaml(), editorDarkTheme];
  }, [format]);

  useEffect(() => {
    if (authLoading) return;

    if (user?.uid) {
      initializeSchema(authLoading, user.uid).catch((err) => {
        console.error('Failed to initialize schema:', err);
      });
    } else {
      initializeSchema(authLoading);
    }
  }, [user?.uid, authLoading, initializeSchema]);

  const showLoader = authLoading || isSchemaLoading;

  return (
    <div className="w-full h-full overflow-hidden flex flex-col bg-background">
      <div className="flex flex-row gap-2 p-2 w-full shrink-0 border-b bg-muted/30">
        <FormatToggleButton />
        {user && <SaveSchemaButton />}
      </div>

      <div className="flex-1 w-full min-h-0 overflow-hidden relative">
        {showLoader ? (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center gap-2">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-medium tracking-tight animate-pulse">
              {t('loadingSchema')}
            </p>
          </div>
        ) : (
          <CodeMirror
            value={spec}
            height="100%"
            extensions={extensions}
            onChange={(value: string) => setSpec(value)}
            theme={theme}
            className="absolute inset-0 w-full h-full text-sm overflow-hidden"
          />
        )}
      </div>
    </div>
  );
}
