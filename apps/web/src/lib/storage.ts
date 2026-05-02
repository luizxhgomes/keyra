/**
 * `safeLocalStorage` (Story 6.3) — wrapper SSR-safe e fail-safe para localStorage.
 *
 * Trata cenários onde localStorage falha:
 * - SSR (window não definido)
 * - Modo privado/incognito (Safari iOS lança QuotaExceededError em setItem)
 * - Storage cheio (QuotaExceededError)
 * - JSON parse de valor corrompido por outra aba ou versão anterior
 *
 * Retorna fallback (`null`/`false`/valor padrão) ao invés de throw — UX
 * permanece estável. Falhas são silenciosas porque o consumidor sempre
 * checa o retorno e não há ação corretiva útil que o usuário possa tomar.
 */
export const safeLocalStorage = {
  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem(key: string, value: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },

  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Silencioso — falha aqui não afeta UX.
    }
  },

  getJSON<T>(key: string, fallback: T): T {
    const raw = this.getItem(key);
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  setJSON<T>(key: string, value: T): boolean {
    try {
      return this.setItem(key, JSON.stringify(value));
    } catch {
      return false;
    }
  },
};
