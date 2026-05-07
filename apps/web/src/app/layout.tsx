import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import { Toaster } from 'sonner';

import { cn } from '@/lib/utils';

import './globals.css';

/**
 * Tipografia dupla KEYRA (Brand Identity, Epic BRAND-INTEGRATION story brand.1).
 *
 * - Fraunces: serifa editorial (Display, headlines, hero, títulos de página).
 *   Carregada com axis opsz e SOFT para optical sizing premium.
 * - Inter: sans funcional (body, UI, KPIs com numerais tabulares).
 *   Variable cobre 200–700 num único arquivo.
 *
 * Referência canônica: docs/brand/03-identity/typography-system.md
 */
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  axes: ['opsz', 'SOFT'],
});

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
    { media: '(prefers-color-scheme: light)', color: '#FAF6EE' },
    { media: '(prefers-color-scheme: dark)', color: '#181210' },
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
      <body className={cn(fraunces.variable, inter.variable, 'min-h-screen bg-background font-sans text-foreground')}>
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
