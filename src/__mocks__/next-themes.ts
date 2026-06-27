import { vi } from 'vitest';

export const mockSetTheme = vi.fn();

export const mockUseTheme = vi.fn().mockReturnValue({
  theme: 'light',
  resolvedTheme: 'light',
  setTheme: mockSetTheme,
});

vi.mock('next-themes', () => ({
  useTheme: () => mockUseTheme(),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));
