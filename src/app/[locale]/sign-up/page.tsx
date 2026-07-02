'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { validateEmail, validatePassword } from '@/lib/validate';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignUpPage() {
  const t = useTranslations('pages.Auth');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    setEmailError('');
    setPasswordError('');

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid) {
      setEmailError(t('errors.invalidEmail'));
    }
    if (!isPasswordValid) {
      setPasswordError(t('errors.invalidPassword'));
    }

    if (!isEmailValid || !isPasswordValid) return;

    try {
      setIsSubmitting(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight font-heading text-foreground">
            {t('register.title')}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            {t('register.description')}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                {t('labels.email')}
              </Label>
              <Input
                id="email"
                type="text"
                placeholder={t('placeholders.email')}
                value={email}
                onChange={(e) => {
                  const value = e.target.value;
                  setEmail(value);

                  if (emailError) {
                    const isValid = validateEmail(value);
                    if (isValid) setEmailError('');
                  }
                }}
                disabled={isSubmitting}
                className={
                  emailError ? 'border-destructive focus-visible:ring-destructive' : 'border-input'
                }
              />
              {emailError && (
                <p className="text-xs font-medium text-destructive animate-fade-in">{emailError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                {t('labels.password')}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={t('placeholders.password')}
                value={password}
                onChange={(e) => {
                  const value = e.target.value;
                  setPassword(value);

                  if (passwordError) {
                    const isValid = validatePassword(value);
                    if (isValid) setPasswordError('');
                  }
                }}
                disabled={isSubmitting}
                className={
                  passwordError
                    ? 'border-destructive focus-visible:ring-destructive'
                    : 'border-input'
                }
              />
              {passwordError && (
                <p className="text-xs font-medium text-destructive space-y-1 whitespace-pre-line leading-relaxed">
                  {passwordError}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 mt-4">
            <Button type="submit" className="w-full font-medium" disabled={isSubmitting}>
              {isSubmitting ? t('buttons.processing') : t('buttons.register')}
            </Button>

            <div className="text-sm text-center text-muted-foreground">
              {t('register.alreadyHaveAccount')}{' '}
              <Link
                href="/sign-in"
                className="text-primary hover:underline font-medium transition-colors"
              >
                {t('register.signInLink')}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
