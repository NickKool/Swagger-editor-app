import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AboutPage from './page';

vi.mock('@/constants/about', () => ({
  PROJECT_TECHNOLOGIES: ['React', 'Next.js', 'TailwindCSS'],
  TEAM: [
    {
      id: '1',
      name: 'johnDoe',
      role: 'Frontend Developer',
      contribution: 'johnContribution',
      github: 'https://github.com',
      githubAvatarId: '12345',
    },
  ],
}));

describe('AboutPage Component', () => {
  it('should render headers, main title, and introductory text correctly', () => {
    render(<AboutPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'aboutProject' })).toBeInTheDocument();
    expect(screen.getByText('aboutDescription')).toBeInTheDocument();
  });

  it('should render the course section card with correct title and external anchor link', () => {
    render(<AboutPage />);

    expect(screen.getByText('learning')).toBeInTheDocument();
    expect(screen.getByText('rsschoolCourse')).toBeInTheDocument();
    expect(screen.getByText('rsschool')).toBeInTheDocument();

    const joinLink = screen.getByRole('link', { name: 'rsschoolJoin' });
    expect(joinLink).toBeInTheDocument();
    expect(joinLink).toHaveAttribute('href', 'https://rs.school');
    expect(joinLink).toHaveAttribute('target', '_blank');
  });

  it('should render product feature tags from mapped technology configurations', () => {
    render(<AboutPage />);

    expect(screen.getByText('product')).toBeInTheDocument();
    expect(screen.getByText('projectDescription')).toBeInTheDocument();

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Next.js')).toBeInTheDocument();
    expect(screen.getByText('TailwindCSS')).toBeInTheDocument();
  });

  it('should render team directory profiles with avatar fallbacks and interactive external links', () => {
    render(<AboutPage />);

    expect(screen.getByRole('heading', { level: 2, name: 'ourTeam' })).toBeInTheDocument();
    expect(screen.getByText('johnDoe')).toBeInTheDocument();
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    expect(screen.getByText('johnContribution')).toBeInTheDocument();
    expect(screen.getByText('JO')).toBeInTheDocument();

    const gitHubLink = screen.getByRole('link', { name: 'gitHubProfile' });
    expect(gitHubLink).toBeInTheDocument();
    expect(gitHubLink).toHaveAttribute('href', 'https://github.com');
    expect(gitHubLink).toHaveAttribute('target', '_blank');
  });
});
