import { describe, it, expect } from 'vitest';
import type { OpenAPI } from '@scalar/openapi-types';

import { groupPathsByTag } from './sorting';

const spec = (paths: unknown) => ({ paths }) as unknown as OpenAPI.Document;

describe('groupPathsByTag', () => {
  it('groups operations by tag and maps operation fields', () => {
    const result = groupPathsByTag(
      spec({
        '/users': {
          get: { tags: ['Users'], summary: 'List users', parameters: [{ name: 'q', in: 'query' }] },
          post: { tags: ['Users'], requestBody: { content: {} }, responses: { '201': {} } },
        },
      }),
    );

    expect(Object.keys(result)).toEqual(['Users']);
    expect(result.Users).toEqual([
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

  it('falls back to the default tag and duplicates entries across multiple tags', () => {
    const result = groupPathsByTag(
      spec({
        '/ping': { get: {} },
        '/multi': { get: { tags: ['A', 'B'] } },
      }),
    );

    expect(result.default).toHaveLength(1);
    expect(result.A).toHaveLength(1);
    expect(result.B).toHaveLength(1);
    expect(result.A[0]).toEqual(result.B[0]);
  });

  it('sorts entries within a tag by path then method', () => {
    const result = groupPathsByTag(
      spec({
        '/b': { get: { tags: ['T'] } },
        '/a': { post: { tags: ['T'] }, get: { tags: ['T'] } },
      }),
    );

    expect(result.T.map((op) => `${op.path}-${op.method}`)).toEqual([
      '/a-get',
      '/a-post',
      '/b-get',
    ]);
  });

  it('skips missing paths, falsy path items, and unsupported methods', () => {
    expect(groupPathsByTag(spec(undefined))).toEqual({});

    const result = groupPathsByTag(spec({ '/gone': null, '/keep': { get: {}, parameters: [] } }));
    expect(Object.keys(result)).toEqual(['default']);
    expect(result.default).toHaveLength(1);
  });
});
