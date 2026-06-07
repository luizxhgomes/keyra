/**
 * Mapeadores puros de enums do banco (inglês) → StatusKind (pt-BR) da KEYRA.
 *
 * Extraídos de `StatusBadge.tsx` (que é `'use client'` por causa do framer-motion)
 * para um módulo **server-safe**. Server Components (ex.: `dashboard/agenda-hoje-card`)
 * precisam chamar estes mapeadores durante a renderização no servidor — e uma função
 * pura exportada de um módulo `'use client'` vira *client reference*, quebrando a
 * fronteira RSC (digest `1511366857`). Ver `docs/dev/rsc-boundary-rules.md` regra 2.
 *
 * Sem motion, sem JSX, sem hooks: só tipos e funções puras. Pode ser importado
 * tanto por Server quanto por Client Components.
 */

export type AppointmentStatus = 'agendado' | 'realizado' | 'cancelado' | 'falta';
export type CommandStatus = 'aberta' | 'finalizada' | 'paga';
export type MovementType = 'entrada' | 'saida' | 'ajuste' | 'consumo' | 'perda';
export type CategoryKind =
  | 'receita'
  | 'custo-variavel'
  | 'custo-fixo'
  | 'despesa'
  | 'imposto'
  | 'outros';
export type AlertSeverity = 'info' | 'aviso' | 'critico';

export type StatusKind =
  | AppointmentStatus
  | CommandStatus
  | MovementType
  | CategoryKind
  | AlertSeverity;

export function appointmentStatusToBadge(
  status: 'scheduled' | 'done' | 'cancelled' | 'no_show',
): AppointmentStatus {
  switch (status) {
    case 'scheduled':
      return 'agendado';
    case 'done':
      return 'realizado';
    case 'cancelled':
      return 'cancelado';
    case 'no_show':
      return 'falta';
  }
}

export function commandStatusToBadge(
  status: 'open' | 'finalized' | 'paid' | 'cancelled',
): CommandStatus | AppointmentStatus {
  switch (status) {
    case 'open':
      return 'aberta';
    case 'finalized':
      return 'finalizada';
    case 'paid':
      return 'paga';
    case 'cancelled':
      return 'cancelado';
  }
}

export function movementTypeToBadge(
  type: 'entry' | 'exit' | 'adjustment' | 'service_consumption' | 'loss',
): MovementType {
  switch (type) {
    case 'entry':
      return 'entrada';
    case 'exit':
      return 'saida';
    case 'adjustment':
      return 'ajuste';
    case 'service_consumption':
      return 'consumo';
    case 'loss':
      return 'perda';
  }
}

export function categoryKindToBadge(
  kind: 'revenue' | 'variable_cost' | 'fixed_cost' | 'operating_expense' | 'tax' | 'other',
): CategoryKind {
  switch (kind) {
    case 'revenue':
      return 'receita';
    case 'variable_cost':
      return 'custo-variavel';
    case 'fixed_cost':
      return 'custo-fixo';
    case 'operating_expense':
      return 'despesa';
    case 'tax':
      return 'imposto';
    case 'other':
      return 'outros';
  }
}

export function alertSeverityToBadge(
  severity: 'info' | 'warning' | 'critical',
): AlertSeverity {
  switch (severity) {
    case 'info':
      return 'info';
    case 'warning':
      return 'aviso';
    case 'critical':
      return 'critico';
  }
}
