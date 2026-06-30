import { describe, it, expect } from 'vitest';
import CatchRest from './page';
import { mockRedirect } from '@/__mocks__/next-navigation';

mockRedirect.mockImplementation((url: string) => {
  throw new Error(`Redirected to ${url}`);
});

describe('CatchRest Component', () => {
  it('should redirect to localized 404 page', async () => {
    const mockParams = Promise.resolve({ locale: 'en' });

    await expect(CatchRest({ params: mockParams })).rejects.toThrow('Redirected to /en/404');
    expect(mockRedirect).toHaveBeenCalledWith('/en/404');
  });
});
