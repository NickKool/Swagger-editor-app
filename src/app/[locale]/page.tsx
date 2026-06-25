import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('pages.HomePage');

  return <div>{t('content')}</div>;
}
