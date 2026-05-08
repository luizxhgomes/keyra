import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCentsBRL } from '@/lib/money';
import { cn } from '@/lib/utils';

import type { PatientEncounter } from '../actions';

interface Props {
  rows: PatientEncounter[];
}

const STATUS_LABEL: Record<PatientEncounter['status'], string> = {
  scheduled: 'Agendado',
  done: 'Concluído',
  cancelled: 'Cancelado',
  no_show: 'Falta',
};

const STATUS_PILL: Record<PatientEncounter['status'], string> = {
  scheduled: 'border-amber-500/30 bg-amber-300/10 text-amber-500',
  done: 'border-success-leaf/40 bg-success-leaf/10 text-success-deep',
  cancelled: 'border-mocha-300/40 bg-mocha-300/10 text-mocha-300 line-through',
  no_show: 'border-rust-800/30 bg-rust-800/10 text-rust-800',
};

/**
 * Tabela de atendimentos (Encounters) do cliente — inspirado em referência.
 *
 * Adaptação:
 * - Visit Date    → Data do agendamento
 * - Encounter #   → ID curto (8 chars)
 * - Patient name  → omitido (já é página do paciente)
 * - Visit Type    → Serviço prestado
 * - Physician     → Profissional
 * - Visit status  → Status pill com label pt-BR
 * - Charges       → Valor (price_snapshot do appointment)
 * - Action        → "Ver" link futuro pra detalhe
 */
export function PatientEncountersTable({ rows }: Props) {
  const isEmpty = rows.length === 0;

  // 3 linhas placeholder visualmente preenchidas quando vazio.
  const placeholders = [
    { service: 'Limpeza de pele', professional: '—', status: 'scheduled' as const },
    { service: 'Massagem relaxante', professional: '—', status: 'done' as const },
    { service: 'Drenagem linfática', professional: '—', status: 'done' as const },
  ];

  return (
    <Card className="shadow-warm-sm">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-xl">Atendimentos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mocha-300/30 text-left">
                <Th>Data</Th>
                <Th>Comanda</Th>
                <Th>Serviço</Th>
                <Th>Profissional</Th>
                <Th>Status</Th>
                <Th align="right">Valor</Th>
                <Th align="right">Ação</Th>
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
                      <Td>{p.service}</Td>
                      <Td>{p.professional}</Td>
                      <Td>
                        <StatusPill status={p.status} />
                      </Td>
                      <Td align="right" mono>R$ —,—</Td>
                      <Td align="right">
                        <span className="text-xs text-mocha-300">—</span>
                      </Td>
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
                      <Td mono>#{r.shortId}</Td>
                      <Td>{r.serviceName}</Td>
                      <Td>{r.professionalName}</Td>
                      <Td>
                        <StatusPill status={r.status} />
                      </Td>
                      <Td align="right" mono>
                        {formatCentsBRL(r.amountCents)}
                      </Td>
                      <Td align="right">
                        <Link
                          href={`/agenda?evento=${r.id}`}
                          className="text-xs font-medium text-cocoa-800 hover:text-cocoa-900 hover:underline"
                        >
                          Ver
                        </Link>
                      </Td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {isEmpty && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Sem atendimentos registrados ainda — exemplos acima ilustram o
            formato.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function StatusPill({ status }: { status: PatientEncounter['status'] }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
        STATUS_PILL[status],
      )}
    >
      {STATUS_LABEL[status]}
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
