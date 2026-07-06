'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Check, Loader, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useOpenApiSchemaStore } from '@/stores/OpenApiSchema';
import { useAuth } from '@/context/AuthContext';
import { saveSchema } from '@/actions/schema';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

type SaveStatus = 'idle' | 'loading' | 'success' | 'error';

const SUCCESS_STATUS_TIME_MS = 2000;
const ERROR_STATUS_TIME_MS = 3000;

export default function SaveSchemaButton() {
  const t = useTranslations('components.SaveSchemaButton');
  const [status, setStatus] = useState<SaveStatus>('idle');
  const { user } = useAuth();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isValid = useOpenApiSchemaStore((state) => state.isValid);
  const spec = useOpenApiSchemaStore((state) => state.spec);
  const format = useOpenApiSchemaStore((state) => state.format);
  const parsedSpec = useOpenApiSchemaStore((state) => state.parsedSpec);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSave = async () => {
    if (!isValid || !user || !parsedSpec || status === 'loading') return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setStatus('loading');

    const savePromise = saveSchema({
      userId: user.uid,
      spec,
      format,
      parsedSpec,
    });

    toast.promise(savePromise, {
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
        console.error('Firebase save error:', err);
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
      onClick={handleSave}
      disabled={!isValid || !user || status === 'loading'}
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

      {status === 'idle' && <Save className="h-4 w-4" />}
    </Button>
  );
}
