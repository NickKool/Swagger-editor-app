import React from 'react';

import { getTranslations } from 'next-intl/server';
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

export async function getMockHistoryRecords(): Promise<HistoryRecord[]> {
  return [
    // {
    //   id: 'rec-1',
    //   userId: 'user-123',
    //   timestamp: Date.now() - 5000,
    //   method: 'GET',
    //   url: 'https://swagger-editor.com',
    //   statusCode: 200,
    //   duration: 145,
    //   requestSize: 240,
    //   responseSize: 1024,
    // },
    // {
    //   id: 'rec-2',
    //   userId: 'user-123',
    //   timestamp: Date.now() - 600000,
    //   method: 'POST',
    //   url: 'https://swagger-editor.com',
    //   statusCode: 400,
    //   duration: 320,
    //   requestSize: 1450,
    //   responseSize: 180,
    //   errorDetails: 'Invalid syntax at line 14: core property "info" is missing.',
    // },
    // {
    //   id: 'rec-3',
    //   userId: 'user-123',
    //   timestamp: Date.now() - 3600000,
    //   method: 'DELETE',
    //   url: 'https://swagger-editor.com',
    //   statusCode: 404,
    //   duration: 98,
    //   requestSize: 0,
    //   responseSize: 64,
    //   errorDetails: 'Pet with specified identifier not found in cluster database.',
    // }
  ];
}

interface HistoryPageProps {
  params: Promise<{ locale: string }>;
}

export default async function HistoryPage({ params }: HistoryPageProps) {
  await params;

  const t = await getTranslations('pages.History');

  const rawRecords = await getMockHistoryRecords();

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
