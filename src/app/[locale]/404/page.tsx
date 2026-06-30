'use client';

import { useTranslations } from 'next-intl';
import { ArrowLeft, Home } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useRouter } from '@/i18n/navigation';

export default function NotFoundPage() {
  const t = useTranslations('pages.NotFoundPage');
  const router = useRouter();

  return (
    <div className="flex flex-1 items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-dashed shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted text-primary">
            <span className="text-3xl font-extrabold tracking-tight select-none">404</span>
          </div>

          <CardTitle className="text-2xl font-bold tracking-tight">{t('pageNotFound')}</CardTitle>

          <CardDescription className="text-muted-foreground mt-2">
            {t('notFoundDescription')}
          </CardDescription>
        </CardHeader>

        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('goBack')}
          </Button>

          <Button asChild className="w-full sm:w-auto">
            <Link className="cursor-default" href="/">
              <Home className="mr-2 h-4 w-4" />
              {t('backToHome')}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
