import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AboutPage from './page';
import { mockTranslate } from '@/__mocks__/next-intl';

const { MOCK_TECHNOLOGIES, MOCK_RS_SCHOOL_LINK, MOCK_TEAM } = vi.hoisted(() => ({
  MOCK_TECHNOLOGIES: ['React', 'Next.js', 'TailwindCSS'] as const,
  MOCK_RS_SCHOOL_LINK: 'https://cool.url.com',
  MOCK_TEAM: [
    {
      id: '1',
      name: 'team.johnName',
      role: 'Frontend Developer',
      contribution: 'team.johnContribution',
      github: 'https://github.com',
      githubAvatarId: '12345',
    },
  ] as const,
}));

const AVATAR_FALLBACK = MOCK_TEAM[0].name.substring(0, 2).toUpperCase();

vi.mock('@/constants/about', () => ({
  PROJECT_TECHNOLOGIES: MOCK_TECHNOLOGIES,
  RS_SCHOOL_LINK: MOCK_RS_SCHOOL_LINK,
  TEAM: MOCK_TEAM,
}));

const MOCK_MESSAGES: Record<string, string> = {
  aboutProject: 'About Project',
  aboutDescription: 'About Description',
  learning: 'Learning',
  rsschoolCourse: 'RS School Course',
  rsschool: 'RS School',
  rsschoolJoin: 'Join RS School',
  product: 'Product',
  projectDescription: 'Project Description',
  ourTeam: 'Our Team',
  gitHubProfile: 'GitHub Profile',
  'team.johnName': 'John Doe',
  'team.johnContribution': 'Does cool staff',
} as const;

mockTranslate.mockImplementation((k: string) => MOCK_MESSAGES[k]);

describe('AboutPage Component', () => {
  it('should render headers, main title, and introductory text correctly', () => {
    render(<AboutPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: MOCK_MESSAGES['aboutProject'] }),
    ).toBeInTheDocument();
    expect(screen.getByText(MOCK_MESSAGES['aboutDescription'])).toBeInTheDocument();
  });

  it('should render the course section card with correct title and external anchor link', () => {
    render(<AboutPage />);

    expect(screen.getByText(MOCK_MESSAGES['learning'])).toBeInTheDocument();
    expect(screen.getByText(MOCK_MESSAGES['rsschoolCourse'])).toBeInTheDocument();
    expect(screen.getByText(MOCK_MESSAGES['rsschool'])).toBeInTheDocument();

    const joinLink = screen.getByRole('link', { name: MOCK_MESSAGES['rsschoolJoin'] });
    expect(joinLink).toBeInTheDocument();
    expect(joinLink).toHaveAttribute('href', MOCK_RS_SCHOOL_LINK);
    expect(joinLink).toHaveAttribute('target', '_blank');
  });

  it('should render product feature tags from mapped technology configurations', () => {
    render(<AboutPage />);

    expect(screen.getByText(MOCK_MESSAGES['product'])).toBeInTheDocument();
    expect(screen.getByText(MOCK_MESSAGES['projectDescription'])).toBeInTheDocument();

    expect(screen.getByText(MOCK_TECHNOLOGIES[0])).toBeInTheDocument();
    expect(screen.getByText(MOCK_TECHNOLOGIES[1])).toBeInTheDocument();
    expect(screen.getByText(MOCK_TECHNOLOGIES[2])).toBeInTheDocument();
  });

  it('should render team directory profiles with avatar fallbacks and interactive external links', () => {
    render(<AboutPage />);

    expect(
      screen.getByRole('heading', { level: 2, name: MOCK_MESSAGES['ourTeam'] }),
    ).toBeInTheDocument();
    expect(screen.getByText(MOCK_MESSAGES[MOCK_TEAM[0].name])).toBeInTheDocument();
    expect(screen.getByText(MOCK_TEAM[0].role)).toBeInTheDocument();
    expect(screen.getByText(MOCK_MESSAGES[MOCK_TEAM[0].contribution])).toBeInTheDocument();
    expect(screen.getByText(AVATAR_FALLBACK)).toBeInTheDocument();

    const gitHubLink = screen.getByRole('link', { name: MOCK_MESSAGES['gitHubProfile'] });
    expect(gitHubLink).toBeInTheDocument();
    expect(gitHubLink).toHaveAttribute('href', MOCK_TEAM[0].github);
    expect(gitHubLink).toHaveAttribute('target', '_blank');
  });
});
