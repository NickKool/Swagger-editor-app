import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const FORBIDDEN_REQUEST_HEADERS = new Set([
  'host',
  'connection',
  'content-length',
  'origin',
  'referer',
]);

const FORBIDDEN_RESPONSE_HEADERS = new Set([
  'content-encoding',
  'content-length',
  'transfer-encoding',
  'connection',
]);

async function handler(req: NextRequest) {
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
  req.headers.forEach((value, key) => {
    if (!FORBIDDEN_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const method = req.method;
  const hasBody = !['GET', 'HEAD'].includes(method);

  let body: string | undefined = undefined;
  if (hasBody) {
    try {
      body = await req.text();
    } catch {
      return null;
    }
  }

  try {
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
    targetResponse.headers.forEach((value, key) => {
      if (!FORBIDDEN_RESPONSE_HEADERS.has(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    responseHeaders.set('Cache-Control', 'no-store, max-age=0, must-revalidate');

    const responseBody = await targetResponse.arrayBuffer();

    return new NextResponse(responseBody, {
      status: targetResponse.status,
      statusText: targetResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to reach target server',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    );
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
