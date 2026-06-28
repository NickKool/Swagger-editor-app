import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/vitest.setup.ts',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: [
        'src/**/*.test.{js,jsx,ts,tsx}',
        'src/**/*.spec.{js,jsx,ts,tsx}',
        'src/__mocks__/**/*.{js,jsx,ts,tsx}',
        'src/i18n/**/*.{js,ts}',
        'src/constants/**/*.{js,ts}',
        'src/proxy.{js,ts}',
        'src/vitest.setup.{js,ts}',
        'src/**/*.d.ts',
        '.next/**',
        // These are ready-made components from the shadcn library
        'src/components/ui/**/*.{js,ts}',
      ],
      thresholds: {
        statements: 80,
        branches: 50,
        functions: 50,
        lines: 50,
      },
    },
  },
});
