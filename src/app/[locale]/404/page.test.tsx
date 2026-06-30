import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotFoundPage from './page';
import { mockBack } from '@/__mocks__/i18n-navigation';
import { mockTranslate } from '@/__mocks__/next-intl';

const MOCK_MESSAGES: Record<string, string> = {
  pageNotFound: 'Page Not Found',
  notFoundDescription: 'Some sad description',
  goBack: 'Go Back',
  backToHome: 'Back to Home',
} as const;

mockTranslate.mockImplementation((k: string) => MOCK_MESSAGES[k]);

describe('NotFoundPage Component', () => {
  it('should successfully render translated content and navigation elements', async () => {
    const user = userEvent.setup();
    render(<NotFoundPage />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText(MOCK_MESSAGES['pageNotFound'])).toBeInTheDocument();
    expect(screen.getByText(MOCK_MESSAGES['notFoundDescription'])).toBeInTheDocument();

    const backButton = screen.getByRole('button', { name: MOCK_MESSAGES['goBack'] });
    expect(backButton).toBeInTheDocument();

    await user.click(backButton);
    expect(mockBack).toHaveBeenCalledTimes(1);

    const returnLink = screen.getByRole('link', { name: MOCK_MESSAGES['backToHome'] });
    expect(returnLink).toBeInTheDocument();
    expect(returnLink).toHaveAttribute('href', '/');
  });
});
