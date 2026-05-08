import { Sparkles } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Card de Pacote/Assinatura do cliente — adaptação do "Insurance information"
 * da referência. Feature em construção (schema de packages ainda não existe).
 *
 * Empty state com mock visual estruturado mostra como o card vai aparecer
 * quando a feature for ligada — não fica como buraco vazio.
 */
export function PatientPackageCard() {
  return (
    <Card className="shadow-warm-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-base">
            Pacote ou assinatura
          </CardTitle>
          <span className="rounded-full border border-amber-500/30 bg-amber-300/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-500">
            Em breve
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 opacity-60">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Field label="Plano" value="—" />
            <Field label="Status" value="—" />
            <Field label="Validade" value="—" />
            <Field label="Sessões totais" value="—" />
            <Field label="Sessões usadas" value="—" />
            <Field label="Restantes" value="—" />
          </dl>

          {/* Barra placeholder de uso */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>Uso do pacote</span>
              <span>—</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-mocha-300/20">
              <div className="h-full w-0 bg-mocha-300" />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-300/5 p-3">
          <Sparkles
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <p className="text-xs text-cocoa-800">
            Em breve você poderá vender pacotes de sessões pré-pagos e
            controlar saldo, validade e uso direto pelo perfil.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm tabular-nums text-mocha-300">{value}</dd>
    </div>
  );
}
