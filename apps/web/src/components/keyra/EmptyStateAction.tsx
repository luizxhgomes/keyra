'use client';

import { Button } from '@/components/ui/button';

/**
 * Wrapper Client-only do botão `action.onClick` do `<EmptyState>`.
 *
 * Existe porque `onClick: () => void` não pode ser serializado de
 * Server → Client em RSC (React 19). EmptyState é Server Component
 * (HOTFIX 2026-05-02 — digest 3213099672) e delega APENAS o caso com
 * onClick para este Client Component dedicado.
 *
 * Casos com `action.href` ficam no Server (usa `<Link>` puro).
 */
export function EmptyStateAction({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button size="sm" className="mt-2" onClick={onClick}>
      {label}
    </Button>
  );
}
