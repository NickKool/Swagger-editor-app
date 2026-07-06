'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { validateEmail } from '@/lib/validate';

import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

import { toast } from 'sonner';

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

export default function SignInPage() {
  const t = useTranslations('pages.Auth');
  const router = useRouter();

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
    const isPasswordFilled = password.trim().length > 0;

    if (!isEmailValid) {
      setEmailError(t('errors.invalidEmail'));
    }
    if (!isPasswordFilled) {
      setPasswordError(t('errors.requiredPassword') || 'Password is required.');
    }

    if (!isEmailValid || !isPasswordFilled) return;

    try {
      setIsSubmitting(true);

      await signInWithEmailAndPassword(auth, email.trim(), password);

      toast.success(t('login.title'), {
        description: t('login.toastSuccess'),
        position: 'top-center',
      });

      router.push('/');
    } catch (error) {
      console.error('Firebase SignIn Error:', error);

      if (error instanceof FirebaseError) {
        if (
          error.code === 'auth/user-not-found' ||
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/invalid-credential'
        ) {
          setPasswordError(t('errors.invalidCredentials'));
        } else if (error.code === 'auth/too-many-requests') {
          toast.error(t('errors.accountLockedTitle'), {
            description: t('errors.accountLockedDesc'),
            position: 'top-center',
          });
        } else {
          toast.error(t('errors.authFailedTitle'), {
            description: error.message || t('errors.unexpectedError'),
            position: 'top-center',
          });
        }
      } else {
        const errorMessage =
          error instanceof Error ? error.message : 'An unexpected error occurred.';
        toast.error(t('errors.loginFailedTitle'), {
          description: errorMessage,
          position: 'top-center',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight font-heading text-foreground">
            {t('login.title')}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            {t('login.description')}
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
                  if (emailError && validateEmail(value)) setEmailError('');
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
                  if (passwordError) setPasswordError('');
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
              {isSubmitting ? t('buttons.processing') : t('buttons.signIn') || 'Sign In'}
            </Button>

            <div className="text-sm text-center text-muted-foreground">
              {t('login.dontHaveAccount')}{' '}
              <Link
                href="/sign-up"
                className="text-primary hover:underline font-medium transition-colors"
              >
                {t('login.signUpLink') || 'Register'}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
