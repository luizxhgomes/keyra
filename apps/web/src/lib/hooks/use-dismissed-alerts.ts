'use client';

import { useCallback, useEffect, useState } from 'react';

import { safeLocalStorage } from '@/lib/storage';

/**
 * `useDismissedAlerts` — gerencia alertas silenciados pela usuária.
 *
 * **HOTFIX 2026-05-02:** reescrito sem `useSyncExternalStore`. A versão
 * anterior (Story 6.3) usava `useSyncExternalStore` para evitar hydration
 * mismatch, mas em Next 16 + React 19 o pattern estava causando erro de
 * hidratação em produção (digest 3213099672 no Dashboard).
 *
 * Trade-off aceito: SSR renderiza com `dismissedIds` vazio. Client lê
 * localStorage no `useEffect` após mount e atualiza state. Pode haver flash
 * de ~50ms onde alertas silenciados aparecem antes de sumir — aceitável
 * porque (a) raramente há alertas silenciados em produção real, (b)
 * confiabilidade > microoptimização visual.
 *
 * Persistência: chave `keyra:dismissed-alerts:{orgId}`. TTL de 7 dias.
 */

type DismissedEntry = { alertId: string; dismissedUntil: string };

const STORAGE_PREFIX = 'keyra:dismissed-alerts:';
const DISMISS_DAYS = 7;
const DISMISS_TTL_MS = DISMISS_DAYS * 24 * 60 * 60 * 1000;

function getStorageKey(orgId: string): string {
  return `${STORAGE_PREFIX}${orgId}`;
}

function readEntries(orgId: string): DismissedEntry[] {
  const raw = safeLocalStorage.getJSON<DismissedEntry[]>(getStorageKey(orgId), []);
  if (!Array.isArray(raw)) return [];
  // Cleanup de entries expiradas — feito on-read.
  const now = Date.now();
  return raw.filter((e) => {
    if (!e || typeof e.alertId !== 'string' || typeof e.dismissedUntil !== 'string') {
      return false;
    }
    const until = new Date(e.dismissedUntil).getTime();
    return Number.isFinite(until) && until > now;
  });
}

export interface UseDismissedAlertsResult {
  dismissedIds: Set<string>;
  dismiss: (alertId: string) => void;
  isDismissed: (alertId: string) => boolean;
}

export function useDismissedAlerts(orgId: string): UseDismissedAlertsResult {
  // Server snapshot e primeiro client render: vazio. Sem hydration mismatch.
  const [entries, setEntries] = useState<DismissedEntry[]>([]);

  // Após mount, lê localStorage assincronamente para evitar cascading render
  // (regra `react-hooks/set-state-in-effect` do projeto). `queueMicrotask`
  // adia o setState pro próximo microtask sem visual delay perceptível.
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setEntries(readEntries(orgId));
    });

    // Listener para sincronizar entre abas.
    const handleStorage = (e: StorageEvent) => {
      if (e.key === getStorageKey(orgId) || e.key === null) {
        queueMicrotask(() => {
          if (!cancelled) setEntries(readEntries(orgId));
        });
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      cancelled = true;
      window.removeEventListener('storage', handleStorage);
    };
  }, [orgId]);

  const dismiss = useCallback(
    (alertId: string) => {
      if (typeof window === 'undefined') return;
      const current = readEntries(orgId);
      const dismissedUntil = new Date(Date.now() + DISMISS_TTL_MS).toISOString();
      const next = [
        ...current.filter((e) => e.alertId !== alertId),
        { alertId, dismissedUntil },
      ];
      safeLocalStorage.setJSON(getStorageKey(orgId), next);
      setEntries(next);
    },
    [orgId],
  );

  const dismissedIds = new Set(entries.map((e) => e.alertId));
  const isDismissed = useCallback(
    (alertId: string) => dismissedIds.has(alertId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries],
  );

  return { dismissedIds, dismiss, isDismissed };
}
