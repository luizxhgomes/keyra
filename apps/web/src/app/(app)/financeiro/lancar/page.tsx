import Link from 'next/link';
import { ArrowUpRight, ReceiptText, Wallet } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { requireAuth } from '@/lib/auth/require-auth';

/**
 * Seletora de lançamento manual (Story reorg.1).
 * Destino único e memorável para o CTA "Lançar" do dashboard: a usuária escolhe
 * entre receita e despesa e segue para a tela existente de cada fluxo.
 * O header "Financeiro" + sub-nav vêm do layout do segmento.
 */
export default async function LancarPage() {
  await requireAuth();

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-serif text-h2 text-foreground">Lançar</h2>
        <p className="text-sm text-muted-foreground">
          O que você quer registrar agora? Receitas de atendimento nascem sozinhas da
          comanda — aqui entram os lançamentos manuais.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/financeiro/receitas"
          className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Card className="h-full transition-colors group-hover:border-cocoa-700/40">
            <CardContent className="flex h-full flex-col justify-center gap-2 p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-champagne-200/60 text-cocoa-800">
                <Wallet className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="flex items-center gap-1 font-serif text-h3 text-foreground">
                Lançar receita
                <ArrowUpRight
                  className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
              <span className="text-sm text-muted-foreground">
                Uma entrada avulsa, fora da comanda — venda de produto, sinal, repasse.
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link
          href="/financeiro/despesas/nova"
          className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Card className="h-full transition-colors group-hover:border-cocoa-700/40">
            <CardContent className="flex h-full flex-col justify-center gap-2 p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sand-200/70 text-cocoa-800">
                <ReceiptText className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="flex items-center gap-1 font-serif text-h3 text-foreground">
                Lançar despesa
                <ArrowUpRight
                  className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
              <span className="text-sm text-muted-foreground">
                Um gasto do mês — insumo, conta da clínica, compra pontual.
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </section>
  );
}
