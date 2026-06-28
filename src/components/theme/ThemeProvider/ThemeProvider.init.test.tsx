import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('ThemeProvider Console Error Patch', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should suppress next-themes transition script tag warning in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const spy = vi.fn();
    const originalConsoleError = console.error;
    console.error = spy;

    await import('./ThemeProvider');

    console.error('Encountered a script tag during hydration...');

    console.error = originalConsoleError;

    expect(spy).not.toHaveBeenCalled();
  });

  it('should let normal error messages pass through untouched', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const spy = vi.fn();
    const originalConsoleError = console.error;
    console.error = spy;

    await import('./ThemeProvider');

    console.error('Some other critical rendering error');

    console.error = originalConsoleError;

    expect(spy).toHaveBeenCalledWith('Some other critical rendering error');
  });
});
