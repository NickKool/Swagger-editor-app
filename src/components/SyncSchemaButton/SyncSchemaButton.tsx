'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Check, Loader, CloudAlert, CloudSync } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { useOpenApiSchemaStore } from '@/stores/OpenApiSchema';
import { useAuth } from '@/context/AuthContext';

type SyncStatus = 'idle' | 'loading' | 'success' | 'error';

const SUCCESS_STATUS_TIME_MS = 2000;
const ERROR_STATUS_TIME_MS = 3000;

export default function SyncSchemaButton() {
  const t = useTranslations('components.SyncSchemaButton');
  const [status, setStatus] = useState<SyncStatus>('idle');
  const { user, loading: authLoading } = useAuth();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isSynced = useOpenApiSchemaStore((state) => state.isSynced);
  const isLoading = useOpenApiSchemaStore((state) => state.isLoading);
  const isSaving = useOpenApiSchemaStore((state) => state.isSaving);
  const initializeSchema = useOpenApiSchemaStore((state) => state.initializeSchema);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSync = async () => {
    if (!user || status === 'loading') return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setStatus('loading');

    toast.promise(initializeSchema(authLoading, user.uid, true), {
      loading: t('toasts.loading'),
      position: 'top-center',
      success: () => {
        setStatus('success');
        timeoutRef.current = setTimeout(() => {
          setStatus('idle');
          timeoutRef.current = null;
        }, SUCCESS_STATUS_TIME_MS);
        return {
          message: t('toasts.success.title'),
          description: t('toasts.success.description'),
        };
      },
      error: (err: unknown) => {
        setStatus('error');
        timeoutRef.current = setTimeout(() => {
          setStatus('idle');
          timeoutRef.current = null;
        }, ERROR_STATUS_TIME_MS);
        return {
          message: t('toasts.error.title'),
          description: err instanceof Error ? err.message : t('toasts.error.description'),
        };
      },
    });
  };

  const getVariant = () => {
    if (status === 'success') return 'default';
    if (status === 'error') return 'destructive';
    return 'outline';
  };

  return (
    <Button
      size="icon-lg"
      onClick={handleSync}
      disabled={!user || status === 'loading' || isLoading || isSaving}
      variant={getVariant()}
      className="transition-all duration-300"
      title={t('title')}
    >
      {status === 'loading' && <Loader className="h-4 w-4 animate-spin" />}

      {status === 'success' && (
        <Check className="h-4 w-4 scale-110 animate-in zoom-in duration-300" />
      )}

      {status === 'error' && (
        <AlertCircle className="h-4 w-4 text-destructive-foreground animate-bounce" />
      )}

      {status === 'idle' &&
        (isSynced && user ? (
          <CloudSync className="h-4 w-4 text-muted-foreground" />
        ) : (
          <CloudAlert className="h-4 w-4 text-amber-500" />
        ))}
    </Button>
  );
}
