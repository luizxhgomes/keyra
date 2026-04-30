/**
 * Helper para validar o parâmetro `?next=` usado em fluxos pós-login (magic
 * link, aceite de convite). Sem isto, qualquer atacante poderia gerar um link
 * `/login?next=https://evil.com` e o `/auth/callback` redirecionaria a vítima
 * para o site malicioso após autenticar — clássico open redirect.
 *
 * Regras (todas obrigatórias):
 *   1. Tem que começar com '/' (caminho relativo na própria origin).
 *   2. NÃO pode começar com '//' (URL protocol-relative — `//evil.com/x`
 *      seria interpretada como `https://evil.com/x`).
 *   3. NÃO pode conter '://' em lugar nenhum (defesa em profundidade
 *      contra encoded shenanigans).
 *
 * Pode rodar em qualquer ambiente (sem `server-only`) — usado tanto no
 * proxy edge quanto em route handlers Node.
 */
export function isSafeNextPath(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0) return false;
  if (!value.startsWith('/')) return false;
  if (value.startsWith('//')) return false;
  if (value.includes('://')) return false;
  return true;
}

/**
 * Convenience: retorna `next` se válido, senão `null`. Útil para `??` chains.
 */
export function getSafeNext(value: unknown): string | null {
  return isSafeNextPath(value) ? value : null;
}
