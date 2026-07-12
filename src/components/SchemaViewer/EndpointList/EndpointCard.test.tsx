import { render, screen } from '@testing-library/react';
import { vi, describe, test, expect } from 'vitest';

import EndpointCard from './EndpointCard';
import type { ApiOperation, ApiOperationTag } from '../utils/sortedSchema';

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

const createTag = (overrides: Partial<ApiOperationTag> = {}): ApiOperationTag => ({
  name: 'Users',
  operations: [],
  ...overrides,
});

describe('EndpointCard', () => {
  const baseUrl = 'https://api.example.com';

  test('renders the tag name and description', () => {
    const tag = createTag({ name: 'Users', description: 'User endpoints' });
    render(<EndpointCard tag={tag} baseUrl={baseUrl} />);

    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('User endpoints')).toBeInTheDocument();
  });

  test('renders one EndpointItem per operation', () => {
    const tag = createTag({
      name: 'Users',
      operations: [
        createOperation({ path: '/users', method: 'get' }),
        createOperation({ path: '/users', method: 'post' }),
        createOperation({ path: '/users/{id}', method: 'delete' }),
      ],
    });

    render(<EndpointCard tag={tag} baseUrl={baseUrl} />);

    expect(screen.getAllByTestId('endpoint-item')).toHaveLength(3);
  });

  test('passes the correct operation and baseUrl to each EndpointItem', () => {
    const tag = createTag({
      name: 'Orders',
      operations: [createOperation({ path: '/orders', method: 'put' })],
    });

    render(<EndpointCard tag={tag} baseUrl={baseUrl} />);

    expect(screen.getByText('put-/orders-https://api.example.com')).toBeInTheDocument();
  });

  test('uses method-path as the list key and still renders duplicates with different methods', () => {
    const tag = createTag({
      name: 'Items',
      operations: [
        createOperation({ path: '/items', method: 'get' }),
        createOperation({ path: '/items', method: 'post' }),
      ],
    });

    render(<EndpointCard tag={tag} baseUrl={baseUrl} />);

    expect(screen.getByText('get-/items-https://api.example.com')).toBeInTheDocument();
    expect(screen.getByText('post-/items-https://api.example.com')).toBeInTheDocument();
  });

  test('renders no EndpointItem when operations is empty', () => {
    const tag = createTag({ name: 'Empty', operations: [] });
    render(<EndpointCard tag={tag} baseUrl={baseUrl} />);

    expect(screen.getByText('Empty')).toBeInTheDocument();
    expect(screen.queryAllByTestId('endpoint-item')).toHaveLength(0);
  });

  test('opens the accordion content by default because defaultValue matches the tag name', () => {
    const tag = createTag({ name: 'Users', operations: [createOperation()] });
    render(<EndpointCard tag={tag} baseUrl={baseUrl} />);

    expect(screen.getByTestId('endpoint-item')).toBeVisible();
  });

  test('renders a separate accordion item for a different tag value', () => {
    const tag = createTag({ name: 'Payments', operations: [createOperation({ path: '/pay' })] });
    render(<EndpointCard tag={tag} baseUrl={baseUrl} />);

    expect(screen.getByRole('button', { name: /Payments/ })).toBeInTheDocument();
  });
});
