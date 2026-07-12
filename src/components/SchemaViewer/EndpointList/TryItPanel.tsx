'use client';

import { useState } from 'react';
import { ApiOperation } from '../utils/sortedSchema';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { logApiRequest } from '@/lib/analytics';
import { HistoryRecord } from '@/types/analytics';

interface TryItPanelProps {
  operation: ApiOperation;
  baseUrl: string;
}

interface ProxyResult {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
}

export default function TryItPanel({ operation, baseUrl }: TryItPanelProps) {
  const [params, setParams] = useState<Record<string, string>>({});
  const [body, setBody] = useState('');
  const [result, setResult] = useState<ProxyResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = useTranslations('components.EndpointItem.tryIt');

  const buildRequest = () => {
    let url = baseUrl + operation.path;
    const query: string[] = [];
    const headers: Record<string, string> = {};

    for (const param of operation.parameters) {
      if (!param.name) continue;

      const value = params[param.name];
      if (!value) continue;

      switch (param.in) {
        case 'path':
          url = url.replace(`{${param.name}}`, encodeURIComponent(value));
          break;
        case 'header':
          headers[param.name] = value;
          break;
        case 'cookie':
          headers['Cookie'] = headers['Cookie']
            ? `${headers['Cookie']}; ${param.name}=${value}`
            : `${param.name}=${value}`;
          break;
        case 'query':
        default:
          query.push(`${encodeURIComponent(param.name)}=${encodeURIComponent(value)}`);
          break;
      }
    }
    if (query.length) url += `?${query.join('&')}`;

    return { url, headers };
  };

  const execute = async () => {
    setError(null);
    setResult(null);

    const { url, headers } = buildRequest();

    const method = operation.method.toUpperCase() as HistoryRecord['method'];
    const canHaveBody = method !== 'GET' && method !== 'HEAD';

    const requestHeaders = { ...headers };
    if (canHaveBody && body && !requestHeaders['Content-Type']) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    const startTime = performance.now();

    try {
      const res = await fetch(url, {
        method,
        headers: requestHeaders,
        body: canHaveBody && body ? body : undefined,
      });

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      const text = await res.text();
      let parsedBody: unknown = null;
      if (text) {
        try {
          parsedBody = JSON.parse(text);
        } catch {
          parsedBody = text;
        }
      }

      setResult({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body: parsedBody,
      });

      let errorDetails: string | undefined = undefined;
      if (res.status >= 400) {
        errorDetails = typeof parsedBody === 'string' ? parsedBody : JSON.stringify(parsedBody);
      }

      await logApiRequest({
        method,
        url,
        statusCode: res.status,
        duration,
        requestBody: canHaveBody && body ? body : null,
        responseBody: text,
        errorDetails,
        t,
      });
    } catch (err) {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      const errorMessage = err instanceof Error ? err.message : 'Request failed';
      setError(errorMessage);

      await logApiRequest({
        method,
        url,
        statusCode: 0,
        duration,
        requestBody: canHaveBody && body ? body : null,
        responseBody: null,
        errorDetails: errorMessage,
        t,
      });
    }
  };

  const copyCurl = async () => {
    const { url, headers } = buildRequest();
    let curl = `curl -X ${operation.method.toUpperCase()} '${url}'`;

    for (const [key, value] of Object.entries(headers)) {
      curl += ` -H '${key}: ${value.replace(/'/g, "'\\''")}'`;
    }

    if (body) {
      curl += ` -H 'Content-Type: application/json' -d '${body.replace(/'/g, "'\\''")}'`;
    }

    await navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="border rounded-md p-3 space-y-2">
      {operation.parameters
        .filter((param): param is typeof param & { name: string } => Boolean(param.name))
        .map((param) => (
          <Input
            key={param.name}
            placeholder={`${param.name} (${param.in})`}
            value={params[param.name] ?? ''}
            onChange={(e) => setParams({ ...params, [param.name]: e.target.value })}
          />
        ))}

      {operation.requestBody && (
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          className="font-mono text-xs"
        />
      )}

      <div className="flex gap-2">
        <Button onClick={execute}>{t('execute')}</Button>
        <Button variant="outline" onClick={copyCurl}>
          {copied ? t('copied') : t('generate')}
        </Button>
      </div>

      {error && (
        <p className="text-xs text-destructive">
          {t('networkError')}: {error}
        </p>
      )}

      {result && (
        <div className="space-y-2">
          <div className="text-xs font-mono">
            <span className="font-semibold">{t('status')}:</span> {result.status}{' '}
            {result.statusText}
          </div>

          <div>
            <p className="text-xs font-semibold">{t('responseHeaders')}</p>
            <pre className="bg-muted/40 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(result.headers, null, 2)}
            </pre>
          </div>

          <div>
            <p className="text-xs font-semibold">{t('responseBody')}</p>
            <pre className="bg-muted/40 p-2 rounded text-xs overflow-auto whitespace-pre-wrap">
              {typeof result.body === 'string' ? result.body : JSON.stringify(result.body, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
