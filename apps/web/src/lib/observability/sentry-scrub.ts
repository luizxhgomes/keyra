/**
 * Sentry PII scrubbing — KEYRA Story auth.0 (R16 da auditoria de segurança).
 *
 * Por que existe: Server Actions e API routes podem capturar input de usuário
 * em breadcrumbs, exception extras, request bodies e contexts quando algo dá
 * erro. Sem scrubbing, senhas, tokens e PII (CPF, telefone) viajariam pra
 * o Sentry e ficariam visíveis no dashboard pra qualquer dev — vetor real de
 * vazamento.
 *
 * Estratégia: percorrer recursivamente as estruturas de evento que o Sentry
 * envia e substituir o VALOR de qualquer chave que bater no padrão sensível
 * por '[REDACTED]'. Não tocamos nas chaves nem na forma do objeto — só no
 * valor. Isso preserva a utilidade do erro (sabemos que o campo existia) sem
 * vazar conteúdo.
 *
 * Lista de padrões: derivada do OWASP Sensitive Data Cheat Sheet + termos
 * em pt-BR específicos do KEYRA (`senha`, `celular`, `cpf`).
 */

/**
 * `scrubSensitiveFields` aceita o evento via genérico T e retorna o MESMO tipo,
 * permitindo que o caller (Sentry SDK) preserve seu tipo concreto (`ErrorEvent`,
 * `TransactionEvent`, etc.) sem precisarmos importar `@sentry/core` (dep
 * transitiva via `@sentry/nextjs`, não exposta diretamente pelo pnpm).
 *
 * Internamente, fazemos narrowing controlado nos campos que sabemos existir:
 *   `extra`, `contexts`, `request.data`, `request.headers`, `request.cookies`,
 *   `exception.values[].mechanism.data`, `breadcrumbs[].data`.
 *
 * Qualquer outra chave do evento permanece intacta (apenas o VALOR de chaves
 * que batem em `SENSITIVE_KEY_PATTERNS` é substituído por '[REDACTED]').
 */

/** Chaves cujo VALOR deve ser substituído por '[REDACTED]'. Case-insensitive. */
const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /senha/i,
  /confirma/i,
  /token/i,
  /secret/i,
  /api[_-]?key/i,
  /authorization/i,
  /cookie/i,
  /cpf/i,
  /phone/i,
  /celular/i,
  /telefone/i,
] as const;

const REDACTED = '[REDACTED]';

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

/**
 * Substitui in-place o valor de qualquer chave sensível dentro do objeto.
 * Recursivo. Tolerante a ciclos via `WeakSet`.
 */
function scrubObject(obj: unknown, seen: WeakSet<object>): unknown {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => scrubObject(item, seen));
  }

  if (typeof obj !== 'object') return obj;

  if (seen.has(obj as object)) return obj; // ciclo
  seen.add(obj as object);

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (isSensitiveKey(key)) {
      result[key] = REDACTED;
    } else {
      result[key] = scrubObject(value, seen);
    }
  }
  return result;
}

/**
 * Hook `beforeSend` do Sentry. Aplica scrubbing nas seções do evento que
 * tipicamente carregam input de usuário ou request data.
 *
 * Retorna o evento (mutado) para Sentry continuar o pipeline.
 *
 * Áreas cobertas (definidas pelo schema do evento Sentry):
 *   - `event.extra`           — context extra adicionado via `Sentry.setExtra`
 *   - `event.contexts`        — `device`, `runtime`, `state`, etc.
 *   - `event.request.data`    — body de POST/PUT
 *   - `event.request.headers` — pega `Authorization`, `Cookie`
 *   - `event.exception.values[].mechanism.data` — input que causou exception
 *   - `event.breadcrumbs[].data` — bag de dados das migalhas
 */
export function scrubSensitiveFields<T>(event: T): T {
  if (!event || typeof event !== 'object') return event;

  const seen = new WeakSet<object>();
  // Cast interno controlado — narrowing seguro, escrevemos só nas chaves que
  // sabemos existir e usamos optional chaining para tudo. O retorno é T puro.
  const e = event as unknown as {
    extra?: unknown;
    contexts?: unknown;
    request?: { data?: unknown; headers?: unknown; cookies?: unknown };
    exception?: { values?: Array<{ mechanism?: { data?: unknown } }> };
    breadcrumbs?: Array<{ data?: unknown }>;
  };

  if (e.extra) {
    e.extra = scrubObject(e.extra, seen);
  }

  if (e.contexts) {
    e.contexts = scrubObject(e.contexts, seen);
  }

  if (e.request) {
    if (e.request.data !== undefined) {
      e.request.data = scrubObject(e.request.data, seen);
    }
    if (e.request.headers) {
      e.request.headers = scrubObject(e.request.headers, seen);
    }
    if (e.request.cookies) {
      e.request.cookies = scrubObject(e.request.cookies, seen);
    }
  }

  if (e.exception?.values) {
    e.exception.values = e.exception.values.map((v) => {
      if (v.mechanism?.data) {
        return {
          ...v,
          mechanism: {
            ...v.mechanism,
            data: scrubObject(v.mechanism.data, seen),
          },
        };
      }
      return v;
    });
  }

  if (e.breadcrumbs) {
    e.breadcrumbs = e.breadcrumbs.map((bc) => {
      if (bc.data) {
        return { ...bc, data: scrubObject(bc.data, seen) };
      }
      return bc;
    });
  }

  return event;
}

// ----------------------------------------------------------------------------
// Smoke test inline — executa quando o arquivo é importado em ambiente Node
// com NODE_ENV=test ou quando KEYRA_SENTRY_SCRUB_SELFTEST=1. Mantém zero
// overhead em produção.
//
// Vitest entra em auth.0 oficialmente; até lá esta função roda manualmente:
//   pnpm exec tsx apps/web/src/lib/observability/sentry-scrub.ts
// ----------------------------------------------------------------------------

if (process.env.KEYRA_SENTRY_SCRUB_SELFTEST === '1') {
  const sample = {
    extra: {
      password: 'minha-senha-123',
      senha: 'outra',
      email: 'camila@clinica.com.br',
      cpf: '123.456.789-00',
      phone: '(11) 99999-9999',
      nested: { token: 'tok_xyz', publicId: 'abc' },
    },
    request: {
      data: { senha: '111111', confirmaSenha: '111111', clinica: 'Belle' },
      headers: { Authorization: 'Bearer abc', 'X-Forwarded-For': '1.1.1.1' },
    },
  };
  const scrubbed = scrubSensitiveFields(JSON.parse(JSON.stringify(sample)) as typeof sample);
  const extra = scrubbed.extra as Record<string, unknown>;
  const nested = extra.nested as Record<string, unknown>;
  const reqData = scrubbed.request.data as Record<string, unknown>;
  const reqHeaders = scrubbed.request.headers as Record<string, unknown>;

  const ok =
    extra.password === REDACTED &&
    extra.senha === REDACTED &&
    extra.email === 'camila@clinica.com.br' &&
    extra.cpf === REDACTED &&
    extra.phone === REDACTED &&
    nested.token === REDACTED &&
    nested.publicId === 'abc' &&
    reqData.senha === REDACTED &&
    reqHeaders.Authorization === REDACTED &&
    reqHeaders['X-Forwarded-For'] === '1.1.1.1';

  console.log(ok ? '✅ sentry-scrub selftest OK' : '❌ sentry-scrub selftest FAIL', scrubbed);
  if (!ok) process.exit(1);
}
