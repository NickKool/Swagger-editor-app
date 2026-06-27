import { describe, it, expect, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeSelector from './ThemeSelector';
import { mockSetTheme } from '@/__mocks__/next-themes';

describe('ThemeSelector Component', () => {
  it('should interactively open menu and select theme modes correctly', async () => {
    const user = userEvent.setup();
    render(<ThemeSelector />);

    const triggerButton = screen.getByRole('button', { name: /selectTheme/i });
    expect(triggerButton).toBeInTheDocument();

    await user.click(triggerButton);

    const lightItem = screen.getByRole('menuitem', { name: /light/i });
    const darkItem = screen.getByRole('menuitem', { name: /dark/i });
    const systemItem = screen.getByRole('menuitem', { name: /system/i });

    expect(lightItem).toBeInTheDocument();
    expect(darkItem).toBeInTheDocument();
    expect(systemItem).toBeInTheDocument();

    await user.click(lightItem);
    expect(mockSetTheme as Mock).toHaveBeenCalledWith('light');

    await user.click(triggerButton);
    await user.click(screen.getByRole('menuitem', { name: /dark/i }));
    expect(mockSetTheme as Mock).toHaveBeenCalledWith('dark');

    await user.click(triggerButton);
    await user.click(screen.getByRole('menuitem', { name: /system/i }));
    expect(mockSetTheme as Mock).toHaveBeenCalledWith('system');
  });
});
