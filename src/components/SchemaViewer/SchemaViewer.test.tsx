import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import SchemaViewer from './SchemaViewer';
import { mockTranslate } from '@/__mocks__/next-intl';

const mockStore = vi.hoisted(() => ({
  isValid: true,
  error: null as Record<string, unknown> | null,
  parsedSpec: null as Record<string, unknown> | null,
}));

vi.mock('@/stores/OpenApiSchema.store', () => ({
  useOpenApiSchemaStore: (selector: (state: typeof mockStore) => unknown) => selector(mockStore),
}));

const MOCK_MESSAGES: Record<string, string> = {
  errorTitle: 'Schema Error',
  schemaReserveTitle: 'API Reference',
  schemaVersion: 'Version: {version}',
  schemaPathsDetected: 'Paths detected: {paths}',
  schemaWaiting: 'Waiting for a valid OpenAPI configuration schema...',
  'errors.empty': 'Specification cannot be empty.',
  'errors.conversionFailed': 'Failed to parse syntax for conversion.',
  'errors.invalidStructure': 'Schema structure validation failed.',
  'errors.syntaxError': 'Invalid formatting or malformed document syntax.',
} as const;

mockTranslate.mockImplementation(
  (k: string, values?: Record<string, string | number | Date> | undefined) => {
    const message = MOCK_MESSAGES[k];
    if (!message) return k;
    if (values) {
      let interpolated = message;
      Object.entries(values).forEach(([key, val]) => {
        interpolated = interpolated.replace(`{${key}}`, String(val));
      });
      return interpolated;
    }
    return message;
  },
);
mockTranslate.has.mockImplementation((k: string) => k in MOCK_MESSAGES);

vi.mock('lucide-react', () => ({
  AlertCircle: () => <svg data-testid="icon-alert" />,
}));

describe('SchemaViewer Component', () => {
  beforeEach(() => {
    mockStore.isValid = true;
    mockStore.error = null;
    mockStore.parsedSpec = null;
  });

  it('should render the waiting state when schema is empty or unparsed', () => {
    render(<SchemaViewer />);

    expect(screen.getByText(MOCK_MESSAGES['schemaWaiting'])).toBeInTheDocument();
    expect(screen.queryByTestId('icon-alert')).not.toBeInTheDocument();
  });

  it('should render structural localization errors when validation fails', () => {
    mockStore.isValid = false;
    mockStore.error = {
      key: 'errors.invalidStructure',
      fallback: 'Fallback structure error message',
    };

    render(<SchemaViewer />);

    expect(screen.getByText(MOCK_MESSAGES['errorTitle'])).toBeInTheDocument();
    expect(screen.getByTestId('icon-alert')).toBeInTheDocument();
    expect(screen.getByText(MOCK_MESSAGES['errors.invalidStructure'])).toBeInTheDocument();
  });

  it('should degrade safely to raw error fallbacks when translation keys match nothing', () => {
    mockStore.isValid = false;
    const fallbackMessage = 'Direct raw parser exception message string';
    mockStore.error = {
      key: 'errors.unknownRandomErrorKey',
      fallback: fallbackMessage,
    };

    render(<SchemaViewer />);

    expect(screen.getByText(fallbackMessage)).toBeInTheDocument();
  });

  it('should parse metadata fields and expose path arrays when schema updates successfully', () => {
    mockStore.isValid = true;
    const titleText = 'User Management Microservice';
    const versionText = '2.4.1';
    const paths = {
      '/users': {},
      '/users/{id}': {},
      '/status': {},
    };
    mockStore.parsedSpec = {
      info: {
        title: titleText,
        version: versionText,
      },
      paths: paths,
    };

    render(<SchemaViewer />);

    expect(screen.getByText(titleText)).toBeInTheDocument();
    expect(
      screen.getByText(MOCK_MESSAGES['schemaVersion'].replace('{version}', versionText)),
    ).toBeInTheDocument();
    expect(
      screen.getByText(MOCK_MESSAGES['schemaPathsDetected'].replace('{paths}', '3')),
    ).toBeInTheDocument();
    expect(screen.queryByText(MOCK_MESSAGES['schemaWaiting'])).not.toBeInTheDocument();
  });

  it('should drop down into reserve title localizations when specification info block lacks a title', () => {
    mockStore.isValid = true;
    mockStore.parsedSpec = {
      info: {
        version: '1.0.0',
      },
      paths: {},
    };

    render(<SchemaViewer />);

    expect(screen.getByText(MOCK_MESSAGES['schemaReserveTitle'])).toBeInTheDocument();
  });

  it('should render fallback values when spec metadata is missing', () => {
    mockStore.isValid = true;
    mockStore.parsedSpec = {
      info: {
        version: undefined,
      },
      paths: undefined,
    };

    render(<SchemaViewer />);

    expect(screen.getByText(MOCK_MESSAGES['schemaReserveTitle'])).toBeInTheDocument();
    expect(
      screen.getByText(MOCK_MESSAGES['schemaVersion'].replace('{version}', '1.0.0')),
    ).toBeInTheDocument();
    expect(
      screen.getByText(MOCK_MESSAGES['schemaPathsDetected'].replace('{paths}', '0')),
    ).toBeInTheDocument();
  });
});
