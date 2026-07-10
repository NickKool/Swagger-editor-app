import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import type { OpenAPIV3 } from '@scalar/openapi-types';

import TryItPanel from './TryItPanel';
import type { ApiOperation } from '../utils/sorting';

const baseUrl = 'https://api.example.com';

const param = (overrides: Partial<OpenAPIV3.ParameterObject>): OpenAPIV3.ParameterObject => ({
  name: 'id',
  in: 'path',
  ...overrides,
});

const operation: ApiOperation = {
  path: '/users/{id}',
  method: 'post',
  parameters: [
    param({ name: 'id', in: 'path' }),
    param({ name: 'q', in: 'query' }),
    param({ name: 'X-Token', in: 'header' }),
    param({ name: 'session', in: 'cookie' }),
    param({ name: '', in: 'query' }) as OpenAPIV3.ParameterObject,
  ],
  requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
  responses: {},
};

const fillParams = () => {
  fireEvent.change(screen.getByPlaceholderText('id (path)'), { target: { value: '42' } });
  fireEvent.change(screen.getByPlaceholderText('q (query)'), { target: { value: 'term' } });
  fireEvent.change(screen.getByPlaceholderText('X-Token (header)'), {
    target: { value: 'secret' },
  });
  fireEvent.change(screen.getByPlaceholderText('session (cookie)'), {
    target: { value: 'abc' },
  });
};

describe('TryItPanel', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              status: 200,
              statusText: 'OK',
              headers: { 'content-type': 'application/json' },
              body: { ok: true },
            }),
        }),
      ) as unknown as typeof fetch,
    );
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn(() => Promise.resolve()) },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  test('renders inputs only for named parameters and a textarea when requestBody exists', () => {
    render(<TryItPanel operation={operation} baseUrl={baseUrl} />);

    expect(screen.getByPlaceholderText('id (path)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('q (query)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('X-Token (header)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('session (cookie)')).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/\(.*\)/)).toHaveLength(4);
    expect(document.querySelector('textarea')).toBeInTheDocument();
  });

  test('omits the textarea when there is no requestBody', () => {
    render(<TryItPanel operation={{ ...operation, requestBody: undefined }} baseUrl={baseUrl} />);

    expect(document.querySelector('textarea')).not.toBeInTheDocument();
  });

  test('builds the request from parameters and renders the proxy result', async () => {
    render(<TryItPanel operation={operation} baseUrl={baseUrl} />);
    fillParams();

    fireEvent.click(screen.getByText('execute'));

    await waitFor(() => expect(screen.getByText(/status/)).toBeInTheDocument());

    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    const call = fetchMock.mock.calls[0];
    const payload = JSON.parse(call[1].body as string);

    expect(payload.url).toBe('https://api.example.com/users/42?q=term');
    expect(payload.headers['X-Token']).toBe('secret');
    expect(payload.headers['Cookie']).toBe('session=abc');
    expect(payload.method).toBe('post');

    expect(screen.getByText(/200/)).toBeInTheDocument();
    expect(screen.getByText(/"ok": true/)).toBeInTheDocument();
  });

  test('renders a string response body as-is', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              status: 500,
              statusText: 'Error',
              headers: {},
              body: 'raw text body',
            }),
        }),
      ) as unknown as typeof fetch,
    );

    render(<TryItPanel operation={operation} baseUrl={baseUrl} />);
    fireEvent.click(screen.getByText('execute'));

    await waitFor(() => expect(screen.getByText('raw text body')).toBeInTheDocument());
  });

  test('copies a curl command and toggles the copied label back after a delay', async () => {
    vi.useFakeTimers();
    render(<TryItPanel operation={operation} baseUrl={baseUrl} />);
    fillParams();

    fireEvent.click(screen.getByText('generate'));

    await vi.waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    const curl = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as string;
    expect(curl).toContain("curl -X POST 'https://api.example.com/users/42?q=term'");
    expect(curl).toContain("-H 'X-Token: secret'");

    await vi.waitFor(() => {
      expect(screen.getByText('copied')).toBeInTheDocument();
    });

    vi.advanceTimersByTime(1500);

    await vi.waitFor(() => {
      expect(screen.getByText('generate')).toBeInTheDocument();
    });
  });
});
