import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import type { OpenAPIV3 } from '@scalar/openapi-types';

import EndpointItem from './EndpointItem';
import getExamples from '../utils/getExamples';
import type { ApiOperation } from '../utils/sortedSchema';

vi.mock('../utils/getExamples', () => ({ default: vi.fn() }));
const mockGetExamples = vi.mocked(getExamples);

vi.mock('./TryItPanel', () => ({
  default: vi.fn(({ operation, baseUrl }: { operation: ApiOperation; baseUrl: string }) => (
    <div data-testid="try-it-panel">
      {operation.method}-{operation.path}-{baseUrl}
    </div>
  )),
}));

const baseUrl = 'https://api.example.com';
const open = () => fireEvent.click(screen.getByRole('button'));

const fullOperation: ApiOperation = {
  path: '/users/{id}',
  method: 'post',
  summary: 'Get a user',
  description: 'Returns a single user',
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
    { name: '', in: 'query', required: false } as OpenAPIV3.ParameterObject,
  ],
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { type: 'object' } } },
  },
  responses: {
    '200': {
      description: 'OK',
      content: { 'application/json': { schema: { type: 'object' } } },
    },
    '204': { description: 'No content' },
  },
};

describe('EndpointItem', () => {
  beforeEach(() => {
    mockGetExamples.mockReturnValue([{ name: 'Sample', value: { foo: 'bar' } }]);
  });

  test('renders header (badge, path, summary) collapsed, without body content', () => {
    render(<EndpointItem operation={fullOperation} baseUrl={baseUrl} />);

    expect(screen.getByText('post')).toHaveStyle({ backgroundColor: '#49cc9080' });
    expect(screen.getByText('/users/{id}')).toBeInTheDocument();
    expect(screen.getByText('Get a user')).toBeInTheDocument();
    expect(screen.queryByText('Returns a single user')).not.toBeInTheDocument();
  });

  test('renders every body section once expanded', () => {
    render(<EndpointItem operation={fullOperation} baseUrl={baseUrl} />);
    open();

    expect(screen.getByText('Returns a single user')).toBeInTheDocument();

    expect(screen.getByText('paramLocation.path')).toBeInTheDocument();
    expect(screen.getByText('paramLocation.query')).toBeInTheDocument();
    expect(screen.queryByText('paramLocation.header')).not.toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    expect(screen.getByText('✕')).toBeInTheDocument();

    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByText('tabs.example')).toBeInTheDocument();

    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('204')).toBeInTheDocument();
    expect(screen.getAllByText(/"type": "object"/).length).toBeGreaterThan(0);

    expect(screen.getByTestId('try-it-panel')).toHaveTextContent(
      'post-/users/{id}-https://api.example.com',
    );
  });

  test('omits optional sections when data is absent', () => {
    mockGetExamples.mockReturnValue([]);
    const minimal: ApiOperation = { path: '/ping', method: 'get', parameters: [], responses: {} };

    render(<EndpointItem operation={minimal} baseUrl={baseUrl} />);
    open();

    expect(screen.queryByText('paramLocation.path')).not.toBeInTheDocument();
    expect(screen.queryByText('requestBody')).not.toBeInTheDocument();
    expect(screen.queryByText('tabs.example')).not.toBeInTheDocument();
  });
});
