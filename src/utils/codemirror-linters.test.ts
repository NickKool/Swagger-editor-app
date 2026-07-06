import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as yamlParser from 'js-yaml';
import { yamlLinter } from './codemirror-linters';

vi.mock('js-yaml', () => ({
  load: vi.fn(),
}));

vi.mock('@codemirror/lint', () => ({
  linter: vi.fn((callback) => callback),
}));

interface MockLine {
  from: number;
  to: number;
}

interface MockView {
  state: {
    doc: {
      toString: () => string;
      line: (lineNum: number) => MockLine;
    };
  };
}

describe('yamlLinter', () => {
  let mockView: MockView;
  let mockLines: Record<number, MockLine>;

  beforeEach(() => {
    mockLines = {
      1: { from: 0, to: 15 },
      2: { from: 16, to: 30 },
      3: { from: 31, to: 45 },
    };

    mockView = {
      state: {
        doc: {
          toString: vi.fn().mockReturnValue('key: value\ninvalid: yaml:\n  nested: true'),
          line: vi.fn((lineNum: number) => mockLines[lineNum] || { from: 0, to: 0 }),
        },
      },
    };
  });

  it('should return an empty array if YAML parsing succeeds', () => {
    vi.mocked(yamlParser.load).mockReturnValue({});

    const lintCallback = yamlLinter as unknown as (view: MockView) => unknown[];
    const result = lintCallback(mockView);

    expect(yamlParser.load).toHaveBeenCalledWith('key: value\ninvalid: yaml:\n  nested: true');
    expect(result).toEqual([]);
  });

  it('should map a YAMLException with mark data to a precise line diagnostic object', () => {
    const mockYamlError = {
      name: 'YAMLException',
      message: 'bad indentation of a mapping entry',
      reason: 'bad indentation',
      mark: { line: 1 },
    };
    vi.mocked(yamlParser.load).mockImplementation(() => {
      throw mockYamlError;
    });

    const lintCallback = yamlLinter as unknown as (view: MockView) => unknown[];
    const result = lintCallback(mockView);

    expect(mockView.state.doc.line).toHaveBeenCalledWith(2);
    expect(result).toEqual([
      {
        from: 16,
        to: 30,
        severity: 'error',
        message: 'bad indentation',
      },
    ]);
  });

  it('should fallback to line 1 and error.message if mark data and error.reason are missing', () => {
    const mockGenericError = new Error('Unexpected end of stream');
    vi.mocked(yamlParser.load).mockImplementation(() => {
      throw mockGenericError;
    });

    const lintCallback = yamlLinter as unknown as (view: MockView) => unknown[];
    const result = lintCallback(mockView);

    expect(mockView.state.doc.line).toHaveBeenCalledWith(1);
    expect(result).toEqual([
      {
        from: 0,
        to: 15,
        severity: 'error',
        message: 'Unexpected end of stream',
      },
    ]);
  });
});
