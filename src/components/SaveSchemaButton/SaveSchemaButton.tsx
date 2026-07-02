'use client';

import { useState } from 'react';
import { Check, Loader, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useOpenApiSchemaStore } from '@/stores/OpenApiSchema.store';

type SaveStatus = 'idle' | 'loading' | 'success';

export default function SaveSchemaButton() {
  const [status, setStatus] = useState<SaveStatus>('idle');

  const isValid = useOpenApiSchemaStore((state) => state.isValid);

  const handleSave = async () => {
    if (!isValid || status !== 'idle') return;

    setStatus('loading');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setStatus('success');

      setTimeout(() => {
        setStatus('idle');
      }, 2000);
    } catch {
      setStatus('idle');
    }
  };

  return (
    <Button
      size="icon-lg"
      onClick={handleSave}
      disabled={!isValid || status === 'loading'}
      variant={status === 'success' ? 'default' : 'outline'}
      className={`transition-all duration-300`}
    >
      {status === 'loading' && <Loader className="h-4 w-4 animate-spin" />}

      {status === 'success' && (
        <Check className="h-4 w-4 scale-110 animate-in zoom-in duration-300" />
      )}

      {status === 'idle' && <Save className="h-4 w-4" />}
    </Button>
  );
}
