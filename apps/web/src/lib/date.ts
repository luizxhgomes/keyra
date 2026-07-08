import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Date helpers for KEYRA — always in `pt-BR` locale (ADR: market is BR-only at
 * this stage; see ADR-020 + design-principles §3.4).
 *
 * Use these instead of `toLocaleDateString` to keep formatting consistent and
 * to avoid SSR/CSR locale mismatches that surface as hydration errors.
 */
export type DateLike = Date | string;

const toDate = (value: DateLike): Date =>
  typeof value === 'string' ? parseISO(value) : value;

export const formatDate = (value: DateLike): string =>
  format(toDate(value), 'dd/MM/yyyy', { locale: ptBR });

export const formatDateTime = (value: DateLike): string =>
  format(toDate(value), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

export const formatTime = (value: DateLike): string =>
  format(toDate(value), 'HH:mm', { locale: ptBR });

export const formatMonthYear = (value: DateLike): string =>
  format(toDate(value), "MMMM 'de' yyyy", { locale: ptBR });

/** Useful for "há 5 minutos" / "ontem" copy in alert cards and logs. */
export const formatRelative = (value: DateLike): string =>
  formatDistanceToNow(toDate(value), { addSuffix: true, locale: ptBR });

/**
 * Capitaliza APENAS o primeiro caractere alfabético da string, preservando o
 * restante — "quarta, 8 de jul." → "Quarta, 8 de jul.".
 *
 * Substitui a classe CSS `capitalize` sobre datas do date-fns: em pt-BR as
 * preposições ficam minúsculas ("8 de jul", nunca "8 De Jul") e o `capitalize`
 * do Tailwind capitaliza toda palavra (Story reorg.3). Labels que começam por
 * dígito ("6 – 12 de jul.") voltam intactos — comportamento correto para ranges.
 */
export const capitalizarPrimeira = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1);
