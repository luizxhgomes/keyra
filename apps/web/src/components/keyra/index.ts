export { AlertCard, type AlertCardProps } from './AlertCard';
export { ComparativoTexto, type ComparativoTextoProps } from './ComparativoTexto';
export { KPICard, type KPICardProps } from './KPICard';
export {
  Skeleton,
  KPICardSkeleton,
  TableSkeleton,
  type SkeletonProps,
} from './Skeleton';
export { EmptyState, type EmptyStateProps } from './EmptyState';
export { Headline, type HeadlineProps } from './Headline';
export { ErrorMessage, type ErrorMessageProps } from './ErrorMessage';
export { LegalDocument, type LegalDocumentProps } from './LegalDocument';
export { StatusBadge, type StatusBadgeProps } from './StatusBadge';
export {
  appointmentStatusToBadge,
  commandStatusToBadge,
  movementTypeToBadge,
  categoryKindToBadge,
  alertSeverityToBadge,
  type StatusKind,
  type AppointmentStatus,
  type CommandStatus,
  type MovementType,
  type CategoryKind,
  type AlertSeverity,
} from './status-badge-mappers';
