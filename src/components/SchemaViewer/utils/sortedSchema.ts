import type { OpenAPI, OpenAPIV3 } from '@scalar/openapi-types';

const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'] as const;
type HttpMethod = (typeof HTTP_METHODS)[number];

export interface SortedApiSchema {
  openapi: string | undefined;
  info: ApiSchemaInfo;
  externalDocs?: OpenAPIV3.ExternalDocumentationObject;
  servers?: ApiSchemaServer[];
  tags: ApiOperationTag[];
}

export interface ApiSchemaInfo {
  title: string;
  description?: string;
  termsOfService?: string;
  contact?: OpenAPIV3.ContactObject;
  license?: OpenAPIV3.LicenseObject;
  version: string;
}

export interface ApiSchemaServer {
  url: string;
  description?: string;
  variables?: Record<string, OpenAPIV3.ServerVariableObject>;
}

export interface ApiOperationTag {
  name: string;
  description?: string;
  externalDocs?: OpenAPIV3.ExternalDocumentationObject;
  operations: ApiOperation[];
}

export interface ApiOperation {
  path: string;
  method: HttpMethod;
  summary?: string;
  description?: string;
  parameters: OpenAPIV3.ParameterObject[];
  requestBody?: OpenAPIV3.RequestBodyObject;
  responses: Record<string, OpenAPIV3.ResponseObject>;
}

const DEFAULT_TAG = 'default';

function extractBasic(spec: OpenAPI.Document): SortedApiSchema {
  const openapiVersion = spec.openapi;
  const infoObj = spec.info as OpenAPIV3.InfoObject;

  const info: ApiSchemaInfo = {
    title: infoObj.title!,
    version: infoObj.version!,
  };

  if (infoObj.description) info.description = infoObj.description;
  if (infoObj.termsOfService) info.termsOfService = infoObj.termsOfService;
  if (infoObj.contact) info.contact = infoObj.contact as OpenAPIV3.ContactObject;
  if (infoObj.license) info.license = infoObj.license as OpenAPIV3.LicenseObject;

  const result: SortedApiSchema = {
    openapi: openapiVersion,
    info,
    tags: [],
  };

  if ('externalDocs' in spec && spec.externalDocs) {
    result.externalDocs = spec.externalDocs as OpenAPIV3.ExternalDocumentationObject;
  }

  if ('servers' in spec && Array.isArray(spec.servers)) {
    result.servers = (spec.servers as OpenAPIV3.ServerObject[]).map((server) => {
      const serverNode: ApiSchemaServer = { url: server.url! };
      if (server.description) serverNode.description = server.description;
      if (server.variables)
        serverNode.variables = server.variables as Record<string, OpenAPIV3.ServerVariableObject>;
      return serverNode;
    });
  }

  return result;
}

export function getSortedApiSchema(spec: OpenAPI.Document): SortedApiSchema {
  const result = extractBasic(spec);
  const cache: Record<string, ApiOperation[]> = {};

  if (spec.paths) {
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
          (cache[tag] ??= []).push(entry);
        }
      }
    }
  }

  for (const operations of Object.values(cache)) {
    operations.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));
  }

  const processedTags = new Set<string>();

  if ('tags' in spec && Array.isArray(spec.tags)) {
    for (const tagObj of spec.tags as OpenAPIV3.TagObject[]) {
      if (tagObj.name) {
        result.tags.push({
          name: tagObj.name,
          description: tagObj.description,
          externalDocs: tagObj.externalDocs,
          operations: cache[tagObj.name] ?? [],
        });
        processedTags.add(tagObj.name);
      }
    }
  }

  for (const [tagName, operations] of Object.entries(cache)) {
    if (!processedTags.has(tagName)) {
      result.tags.push({
        name: tagName,
        operations,
      });
    }
  }

  return result;
}
