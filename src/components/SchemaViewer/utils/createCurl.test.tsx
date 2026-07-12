import { describe, it, expect } from 'vitest';

import { buildCurl } from './createCurl';

describe('buildCurl', () => {
  it('builds a bare curl command without body, uppercasing the method', () => {
    expect(buildCurl('https://api.example.com/users', 'get', '')).toBe(
      "curl -X GET 'https://api.example.com/users'",
    );
  });

  it('appends JSON headers and the body when provided', () => {
    expect(buildCurl('https://api.example.com/users', 'post', '{"name":"Alice"}')).toBe(
      "curl -X POST 'https://api.example.com/users' -H 'Content-Type: application/json' -d '{\"name\":\"Alice\"}'",
    );
  });

  it('escapes single quotes inside the body', () => {
    expect(buildCurl('https://api.example.com/x', 'post', "O'Brien")).toBe(
      "curl -X POST 'https://api.example.com/x' -H 'Content-Type: application/json' -d 'O'\\''Brien'",
    );
  });
});
