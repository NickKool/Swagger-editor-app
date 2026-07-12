'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ApiOperation } from '../utils/sortedSchema';
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
import TryItPanel from './TryItPanel';
import type { OpenAPIV3 } from '@scalar/openapi-types';
import MediaTypeBlock from './MediaTypeBlock';

interface EndpointItemProps {
  operation: ApiOperation;
  baseUrl: string;
  components?: OpenAPIV3.ComponentsObject;
}

const METHODS_COLORS = {
  get: '#61afff',
  post: '#49cc90',
  put: '#fca130',
  delete: '#f93e3e',
  patch: '#50e3c2',
  options: '#0d5aa7',
  head: '#9012fe',
  trace: '#78909c',
} as const;

const PARAM_LOCATIONS = ['path', 'query', 'header', 'cookie'] as const;

export default function EndpointItem({ operation, baseUrl, components }: EndpointItemProps) {
  const { summary, description, parameters, requestBody, responses } = operation;

  const method = operation.method.toLowerCase() as keyof typeof METHODS_COLORS;
  const badgeColor = METHODS_COLORS[method];

  const t = useTranslations('components.EndpointItem');

  return (
    <Accordion type="single" collapsible style={{ borderColor: badgeColor }}>
      <AccordionItem value={operation.method}>
        <AccordionTrigger className="hover:no-underline cursor-pointer items-center">
          <Badge
            className="uppercase text-white w-[72px]"
            style={{ backgroundColor: `${badgeColor}80` }}
          >
            {operation.method}
          </Badge>
          <b>{operation.path}</b>
          <span>{summary && <p className="font-medium text-muted-foreground">{summary}</p>}</span>
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
                        <TableCell>
                          {(param.schema as OpenAPIV3.SchemaObject)?.type || '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          })}

          {requestBody?.content && (
            <div>
              <h4 className="font-semibold mb-3">
                {t('requestBody')}{' '}
                {requestBody.required && <span className="text-destructive">*</span>}
              </h4>
              <MediaTypeBlock content={requestBody.content} components={components} />
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-3">{t('responses')}</h4>
            {Object.entries(responses).map(([code, resp]) => (
              <div key={code} className="mb-2 border rounded p-2">
                <p className="text-sm">
                  <span className="font-mono font-semibold">{code}</span> — {resp.description}
                </p>
                {resp.content && <MediaTypeBlock content={resp.content} components={components} />}
              </div>
            ))}
          </div>
          <TryItPanel operation={operation} baseUrl={baseUrl} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
