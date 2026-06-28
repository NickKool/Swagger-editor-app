import { vi } from 'vitest';

class MockPointerEvent extends Event {
  button: number;
  ctrlKey: boolean;
  pointerType: string;

  constructor(type: string, props: PointerEventInit = {}) {
    super(type, props);
    this.button = props.button ?? 0;
    this.ctrlKey = props.ctrlKey ?? false;
    this.pointerType = props.pointerType ?? 'mouse';
  }
}

window.PointerEvent = MockPointerEvent as unknown as typeof PointerEvent;

Element.prototype.scrollIntoView = vi.fn<Element['scrollIntoView']>();
HTMLElement.prototype.hasPointerCapture = vi.fn<HTMLElement['hasPointerCapture']>();
HTMLElement.prototype.releasePointerCapture = vi.fn<HTMLElement['releasePointerCapture']>();
