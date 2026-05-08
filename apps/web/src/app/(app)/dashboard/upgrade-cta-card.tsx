import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { Card } from '@/components/ui/card';

/**
 * CTA escuro de upgrade — inspirado em: dashboard reference (Join Our Venture).
 *
 * Adaptação Editorial Beauty Luxury:
 * - Background cocoa-900 (não preto puro)
 * - Tipografia Fraunces na pergunta
 * - Botão pill ivory com seta
 * - Copy adaptada pra contexto KEYRA
 */
export function UpgradeCTACard() {
  return (
    <Card className="relative flex h-full flex-col overflow-hidden border-0 bg-cocoa-900 p-6 text-ivory-50 shadow-warm-md">
      {/* Detalhes decorativos sutis */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(circle at 100% 0%, hsl(21 56% 50% / 0.3), transparent 60%)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background:
            'radial-gradient(circle at 0% 100%, hsl(40 50% 60% / 0.4), transparent 50%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex h-full flex-col gap-4">
        <div className="flex items-center gap-1.5">
          <span className="h-1 w-3 rounded-full bg-ivory-50" aria-hidden="true" />
          <span className="h-1 w-1 rounded-full bg-ivory-50/40" aria-hidden="true" />
          <span className="h-1 w-1 rounded-full bg-ivory-50/40" aria-hidden="true" />
        </div>

        <p className="text-xs uppercase tracking-wider text-ivory-50/70">
          Crescer com a Keyra
        </p>

        <h3 className="font-serif text-2xl font-light leading-tight tracking-tight">
          Pronta para precificar com inteligência?
        </h3>

        <Link
          href="/configuracoes/plano"
          className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-ivory-50 px-4 py-2 text-sm font-medium text-cocoa-900 transition-all hover:bg-ivory-100 hover:gap-3"
        >
          Ver planos
          <ArrowUpRight
            className="h-4 w-4"
            strokeWidth={2}
            aria-hidden="true"
          />
        </Link>
      </div>
    </Card>
  );
}
