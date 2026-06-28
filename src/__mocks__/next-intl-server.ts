import { vi } from 'vitest';

export const mockGetMessages = vi.fn(async () => ({}));

vi.mock('next-intl/server', () => ({
  getMessages: () => mockGetMessages(),
}));
