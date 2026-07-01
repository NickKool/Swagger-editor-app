import { describe, expect, test } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMounted } from './useMounted';

describe('useMounted', () => {
  test('Return true on client render', () => {
    const { result } = renderHook(() => useMounted());
    expect(result.current).toBe(true);
  });

  test('Unmount call unscribe', () => {
    const { unmount } = renderHook(() => useMounted());
    expect(() => unmount()).not.toThrow();
  });
});
