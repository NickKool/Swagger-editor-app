import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MouseEventHandler } from 'react';

type Side = 'left' | 'right';

interface ToggleIndicatorProps {
  indicatorContent: React.ReactNode;
  buttonContent: React.ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
  buttonSide?: Side;
  disabled?: boolean;
}

export default function ToggleIndicator({
  indicatorContent,
  buttonContent,
  onClick,
  buttonSide = 'right',
  disabled = false,
}: ToggleIndicatorProps) {
  return (
    <div
      className={cn('w-min', 'flex', 'items-center', { 'flex-row-reverse': buttonSide === 'left' })}
    >
      <div
        className={cn(
          'flex',
          'h-full',
          'flex-1',
          'items-center',
          'justify-center',
          'pl-3',
          'pr-2',
          'border',
          'text-sm',
          'font-medium',
          'card-ba',
          buttonSide === 'left' ? 'rounded-r-4xl' : 'rounded-l-4xl',
        )}
      >
        {indicatorContent}
      </div>
      <Button
        size="icon-lg"
        variant="outline"
        className={cn(buttonSide === 'left' ? 'rounded-r-none' : 'rounded-l-none')}
        disabled={disabled}
        onClick={onClick}
      >
        {buttonContent}
      </Button>
    </div>
  );
}
