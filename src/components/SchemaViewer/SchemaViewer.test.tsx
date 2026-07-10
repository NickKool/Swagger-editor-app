import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import SchemaViewer from './SchemaViewer';
import { mockTranslate } from '@/__mocks__/next-intl';

const mockStore = vi.hoisted(() => ({
  isValid: true,
  error: null as Record<string, unknown> | null,
  parsedSpec: null as Record<string, unknown> | null,
}));

vi.mock('@/stores/OpenApiSchema', () => ({
  useOpenApiSchemaStore: (selector: (state: typeof mockStore) => unknown) => selector(mockStore),
}));

const MOCK_MESSAGES: Record<string, string> = {
  errorTitle: 'Schema Error',
  schemaVersion: 'Version: {version}',
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

vi.mock('./EndpointList/EndpointCard', () => ({
  default: vi.fn(({ tag, baseUrl }: { tag: { name: string }; baseUrl: string }) => (
    <div data-testid="endpoint-card">
      {tag.name}-{baseUrl}
    </div>
  )),
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

  it('should parse metadata fields and map over tags array when schema updates successfully', () => {
    mockStore.isValid = true;
    const titleText = 'User Management Microservice';
    const versionText = '2.4.1';

    mockStore.parsedSpec = {
      openapi: '3.0.0',
      info: {
        title: titleText,
        version: versionText,
      },
      servers: [{ url: 'https://example.com' }],
      paths: {
        '/users': {
          get: {
            tags: ['Users'],
          },
        },
      },
    };

    render(<SchemaViewer />);

    expect(screen.getByText(titleText)).toBeInTheDocument();
    expect(
      screen.getByText(MOCK_MESSAGES['schemaVersion'].replace('{version}', versionText)),
    ).toBeInTheDocument();
    expect(screen.getByTestId('endpoint-card')).toHaveTextContent('Users-https://example.com');
    expect(screen.queryByText(MOCK_MESSAGES['schemaWaiting'])).not.toBeInTheDocument();
  });
});
