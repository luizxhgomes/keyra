import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  shortId: string;
  phone: string | null;
  email: string | null;
  birthDate: string | null;
  age: number | null;
  notes: string | null;
  createdAt: string;
  lastVisit: string | null;
}

/**
 * Card "Overview" do perfil do paciente — inspirado em referência.
 *
 * Adaptação para schema KEYRA:
 * - Account #     → ID interno (shortId)
 * - NHS #         → omitido (sem equivalente)
 * - Address       → omitido por enquanto (schema não tem)
 * - Nationality   → omitido
 * - Ethnicity     → omitido
 * - VIP           → omitido
 * - Gender        → derivado heurístico do nome (placeholder)
 * - Age           → calculada de birth_date
 * - Contact       → phone
 * - Email         → email
 * Adicionado:
 * - Última visita
 * - Cliente desde (created_at)
 */
export function PatientOverviewCard({
  shortId,
  phone,
  email,
  birthDate,
  age,
  notes,
  createdAt,
  lastVisit,
}: Props) {
  return (
    <Card className="shadow-warm-sm">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-base">Visão geral</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <Field label="ID" value={`#${shortId}`} mono />
          <Field
            label="Idade"
            value={age !== null ? `${age} anos` : '—'}
          />
          <Field
            label="Aniversário"
            value={
              birthDate
                ? format(new Date(birthDate), "d 'de' MMMM", { locale: ptBR })
                : '—'
            }
          />
          <Field label="Telefone" value={phone ?? '—'} />
          <Field label="Email" value={email ?? '—'} truncate full />
          <Field
            label="Última visita"
            value={
              lastVisit
                ? format(new Date(lastVisit), "d 'de' MMM 'de' yyyy", {
                    locale: ptBR,
                  })
                : 'Nenhuma'
            }
          />
          <Field
            label="Cliente desde"
            value={format(new Date(createdAt), 'MMM yyyy', { locale: ptBR })}
            full
          />
          {notes && <Field label="Observações" value={notes} full multiline />}
        </dl>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  mono = false,
  truncate = false,
  multiline = false,
  full = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  truncate?: boolean;
  multiline?: boolean;
  full?: boolean;
}) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd
        className={[
          'mt-0.5 text-foreground',
          mono ? 'tabular-nums font-mono text-xs' : 'text-sm',
          truncate ? 'truncate' : '',
          multiline ? 'whitespace-pre-wrap' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {value}
      </dd>
    </div>
  );
}
