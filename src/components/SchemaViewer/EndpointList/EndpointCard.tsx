import { Accordion, AccordionContent } from '@/components/ui/accordion';
import { ApiOperationTag } from '../utils/sortedSchema';
import EndpointItem from './EndpointItem';
import { AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { OpenAPIV3 } from '@scalar/openapi-types';

interface EndpointCardProps {
  tag: ApiOperationTag;
  baseUrl: string;
  components?: OpenAPIV3.ComponentsObject;
}

export default function EndpointCard({ tag, baseUrl, components }: EndpointCardProps) {
  return (
    <Accordion type="single" defaultValue={tag.name} collapsible>
      <AccordionItem value={tag.name}>
        <AccordionTrigger className="hover:no-underline cursor-pointer items-center">
          <b className="text-lg">{tag.name}</b>
          <p className="font-medium text-muted-foreground">{tag.description}</p>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-2">
            {tag.operations.map((operation) => (
              <EndpointItem
                key={`${operation.method}-${operation.path}`}
                operation={operation}
                components={components}
                baseUrl={baseUrl}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
