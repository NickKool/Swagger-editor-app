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
  isSynced: boolean;
  isLoading: boolean;
  isSaving: boolean;

  setUnsynced: () => void;

  initializeSchema: (authLoading: boolean, uid?: string, force?: boolean) => Promise<void>;
  saveCurrentSchema: (uid: string) => Promise<void>;
  setSpec: (newSpec: string, synced?: boolean) => Promise<void>;
  toggleFormat: () => void;
  validateAndParseSpec: () => Promise<void>;
}
