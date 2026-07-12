import type { OpenAPIV3 } from '@scalar/openapi-types';

type Schema = OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
type Components = OpenAPIV3.ComponentsObject;

function resolveSchema(schema: Schema, components?: Components): OpenAPIV3.SchemaObject | null {
  if (!('$ref' in schema)) return schema;
  const name = schema.$ref.replace('#/components/schemas/', '');
  return (components?.schemas?.[name] as OpenAPIV3.SchemaObject) ?? null;
}

function exampleForFormat(format: string): unknown {
  if (format === 'date-time') return new Date().toISOString();
  if (format === 'date') return new Date().toISOString().slice(0, 10);
  if (format === 'email') return 'user@example.com';
  if (format === 'uuid') return '3fa85f64-5717-4562-b3fc-2c963f66afa6';
  return 'string';
}

export default function generateSchemaExample(
  schema: Schema | undefined,
  components?: Components,
): unknown {
  if (!schema) return undefined;

  const resolved = resolveSchema(schema, components);
  if (!resolved) return {};

  if (resolved.example !== undefined) return resolved.example;
  if (resolved.default !== undefined) return resolved.default;
  if (resolved.enum?.length) return resolved.enum[0];

  if (resolved.type === 'object' || resolved.properties) {
    const result: Record<string, unknown> = {};
    for (const [key, propSchema] of Object.entries(resolved.properties ?? {})) {
      result[key] = generateSchemaExample(propSchema, components);
    }
    return result;
  }

  if (resolved.type === 'array' || resolved.items) {
    return [generateSchemaExample(resolved.items, components)];
  }

  if (resolved.type === 'string')
    return resolved.format ? exampleForFormat(resolved.format) : 'string';
  if (resolved.type === 'integer' || resolved.type === 'number') return 0;
  if (resolved.type === 'boolean') return true;

  return null;
}

function escapeXml(value: unknown): string {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildXml(
  schema: OpenAPIV3.SchemaObject,
  components: Components | undefined,
  tagName: string,
  indent: number,
): string {
  const pad = '  '.repeat(indent);

  if (schema.type === 'object' || schema.properties) {
    const children: string[] = [];
    for (const [key, propSchemaRaw] of Object.entries(schema.properties ?? {})) {
      const propSchema = resolveSchema(propSchemaRaw, components);
      if (!propSchema) continue;
      const childName = propSchema.xml?.name ?? key;
      children.push(buildXml(propSchema, components, childName, indent + 1));
    }
    if (children.length === 0) return `${pad}<${tagName}/>`;
    return `${pad}<${tagName}>\n${children.join('\n')}\n${pad}</${tagName}>`;
  }

  if (schema.type === 'array' || schema.items) {
    const itemSchema = resolveSchema(schema.items as Schema, components);
    if (!itemSchema) return `${pad}<${tagName}/>`;

    const itemName = itemSchema.xml?.name ?? tagName;
    const wrapped = schema.xml?.wrapped;

    if (wrapped)
      return `${pad}<${tagName}>\n${buildXml(itemSchema, components, itemName, indent + 1)}\n${pad}</${tagName}>`;
    return buildXml(itemSchema, components, itemName, indent);
  }

  const value = generateSchemaExample(schema, components);
  return `${pad}<${tagName}>${escapeXml(value)}</${tagName}>`;
}

export function generateXmlExample(schema: Schema | undefined, components?: Components): string {
  if (!schema) return '';
  const resolved = resolveSchema(schema, components);
  if (!resolved) return '';
  const rootName = resolved.xml?.name ?? 'root';
  return buildXml(resolved, components, rootName, 0);
}
