import type { OpenAPI, OpenAPIV3 } from '@scalar/openapi-types';

const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'] as const;
type HttpMethod = (typeof HTTP_METHODS)[number];

export interface ApiOperation {
  path: string;
  method: HttpMethod;
  summary?: string;
  description?: string;
  parameters: OpenAPIV3.ParameterObject[];
  requestBody?: OpenAPIV3.RequestBodyObject;
  responses: Record<string, OpenAPIV3.ResponseObject>;
}

export type OperationsByTag = Record<string, ApiOperation[]>;

const DEFAULT_TAG = 'default';

export function groupPathsByTag(spec: OpenAPI.Document): OperationsByTag {
  const result: OperationsByTag = {};
  if (!spec.paths) return result;

  for (const [path, pathItem] of Object.entries(spec.paths)) {
    if (!pathItem) continue;

    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];
      if (!operation) continue;

      const entry: ApiOperation = {
        path,
        method,
        summary: operation.summary,
        description: operation.description,
        parameters: (operation.parameters ?? []) as OpenAPIV3.ParameterObject[],
        requestBody: operation.requestBody as OpenAPIV3.RequestBodyObject | undefined,
        responses: (operation.responses ?? {}) as Record<string, OpenAPIV3.ResponseObject>,
      };

      const tags = operation.tags?.length ? operation.tags : [DEFAULT_TAG];
      for (const tag of tags) {
        (result[tag] ??= []).push(entry);
      }
    }
  }

  for (const list of Object.values(result)) {
    list.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));
  }

  return result;
}
