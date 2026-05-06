/**
 * KEYRA — BroadcastChannel helper para sincronizar estados de auth entre abas.
 *
 * Story auth.8 do EPIC-AUTH-V2.
 *
 * Caso de uso original: aba A mostra `/esqueci-senha` em estado `submitted`;
 * aba B (aberta pelo link de email) completa o reset; queremos que a aba A
 * receba o sinal e atualize a UI sem clique adicional.
 *
 * Defensive checks:
 *   - `BroadcastChannel` é Browser API (suporte amplo: iOS Safari 15.4+,
 *     Chrome 54+, Firefox 38+ — >97% global desde 2022).
 *   - SSR e browsers muito antigos: helper faz no-op silencioso (sem erro).
 *
 * Convenções:
 *   - Channel name único e namespaced (`KEYRA_AUTH_CHANNEL`) para não
 *     colidir com outros canais que outras libs possam abrir.
 *   - Mensagens são objetos discriminados por `type` (extensível sem
 *     breaking change).
 */

export const KEYRA_AUTH_CHANNEL = 'keyra-auth-events';

export type KeyraAuthEvent = { type: 'password_reset_completed' };

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') {
    return null;
  }
  return new BroadcastChannel(KEYRA_AUTH_CHANNEL);
}

/**
 * Posta um evento de auth no canal — fire-and-forget.
 * Em ambientes sem BroadcastChannel (SSR / browsers antigos), faz no-op.
 */
export function postKeyraAuthEvent(event: KeyraAuthEvent): void {
  const channel = getBroadcastChannel();
  if (!channel) return;
  try {
    channel.postMessage(event);
  } finally {
    channel.close();
  }
}

/**
 * Inscreve um handler para receber eventos de auth de outras abas.
 * Retorna função de cleanup (idiomático para `useEffect`).
 *
 * O handler NÃO é chamado para mensagens postadas pela própria aba —
 * BroadcastChannel só notifica os outros listeners conectados ao mesmo
 * channel name.
 */
export function subscribeKeyraAuthEvents(
  handler: (event: KeyraAuthEvent) => void,
): () => void {
  if (typeof BroadcastChannel === 'undefined') {
    return () => {
      /* no-op cleanup */
    };
  }

  const channel = new BroadcastChannel(KEYRA_AUTH_CHANNEL);
  const messageHandler = (e: MessageEvent<KeyraAuthEvent>) => {
    handler(e.data);
  };
  channel.addEventListener('message', messageHandler);

  return () => {
    channel.removeEventListener('message', messageHandler);
    channel.close();
  };
}
