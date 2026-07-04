'use client';

import React, { useState, useEffect, useRef } from 'react';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

interface ResponsiveSplitterProps {
  leftChild: React.ReactNode;
  rightChild: React.ReactNode;
}

export default function ResponsiveSplitter({
  leftChild,
  rightChild,
}: ResponsiveSplitterProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>('horizontal');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDirection(width >= height ? 'horizontal' : 'vertical');
      }
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col flex-1 w-full">
      <ResizablePanelGroup orientation={direction} className="flex flex-col flex-1 w-full">
        <ResizablePanel defaultSize="50%" minSize="25%" className="flex flex-col w-full">
          {leftChild}
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize="50%" minSize="25%" className="flex flex-col w-full">
          {rightChild}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
