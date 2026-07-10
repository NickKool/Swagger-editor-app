import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { url, method, body, headers } = await req.json();

  try {
    const requestHeaders: Record<string, string> = { ...(headers ?? {}) };
    if (body && !requestHeaders['Content-Type']) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: method !== 'GET' && method !== 'HEAD' ? body : undefined,
    });

    const text = await response.text();
    let parsedBody: unknown = text;

    try {
      parsedBody = JSON.parse(text);
    } catch {
      parsedBody = text;
    }

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: parsedBody,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Proxy request failed';

    return NextResponse.json(
      { status: 0, statusText: 'Proxy Error', headers: {}, body: message },
      { status: 500 },
    );
  }
}
