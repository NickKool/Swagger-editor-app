import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ToggleIndicator from './ToggleIndicator';

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    disabled,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
  }) => (
    <button data-testid="ui-button" disabled={disabled} onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

vi.mock('@/lib/utils', () => ({
  cn: (...inputs: unknown[]) =>
    inputs
      .flatMap((input) => {
        if (!input) return [];
        if (typeof input === 'object') {
          return Object.entries(input)
            .filter(([, v]) => v)
            .map(([k]) => k);
        }
        return String(input).split(' ');
      })
      .filter(Boolean)
      .join(' '),
}));

describe('ToggleIndicator', () => {
  it('should render both indicator and button layout content values safely', () => {
    render(
      <ToggleIndicator
        indicatorContent={<span data-testid="indicator">YAML</span>}
        buttonContent={<span>Icon</span>}
        onClick={vi.fn()}
      />,
    );

    expect(screen.getByTestId('indicator')).toBeInTheDocument();
    expect(screen.getByText('Icon')).toBeInTheDocument();
  });

  it('should trigger target callback mechanism when actionable element receives click actions', () => {
    const onClickMock = vi.fn();
    render(
      <ToggleIndicator
        indicatorContent={<span>YAML</span>}
        buttonContent={<span>Icon</span>}
        onClick={onClickMock}
      />,
    );

    fireEvent.click(screen.getByTestId('ui-button'));
    expect(onClickMock).toHaveBeenCalled();
  });

  it('should forward disabled visibility flags down to internal subcomponents', () => {
    render(
      <ToggleIndicator
        indicatorContent={<span>YAML</span>}
        buttonContent={<span>Icon</span>}
        onClick={vi.fn()}
        disabled={true}
      />,
    );

    expect(screen.getByTestId('ui-button')).toBeDisabled();
  });

  it('should assign right corner rounding variations during standard configuration alignments', () => {
    render(
      <ToggleIndicator
        indicatorContent={<span data-testid="indicator">YAML</span>}
        buttonContent={<span>Icon</span>}
        onClick={vi.fn()}
        buttonSide="right"
      />,
    );

    const indicatorWrapper = screen.getByTestId('indicator').parentElement;
    const buttonElement = screen.getByTestId('ui-button');

    expect(indicatorWrapper?.className).toContain('rounded-l-4xl');
    expect(buttonElement.className).toContain('rounded-l-none');
  });

  it('should assign left corner rounding variations during alternative configuration alignments', () => {
    render(
      <ToggleIndicator
        indicatorContent={<span data-testid="indicator">YAML</span>}
        buttonContent={<span>Icon</span>}
        onClick={vi.fn()}
        buttonSide="left"
      />,
    );

    const indicatorWrapper = screen.getByTestId('indicator').parentElement;
    const buttonElement = screen.getByTestId('ui-button');

    expect(indicatorWrapper?.className).toContain('rounded-r-4xl');
    expect(buttonElement.className).toContain('rounded-r-none');
  });
});
