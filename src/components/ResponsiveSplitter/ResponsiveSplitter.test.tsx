import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import ResponsiveSplitter from './ResponsiveSplitter';

type ResizeCallback = (entries: Partial<ResizeObserverEntry>[]) => void;

let resizeCallback: ResizeCallback;

const observeMock = vi.fn();
const unobserveMock = vi.fn();
const disconnectMock = vi.fn();

class MockResizeObserver {
  constructor(callback: ResizeCallback) {
    resizeCallback = callback;
  }
  observe = observeMock;
  unobserve = unobserveMock;
  disconnect = disconnectMock;
}

vi.stubGlobal('ResizeObserver', MockResizeObserver);

vi.mock('@/components/ui/resizable', () => ({
  ResizablePanelGroup: ({
    orientation,
    children,
  }: {
    orientation: string;
    children: React.ReactNode;
  }) => (
    <div data-testid="panel-group" data-orientation={orientation}>
      {children}
    </div>
  ),
  ResizablePanel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="panel">{children}</div>
  ),
  ResizableHandle: () => <div data-testid="handle" />,
}));

describe('ResponsiveSplitter Component', () => {
  it('should render children within resizable panels', () => {
    render(
      <ResponsiveSplitter
        leftChild={<div data-testid="left-child" />}
        rightChild={<div data-testid="right-child" />}
      />,
    );

    expect(screen.getByTestId('left-child')).toBeInTheDocument();
    expect(screen.getByTestId('right-child')).toBeInTheDocument();
    expect(screen.getByTestId('handle')).toBeInTheDocument();
  });

  it('should set horizontal orientation when width is greater than or equal to height', () => {
    render(<ResponsiveSplitter leftChild={<div />} rightChild={<div />} />);

    act(() => {
      resizeCallback([
        {
          contentRect: { width: 1000, height: 500 } as DOMRectReadOnly,
        },
      ]);
    });

    const group = screen.getByTestId('panel-group');
    expect(group).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('should set vertical orientation when width is less than height', () => {
    render(<ResponsiveSplitter leftChild={<div />} rightChild={<div />} />);

    act(() => {
      resizeCallback([
        {
          contentRect: { width: 400, height: 800 } as DOMRectReadOnly,
        },
      ]);
    });

    const group = screen.getByTestId('panel-group');
    expect(group).toHaveAttribute('data-orientation', 'vertical');
  });

  it('should disconnect the observer on unmount', () => {
    const { unmount } = render(<ResponsiveSplitter leftChild={<div />} rightChild={<div />} />);

    unmount();
    expect(disconnectMock).toHaveBeenCalled();
  });
});
