'use client';

import { useState } from 'react';
import { ApiOperation } from '../utils/sorting';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

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
    const { url, headers } = buildRequest();

    const res = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, method: operation.method, body, headers }),
    });
    setResult(await res.json());
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
