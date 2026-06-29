import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { GitBranch, BookOpen, ExternalLink, Code2, Users } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PROJECT_TECHNOLOGIES, TEAM } from '@/constants/about';

export default function AboutPage() {
  const t = useTranslations('pages.AboutPage');

  return (
    <div className="container max-w-5xl mx-auto py-10 px-4 space-y-12">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{t('aboutProject')}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t('aboutDescription')}</p>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2 text-primary">
              <BookOpen className="h-5 w-5" />
              <span className="font-semibold uppercase tracking-wider text-xs">
                {t('learning')}
              </span>
            </div>
            <CardTitle className="text-2xl">{t('rsschoolCourse')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
            <p className="text-muted-foreground leading-relaxed">
              <strong>{t('rsschool')}</strong> {t('rsschoolDescription')}
            </p>
            <Button asChild variant="outline" className="w-fill sm:w-min">
              <Link href="https://rs.school" target="_blank" rel="noreferrer">
                {t('rsschoolJoin')} <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2 text-primary">
              <Code2 className="h-5 w-5" />
              <span className="font-semibold uppercase tracking-wider text-xs">{t('product')}</span>
            </div>
            <CardTitle className="text-2xl">{t('projectDescription')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
            <p className="text-muted-foreground leading-relaxed">
              <strong>{t('swaggerEditorApp')}</strong> {t('swaggerEditorAppDescription')}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {PROJECT_TECHNOLOGIES.map((tech) => (
                <Badge key={tech} variant="secondary">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b pb-2">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-medium tracking-tight">{t('ourTeam')}</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEAM.map((member) => (
            <Card key={member.id} className="flex flex-col justify-between overflow-hidden">
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-12 w-12 border" size="default">
                  <AvatarImage
                    asChild
                    src={`https://avatars.githubusercontent.com/u/${member.githubAvatarId}`}
                  >
                    <Image
                      src={`https://avatars.githubusercontent.com/u/${member.githubAvatarId}`}
                      alt={t(member.name)}
                      width={48}
                      height={48}
                    />
                  </AvatarImage>
                  <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <CardTitle className="text-base leading-none">{t(member.name)}</CardTitle>
                  <CardDescription className="text-xs font-medium text-primary">
                    {member.role}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col justify-between flex-grow space-y-4">
                <p className="text-sm text-muted-foreground flex-grow">{t(member.contribution)}</p>
                <Button asChild variant="secondary" size="sm" className="w-full">
                  <Link href={member.github} target="_blank" rel="noreferrer">
                    <GitBranch className="mr-2 h-4 w-4" /> {t('gitHubProfile')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
