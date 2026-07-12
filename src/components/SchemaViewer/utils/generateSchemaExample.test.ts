import { describe, test, expect, vi, afterEach } from 'vitest';
import generateSchemaExample, { generateXmlExample } from './generateSchemaExample';
import type { OpenAPIV3 } from '@scalar/openapi-types';

type Components = OpenAPIV3.ComponentsObject;

function ref(name: string): OpenAPIV3.ReferenceObject {
  return { $ref: `#/components/schemas/${name}` };
}

afterEach(() => vi.useRealTimers());

describe('generateSchemaExample', () => {
  test('undefined schema / unresolvable $ref', () => {
    expect(generateSchemaExample(undefined)).toBeUndefined();
    expect(generateSchemaExample(ref('Missing'))).toEqual({});
    expect(generateSchemaExample(ref('Missing'), { schemas: {} })).toEqual({});
  });

  test('resolves $ref against components.schemas', () => {
    const components: Components = {
      schemas: { Pet: { type: 'object', properties: { name: { type: 'string' } } } },
    };
    expect(generateSchemaExample(ref('Pet'), components)).toEqual({ name: 'string' });
  });

  test('priority: example > default > enum[0], keeping falsy values', () => {
    expect(generateSchemaExample({ type: 'string', example: 'e', default: 'd', enum: ['a'] })).toBe(
      'e',
    );
    expect(generateSchemaExample({ type: 'string', default: 'd', enum: ['a'] })).toBe('d');
    expect(generateSchemaExample({ type: 'string', enum: ['a', 'b'] })).toBe('a');
    expect(generateSchemaExample({ type: 'integer', example: 0 })).toBe(0);
    expect(generateSchemaExample({ type: 'boolean', example: false })).toBe(false);
  });

  const primitiveCases: Array<{
    type: 'string' | 'integer' | 'number' | 'boolean';
    expected: unknown;
  }> = [
    { type: 'string', expected: 'string' },
    { type: 'integer', expected: 0 },
    { type: 'number', expected: 0 },
    { type: 'boolean', expected: true },
  ];
  test.each(primitiveCases)('placeholder for type "$type"', ({ type, expected }) => {
    expect(generateSchemaExample({ type })).toBe(expected);
  });

  test('null for unrecognized type', () => {
    expect(generateSchemaExample({})).toBeNull();
  });

  const formatCases: Array<{ format: string; expected: string }> = [
    { format: 'date-time', expected: '2024-01-15T10:00:00.000Z' },
    { format: 'date', expected: '2024-01-15' },
    { format: 'email', expected: 'user@example.com' },
    { format: 'uuid', expected: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
    { format: 'binary', expected: 'string' },
  ];
  test.each(formatCases)('string format "$format"', ({ format, expected }) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T10:00:00.000Z'));
    expect(generateSchemaExample({ type: 'string', format })).toBe(expected);
  });

  test('objects: flat, nested, $ref props, no-type, empty', () => {
    expect(
      generateSchemaExample({
        type: 'object',
        properties: { id: { type: 'integer' }, name: { type: 'string' } },
      }),
    ).toEqual({ id: 0, name: 'string' });
    expect(
      generateSchemaExample({
        type: 'object',
        properties: { user: { type: 'object', properties: { name: { type: 'string' } } } },
      }),
    ).toEqual({ user: { name: 'string' } });
    expect(generateSchemaExample({ properties: { id: { type: 'integer' } } })).toEqual({ id: 0 });
    expect(generateSchemaExample({ type: 'object' })).toEqual({});

    const components: Components = {
      schemas: { Address: { type: 'object', properties: { city: { type: 'string' } } } },
    };
    expect(
      generateSchemaExample(
        { type: 'object', properties: { address: ref('Address') } },
        components,
      ),
    ).toEqual({ address: { city: 'string' } });
  });

  test('arrays: single item, objects, $ref items, no-type', () => {
    expect(generateSchemaExample({ type: 'array', items: { type: 'string' } })).toEqual(['string']);
    expect(
      generateSchemaExample({
        type: 'array',
        items: { type: 'object', properties: { id: { type: 'integer' } } },
      }),
    ).toEqual([{ id: 0 }]);
    expect(generateSchemaExample({ items: { type: 'integer' } })).toEqual([0]);

    const components: Components = { schemas: { Tag: { type: 'string', example: 'tag-1' } } };
    expect(generateSchemaExample({ type: 'array', items: ref('Tag') }, components)).toEqual([
      'tag-1',
    ]);
  });
});

describe('generateXmlExample', () => {
  test('undefined / unresolvable $ref -> empty string', () => {
    expect(generateXmlExample(undefined)).toBe('');
    expect(generateXmlExample(ref('Missing'), { schemas: {} })).toBe('');
  });

  test('root tag name: "root" default, or schema.xml.name', () => {
    expect(generateXmlExample({ type: 'string', example: 'hello' })).toBe('<root>hello</root>');
    expect(
      generateXmlExample({ type: 'string', example: 'hello', xml: { name: 'Greeting' } }),
    ).toBe('<Greeting>hello</Greeting>');
  });

  test('objects: indented children, self-closes when empty', () => {
    expect(
      generateXmlExample({
        type: 'object',
        xml: { name: 'Pet' },
        properties: { id: { type: 'integer' }, name: { type: 'string' } },
      }),
    ).toBe('<Pet>\n  <id>0</id>\n  <name>string</name>\n</Pet>');
    expect(generateXmlExample({ type: 'object', xml: { name: 'Empty' } })).toBe('<Empty/>');
  });

  test('$ref properties: resolved and rendered, unresolved ones skipped', () => {
    const components: Components = {
      schemas: {
        Address: { type: 'object', properties: { city: { type: 'string', example: 'NYC' } } },
      },
    };
    expect(
      generateXmlExample(
        { type: 'object', xml: { name: 'Root' }, properties: { address: ref('Address') } },
        components,
      ),
    ).toBe('<Root>\n  <address>\n    <city>NYC</city>\n  </address>\n</Root>');

    expect(
      generateXmlExample(
        {
          type: 'object',
          xml: { name: 'Root' },
          properties: { missing: ref('Missing'), name: { type: 'string', example: 'ok' } },
        },
        { schemas: {} },
      ),
    ).toBe('<Root>\n  <name>ok</name>\n</Root>');
  });

  test('array self-closes when items unresolvable', () => {
    expect(
      generateXmlExample(
        { type: 'array', xml: { name: 'Items' }, items: ref('Missing') },
        { schemas: {} },
      ),
    ).toBe('<Items/>');
  });

  test('unwrapped vs wrapped arrays, item xml.name takes priority over array name', () => {
    expect(
      generateXmlExample({
        type: 'array',
        xml: { name: 'tags' },
        items: { type: 'string', example: 'a' },
      }),
    ).toBe('<tags>a</tags>');
    expect(
      generateXmlExample({
        type: 'array',
        xml: { name: 'tags' },
        items: { type: 'string', example: 'a', xml: { name: 'tag' } },
      }),
    ).toBe('<tag>a</tag>');
    expect(
      generateXmlExample({
        type: 'array',
        xml: { name: 'tags', wrapped: true },
        items: { type: 'string', example: 'a' },
      }),
    ).toBe('<tags>\n  <tags>a</tags>\n</tags>');
    expect(
      generateXmlExample({
        type: 'array',
        xml: { name: 'tags', wrapped: true },
        items: { type: 'string', example: 'a', xml: { name: 'tag' } },
      }),
    ).toBe('<tags>\n  <tag>a</tag>\n</tags>');
  });

  test('array of objects: nested indentation', () => {
    expect(
      generateXmlExample({
        type: 'array',
        xml: { name: 'pets' },
        items: { type: 'object', xml: { name: 'pet' }, properties: { id: { type: 'integer' } } },
      }),
    ).toBe('<pet>\n  <id>0</id>\n</pet>');
  });

  test('escapes &, < and > in leaf values', () => {
    expect(
      generateXmlExample({ type: 'string', example: 'Tom & Jerry <3', xml: { name: 'note' } }),
    ).toBe('<note>Tom &amp; Jerry &lt;3</note>');
  });
});
