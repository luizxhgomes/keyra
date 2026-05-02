'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

import { safeLocalStorage } from '@/lib/storage';

/**
 * `useDismissedAlerts` (Story 6.3) — hook SSR-safe para gerenciar alertas
 * silenciados pela usuária.
 *
 * Pattern canônico React 18+ via `useSyncExternalStore` que casa SSR e
 * client de forma síncrona, sem hydration mismatch warning e sem
 * `useEffect` mutativo (compliance React 19 — `react-hooks/set-state-in-effect`).
 *
 * - **SSR snapshot**: array vazio. Server renderiza com zero alertas
 *   silenciados — comportamento correto pois localStorage não existe
 *   no server. Hidratação aplica filtro real sem flicker.
 * - **Client snapshot**: lê localStorage com cleanup automático on-read
 *   (entries cujo `dismissedUntil` já expirou são descartadas).
 * - **Subscribe**: ouve `storage` event do window — silenciar em uma aba
 *   reflete em outra automaticamente. Para a própria aba que escreve,
 *   `dismiss()` dispara `StorageEvent` manual (browsers não emitem
 *   `storage` na origem da escrita por design).
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

function subscribe(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

const EMPTY_SNAPSHOT: DismissedEntry[] = [];

export interface UseDismissedAlertsResult {
  dismissedIds: Set<string>;
  dismiss: (alertId: string) => void;
  isDismissed: (alertId: string) => boolean;
}

export function useDismissedAlerts(orgId: string): UseDismissedAlertsResult {
  const entries = useSyncExternalStore<DismissedEntry[]>(
    subscribe,
    () => readEntries(orgId),
    () => EMPTY_SNAPSHOT,
  );

  // Memoiza o Set para que `isDismissed` (useCallback abaixo) tenha
  // dependência estável quando `entries` não muda — evita warning
  // `react-hooks/exhaustive-deps`.
  const dismissedIds = useMemo(
    () => new Set(entries.map((e) => e.alertId)),
    [entries],
  );

  const dismiss = useCallback(
    (alertId: string) => {
      if (typeof window === 'undefined') return;
      const current = readEntries(orgId);
      const dismissedUntil = new Date(Date.now() + DISMISS_TTL_MS).toISOString();
      const next = [
        ...current.filter((e) => e.alertId !== alertId),
        { alertId, dismissedUntil },
      ];
      const key = getStorageKey(orgId);
      safeLocalStorage.setJSON(key, next);
      // Browsers não emitem `storage` event na própria aba que escreveu.
      // Dispatch manual força re-leitura via `useSyncExternalStore` aqui
      // E também notifica outras abas (que receberiam o evento natural).
      try {
        window.dispatchEvent(new StorageEvent('storage', { key }));
      } catch {
        // Fallback para browsers antigos: força reflow via setItem(key, value)
        // — `useSyncExternalStore` re-lê. Custo zero em browsers modernos.
        const raw = safeLocalStorage.getItem(key);
        if (raw !== null) safeLocalStorage.setItem(key, raw);
      }
    },
    [orgId],
  );

  const isDismissed = useCallback(
    (alertId: string) => dismissedIds.has(alertId),
    [dismissedIds],
  );

  return { dismissedIds, dismiss, isDismissed };
}
