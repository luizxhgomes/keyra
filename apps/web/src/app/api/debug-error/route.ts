import { NextResponse } from 'next/server';
import { startOfMonth, subMonths, endOfMonth } from 'date-fns';

import { requireAuth } from '@/lib/auth/require-auth';
import { getCurrentRole } from '@/lib/auth/roles';
import { createServerClient } from '@/lib/supabase/server';

/**
 * TEMPORARY DIAGNOSTIC ENDPOINT — Story de emergência (Camila reportou que
 * (app)/* explode com digest 3213099672 mas Agenda funciona). Bypassa o
 * error boundary do Next e retorna JSON com cada step e seu erro.
 *
 * Apaga assim que diagnosticado.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type StepResult = {
  step: string;
  ok: boolean;
  data?: unknown;
  error?: { message: string; stack?: string; name?: string };
};

function captureError(err: unknown): NonNullable<StepResult['error']> {
  if (err instanceof Error) {
    return {
      message: err.message,
      ...(err.stack ? { stack: err.stack } : {}),
      name: err.name,
    };
  }
  return { message: String(err) };
}

export async function GET() {
  const steps: StepResult[] = [];

  // STEP 1 — auth
  let user: Awaited<ReturnType<typeof requireAuth>>['user'] | undefined;
  let orgId: string | undefined;
  try {
    const auth = await requireAuth();
    user = auth.user;
    orgId = auth.orgId;
    steps.push({
      step: 'auth.requireAuth',
      ok: true,
      data: {
        user_id: auth.user.id,
        user_email: auth.user.email,
        org_id: auth.orgId,
        // sniff app_metadata to see if org_id claim exists
        app_metadata_keys: Object.keys(auth.user.app_metadata ?? {}),
        app_metadata_org_id: (auth.user.app_metadata as Record<string, unknown>)
          ?.['org_id'] ?? null,
      },
    });
  } catch (err) {
    steps.push({ step: 'auth.requireAuth', ok: false, error: captureError(err) });
    return NextResponse.json({ steps });
  }

  // STEP 2 — role
  try {
    const role = await getCurrentRole(orgId!);
    steps.push({ step: 'auth.getCurrentRole', ok: true, data: { role } });
  } catch (err) {
    steps.push({
      step: 'auth.getCurrentRole',
      ok: false,
      error: captureError(err),
    });
  }

  const supabase = await createServerClient();

  // STEP 3 — JWT decode (raw)
  try {
    const { data: sess } = await supabase.auth.getSession();
    const token = sess.session?.access_token;
    let payload: Record<string, unknown> | null = null;
    if (token) {
      const part = token.split('.')[1];
      if (part) {
        payload = JSON.parse(
          Buffer.from(part.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString(
            'utf8',
          ),
        ) as Record<string, unknown>;
      }
    }
    steps.push({
      step: 'jwt.decode',
      ok: true,
      data: {
        has_session: !!sess.session,
        jwt_org_id: payload?.['org_id'] ?? null,
        jwt_user_role: payload?.['user_role'] ?? null,
        jwt_aud: payload?.['aud'] ?? null,
      },
    });
  } catch (err) {
    steps.push({ step: 'jwt.decode', ok: false, error: captureError(err) });
  }

  // STEP 4 — v_dashboard_kpis
  try {
    const r = await supabase
      .from('v_dashboard_kpis')
      .select('revenue_mtd, expected_revenue_mtd, expenses_mtd, appointments_today')
      .eq('org_id', orgId!)
      .maybeSingle();
    steps.push({
      step: 'query.v_dashboard_kpis',
      ok: !r.error,
      data: r.data,
      ...(r.error
        ? {
            error: {
              message: r.error.message,
              name: r.error.code ?? 'PostgresError',
              stack: JSON.stringify(r.error),
            },
          }
        : {}),
    });
  } catch (err) {
    steps.push({
      step: 'query.v_dashboard_kpis',
      ok: false,
      error: captureError(err),
    });
  }

  // STEP 5 — transactions (the big one — used by dashboard last-month)
  try {
    const lastMonth = subMonths(new Date(), 1);
    const lastStart = startOfMonth(lastMonth).toISOString().slice(0, 10);
    const lastEnd = endOfMonth(lastMonth).toISOString().slice(0, 10);
    const r = await supabase
      .from('transactions')
      .select('net_amount')
      .eq('org_id', orgId!)
      .eq('direction', 'credit')
      .gte('reference_date', lastStart)
      .lte('reference_date', lastEnd)
      .is('deleted_at', null)
      .limit(5);
    steps.push({
      step: 'query.transactions',
      ok: !r.error,
      data: { count: r.data?.length ?? 0 },
      ...(r.error
        ? {
            error: {
              message: r.error.message,
              name: r.error.code ?? 'PostgresError',
              stack: JSON.stringify(r.error),
            },
          }
        : {}),
    });
  } catch (err) {
    steps.push({ step: 'query.transactions', ok: false, error: captureError(err) });
  }

  // STEP 6 — customers (pacientes page)
  try {
    const r = await supabase
      .from('customers')
      .select('id, full_name', { count: 'exact' })
      .eq('org_id', orgId!)
      .is('deleted_at', null)
      .limit(5);
    steps.push({
      step: 'query.customers',
      ok: !r.error,
      data: { count: r.count, sample_len: r.data?.length ?? 0 },
      ...(r.error
        ? {
            error: {
              message: r.error.message,
              name: r.error.code ?? 'PostgresError',
              stack: JSON.stringify(r.error),
            },
          }
        : {}),
    });
  } catch (err) {
    steps.push({ step: 'query.customers', ok: false, error: captureError(err) });
  }

  // STEP 7 — commands (comandas page)
  try {
    const r = await supabase
      .from('commands')
      .select(
        `id, status, subtotal, customer:customers(full_name), professional:professionals(display_name)`,
        { count: 'exact' },
      )
      .eq('org_id', orgId!)
      .is('deleted_at', null)
      .limit(5);
    steps.push({
      step: 'query.commands',
      ok: !r.error,
      data: { count: r.count, sample_len: r.data?.length ?? 0 },
      ...(r.error
        ? {
            error: {
              message: r.error.message,
              name: r.error.code ?? 'PostgresError',
              stack: JSON.stringify(r.error),
            },
          }
        : {}),
    });
  } catch (err) {
    steps.push({ step: 'query.commands', ok: false, error: captureError(err) });
  }

  // STEP 8 — services (servicos page)
  try {
    const r = await supabase
      .from('services')
      .select('id, name, price', { count: 'exact' })
      .eq('org_id', orgId!)
      .is('deleted_at', null)
      .limit(5);
    steps.push({
      step: 'query.services',
      ok: !r.error,
      data: { count: r.count, sample_len: r.data?.length ?? 0 },
      ...(r.error
        ? {
            error: {
              message: r.error.message,
              name: r.error.code ?? 'PostgresError',
              stack: JSON.stringify(r.error),
            },
          }
        : {}),
    });
  } catch (err) {
    steps.push({ step: 'query.services', ok: false, error: captureError(err) });
  }

  // STEP 9 — supplies (estoque page)
  try {
    const r = await supabase
      .from('supplies')
      .select('id, name, current_stock', { count: 'exact' })
      .eq('org_id', orgId!)
      .is('deleted_at', null)
      .limit(5);
    steps.push({
      step: 'query.supplies',
      ok: !r.error,
      data: { count: r.count, sample_len: r.data?.length ?? 0 },
      ...(r.error
        ? {
            error: {
              message: r.error.message,
              name: r.error.code ?? 'PostgresError',
              stack: JSON.stringify(r.error),
            },
          }
        : {}),
    });
  } catch (err) {
    steps.push({ step: 'query.supplies', ok: false, error: captureError(err) });
  }

  return NextResponse.json({
    user_id: user?.id,
    org_id: orgId,
    steps,
  });
}
