import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';

import { cn } from '@/lib/utils';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'KEYRA — Financeiro operacional para estética',
    template: '%s · KEYRA',
  },
  description:
    'O primeiro financeiro operacional para clínicas e profissionais de estética. A agenda dispara o financeiro automaticamente.',
  applicationName: 'KEYRA',
  authors: [{ name: 'KEYRA' }],
  metadataBase: new URL('https://keyra.app'),
  openGraph: {
    title: 'KEYRA',
    description:
      'O primeiro financeiro operacional para estética. Agenda → Comanda → DRE, automático.',
    url: 'https://keyra.app',
    siteName: 'KEYRA',
    locale: 'pt_BR',
    type: 'website',
  },
  robots: {
    // Pre-launch: keep marketing surfaces out of search until product is live.
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF8F5' },
    { media: '(prefers-color-scheme: dark)', color: '#1C1A17' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn(inter.variable, 'min-h-screen bg-background font-sans text-foreground')}>
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
