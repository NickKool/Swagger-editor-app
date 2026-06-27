import { vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Space_Grotesk: () => ({ variable: 'mocked-font-heading' }),
  Public_Sans: () => ({ variable: 'mocked-font-sans' }),
}));
