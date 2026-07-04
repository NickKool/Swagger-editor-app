import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import HomePage from './page';

vi.mock('@/components/SchemaEditor/SchemaEditor', () => ({
  default: () => <div data-testid="mock-schema-editor" />,
}));

vi.mock('@/components/SchemaViewer/SchemaViewer', () => ({
  default: () => <div data-testid="mock-schema-viewer" />,
}));

vi.mock('@/components/ResponsiveSplitter/ResponsiveSplitter', () => ({
  default: ({
    leftChild,
    rightChild,
  }: {
    leftChild: React.ReactNode;
    rightChild: React.ReactNode;
  }) => (
    <div data-testid="mock-responsive-splitter">
      <div data-testid="splitter-left">{leftChild}</div>
      <div data-testid="splitter-right">{rightChild}</div>
    </div>
  ),
}));

describe('HomePage Component', () => {
  it('should render the workspace layout with all required subcomponents', () => {
    render(<HomePage />);

    const splitter = screen.getByTestId('mock-responsive-splitter');
    expect(splitter).toBeInTheDocument();

    const leftPanel = screen.getByTestId('splitter-left');
    expect(leftPanel).toContainElement(screen.getByTestId('mock-schema-editor'));

    const rightPanel = screen.getByTestId('splitter-right');
    expect(rightPanel).toContainElement(screen.getByTestId('mock-schema-viewer'));
  });
});
