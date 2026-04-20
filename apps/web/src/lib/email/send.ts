import 'server-only';

import { Resend } from 'resend';
import { render } from '@react-email/render';
import type { ReactElement } from 'react';

import { env } from '@/lib/env';

/**
 * Helper canônico de disparo de email transacional (ADR-021).
 *
 * - Server-only (nunca importar do client).
 * - Quando `RESEND_API_KEY` está ausente ou `NODE_ENV === 'test'`, faz dry-run
 *   e apenas loga o payload (útil para testes e ambientes dev sem credencial).
 * - Usa o `EMAIL_FROM` da env como remetente padrão. Pode ser sobrescrito por
 *   feature se necessário (ex.: notificações vs convites).
 * - Idempotência: quem chama deve passar `idempotencyKey` derivado de algo
 *   estável (id do convite, id do lembrete) para evitar duplo envio em retries.
 */

type SendEmailArgs = {
  to: string | string[];
  subject: string;
  react: ReactElement;
  /** Override do remetente padrão (EMAIL_FROM). */
  from?: string;
  /** Copy to plain text. Se omitido, é derivado do HTML renderizado. */
  text?: string;
  /** Chave de idempotência (Resend: header `Idempotency-Key`). */
  idempotencyKey?: string;
  /** Tags para observabilidade no dashboard Resend. */
  tags?: Array<{ name: string; value: string }>;
};

type SendEmailResult =
  | { ok: true; id: string; dryRun: false }
  | { ok: true; id: null; dryRun: true }
  | { ok: false; error: string };

export async function sendEmail(args: SendEmailArgs): Promise<SendEmailResult> {
  const { to, subject, react, from, text, idempotencyKey, tags } = args;

  const html = await render(react);
  const plainText = text ?? (await render(react, { plainText: true }));

  const shouldDryRun = !env.RESEND_API_KEY || env.NODE_ENV === 'test';

  if (shouldDryRun) {
    console.info(
      '[email:dry-run]',
      JSON.stringify(
        {
          to,
          subject,
          from: from ?? env.EMAIL_FROM,
          preview: plainText.slice(0, 120),
          idempotencyKey,
          tags,
        },
        null,
        2,
      ),
    );
    return { ok: true, id: null, dryRun: true };
  }

  const resend = new Resend(env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send(
    {
      from: from ?? env.EMAIL_FROM,
      to,
      subject,
      html,
      text: plainText,
      ...(tags ? { tags } : {}),
    },
    idempotencyKey ? { idempotencyKey } : undefined,
  );

  if (error) {
    console.error('[email:send:error]', error);
    return { ok: false, error: error.message };
  }

  return { ok: true, id: data?.id ?? '', dryRun: false };
}
