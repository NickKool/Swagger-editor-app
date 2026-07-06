import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validate, dereference } from '@scalar/openapi-parser';
import { useOpenApiSchemaStore } from './OpenApiSchema';
import { OpenApiSchemaStoreState } from './OpenApiSchema.types';
import { OpenAPI } from '@scalar/openapi-types';
import YAML from 'yaml';

vi.mock('@scalar/openapi-parser', () => ({
  validate: vi.fn(),
  dereference: vi.fn(),
}));

vi.mock('@/constants/open-api', () => ({
  DEFAULT_YAML_SCHEMA: 'openapi: 3.0.0',
}));

type ValidateReturn = Awaited<ReturnType<typeof validate>>;
type DereferenceReturn = Awaited<ReturnType<typeof dereference>>;

describe('useOpenApiSchemaStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(validate).mockReset();
    vi.mocked(dereference).mockReset();

    useOpenApiSchemaStore.setState({
      spec: 'openapi: 3.0.0',
      format: 'yaml',
      isValid: true,
      error: null,
      parsedSpec: null,
    } as OpenApiSchemaStoreState);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should initialize with default states and values', () => {
    const state = useOpenApiSchemaStore.getState();
    expect(state.spec).toBe('openapi: 3.0.0');
    expect(state.format).toBe('yaml');
    expect(state.isValid).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should detect yaml format and set spec target values', async () => {
    vi.mocked(validate).mockResolvedValue({
      valid: true,
      specification: {} as unknown,
      version: '3.0',
      schema: {} as unknown,
    } as unknown as ValidateReturn);

    vi.mocked(dereference).mockResolvedValue({
      schema: { openapi: '3.0.0' } as unknown as OpenAPI.Document,
    } as unknown as DereferenceReturn);

    await useOpenApiSchemaStore.getState().setSpec('openapi: 3.1.0');

    expect(useOpenApiSchemaStore.getState().spec).toBe('openapi: 3.1.0');
    expect(useOpenApiSchemaStore.getState().format).toBe('yaml');
  });

  it('should detect json format when string begins with brackets', async () => {
    vi.mocked(validate).mockResolvedValue({
      valid: true,
      specification: {} as unknown,
      version: '3.0',
      schema: {} as unknown,
    } as unknown as ValidateReturn);

    vi.mocked(dereference).mockResolvedValue({
      schema: {} as unknown as OpenAPI.Document,
    } as unknown as DereferenceReturn);

    await useOpenApiSchemaStore.getState().setSpec('{"openapi": "3.0.0"}');

    expect(useOpenApiSchemaStore.getState().format).toBe('json');
  });

  it('should fallback to json when string matching brackets causes parse errors', async () => {
    vi.mocked(validate).mockResolvedValue({
      valid: false,
      errors: [{ message: 'SyntaxError' } as unknown],
    } as unknown as ValidateReturn);

    await useOpenApiSchemaStore.getState().setSpec('{ invalid json');

    expect(useOpenApiSchemaStore.getState().format).toBe('json');
  });

  it('should debounce input validation parsing logic runs', async () => {
    vi.mocked(validate).mockResolvedValue({
      valid: true,
      specification: {} as unknown,
      version: '3.0',
      schema: {} as unknown,
    } as unknown as ValidateReturn);

    vi.mocked(dereference).mockResolvedValue({
      schema: {} as unknown as OpenAPI.Document,
    } as unknown as DereferenceReturn);

    await useOpenApiSchemaStore.getState().setSpec('test-1');
    await useOpenApiSchemaStore.getState().setSpec('test-2');

    expect(validate).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(400);

    expect(validate).toHaveBeenCalledTimes(1);
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
      errors: [{ message: 'Missing version parameter key' } as unknown],
    } as unknown as ValidateReturn);

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
    } as unknown as ValidateReturn);

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
    } as OpenApiSchemaStoreState);

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
    } as OpenApiSchemaStoreState);

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
    } as OpenApiSchemaStoreState);

    useOpenApiSchemaStore.getState().toggleFormat();

    expect(useOpenApiSchemaStore.getState().format).toBe('yaml');
  });

  it('should fallback to error records if conversion parsing crashes', () => {
    useOpenApiSchemaStore.setState({
      spec: '{"unclosed json',
      format: 'json',
      isValid: true,
    } as OpenApiSchemaStoreState);

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
    } as OpenApiSchemaStoreState);

    vi.spyOn(YAML, 'parse').mockImplementation(() => {
      throw 'Plain string error rejection';
    });

    useOpenApiSchemaStore.getState().toggleFormat();

    const state = useOpenApiSchemaStore.getState();
    expect(state.isValid).toBe(false);
    expect(state.error?.fallback).toBe('Syntax error');

    vi.restoreAllMocks();
  });
});
