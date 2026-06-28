import { describe, it, expect } from 'vitest';
import CatchRest from './page';
import { mockNotFound } from '@/__mocks__/next-navigation';

describe('CatchRest Component', () => {
  it('should trigger notFound execution when rendered', () => {
    expect(() => CatchRest()).toThrow('NEXT_NOT_FOUND');
    expect(mockNotFound).toHaveBeenCalled();
  });
});
