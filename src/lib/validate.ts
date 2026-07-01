export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
  return emailRegex.test(email.trim());
};

export const validatePassword = (password: string): boolean => {
  if (password.length < 8) return false;

  const hasDigit = /\d/.test(password);

  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_+\-[\]\\/`~;]/.test(password);

  const hasUppercase = /\p{Lu}/u.test(password);

  const hasLowercase = /\p{Ll}/u.test(password);

  return hasDigit && hasSpecialChar && hasUppercase && hasLowercase;
};
