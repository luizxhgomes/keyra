import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCentsBRL } from '@/lib/money';
import { cn } from '@/lib/utils';

import type { PatientPayment } from '../actions';

interface Props {
  rows: PatientPayment[];
}

/**
 * Tabela de pagamentos (Remittance) do cliente — inspirado em referência.
 *
 * Adaptação:
 * - Date          → Data da transação
 * - Encounter #   → ID curto da comanda (se origem = command)
 * - Status        → Sempre "Pago" (transactions credit lançadas = realizadas)
 * - Type          → Origem (Pagamento de comanda / Receita manual)
 * - Method        → Description (forma de pagamento)
 * - Paid by       → omitido (sempre o cliente desta página)
 * - Amount        → gross_amount
 * - Adjustment    → omitido (sem ajustes hoje)
 * - Action        → omitido (transactions são imutáveis para auditoria)
 */
export function PatientPaymentsTable({ rows }: Props) {
  const isEmpty = rows.length === 0;

  const placeholders = [
    { type: 'Pagamento de comanda', method: 'Pix' },
    { type: 'Pagamento de comanda', method: 'Cartão de crédito' },
    { type: 'Pagamento de comanda', method: 'Dinheiro' },
  ];

  return (
    <Card className="shadow-warm-sm">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-xl">Pagamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mocha-300/30 text-left">
                <Th>Data</Th>
                <Th>Comanda</Th>
                <Th>Status</Th>
                <Th>Tipo</Th>
                <Th>Método</Th>
                <Th align="right">Valor</Th>
              </tr>
            </thead>
            <tbody>
              {isEmpty
                ? placeholders.map((p, idx) => (
                    <tr
                      key={`placeholder-${idx}`}
                      className="border-b border-mocha-300/20 opacity-50"
                    >
                      <Td>—</Td>
                      <Td mono>—</Td>
                      <Td>
                        <StatusPill />
                      </Td>
                      <Td>{p.type}</Td>
                      <Td>{p.method}</Td>
                      <Td align="right" mono>R$ —,—</Td>
                    </tr>
                  ))
                : rows.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-mocha-300/20 transition-colors hover:bg-ivory-100"
                    >
                      <Td>
                        {format(new Date(r.date), "d 'de' MMM yyyy", {
                          locale: ptBR,
                        })}
                      </Td>
                      <Td mono>
                        {r.commandShortId ? `#${r.commandShortId}` : '—'}
                      </Td>
                      <Td>
                        <StatusPill />
                      </Td>
                      <Td>{r.type}</Td>
                      <Td>{r.method}</Td>
                      <Td align="right" mono>
                        {formatCentsBRL(r.amountCents)}
                      </Td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {isEmpty && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Sem pagamentos registrados ainda — exemplos acima ilustram o
            formato.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function StatusPill() {
  return (
    <span className="inline-flex rounded-full border border-success-leaf/40 bg-success-leaf/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-success-deep">
      Pago
    </span>
  );
}

function Th({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
}) {
  return (
    <th
      className={cn(
        'pb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground',
        align === 'right' ? 'text-right' : 'text-left',
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = 'left',
  mono = false,
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
  mono?: boolean;
}) {
  return (
    <td
      className={cn(
        'py-3 text-foreground',
        align === 'right' ? 'text-right' : 'text-left',
        mono ? 'tabular-nums' : '',
      )}
    >
      {children}
    </td>
  );
}
