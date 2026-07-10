import { render, screen } from '@testing-library/react';
import { vi, describe, test, expect } from 'vitest';

import EndpointCard from './EndpointCard';
import type { ApiOperation } from '../utils/sorting';

vi.mock('./EndpointItem', () => ({
  default: vi.fn(({ operation, baseUrl }: { operation: ApiOperation; baseUrl: string }) => (
    <div data-testid="endpoint-item">
      {operation.method}-{operation.path}-{baseUrl}
    </div>
  )),
}));

const createOperation = (overrides: Partial<ApiOperation> = {}): ApiOperation => ({
  path: '/users',
  method: 'get',
  parameters: [],
  responses: {},
  ...overrides,
});

describe('EndpointCard', () => {
  const baseUrl = 'https://api.example.com';

  test('renders the tag name', () => {
    render(<EndpointCard tag="Users" paths={[createOperation()]} baseUrl={baseUrl} />);

    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  test('renders one EndpointItem per operation', () => {
    const paths: ApiOperation[] = [
      createOperation({ path: '/users', method: 'get' }),
      createOperation({ path: '/users', method: 'post' }),
      createOperation({ path: '/users/{id}', method: 'delete' }),
    ];

    render(<EndpointCard tag="Users" paths={paths} baseUrl={baseUrl} />);

    expect(screen.getAllByTestId('endpoint-item')).toHaveLength(3);
  });

  test('passes the correct operation and baseUrl to each EndpointItem', () => {
    const paths: ApiOperation[] = [createOperation({ path: '/orders', method: 'put' })];

    render(<EndpointCard tag="Orders" paths={paths} baseUrl={baseUrl} />);

    expect(screen.getByText('put-/orders-https://api.example.com')).toBeInTheDocument();
  });

  test('uses method-path as the list key and still renders duplicates with different methods', () => {
    const paths: ApiOperation[] = [
      createOperation({ path: '/items', method: 'get' }),
      createOperation({ path: '/items', method: 'post' }),
    ];

    render(<EndpointCard tag="Items" paths={paths} baseUrl={baseUrl} />);

    expect(screen.getByText('get-/items-https://api.example.com')).toBeInTheDocument();
    expect(screen.getByText('post-/items-https://api.example.com')).toBeInTheDocument();
  });

  test('renders no EndpointItem when paths is empty', () => {
    render(<EndpointCard tag="Empty" paths={[]} baseUrl={baseUrl} />);

    expect(screen.getByText('Empty')).toBeInTheDocument();
    expect(screen.queryAllByTestId('endpoint-item')).toHaveLength(0);
  });

  test('opens the accordion content by default because defaultValue matches the tag', () => {
    render(<EndpointCard tag="Users" paths={[createOperation()]} baseUrl={baseUrl} />);

    expect(screen.getByTestId('endpoint-item')).toBeVisible();
  });

  test('renders a separate accordion item for a different tag value', () => {
    render(
      <EndpointCard tag="Payments" paths={[createOperation({ path: '/pay' })]} baseUrl={baseUrl} />,
    );

    expect(screen.getByRole('button', { name: 'Payments' })).toBeInTheDocument();
  });
});
