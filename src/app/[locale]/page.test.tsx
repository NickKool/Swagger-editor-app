import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from './page';

describe('HomePage Component', () => {
  it('should successfully render localized homepage content text', () => {
    render(<HomePage />);

    expect(screen.getByText('content')).toBeInTheDocument();
  });
});
