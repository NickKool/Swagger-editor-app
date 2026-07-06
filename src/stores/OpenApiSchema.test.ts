import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validate, dereference } from '@scalar/openapi-parser';
import { useOpenApiSchemaStore } from './OpenApiSchema';
import { fetchSchema } from '@/actions/schema';
import { OpenAPI } from '@scalar/openapi-types';
import YAML from 'yaml';

vi.mock('@scalar/openapi-parser', () => ({
  validate: vi.fn(),
  dereference: vi.fn(),
}));

vi.mock('@/actions/schema', () => ({
  fetchSchema: vi.fn(),
}));

vi.mock('@/constants/open-api', () => ({
  DEFAULT_YAML_SCHEMA: 'openapi: 3.0.0',
}));

type ValidateResult = Awaited<ReturnType<typeof validate>>;
type DereferenceResult = Awaited<ReturnType<typeof validate>>;

const MOCK_VALIDATE_SUCCESS_RESULT: ValidateResult = {
  valid: true,
  version: '3.0',
  specification: {
    openapi: '3.0.0',
    info: { title: 'Test', version: '1.0.0' },
    paths: {},
  },
  schema: {
    openapi: '3.0.0',
    info: { title: 'Test', version: '1.0.0' },
    paths: {},
  },
  errors: [],
};

const MOCK_VALIDATE_FAIL_RESULT: ValidateResult = {
  valid: false,
  errors: [{ message: 'SyntaxError' }],
};

const MOCK_SCHEMA_DOCUMENT: Awaited<ReturnType<typeof fetchSchema>> = {
  rawText: 'openapi: 3.1.0',
  updatedAt: '2026-01-01',
  userId: 'user-123',
  name: 'Test Schema',
  version: '1.0.0',
  formatUsed: 'yaml',
};

describe('useOpenApiSchemaStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(validate).mockReset();
    vi.mocked(dereference).mockReset();
    vi.mocked(fetchSchema).mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});

    useOpenApiSchemaStore.setState({
      spec: 'openapi: 3.0.0',
      format: 'yaml',
      isValid: true,
      error: null,
      parsedSpec: null,
      hasInitialized: false,
      isLoading: false,
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should initialize with default states and values', () => {
    const state = useOpenApiSchemaStore.getState();
    expect(state.spec).toBe('openapi: 3.0.0');
    expect(state.format).toBe('yaml');
    expect(state.isValid).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should initialize with default spec when no uid is provided', async () => {
    await useOpenApiSchemaStore.getState().initializeSchema(false);

    const state = useOpenApiSchemaStore.getState();
    expect(state.hasInitialized).toBe(true);
    expect(state.spec).toBe('openapi: 3.0.0');
    expect(vi.mocked(fetchSchema)).not.toHaveBeenCalled();
  });

  it('should fetch and set schema text when uid is provided', async () => {
    vi.mocked(fetchSchema).mockResolvedValue(MOCK_SCHEMA_DOCUMENT);

    await useOpenApiSchemaStore.getState().initializeSchema(false, 'schema-123');

    const state = useOpenApiSchemaStore.getState();
    expect(vi.mocked(fetchSchema)).toHaveBeenCalledWith('schema-123');
    expect(state.spec).toBe('openapi: 3.1.0');
    expect(state.hasInitialized).toBe(true);
  });

  it('should set default schema when fetched schema document lacks raw text', async () => {
    vi.mocked(fetchSchema).mockResolvedValue(MOCK_SCHEMA_DOCUMENT);

    await useOpenApiSchemaStore.getState().initializeSchema(false, 'schema-empty');

    const state = useOpenApiSchemaStore.getState();
    expect(state.spec).toBe('openapi: 3.1.0');
    expect(state.hasInitialized).toBe(true);
  });

  it('should update error states and rethrow when initialization API fails', async () => {
    vi.mocked(fetchSchema).mockRejectedValue(new Error('Network failure'));

    await expect(
      useOpenApiSchemaStore.getState().initializeSchema(false, 'schema-fail'),
    ).rejects.toThrow('Network failure');

    const state = useOpenApiSchemaStore.getState();
    expect(state.isValid).toBe(false);
    expect(state.hasInitialized).toBe(true);
    expect(state.error).toEqual({
      key: 'errors.fetchFailed',
      fallback: 'Network failure',
    });
  });

  it('should stop initialization routine when auth conditions are loading', async () => {
    await useOpenApiSchemaStore.getState().initializeSchema(true);

    const state = useOpenApiSchemaStore.getState();
    expect(state.hasInitialized).toBe(false);
  });

  it('should detect yaml format and set spec target values', async () => {
    vi.mocked(validate).mockResolvedValue(MOCK_VALIDATE_SUCCESS_RESULT);

    vi.mocked(dereference).mockResolvedValue({
      schema: { openapi: '3.1.0' } as OpenAPI.Document,
    });

    await useOpenApiSchemaStore.getState().setSpec('openapi: 3.1.0');

    expect(useOpenApiSchemaStore.getState().spec).toBe('openapi: 3.1.0');
    expect(useOpenApiSchemaStore.getState().format).toBe('yaml');
  });

  it('should detect json format when string begins with brackets', async () => {
    vi.mocked(validate).mockResolvedValue(MOCK_VALIDATE_SUCCESS_RESULT);

    vi.mocked(dereference).mockResolvedValue({
      schema: {} as OpenAPI.Document,
    });

    await useOpenApiSchemaStore.getState().setSpec('{"openapi": "3.0.0"}');

    expect(useOpenApiSchemaStore.getState().format).toBe('json');
  });

  it('should fallback to json when string matching brackets causes parse errors', async () => {
    vi.mocked(validate).mockResolvedValue(MOCK_VALIDATE_FAIL_RESULT);

    await useOpenApiSchemaStore.getState().setSpec('{ invalid json');

    expect(useOpenApiSchemaStore.getState().format).toBe('json');
  });

  it('should initialize with default schema when auth is not loading and uid is missing', async () => {
    vi.mocked(validate).mockResolvedValue(MOCK_VALIDATE_SUCCESS_RESULT);

    vi.mocked(dereference).mockResolvedValue({
      schema: { openapi: '3.0.0' },
    } as DereferenceResult);

    await useOpenApiSchemaStore.getState().initializeSchema(false);

    const state = useOpenApiSchemaStore.getState();
    expect(state.hasInitialized).toBe(true);
    expect(state.spec).toBe('openapi: 3.0.0');
    expect(vi.mocked(fetchSchema)).not.toHaveBeenCalled();
  });

  it('should set error markers when parsing empty schemas', async () => {
    await useOpenApiSchemaStore.getState().setSpec('   ');
    await vi.advanceTimersByTimeAsync(400);

    const state = useOpenApiSchemaStore.getState();
    expect(state.isValid).toBe(false);
    expect(state.error?.key).toBe('errors.empty');
  });

  it('should handle syntax validation failures from parser engines', async () => {
    vi.mocked(validate).mockResolvedValue({
      valid: false,
      errors: [{ message: 'Missing version parameter key' }],
    });

    await useOpenApiSchemaStore.getState().setSpec('invalid-yaml');
    await vi.advanceTimersByTimeAsync(400);

    const state = useOpenApiSchemaStore.getState();
    expect(state.isValid).toBe(false);
    expect(state.error?.key).toBe('errors.invalidStructure');
    expect(state.error?.fallback).toBe('Missing version parameter key');
  });

  it('should use default error message when parser validation misses error descriptions', async () => {
    vi.mocked(validate).mockResolvedValue({
      valid: false,
      errors: [],
    });

    await useOpenApiSchemaStore.getState().setSpec('invalid-yaml-no-message');
    await vi.advanceTimersByTimeAsync(400);

    const state = useOpenApiSchemaStore.getState();
    expect(state.isValid).toBe(false);
    expect(state.error?.fallback).toBe('Invalid layout');
  });

  it('should handle runtime exceptions inside schema validation process blocks', async () => {
    vi.mocked(validate).mockRejectedValue(new Error('Fatal error'));

    await useOpenApiSchemaStore.getState().setSpec('crash-trigger');
    await vi.advanceTimersByTimeAsync(400);

    const state = useOpenApiSchemaStore.getState();
    expect(state.isValid).toBe(false);
    expect(state.error?.key).toBe('errors.syntaxError');
    expect(state.error?.fallback).toBe('Fatal error');
  });

  it('should handle string based syntax errors without standard stack error types', async () => {
    vi.mocked(validate).mockRejectedValue('Unknown error payload string');

    await useOpenApiSchemaStore.getState().setSpec('string-crash-trigger');
    await vi.advanceTimersByTimeAsync(400);

    const state = useOpenApiSchemaStore.getState();
    expect(state.isValid).toBe(false);
    expect(state.error?.fallback).toBe('Syntax error');
  });

  it('should convert content profiles during toggle format switches from yaml to json', () => {
    useOpenApiSchemaStore.setState({
      spec: 'title: Test App',
      format: 'yaml',
      isValid: true,
      error: null,
      parsedSpec: null,
      hasInitialized: false,
      isLoading: false,
    });

    useOpenApiSchemaStore.getState().toggleFormat();

    const state = useOpenApiSchemaStore.getState();
    expect(state.format).toBe('json');
    expect(JSON.parse(state.spec)).toEqual({ title: 'Test App' });
  });

  it('should convert content profiles during toggle format switches from json to yaml', () => {
    useOpenApiSchemaStore.setState({
      spec: '{"title": "Test App"}',
      format: 'json',
      isValid: true,
      error: null,
      parsedSpec: null,
      hasInitialized: false,
      isLoading: false,
    });

    useOpenApiSchemaStore.getState().toggleFormat();

    const state = useOpenApiSchemaStore.getState();
    expect(state.format).toBe('yaml');
    expect(YAML.parse(state.spec)).toEqual({ title: 'Test App' });
  });

  it('should skip structural conversion changes when schema is invalid', () => {
    useOpenApiSchemaStore.setState({
      spec: '!!!',
      format: 'yaml',
      isValid: false,
      error: null,
      parsedSpec: null,
      hasInitialized: false,
      isLoading: false,
    });

    useOpenApiSchemaStore.getState().toggleFormat();

    expect(useOpenApiSchemaStore.getState().format).toBe('yaml');
  });

  it('should fallback to error records if conversion parsing crashes', () => {
    useOpenApiSchemaStore.setState({
      spec: '{"unclosed json',
      format: 'json',
      isValid: true,
      error: null,
      parsedSpec: null,
      hasInitialized: false,
      isLoading: false,
    });

    useOpenApiSchemaStore.getState().toggleFormat();

    const state = useOpenApiSchemaStore.getState();
    expect(state.isValid).toBe(false);
    expect(state.error?.key).toBe('errors.conversionFailed');
  });

  it('should fallback to plain fallback text when conversion crashes without standard error objects', () => {
    useOpenApiSchemaStore.setState({
      spec: 'title: Test App',
      format: 'yaml',
      isValid: true,
      error: null,
      parsedSpec: null,
      hasInitialized: false,
      isLoading: false,
    });

    vi.spyOn(YAML, 'parse').mockImplementation(() => {
      throw 'Plain string error rejection';
    });

    useOpenApiSchemaStore.getState().toggleFormat();

    const state = useOpenApiSchemaStore.getState();
    expect(state.isValid).toBe(false);
    expect(state.error?.fallback).toBe('Syntax error');
    vi.restoreAllMocks();
  });

  it('should fallback to default schema when fetched schema document lacks raw text', async () => {
    const mockEmptySchemaDocument = {
      ...MOCK_SCHEMA_DOCUMENT,
      rawText: '',
    };

    vi.mocked(fetchSchema).mockResolvedValue(mockEmptySchemaDocument);

    await useOpenApiSchemaStore.getState().initializeSchema(false, 'schema-empty');

    const state = useOpenApiSchemaStore.getState();
    expect(state.spec).toBe('openapi: 3.0.0');
    expect(state.hasInitialized).toBe(true);
  });

  it('should fallback to default error message text when initialization API rejects with a plain string instead of an Error object', async () => {
    vi.mocked(fetchSchema).mockRejectedValue('Fatal database disconnection string');

    await expect(
      useOpenApiSchemaStore.getState().initializeSchema(false, 'schema-string-fail'),
    ).rejects.toBe('Fatal database disconnection string');

    const state = useOpenApiSchemaStore.getState();
    expect(state.isValid).toBe(false);
    expect(state.hasInitialized).toBe(true);
    expect(state.error?.fallback).toBe('Failed to fetch schema');
  });
});
