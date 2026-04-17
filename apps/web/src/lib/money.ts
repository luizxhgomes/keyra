import Decimal from 'decimal.js';

/**
 * Decimal.js global config for KEYRA.
 *
 * - precision: 20 — comfortably above any KEYRA value (commission, tax, splits).
 * - rounding: ROUND_HALF_EVEN (banker's rounding) — matches Postgres
 *   `round_half_even()` invariant defined in the schema (NFR-FI-01).
 *
 * NEVER call `Decimal.set` again at runtime — keeping a single config makes
 * server/client behavior reproducible.
 */
Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_EVEN,
});

export type DecimalInput = Decimal | string | number;

export const toDecimal = (value: DecimalInput): Decimal =>
  value instanceof Decimal ? value : new Decimal(value);

/**
 * Formats a decimal amount as Brazilian Real (`R$ 1.234,56`).
 *
 * Accepts a Decimal, string (`"123.45"`) or number (avoid floats for money —
 * prefer string from a Decimal at the boundary). Returns the standard
 * `currency` formatter from Intl, locked to `pt-BR`.
 */
export const formatBRL = (value: DecimalInput): string => {
  const numeric = toDecimal(value).toNumber();
  return numeric.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Formats a decimal amount in cents (integer) as BRL.
 * Convenience for KPICards which receive `value: number` in cents.
 */
export const formatCentsBRL = (cents: number): string =>
  formatBRL(toDecimal(cents).dividedBy(100));

/**
 * Adds a list of decimal-like values without floating point error.
 */
export const sumDecimal = (values: DecimalInput[]): Decimal =>
  values.reduce<Decimal>((acc, v) => acc.plus(toDecimal(v)), new Decimal(0));
