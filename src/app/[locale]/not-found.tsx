'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

export default function NotFoundPage() {
  const t = useTranslations('NotFoundPage');

  return (
    <section>
      <h1>{t('page404')}</h1>
      <div>{t('pageNotFound')}</div>
      <Link href="/">{t('return')}</Link>
    </section>
  );
}
