'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ApiOperation } from '../utils/sorting';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTranslations } from 'next-intl';
import getExamples from '../utils/getExamples';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import TryItPanel from './TryItPanel';

interface EndpointItemProps {
  operation: ApiOperation;
  baseUrl: string;
}

const METHODS_COLORS = {
  get: '#61afff',
  post: '#49cc90',
  put: '#fca130',
  delete: '#f93e3e',
} as const;

const PARAM_LOCATIONS = ['path', 'query', 'header', 'cookie'] as const;

export default function EndpointItem({ operation, baseUrl }: EndpointItemProps) {
  const { summary, description, parameters, requestBody, responses } = operation;

  const method = operation.method.toLowerCase() as keyof typeof METHODS_COLORS;
  const badgeColor = METHODS_COLORS[method];

  const t = useTranslations('components.EndpointItem');

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value={operation.method}>
        <AccordionTrigger>
          <Badge className="uppercase text-white" style={{ backgroundColor: `${badgeColor}80` }}>
            {operation.method}
          </Badge>
          <b>{operation.path}</b>
          <span>{summary && <p className="font-medium">{summary}</p>}</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 overflow-auto">
          {description && <p className="text-sm text-muted-foreground">{description}</p>}

          {PARAM_LOCATIONS.map((location) => {
            const items = parameters.filter((param) => param.in === location);
            if (items.length === 0) return null;

            return (
              <div key={location}>
                <h4 className="font-semibold">{t(`paramLocation.${location}`)}</h4>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('table.name')}</TableHead>
                      <TableHead>{t('table.type')}</TableHead>
                      <TableHead>{t('table.required')}</TableHead>
                      <TableHead>{t('table.description')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((param, index) => (
                      <TableRow key={`${param.name}-${index}`}>
                        <TableCell>{param.name || '—'}</TableCell>
                        <TableCell>{param?.schema?.type || '—'}</TableCell>
                        <TableCell>{param.required ? '✓' : '✕'}</TableCell>
                        <TableCell>{param.description || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          })}

          {requestBody && requestBody.content && (
            <div>
              <h4 className="font-semibold">
                {t('requestBody')}{' '}
                {requestBody.required && <span className="text-destructive">*</span>}
              </h4>
              {Object.entries(requestBody.content).map(([contentType, mediaType]) => {
                const examples = getExamples(mediaType);
                return (
                  <div key={contentType} className="mb-2">
                    <p className="text-xs text-muted-foreground font-mono">{contentType}</p>
                    <Tabs defaultValue="schema">
                      <TabsList>
                        <TabsTrigger value="schema">{t('tabs.schema')}</TabsTrigger>
                        {examples.length > 0 && (
                          <TabsTrigger value="example">{t('tabs.example')}</TabsTrigger>
                        )}
                      </TabsList>
                      <TabsContent value="schema">
                        <pre className="bg-muted/40 p-2 rounded text-xs overflow-auto">
                          {JSON.stringify(mediaType.schema, null, 2)}
                        </pre>
                      </TabsContent>
                      {examples.length > 0 && (
                        <TabsContent value="example">
                          {examples.map((example, index) => (
                            <pre
                              key={index}
                              className="bg-muted/40 p-2 rounded text-xs overflow-auto"
                            >
                              {example.name && (
                                <span className="text-muted-foreground">{example.name}:\n</span>
                              )}
                              {JSON.stringify(example.value, null, 2)}
                            </pre>
                          ))}
                        </TabsContent>
                      )}
                    </Tabs>
                  </div>
                );
              })}
            </div>
          )}

          <div>
            <h4 className="font-semibold">{t('responses')}</h4>
            {Object.entries(responses).map(([code, resp]) => (
              <div key={code} className="mb-2 border rounded p-2">
                <p className="text-sm">
                  <span className="font-mono font-semibold">{code}</span> — {resp.description}
                </p>
                {resp.content &&
                  Object.entries(resp.content).map(([contentType, mediaType]) => {
                    const examples = getExamples(mediaType);
                    return (
                      <div key={contentType} className="mt-1">
                        <p className="text-xs text-muted-foreground font-mono">{contentType}</p>
                        <pre className="bg-muted/40 p-2 rounded text-xs overflow-auto">
                          {JSON.stringify(mediaType.schema, null, 2)}
                        </pre>
                        {examples.map((ex, i) => (
                          <pre
                            key={i}
                            className="bg-muted/40 p-2 rounded text-xs overflow-auto mt-1"
                          >
                            {JSON.stringify(ex.value, null, 2)}
                          </pre>
                        ))}
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
          <TryItPanel operation={operation} baseUrl={baseUrl} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
