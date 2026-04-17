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
