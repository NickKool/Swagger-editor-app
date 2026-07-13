import { describe, expect, test, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';

const createRequest = (url: string, init?: ConstructorParameters<typeof NextRequest>[1]) =>
  new NextRequest(`http://localhost/api/proxy${url}`, init);

describe('proxy route', () => {
  afterEach(() => vi.restoreAllMocks());

  test.each([
    ['', 'Missing "url" query parameter'],
    ['?url=not-a-url', 'Invalid target URL'],
    ['?url=file:///tmp/test.txt', 'Only http/https protocols are allowed'],
  ])('returns 400 for "%s"', async (query, error) => {
    const res = await GET(createRequest(query));

    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe(error);
  });

  test('proxies request', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'x-test': '123',
        },
      }),
    );

    const res = await GET(createRequest('?url=https://example.com/api'));

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/api',
      expect.objectContaining({
        method: 'GET',
        redirect: 'follow',
      }),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(res.headers.get('x-test')).toBe('123');
  });

  test('filters response headers', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response('ok', {
        headers: {
          connection: 'keep-alive',
          'content-length': '2',
          'content-type': 'text/plain',
          'x-custom': 'value',
        },
      }),
    );

    const res = await GET(createRequest('?url=https://example.com'));

    expect(res.headers.get('connection')).toBeNull();
    expect(res.headers.get('content-length')).toBeNull();
    expect(res.headers.get('content-type')).toBe('text/plain');
    expect(res.headers.get('x-custom')).toBe('value');
  });

  test('filters request headers', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(new Response());

    await GET(
      createRequest('?url=https://example.com', {
        headers: {
          host: 'localhost',
          origin: 'http://localhost',
          authorization: 'Bearer token',
        },
      }),
    );

    const headers = fetchMock.mock.calls[0][1]?.headers as Headers;

    expect(headers.get('authorization')).toBe('Bearer token');
    expect(headers.get('host')).toBeNull();
    expect(headers.get('origin')).toBeNull();
  });

  test('forwards request body', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(new Response());

    await POST(
      createRequest('?url=https://example.com', {
        method: 'POST',
        body: '{"name":"John"}',
      }),
    );

    expect(fetchMock.mock.calls[0][1]).toEqual(
      expect.objectContaining({
        method: 'POST',
        body: '{"name":"John"}',
      }),
    );
  });

  test('returns 502 on fetch error', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

    const res = await GET(createRequest('?url=https://example.com'));

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({
      error: 'Failed to reach target server',
      details: 'Network error',
    });
  });
});
