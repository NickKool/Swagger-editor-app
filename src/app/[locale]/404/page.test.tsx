import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFoundPage from './page';

describe('NotFoundPage Component', () => {
  it('should successfully render translated content and navigation link', () => {
    render(<NotFoundPage />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('page404');

    const returnLink = screen.getByRole('link', { name: /return/i });
    expect(returnLink).toBeInTheDocument();
    expect(returnLink).toHaveAttribute('href', '/');
  });
});
