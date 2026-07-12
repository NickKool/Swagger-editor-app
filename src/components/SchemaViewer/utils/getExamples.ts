import type { OpenAPIV3 } from '@scalar/openapi-types';

export default function getExamples(
  mediaType: OpenAPIV3.MediaTypeObject,
): Array<{ name?: string; value: unknown }> {
  if (mediaType.examples) {
    return Object.entries(mediaType.examples).map(([exampleName, example]) => ({
      name: exampleName,
      value: 'value' in example ? example.value : example,
    }));
  }

  if (mediaType.example !== undefined) {
    return [{ value: mediaType.example }];
  }

  return [];
}
