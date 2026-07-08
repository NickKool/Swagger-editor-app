import { create } from 'zustand';
import YAML from 'yaml';
import { validate, dereference } from '@scalar/openapi-parser';
import { DEFAULT_YAML_SCHEMA } from '@/constants/open-api';
import { OpenApiSchemaStoreState, SpecFormat } from './OpenApiSchema.types';
import { fetchSchema, saveSchema } from '@/actions/schema';

const VALIDATION_DEBOUNCE_MS = 400;

let validationTimeoutId: NodeJS.Timeout | null = null;

const detectFormat = (text: string): SpecFormat => {
  const trimmed = text.trim();

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      return 'json';
    }
  }

  return 'yaml';
};

export const useOpenApiSchemaStore = create<OpenApiSchemaStoreState>((set, get) => ({
  spec: '',
  format: 'yaml',
  isValid: true,
  error: null,
  parsedSpec: null,
  hasInitialized: false,
  isSynced: false,
  isLoading: false,
  isSaving: false,

  setUnsynced: () => {
    set({ isSynced: false });
  },

  initializeSchema: async (authLoading: boolean, uid?: string, force?: boolean) => {
    if (authLoading || get().isLoading || (get().hasInitialized && !force)) return;

    if (!uid) {
      await get().setSpec(DEFAULT_YAML_SCHEMA, false);
      set({ hasInitialized: true });
      return;
    }

    set({ hasInitialized: false, isLoading: true, error: null });

    try {
      const schemaDocument = await fetchSchema(uid);
      if (schemaDocument?.rawText) {
        await get().setSpec(schemaDocument.rawText, true);
      } else {
        await get().setSpec(DEFAULT_YAML_SCHEMA, true);
      }
      set({ hasInitialized: true, isSynced: true });
    } catch (err: unknown) {
      console.error(err);
      await get().setSpec(DEFAULT_YAML_SCHEMA, false);
      set({
        isValid: false,
        hasInitialized: true,
      });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  saveCurrentSchema: async (uid: string) => {
    const { spec, format, parsedSpec, isValid, isSaving } = get();

    if (!isValid || !parsedSpec || isSaving) return;

    set({ isSaving: true });

    try {
      await saveSchema({
        userId: uid,
        spec,
        format,
        parsedSpec,
      });

      set({ isSynced: true });
    } catch (err: unknown) {
      console.error(err);
      throw err;
    } finally {
      set({ isSaving: false });
    }
  },

  setSpec: async (newSpec: string, synced?: boolean) => {
    const detectedFormat = detectFormat(newSpec);

    set((state) => ({
      spec: newSpec,
      format: detectedFormat,
      isSynced: synced === undefined ? state.isSynced : synced,
    }));

    if (validationTimeoutId) {
      clearTimeout(validationTimeoutId);
    }

    validationTimeoutId = setTimeout(async () => {
      await get().validateAndParseSpec();
    }, VALIDATION_DEBOUNCE_MS);
  },

  toggleFormat: () => {
    const { spec, format, isValid } = get();
    const targetFormat: SpecFormat = format === 'json' ? 'yaml' : 'json';

    if (!isValid) return;

    try {
      const parsedObject = format === 'json' ? JSON.parse(spec) : YAML.parse(spec);
      const convertedText =
        targetFormat === 'json'
          ? JSON.stringify(parsedObject, null, 2)
          : YAML.stringify(parsedObject);

      set({
        spec: convertedText,
        format: targetFormat,
        error: null,
        isValid: true,
      });
    } catch (err: unknown) {
      set({
        isValid: false,
        error: {
          key: 'errors.conversionFailed',
          fallback: err instanceof Error ? err.message : 'Syntax error',
        },
      });
    }
  },

  validateAndParseSpec: async () => {
    const { spec, format } = get();

    if (!spec.trim()) {
      set({
        isValid: false,
        parsedSpec: null,
        error: { key: 'errors.empty' },
      });
      return;
    }

    try {
      const rawObject = format === 'json' ? JSON.parse(spec) : YAML.parse(spec);

      const validation = await validate(rawObject);
      if (!validation.valid) {
        const firstError = validation.errors?.[0]?.message || 'Invalid layout';
        set({
          isValid: false,
          parsedSpec: null,
          error: { key: 'errors.invalidStructure', fallback: firstError },
        });
        return;
      }

      const { schema } = await dereference(rawObject);
      set({ isValid: true, error: null, parsedSpec: schema });
    } catch (err: unknown) {
      set({
        isValid: false,
        parsedSpec: null,
        error: {
          key: 'errors.syntaxError',
          fallback: err instanceof Error ? err.message : 'Syntax error',
        },
      });
    }
  },
}));
