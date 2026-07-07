import { linter, Diagnostic } from '@codemirror/lint';
import * as yamlParser from 'js-yaml';

interface YamlMark {
  line: number;
}

interface YamlError extends Error {
  mark?: YamlMark;
  reason?: string;
}

export const yamlLinter = linter((view) => {
  const diagnostics: Diagnostic[] = [];
  const text = view.state.doc.toString();

  try {
    yamlParser.load(text);
  } catch (e: unknown) {
    const error = e as YamlError;
    const lineNum = error.mark ? error.mark.line : 0;
    const line = view.state.doc.line(lineNum + 1);

    diagnostics.push({
      from: line.from,
      to: line.to,
      severity: 'error',
      message: error.reason || error.message,
    });
  }
  return diagnostics;
});
