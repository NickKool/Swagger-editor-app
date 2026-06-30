import { vi } from 'vitest';

vi.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
}));
