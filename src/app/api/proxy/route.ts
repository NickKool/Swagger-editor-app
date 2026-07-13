import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const FORBIDDEN_REQUEST_HEADERS = new Set([
  'host',
  'connection',
  'content-length',
  'origin',
  'referer',
  'forwarded',
  'x-forwarded-for',
  'x-forwarded-proto',
  'x-forwarded-host',
]);

const FORBIDDEN_RESPONSE_HEADERS = new Set([
  'content-encoding',
  'content-length',
  'transfer-encoding',
  'connection',
  'keep-alive',
  'server',
]);

async function handler(req: NextRequest) {
  try {
    const targetUrl = req.nextUrl.searchParams.get('url');

    if (!targetUrl) {
      return NextResponse.json({ error: 'Missing "url" query parameter' }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid target URL' }, { status: 400 });
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: 'Only http/https protocols are allowed' }, { status: 400 });
    }

    const headers = new Headers();

    if (req.headers && typeof req.headers.entries === 'function') {
      for (const [key, value] of req.headers.entries()) {
        if (!FORBIDDEN_REQUEST_HEADERS.has(key.toLowerCase())) {
          headers.set(key, value);
        }
      }
    }

    const method = req.method;
    const hasBody = !['GET', 'HEAD', 'OPTIONS'].includes(method);

    if (!hasBody) {
      headers.delete('content-type');
      headers.delete('content-length');
    }

    let body: string | undefined = undefined;
    if (hasBody) {
      try {
        body = await req.text();
      } catch {
        return NextResponse.json({ error: 'Failed to read request body.' }, { status: 400 });
      }
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
      redirect: 'follow',
    };

    if (hasBody && body && body.length > 0) {
      fetchOptions.body = body;
    }

    const targetResponse = await fetch(parsedUrl.toString(), fetchOptions);

    const responseHeaders = new Headers();

    if (targetResponse.headers && typeof targetResponse.headers.entries === 'function') {
      for (const [key, value] of targetResponse.headers.entries()) {
        if (!FORBIDDEN_RESPONSE_HEADERS.has(key.toLowerCase())) {
          responseHeaders.set(key, value);
        }
      }
    }

    responseHeaders.set('Cache-Control', 'no-store, max-age=0, must-revalidate');

    const responseBody = await targetResponse.arrayBuffer();

    return new NextResponse(responseBody, {
      status: targetResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Proxy execution failed internally',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    );
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
