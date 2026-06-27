import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LanguageSelector from './LanguageSelector';
import { mockReplace } from '@/__mocks__/i18n-navigation';

describe('LanguageSelector Component', () => {
  it('should render trigger button with current uppercase locale', () => {
    render(<LanguageSelector />);

    expect(screen.getByRole('button', { name: /en/i })).toBeInTheDocument();
  });

  it('should render all configured locales inside the dropdown when opened', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector />);

    const trigger = screen.getByRole('button', { name: /en/i });
    await user.click(trigger);

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitemradio', { name: /ru/i })).toBeInTheDocument();
  });

  it('should trigger router.replace when a different language is chosen', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector />);

    await user.click(screen.getByRole('button', { name: /en/i }));

    const ruOption = screen.getByRole('menuitemradio', { name: /ru/i });
    await user.click(ruOption);

    expect(mockReplace).toHaveBeenCalledWith('/mocked-path', { locale: 'ru' });
  });

  it('should not trigger router.replace when the same language is chosen', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector />);

    await user.click(screen.getByRole('button', { name: /en/i }));

    const enOption = screen.getByRole('menuitemradio', { name: /en/i });
    await user.click(enOption);

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
