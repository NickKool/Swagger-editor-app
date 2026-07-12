import React from 'react';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { Link } from '@/i18n/navigation';
import { HistoryRecord } from '@/types/analytics';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function getUserIdFromToken(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
    const payload = JSON.parse(payloadJson) as { sub?: string; user_id?: string };

    return payload.user_id || payload.sub || null;
  } catch {
    return null;
  }
}

import https from 'https';

export async function getRealHistoryRecords(userId: string): Promise<HistoryRecord[]> {
  try {
    const targetProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'swagger-editor-openapi';

    const path =
      '/v1/projects/' + targetProjectId.trim() + '/databases/(default)/documents/history';

    return new Promise((resolve) => {
      const options = {
        hostname: 'firestore.googleapis.com',
        port: 443,
        path: path,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        agent: new https.Agent({ rejectUnauthorized: false }),
      };

      const req = https.request(options, (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode !== 200) {
            return resolve([]);
          }

          try {
            const data = JSON.parse(rawData) as {
              documents?: Array<{
                name: string;
                fields?: {
                  userId?: { stringValue?: string };
                  timestamp?: { integerValue?: string; doubleValue?: number };
                  method?: { stringValue?: string };
                  url?: { stringValue?: string };
                  statusCode?: { integerValue?: string; doubleValue?: number };
                  duration?: { integerValue?: string; doubleValue?: number };
                  requestSize?: { integerValue?: string; doubleValue?: number };
                  responseSize?: { integerValue?: string; doubleValue?: number };
                  errorDetails?: { stringValue?: string };
                };
              }>;
            };

            if (!data.documents || !Array.isArray(data.documents)) return resolve([]);

            const getNum = (
              field: { integerValue?: string; doubleValue?: number } | undefined,
            ): number => {
              if (!field) return 0;
              if (field.doubleValue !== undefined) return field.doubleValue;
              if (field.integerValue !== undefined) return Number(field.integerValue);
              return 0;
            };

            const records: HistoryRecord[] = [];

            for (const doc of data.documents) {
              const f = doc.fields;
              if (!f) continue;

              const docUserId = f.userId?.stringValue || '';

              if (docUserId === userId) {
                const id = doc.name.split('/').pop() || '';

                records.push({
                  id,
                  userId: docUserId,
                  timestamp: getNum(f.timestamp),
                  method: (f.method?.stringValue || 'GET') as HistoryRecord['method'],
                  url: f.url?.stringValue || '',
                  statusCode: getNum(f.statusCode),
                  duration: getNum(f.duration),
                  requestSize: getNum(f.requestSize),
                  responseSize: getNum(f.responseSize),
                  ...(f.errorDetails?.stringValue
                    ? { errorDetails: f.errorDetails.stringValue }
                    : {}),
                });
              }
            }

            resolve(records);
          } catch {
            resolve([]);
          }
        });
      });

      req.on('error', () => {
        resolve([]);
      });

      req.end();
    });
  } catch {
    return [];
  }
}

interface HistoryPageProps {
  params: Promise<{ locale: string }>;
}

export default async function HistoryPage({ params }: HistoryPageProps) {
  await params;

  const t = await getTranslations('pages.History');

  const cookieStore = await cookies();
  const rawToken = cookieStore.get('auth-token')?.value;

  const token = rawToken ? decodeURIComponent(rawToken) : null;

  let userId = '';
  if (token) {
    userId = getUserIdFromToken(token) || '';
  }

  const rawRecords = userId ? await getRealHistoryRecords(userId) : [];

  const sortedRecords = [...rawRecords].sort((a, b) => b.timestamp - a.timestamp);

  if (sortedRecords.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md shadow-lg border-border text-center">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground">{t('title')}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-2">
              {t('emptyState.message')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-2">
            <Button asChild variant="default" className="font-medium w-full max-w-xs">
              <Link href="/">{t('emptyState.workspaceLink')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: number) => {
    if (status >= 200 && status < 300) return 'default';
    if (status >= 400 && status < 500) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight font-heading text-foreground">
          {t('title')}
        </h1>
        <p className="text-muted-foreground text-sm">{t('description')}</p>
      </div>

      <Card className="border-border shadow-md">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-[160px]">{t('table.timestamp')}</TableHead>
                <TableHead className="w-[90px]">{t('table.method')}</TableHead>
                <TableHead>{t('table.url')}</TableHead>
                <TableHead className="w-[90px]">{t('table.statusCode')}</TableHead>
                <TableHead className="w-[110px]">{t('table.duration')}</TableHead>
                <TableHead className="w-[100px]">{t('table.requestSize')}</TableHead>
                <TableHead className="w-[100px]">{t('table.responseSize')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRecords.map((record) => (
                <React.Fragment key={record.id}>
                  <TableRow className="border-b transition-colors hover:bg-muted/20">
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {new Date(record.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-bold font-mono tracking-wide px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        {record.method}
                      </span>
                    </TableCell>
                    <TableCell
                      className="max-w-[280px] truncate font-mono text-xs text-foreground"
                      title={record.url}
                    >
                      {record.url}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(record.statusCode)}
                        className="font-mono text-xs px-2 py-0"
                      >
                        {record.statusCode}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-xs">{record.duration} ms</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {record.requestSize} B
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {record.responseSize} B
                    </TableCell>
                  </TableRow>

                  {record.errorDetails && (
                    <TableRow className="bg-destructive/5 hover:bg-destructive/5 border-b">
                      <TableCell colSpan={7} className="py-2 px-4">
                        <div className="text-xs text-destructive flex flex-col gap-1 border-l-2 border-destructive pl-3">
                          <span className="font-bold tracking-tight">{t('table.details')}:</span>
                          <span className="font-mono whitespace-pre-line leading-relaxed">
                            {record.errorDetails}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
