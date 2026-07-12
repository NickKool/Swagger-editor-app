import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import type { OpenAPIV3 } from '@scalar/openapi-types';

import TryItPanel from './TryItPanel';
import type { ApiOperation } from '../utils/sortedSchema';

vi.mock('@/lib/analytics', () => ({
  logApiRequest: vi.fn(() => Promise.resolve()),
}));

import { logApiRequest } from '@/lib/analytics';

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

interface MockResponseInit {
  status: number;
  statusText: string;
  headersEntries: [string, string][];
  bodyText: string;
}

function createMockResponse({ status, statusText, headersEntries, bodyText }: MockResponseInit) {
  const headersMap = new Map(headersEntries);
  return {
    status,
    statusText,
    headers: { entries: () => headersMap.entries() },
    text: () => Promise.resolve(bodyText),
  };
}

describe('TryItPanel', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          createMockResponse({
            status: 200,
            statusText: 'OK',
            headersEntries: [['content-type', 'application/json']],
            bodyText: JSON.stringify({ ok: true }),
          }),
        ),
      ) as unknown as typeof fetch,
    );
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn(() => Promise.resolve()) },
      configurable: true,
    });
    vi.mocked(logApiRequest).mockClear();
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

  test('builds the request from parameters and renders the fetch result', async () => {
    render(<TryItPanel operation={operation} baseUrl={baseUrl} />);
    fillParams();

    fireEvent.click(screen.getByText('execute'));

    await waitFor(() => expect(screen.getByText(/status/)).toBeInTheDocument());

    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(url).toBe('https://api.example.com/users/42?q=term');
    expect(options.method).toBe('POST');
    expect((options.headers as Record<string, string>)['X-Token']).toBe('secret');
    expect((options.headers as Record<string, string>)['Cookie']).toBe('session=abc');

    expect(screen.getByText(/200/)).toBeInTheDocument();
    expect(screen.getByText(/"ok": true/)).toBeInTheDocument();

    expect(logApiRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: 'https://api.example.com/users/42?q=term',
        statusCode: 200,
        duration: expect.any(Number),
      }),
    );
  });

  test('renders a string response body as-is', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          createMockResponse({
            status: 500,
            statusText: 'Error',
            headersEntries: [],
            bodyText: 'raw text body',
          }),
        ),
      ) as unknown as typeof fetch,
    );

    render(<TryItPanel operation={operation} baseUrl={baseUrl} />);
    fireEvent.click(screen.getByText('execute'));

    await waitFor(() => expect(screen.getByText('raw text body')).toBeInTheDocument());

    expect(logApiRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        statusCode: 500,
        responseBody: 'raw text body',
      }),
    );
  });

  test('shows a network error message when fetch rejects', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('Failed to fetch'))) as unknown as typeof fetch,
    );

    render(<TryItPanel operation={operation} baseUrl={baseUrl} />);
    fireEvent.click(screen.getByText('execute'));

    await waitFor(() => expect(screen.getByText(/Failed to fetch/)).toBeInTheDocument());

    expect(logApiRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        statusCode: 0,
        errorDetails: 'Failed to fetch',
      }),
    );
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
