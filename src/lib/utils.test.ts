import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
  it('should merge plain string class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes via objects', () => {
    expect(cn('foo', { bar: true, baz: false })).toBe('foo bar');
  });

  it('should handle arrays of classes', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
  });

  it('should ignore falsy values like null, undefined, or boolean', () => {
    expect(cn('foo', null, undefined, false, 'bar')).toBe('foo bar');
  });

  it('should successfully merge Tailwind classes and resolve conflicts', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');

    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('should return an empty string when no arguments are passed', () => {
    expect(cn()).toBe('');
  });
});
