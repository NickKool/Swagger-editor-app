import { describe, it, expect } from 'vitest';
import type { OpenAPIV3 } from '@scalar/openapi-types';

import getExamples from './getExamples';

describe('getExamples', () => {
  it('maps the examples map to name/value pairs, unwrapping "value" when present', () => {
    const mediaType = {
      examples: {
        ok: { value: { id: 1 } },
        ref: { $ref: '#/components/examples/Foo' },
      },
    } as unknown as OpenAPIV3.MediaTypeObject;

    expect(getExamples(mediaType)).toEqual([
      { name: 'ok', value: { id: 1 } },
      { name: 'ref', value: { $ref: '#/components/examples/Foo' } },
    ]);
  });

  it('falls back to a single unnamed example when only "example" is set', () => {
    const mediaType = { example: { id: 2 } } as OpenAPIV3.MediaTypeObject;

    expect(getExamples(mediaType)).toEqual([{ value: { id: 2 } }]);
  });

  it('prefers "examples" over "example" when both are present', () => {
    const mediaType = {
      examples: { a: { value: 1 } },
      example: 2,
    } as unknown as OpenAPIV3.MediaTypeObject;

    expect(getExamples(mediaType)).toEqual([{ name: 'a', value: 1 }]);
  });

  it('returns an empty array when neither is set', () => {
    expect(getExamples({} as OpenAPIV3.MediaTypeObject)).toEqual([]);
  });
});
