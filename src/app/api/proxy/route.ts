import { NextRequest, NextResponse } from 'next/server';

// Заголовки, которые нельзя пробрасывать как есть (управляются самим fetch/Next.js)
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

  // Валидация URL, чтобы не проксировать мусор
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid target URL' }, { status: 400 });
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return NextResponse.json({ error: 'Only http/https protocols are allowed' }, { status: 400 });
  }

  // Собираем заголовки для проксируемого запроса
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!FORBIDDEN_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  // Тело запроса (для GET/HEAD его нет)
  const method = req.method;
  const hasBody = !['GET', 'HEAD'].includes(method);
  const body = hasBody ? await req.text() : undefined;

  try {
    const targetResponse = await fetch(parsedUrl.toString(), {
      method,
      headers,
      body: body && body.length > 0 ? body : undefined,
      redirect: 'follow',
    });

    const responseHeaders = new Headers();
    targetResponse.headers.forEach((value, key) => {
      if (!FORBIDDEN_RESPONSE_HEADERS.has(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

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
