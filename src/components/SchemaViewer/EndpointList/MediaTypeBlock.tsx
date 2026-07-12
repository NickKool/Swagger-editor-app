import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { OpenAPIV3 } from '@scalar/openapi-types';
import { useState } from 'react';
import generateSchemaExample, { generateXmlExample } from '../utils/generateSchemaExample';
import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function MediaTypeBlock({
  content,
  components,
}: {
  content: Record<string, OpenAPIV3.MediaTypeObject>;
  components?: OpenAPIV3.ComponentsObject;
}) {
  const t = useTranslations('components.EndpointItem');
  const contentTypes = Object.keys(content);
  const [selected, setSelected] = useState(contentTypes[0]);
  const mediaType = content[selected];

  const exampleValue = selected.includes('xml')
    ? generateXmlExample(mediaType.schema, components)
    : JSON.stringify(generateSchemaExample(mediaType.schema, components), null, 2);

  return (
    <div>
      {contentTypes.length > 1 && (
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="w-[260px] mb-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {contentTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Tabs defaultValue="example">
        <TabsList>
          <TabsTrigger value="example">{t('tabs.example')}</TabsTrigger>
          <TabsTrigger value="schema">{t('tabs.schema')}</TabsTrigger>
        </TabsList>
        <TabsContent value="example">
          <pre className="bg-muted/40 p-2 rounded text-xs overflow-auto">{exampleValue}</pre>
        </TabsContent>
        <TabsContent value="schema">
          <pre className="bg-muted/40 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(mediaType.schema, null, 2)}
          </pre>
        </TabsContent>
      </Tabs>
    </div>
  );
}
