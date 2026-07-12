import { describe, it, expect } from 'vitest';
import type { OpenAPI } from '@scalar/openapi-types';

import { getSortedApiSchema } from './sortedSchema';

const makeSpec = (paths: unknown, tags?: unknown, extra: Record<string, unknown> = {}) =>
  ({
    openapi: '3.0.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths,
    ...(tags ? { tags } : {}),
    ...extra,
  }) as unknown as OpenAPI.Document;

describe('getSortedApiSchema', () => {
  it('should group operations by tag and map operation fields inside the tags array', () => {
    const result = getSortedApiSchema(
      makeSpec({
        '/users': {
          get: { tags: ['Users'], summary: 'List users', parameters: [{ name: 'q', in: 'query' }] },
          post: { tags: ['Users'], requestBody: { content: {} }, responses: { '201': {} } },
        },
      }),
    );

    expect(result.openapi).toBe('3.0.0');
    expect(result.info).toEqual({ title: 'Test API', version: '1.0.0' });
    expect(result.tags).toHaveLength(1);
    expect(result.tags[0].name).toBe('Users');
    expect(result.tags[0].operations).toEqual([
      {
        path: '/users',
        method: 'get',
        summary: 'List users',
        description: undefined,
        parameters: [{ name: 'q', in: 'query' }],
        requestBody: undefined,
        responses: {},
      },
      {
        path: '/users',
        method: 'post',
        summary: undefined,
        description: undefined,
        parameters: [],
        requestBody: { content: {} },
        responses: { '201': {} },
      },
    ]);
  });

  it('should fall back to the default tag and duplicate entries across multiple tags', () => {
    const result = getSortedApiSchema(
      makeSpec({
        '/ping': { get: {} },
        '/multi': { get: { tags: ['A', 'B'] } },
      }),
    );

    const defaultTag = result.tags.find((t) => t.name === 'default');
    const tagA = result.tags.find((t) => t.name === 'A');
    const tagB = result.tags.find((t) => t.name === 'B');

    expect(defaultTag?.operations).toHaveLength(1);
    expect(tagA?.operations).toHaveLength(1);
    expect(tagB?.operations).toHaveLength(1);
    expect(tagA?.operations[0]).toEqual(tagB?.operations[0]);
  });

  it('should sort entries within a tag by path then method', () => {
    const result = getSortedApiSchema(
      makeSpec({
        '/b': { get: { tags: ['T'] } },
        '/a': { post: { tags: ['T'] }, get: { tags: ['T'] } },
      }),
    );

    const tagT = result.tags.find((t) => t.name === 'T');
    expect(tagT?.operations.map((op) => `${op.path}-${op.method}`)).toEqual([
      '/a-get',
      '/a-post',
      '/b-get',
    ]);
  });

  it('should skip missing paths, falsy path items, and unsupported methods', () => {
    const resultEmpty = getSortedApiSchema(makeSpec(undefined));
    expect(resultEmpty.tags).toEqual([]);

    const resultValid = getSortedApiSchema(
      makeSpec({ '/gone': null, '/keep': { get: {}, parameters: [] } }),
    );
    expect(resultValid.tags).toHaveLength(1);
    expect(resultValid.tags[0].name).toBe('default');
    expect(resultValid.tags[0].operations).toHaveLength(1);
  });

  it('should bind root specification tag metadata and preserve declared tag order', () => {
    const result = getSortedApiSchema(
      makeSpec(
        {
          '/items': { get: { tags: ['Items'] } },
          '/users': { get: { tags: ['Users'] } },
        },
        [
          { name: 'Users', description: 'User management' },
          {
            name: 'Items',
            description: 'Item management',
            externalDocs: { url: 'https://example.com' },
          },
        ],
      ),
    );

    expect(result.tags).toHaveLength(2);
    expect(result.tags[0]).toEqual({
      name: 'Users',
      description: 'User management',
      externalDocs: undefined,
      operations: [
        {
          path: '/users',
          method: 'get',
          summary: undefined,
          description: undefined,
          parameters: [],
          requestBody: undefined,
          responses: {},
        },
      ],
    });
    expect(result.tags[1].name).toBe('Items');
    expect(result.tags[1].description).toBe('Item management');
  });

  it('should cover fallback logic when optional fields like externalDocs or servers are completely missing', () => {
    const specWithoutOptionalBlocks = {
      openapi: undefined,
      info: { title: 'Fallback API', version: '0.0.1' },
    } as unknown as OpenAPI.Document;

    const result = getSortedApiSchema(specWithoutOptionalBlocks);
    expect(result.openapi).toBeUndefined();
    expect(result.info).toEqual({ title: 'Fallback API', version: '0.0.1' });
    expect(result.externalDocs).toBeUndefined();
    expect(result.servers).toBeUndefined();
    expect(result.tags).toEqual([]);
  });

  it('should cover conditional branches for full optional info, externalDocs, servers, and empty endpoints lists within declared tags', () => {
    const infoWithOptionals = {
      title: 'Full API',
      version: '2.0.0',
      description: 'Main Description',
      termsOfService: 'https://example.com',
      contact: { name: 'Dev Team' },
      license: { name: 'MIT' },
    };

    const serversWithOptionals = [
      {
        url: 'https://api.com',
        description: 'Production',
        variables: { port: { default: '443' } },
      },
    ];

    const result = getSortedApiSchema(
      makeSpec(
        {
          '/active': { get: { tags: ['ActiveTag'] } },
        },
        [
          { name: 'ActiveTag', description: 'Active endpoints' },
          { name: 'EmptyTag', description: 'No endpoints here' },
          { name: '' },
        ],
        {
          info: infoWithOptionals,
          externalDocs: { url: 'https://example.com' },
          servers: serversWithOptionals,
        },
      ),
    );

    expect(result.info.description).toBe('Main Description');
    expect(result.info.termsOfService).toBe('https://example.com');
    expect(result.info.contact).toEqual({ name: 'Dev Team' });
    expect(result.info.license).toEqual({ name: 'MIT' });
    expect(result.externalDocs).toEqual({ url: 'https://example.com' });

    expect(result.servers).toBeDefined();
    expect(result.servers![0].description).toBe('Production');
    expect(result.servers![0].variables).toBeDefined();

    const emptyTagFound = result.tags.find((t) => t.name === 'EmptyTag');
    expect(emptyTagFound).toBeDefined();
    expect(emptyTagFound!.operations).toHaveLength(0);
    expect(result.tags).toHaveLength(2);
  });
});
