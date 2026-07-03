import { create } from 'zustand';
import YAML from 'yaml';
import { validate, dereference } from '@scalar/openapi-parser';
import { DEFAULT_YAML_SCHEMA } from '@/constants/open-api';
import { OpenApiSchemaStoreState, SpecFormat } from './OpenApiSchema.types';

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
  spec: DEFAULT_YAML_SCHEMA,
  format: 'yaml',
  isValid: true,
  error: null,
  parsedSpec: null,

  setSpec: async (newSpec: string) => {
    const detectedFormat = detectFormat(newSpec);

    set({
      spec: newSpec,
      format: detectedFormat,
    });

    if (validationTimeoutId) {
      clearTimeout(validationTimeoutId);
    }

    validationTimeoutId = setTimeout(async () => {
      await get().validateAndParseSpec();
    }, 400);
  },

  toggleFormat: () => {
    const { spec, format, isValid } = get();
    const targetFormat: SpecFormat = format === 'json' ? 'yaml' : 'json';

    if (!isValid) {
      return;
    }

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

useOpenApiSchemaStore.getState().validateAndParseSpec();
