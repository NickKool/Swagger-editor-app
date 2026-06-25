import type { Metadata } from 'next';
import { Public_Sans, Space_Grotesk } from 'next/font/google';
import { cn } from '@/lib/utils';
import './globals.css';

const spaceGroteskHeading = Space_Grotesk({ subsets: ['latin'], variable: '--font-heading' });

const publicSans = Public_Sans({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Swagger Editor App',
  description: `A full-stack Swagger and OpenAPI specification editor and \
    viewer featuring interactive REST client capabilities, live validation, \
    and comprehensive request history analytics.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        'h-full',
        'antialiased',
        'font-sans',
        'font-sans',
        publicSans.variable,
        spaceGroteskHeading.variable,
      )}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
