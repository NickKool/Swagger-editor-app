'use client';

import { ArrowDownUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { useOpenApiSchemaStore } from '@/stores/OpenApiSchema';

export default function FormatToggleButton() {
  const t = useTranslations('components.FormatToggleButton');

  const format = useOpenApiSchemaStore((state) => state.format);
  const isValid = useOpenApiSchemaStore((state) => state.isValid);
  const toggleFormat = useOpenApiSchemaStore((state) => state.toggleFormat);

  const handleToggle = () => {
    if (!isValid) {
      return;
    }
    toggleFormat();
  };

  return (
    <div className="w-min flex items-center">
      <div className="flex h-full flex-1 items-center justify-center pl-3 pr-2 border text-sm font-medium card-ba rounded-l-4xl transition-opacity duration-200">
        <span className="w-[48px] text-center font-semibold tracking-wider">
          {format.toUpperCase()}
        </span>
      </div>
      <Button
        size="icon-lg"
        variant="outline"
        className="rounded-l-none transition-opacity duration-200"
        disabled={!isValid}
        onClick={handleToggle}
        title={t('title')}
      >
        <ArrowDownUp className="h-4 w-4" />
      </Button>
    </div>
  );
}
