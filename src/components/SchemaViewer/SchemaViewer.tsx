'use client';

import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useOpenApiSchemaStore } from '@/stores/OpenApiSchema';

export default function SchemaViewer() {
  const tStore = useTranslations('stores.OpenAPISchema');
  const t = useTranslations('components.SchemaViewer');

  const isValid = useOpenApiSchemaStore((state) => state.isValid);
  const error = useOpenApiSchemaStore((state) => state.error);
  const parsedSpec = useOpenApiSchemaStore((state) => state.parsedSpec);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden p-4 bg-background">
      <div className="w-full shrink-0 transition-all duration-200">
        {!isValid && error && (
          <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex flex-col space-y-1 min-w-0">
              <h5 className="font-semibold text-sm leading-none tracking-tight">
                {t('errorTitle')}
              </h5>
              <p className="text-xs font-mono leading-relaxed break-words opacity-90">
                {tStore.has(error.key) ? tStore(error.key, error.values) : error.fallback}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 w-full overflow-auto">
        {isValid && parsedSpec ? (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {parsedSpec.info?.title || t('schemaReserveTitle')}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t('schemaVersion', { version: parsedSpec.info?.version || '1.0.0' })}
              </p>
            </div>

            <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-md border font-mono">
              {t('schemaPathsDetected', {
                paths: parsedSpec.paths ? Object.keys(parsedSpec.paths).length : 0,
              })}
            </div>
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground italic">
            {t('schemaWaiting')}
          </div>
        )}
      </div>
    </div>
  );
}
