import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword } from './validate';

describe('validateEmail', () => {
  it('should return true for valid standard emails', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
  });

  it('should return true for valid international Unicode domains', () => {
    expect(validateEmail('тест@почта.рф')).toBe(true);
    expect(validateEmail('user@müller.de')).toBe(true);
  });

  it('should return false for invalid email structures', () => {
    expect(validateEmail('plainstring')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
    expect(validateEmail('username@')).toBe(false);
    expect(validateEmail('username@domain')).toBe(false);
    expect(validateEmail('user name@domain.com')).toBe(false);
  });

  it('should trim whitespace automatically before validation', () => {
    expect(validateEmail('  valid@domain.com  ')).toBe(true);
  });
});

describe('validatePassword', () => {
  it('should return true for strong passwords using Latin characters', () => {
    expect(validatePassword('P@ssword123')).toBe(true);
    expect(validatePassword('Secure_99#')).toBe(true);
  });

  it('should return true for strong passwords using Unicode (Cyrillic) characters', () => {
    expect(validatePassword('Пароль_123!')).toBe(true);
    expect(validatePassword('ПриятныйЧеловек$7')).toBe(true);
  });

  it('should return false if password length is less than 8 characters', () => {
    expect(validatePassword('Short1!')).toBe(false);
  });

  it('should return false if missing uppercase letters', () => {
    expect(validatePassword('lowercase123!')).toBe(false);
    expect(validatePassword('строчные123!')).toBe(false);
  });

  it('should return false if missing lowercase letters', () => {
    expect(validatePassword('UPPERCASE123!')).toBe(false);
    expect(validatePassword('ЗАГЛАВНЫЕ123!')).toBe(false);
  });

  it('should return false if missing digits', () => {
    expect(validatePassword('NoDigitsHere!')).toBe(false);
    expect(validatePassword('БезЦифрВообще!')).toBe(false);
  });

  it('should return false if missing special characters', () => {
    expect(validatePassword('NoSpecialChars123')).toBe(false);
    expect(validatePassword('БезСпецСимволов123')).toBe(false);
  });
});
