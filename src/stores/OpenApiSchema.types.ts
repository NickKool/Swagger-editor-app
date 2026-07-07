import type { OpenAPI } from '@scalar/openapi-types';

import { LocalizedError } from '@/types/localized-error';

export type SpecFormat = 'yaml' | 'json';

export interface OpenApiSchemaStoreState {
  spec: string;
  format: SpecFormat;
  isValid: boolean;
  error: LocalizedError | null;
  parsedSpec: OpenAPI.Document | null;
  hasInitialized: boolean;
  isLoading: boolean;

  initializeSchema: (authLoading: boolean, uid?: string) => Promise<void>;
  setSpec: (newSpec: string) => Promise<void>;
  toggleFormat: () => void;
  validateAndParseSpec: () => Promise<void>;
}
