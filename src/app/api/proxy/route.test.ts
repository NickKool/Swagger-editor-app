import { NextRequest } from 'next/server';
import { vi, describe, it, expect, afterEach } from 'vitest';

import { POST } from './route';

const makeRequest = (payload: unknown) =>
  new NextRequest('http://localhost/api/proxy', { method: 'POST', body: JSON.stringify(payload) });

const mockFetch = (init: {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  text: string;
}) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve({
        status: init.status ?? 200,
        statusText: init.statusText ?? 'OK',
        headers: new Headers(init.headers ?? {}),
        text: () => Promise.resolve(init.text),
      }),
    ) as unknown as typeof fetch,
  );

describe('POST /api/proxy', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('proxies the request, defaults Content-Type, and returns the parsed JSON body', async () => {
    mockFetch({
      status: 201,
      statusText: 'Created',
      headers: { 'content-type': 'application/json' },
      text: '{"id":1}',
    });

    const res = await POST(
      makeRequest({
        url: 'https://api.example.com/users',
        method: 'POST',
        body: '{"name":"Alice"}',
        headers: {},
      }),
    );

    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"name":"Alice"}',
    });
    expect(await res.json()).toEqual({
      status: 201,
      statusText: 'Created',
      headers: { 'content-type': 'application/json' },
      body: { id: 1 },
    });
  });

  it('keeps an existing Content-Type and drops the body for GET, falling back to raw text', async () => {
    mockFetch({ text: 'plain text' });

    const res = await POST(
      makeRequest({
        url: 'https://api.example.com/x',
        method: 'GET',
        body: 'ignored',
        headers: { 'Content-Type': 'text/plain' },
      }),
    );

    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      headers: { 'Content-Type': 'text/plain' },
      body: undefined,
    });
    expect((await res.json()).body).toBe('plain text');
  });

  it('returns a 500 proxy error when the upstream fetch throws', async () => {
    const errorMessage = 'network down';

    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error(errorMessage))) as unknown as typeof fetch,
    );

    const res = await POST(
      makeRequest({ url: 'https://api.example.com/x', method: 'GET', headers: {} }),
    );

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      status: 0,
      statusText: 'Proxy Error',
      headers: {},
      body: errorMessage,
    });
  });
});
