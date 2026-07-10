import { Accordion, AccordionContent } from '@/components/ui/accordion';
import { ApiOperation } from '../utils/sorting';
import EndpointItem from './EndpointItem';
import { AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface EndpointCardProps {
  tag: string;
  paths: ApiOperation[];
  baseUrl: string;
}

export default function EndpointCard({ tag, paths, baseUrl }: EndpointCardProps) {
  return (
    <Accordion type="single" defaultValue={tag} collapsible>
      <AccordionItem value={tag}>
        <AccordionTrigger>
          <span>{tag}</span>
        </AccordionTrigger>
        <AccordionContent className="pr-2 py-1">
          <div className="flex flex-col gap-2">
            {paths.map((path) => (
              <EndpointItem
                key={`${path.method}-${path.path}`}
                operation={path}
                baseUrl={baseUrl}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
