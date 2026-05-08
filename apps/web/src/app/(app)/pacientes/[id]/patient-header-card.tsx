import Link from 'next/link';
import { CalendarPlus, MoreHorizontal, Pencil } from 'lucide-react';

import { Card } from '@/components/ui/card';

interface Props {
  fullName: string;
  age: number | null;
  phone: string | null;
  shortId: string;
  archived: boolean;
}

/**
 * Header do perfil do paciente — inspirado em referência (Linda Miller, 41F).
 *
 * Adaptação Editorial Beauty Luxury KEYRA:
 * - Avatar com inicial em gradient amber→terracota (não foto)
 * - Nome + idade + status (arquivado se houver)
 * - 3 ações: Editar / Novo agendamento / Mais
 */
export function PatientHeaderCard({
  fullName,
  age,
  phone,
  shortId,
  archived,
}: Props) {
  const initial = fullName.charAt(0).toUpperCase();
  const ageLabel =
    age !== null ? `${age}${guessGenderTag(fullName)}` : null;

  return (
    <Card className="flex flex-col gap-4 p-5 shadow-warm-sm">
      <div className="flex items-start gap-3">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300/40 to-terracotta-500/30 text-xl font-semibold text-cocoa-800"
          aria-hidden="true"
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl font-light tracking-tight text-foreground truncate">
              {fullName}
            </h2>
            {ageLabel && (
              <span className="text-sm text-muted-foreground tabular-nums">
                ({ageLabel})
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Cliente
            {phone ? <> · {phone}</> : null}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            ID #{shortId}
          </p>
          {archived && (
            <span className="mt-2 inline-flex rounded-full border border-mocha-300/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-mocha-300">
              Arquivado
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full bg-cocoa-900 px-3 py-1.5 text-xs font-medium text-ivory-50 transition-colors hover:bg-cocoa-800"
        >
          <Pencil className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
          Editar
        </button>
        <Link
          href="/agenda?novo=1"
          className="inline-flex items-center gap-1 rounded-full border border-mocha-300/40 bg-ivory-50 px-3 py-1.5 text-xs font-medium text-cocoa-800 transition-colors hover:border-cocoa-700/50"
        >
          <CalendarPlus
            className="h-3 w-3"
            strokeWidth={2}
            aria-hidden="true"
          />
          Novo agendamento
        </Link>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-mocha-300/40 bg-ivory-50 px-3 py-1.5 text-xs font-medium text-cocoa-800 transition-colors hover:border-cocoa-700/50"
          aria-label="Mais ações"
        >
          <MoreHorizontal
            className="h-3 w-3"
            strokeWidth={2}
            aria-hidden="true"
          />
          Mais
        </button>
      </div>
    </Card>
  );
}

/**
 * Heurística leve para tag de gênero baseada no nome (não autoritativa).
 * Schema KEYRA não tem campo gender — placeholder discreto na referência.
 */
function guessGenderTag(name: string): string {
  const first = name.split(' ')[0]?.toLowerCase() ?? '';
  if (
    first.endsWith('a') ||
    first.endsWith('e') ||
    ['ana', 'maria', 'beatriz', 'amelia', 'camila'].includes(first)
  ) {
    return 'F';
  }
  return 'M';
}
