'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireAuth } from '@/lib/auth/require-auth';
import {
  AuthorizationError,
  requireRole,
} from '@/lib/auth/roles';
import { createServerClient } from '@/lib/supabase/server';
import { patientIdSchema, patientSchema, type PatientInput } from '@/lib/validators/patient';

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function toError(err: unknown, fallback = 'Erro inesperado.'): string {
  if (err instanceof AuthorizationError) return err.message;
  if (err instanceof z.ZodError) return err.issues.map((i) => i.message).join(' · ');
  if (err instanceof Error) return err.message;
  return fallback;
}

export async function upsertPatient(
  input: PatientInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { orgId } = await requireAuth();
    // `professional` e superiores podem mutar pacientes. viewer só lê.
    await requireRole(orgId, 'professional');

    const parsed = patientSchema.parse(input);
    const supabase = await createServerClient();

    const payload = {
      org_id: orgId,
      full_name: parsed.fullName,
      ...(parsed.phone ? { phone: parsed.phone } : {}),
      ...(parsed.email ? { email: parsed.email } : {}),
      ...(parsed.birthDate ? { birth_date: parsed.birthDate } : {}),
      ...(parsed.notes ? { notes: parsed.notes } : {}),
    };

    if (parsed.id) {
      const { error } = await supabase
        .from('customers')
        .update(payload)
        .eq('id', parsed.id)
        .eq('org_id', orgId);
      if (error) return { ok: false, error: error.message };
      revalidatePath('/pacientes');
      revalidatePath(`/pacientes/${parsed.id}`);
      return { ok: true, data: { id: parsed.id } };
    }

    const { data, error } = await supabase
      .from('customers')
      .insert(payload)
      .select('id')
      .single();

    if (error || !data) {
      return { ok: false, error: error?.message ?? 'Não foi possível criar o paciente.' };
    }

    revalidatePath('/pacientes');
    return { ok: true, data: { id: data.id } };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

export async function archivePatient(
  input: z.infer<typeof patientIdSchema>,
): Promise<ActionResult> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'admin');

    const { id } = patientIdSchema.parse(input);
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('customers')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('org_id', orgId);

    if (error) return { ok: false, error: error.message };
    revalidatePath('/pacientes');
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

export async function unarchivePatient(
  input: z.infer<typeof patientIdSchema>,
): Promise<ActionResult> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'admin');

    const { id } = patientIdSchema.parse(input);
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('customers')
      .update({ deleted_at: null })
      .eq('id', id)
      .eq('org_id', orgId);

    if (error) return { ok: false, error: error.message };
    revalidatePath('/pacientes');
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

// ---------------------------------------------------------------------------
// Refinamento Fase 1 — Perfil completo do paciente (referência cliente)
// ---------------------------------------------------------------------------

export type PatientProfile = {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  birthDate: string | null;
  notes: string | null;
  createdAt: string;
  archived: boolean;
  /** Idade calculada (anos completos) ou null. */
  age: number | null;
  /** ID curto display (primeiros 8 chars do UUID). */
  shortId: string;
  /** Métricas agregadas do cliente. */
  metrics: {
    totalSpentCents: number;
    pendingCents: number;
    encountersTotal: number;
    appointmentsPerMonth: number;
    /** Última visita realizada (status=done). */
    lastVisit: string | null;
  };
};

export async function getPatientProfile(
  id: string,
): Promise<ActionResult<PatientProfile>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'viewer');
    const supabase = await createServerClient();

    const [patientRes, paidCmdRes, openCmdRes, doneApptsRes] = await Promise.all([
      supabase
        .from('customers')
        .select(
          'id, full_name, phone, email, birth_date, notes, deleted_at, created_at',
        )
        .eq('id', id)
        .eq('org_id', orgId)
        .maybeSingle(),
      supabase
        .from('commands')
        .select('total, paid_at')
        .eq('org_id', orgId)
        .eq('customer_id', id)
        .eq('status', 'paid')
        .is('deleted_at', null),
      supabase
        .from('commands')
        .select('total')
        .eq('org_id', orgId)
        .eq('customer_id', id)
        .eq('status', 'open')
        .is('deleted_at', null),
      supabase
        .from('appointments')
        .select('starts_at, status')
        .eq('org_id', orgId)
        .eq('customer_id', id)
        .is('deleted_at', null)
        .order('starts_at', { ascending: false }),
    ]);

    if (patientRes.error) return { ok: false, error: patientRes.error.message };
    if (!patientRes.data) return { ok: false, error: 'Paciente não encontrado.' };
    if (paidCmdRes.error) return { ok: false, error: paidCmdRes.error.message };
    if (openCmdRes.error) return { ok: false, error: openCmdRes.error.message };
    if (doneApptsRes.error)
      return { ok: false, error: doneApptsRes.error.message };

    const p = patientRes.data;

    const totalSpentCents = (paidCmdRes.data ?? []).reduce(
      (acc, c) => acc + Math.round(Number(c.total ?? 0) * 100),
      0,
    );
    const pendingCents = (openCmdRes.data ?? []).reduce(
      (acc, c) => acc + Math.round(Number(c.total ?? 0) * 100),
      0,
    );
    const allAppts = doneApptsRes.data ?? [];
    const doneAppts = allAppts.filter((a) => a.status === 'done');
    const encountersTotal = doneAppts.length;
    const lastVisit = doneAppts[0]?.starts_at ?? null;

    // Frequência: média de atendimentos por mês desde o primeiro paid.
    const firstPaid = (paidCmdRes.data ?? [])
      .map((c) => c.paid_at)
      .filter((d): d is string => !!d)
      .sort()[0];
    let appointmentsPerMonth = 0;
    if (firstPaid && encountersTotal > 0) {
      const now = new Date();
      const start = new Date(firstPaid);
      const months =
        Math.max(
          1,
          (now.getFullYear() - start.getFullYear()) * 12 +
            (now.getMonth() - start.getMonth()),
        ) + 1;
      appointmentsPerMonth =
        Math.round((encountersTotal / months) * 10) / 10;
    }

    let age: number | null = null;
    if (p.birth_date) {
      const bd = new Date(p.birth_date);
      const now = new Date();
      age = now.getFullYear() - bd.getFullYear();
      const md = now.getMonth() - bd.getMonth();
      if (md < 0 || (md === 0 && now.getDate() < bd.getDate())) age -= 1;
    }

    return {
      ok: true,
      data: {
        id: p.id,
        fullName: p.full_name,
        phone: p.phone ?? null,
        email: p.email ?? null,
        birthDate: p.birth_date ?? null,
        notes: p.notes ?? null,
        createdAt: p.created_at,
        archived: !!p.deleted_at,
        age,
        shortId: p.id.slice(0, 8).toUpperCase(),
        metrics: {
          totalSpentCents,
          pendingCents,
          encountersTotal,
          appointmentsPerMonth,
          lastVisit,
        },
      },
    };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

export type PatientEncounter = {
  id: string;
  date: string;
  shortId: string;
  serviceName: string;
  professionalName: string;
  status: 'scheduled' | 'done' | 'cancelled' | 'no_show';
  amountCents: number;
};

export async function getPatientEncounters(
  id: string,
  limit = 20,
): Promise<ActionResult<PatientEncounter[]>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'viewer');
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('appointments')
      .select(
        `id, starts_at, status, price_snapshot,
         service:services(name),
         professional:professionals(display_name)`,
      )
      .eq('org_id', orgId)
      .eq('customer_id', id)
      .is('deleted_at', null)
      .order('starts_at', { ascending: false })
      .limit(limit);

    if (error) return { ok: false, error: error.message };

    const rows: PatientEncounter[] = (data ?? []).map((r) => {
      const s = r.service as { name: string } | { name: string }[] | null;
      const p = r.professional as
        | { display_name: string }
        | { display_name: string }[]
        | null;
      const svc = Array.isArray(s) ? s[0] : s;
      const prof = Array.isArray(p) ? p[0] : p;
      return {
        id: r.id,
        date: r.starts_at,
        shortId: r.id.slice(0, 8).toUpperCase(),
        serviceName: svc?.name ?? 'Serviço',
        professionalName: prof?.display_name ?? 'Profissional',
        status: r.status as PatientEncounter['status'],
        amountCents: Math.round(Number(r.price_snapshot ?? 0) * 100),
      };
    });

    return { ok: true, data: rows };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

export type PatientPayment = {
  id: string;
  date: string;
  commandShortId: string | null;
  status: 'paid';
  type: string;
  method: string;
  amountCents: number;
};

export async function getPatientPayments(
  id: string,
  limit = 20,
): Promise<ActionResult<PatientPayment[]>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'viewer');
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('transactions')
      .select(
        'id, reference_date, gross_amount, origin, source_type, source_id, description',
      )
      .eq('org_id', orgId)
      .eq('customer_id', id)
      .eq('direction', 'credit')
      .is('deleted_at', null)
      .order('reference_date', { ascending: false })
      .limit(limit);

    if (error) return { ok: false, error: error.message };

    const rows: PatientPayment[] = (data ?? []).map((r) => ({
      id: r.id,
      date: r.reference_date,
      commandShortId:
        r.source_type === 'command' && r.source_id
          ? String(r.source_id).slice(0, 8).toUpperCase()
          : null,
      status: 'paid' as const,
      type:
        r.origin === 'command_payment'
          ? 'Pagamento de comanda'
          : r.origin === 'manual_income'
            ? 'Receita manual'
            : r.origin,
      method: r.description ?? '—',
      amountCents: Math.round(Number(r.gross_amount ?? 0) * 100),
    }));

    return { ok: true, data: rows };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

// ---------------------------------------------------------------------------
// Demo seed — popular cliente fictício para demonstração visual
// ---------------------------------------------------------------------------

export type SeedDemoResult = {
  patientId: string;
  message: string;
};

/**
 * Cria 1 cliente fictício "Maria Silva (Demo)" com histórico realista:
 * - 5 atendimentos done em datas variadas dos últimos 5 meses
 * - 3 comandas pagas (status=paid)
 * - 3 transações credit linkadas
 *
 * Requer pelo menos 1 service ativo + 1 professional ativo + 1 account ativa.
 * Apenas role admin pode chamar.
 */
export async function seedDemoPatient(): Promise<ActionResult<SeedDemoResult>> {
  try {
    const { orgId, user } = await requireAuth();
    await requireRole(orgId, 'admin');
    const supabase = await createServerClient();

    const [svcRes, profRes, acctRes] = await Promise.all([
      supabase
        .from('services')
        .select('id, name, price, duration_minutes, commission_rate')
        .eq('org_id', orgId)
        .eq('active', true)
        .eq('type', 'service')
        .is('deleted_at', null)
        .limit(1)
        .maybeSingle(),
      supabase
        .from('professionals')
        .select('id, display_name, default_commission_rate')
        .eq('org_id', orgId)
        .eq('active', true)
        .is('deleted_at', null)
        .limit(1)
        .maybeSingle(),
      supabase
        .from('accounts')
        .select('id, name')
        .eq('org_id', orgId)
        .eq('active', true)
        .is('deleted_at', null)
        .limit(1)
        .maybeSingle(),
    ]);

    if (svcRes.error || !svcRes.data) {
      return {
        ok: false,
        error:
          'Cadastre pelo menos 1 serviço ativo antes de criar dados de demonstração (Catálogo → Novo serviço).',
      };
    }
    if (profRes.error || !profRes.data) {
      return {
        ok: false,
        error:
          'Cadastre pelo menos 1 profissional ativo antes de criar dados de demonstração (Time → Novo profissional).',
      };
    }
    if (acctRes.error || !acctRes.data) {
      return {
        ok: false,
        error:
          'Cadastre pelo menos 1 conta financeira ativa antes de criar dados de demonstração.',
      };
    }

    const service = svcRes.data;
    const professional = profRes.data;
    const account = acctRes.data;

    const demoName = 'Maria Silva (Demo)';
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('org_id', orgId)
      .eq('full_name', demoName)
      .is('deleted_at', null)
      .maybeSingle();

    if (existing) {
      return {
        ok: true,
        data: {
          patientId: existing.id,
          message: 'Cliente de demonstração já existe — abrindo perfil.',
        },
      };
    }

    const { data: newCustomer, error: custErr } = await supabase
      .from('customers')
      .insert({
        org_id: orgId,
        full_name: demoName,
        phone: '(11) 98765-4321',
        email: 'maria.demo@exemplo.com',
        birth_date: '1985-03-15',
        notes:
          'Cliente fictício gerado para demonstração visual. Histórico, KPIs e tabelas usam dados reais inseridos como exemplo. Pode arquivar a qualquer momento.',
      })
      .select('id')
      .single();

    if (custErr || !newCustomer) {
      return {
        ok: false,
        error: `Erro ao criar cliente: ${custErr?.message ?? 'desconhecido'}`,
      };
    }
    const customerId = newCustomer.id;

    const now = new Date();
    const duration = service.duration_minutes ?? 60;
    const price = Number(service.price);
    const commissionRate = Number(
      service.commission_rate ?? professional.default_commission_rate ?? 0,
    );

    const apptInserts = Array.from({ length: 5 }, (_, idx) => {
      const i = 5 - idx;
      const start = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        10,
        9 + i * 2,
        0,
      );
      const end = new Date(start.getTime() + duration * 60000);
      return {
        org_id: orgId,
        customer_id: customerId,
        service_id: service.id,
        professional_id: professional.id,
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        status: 'done',
        price_snapshot: price,
        commission_snapshot: commissionRate,
        done_at: end.toISOString(),
        created_by: user.id,
      };
    });

    const { data: createdAppts, error: apptErr } = await supabase
      .from('appointments')
      .insert(apptInserts)
      .select('id, starts_at, done_at');

    if (apptErr || !createdAppts || createdAppts.length === 0) {
      await supabase
        .from('customers')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', customerId);
      return {
        ok: false,
        error: `Erro ao criar atendimentos demo: ${apptErr?.message ?? 'desconhecido'}`,
      };
    }

    const top3 = createdAppts.slice(-3);
    const cmdInserts = top3.map((a) => ({
      org_id: orgId,
      appointment_id: a.id,
      customer_id: customerId,
      professional_id: professional.id,
      status: 'paid' as const,
      subtotal: price,
      paid_amount: price,
      finalized_at: a.done_at ?? a.starts_at,
      paid_at: a.done_at ?? a.starts_at,
      created_by: user.id,
    }));

    const { data: createdCmds, error: cmdErr } = await supabase
      .from('commands')
      .insert(cmdInserts)
      .select('id, paid_at, total');

    if (cmdErr) {
      return {
        ok: false,
        error: `Atendimentos criados, mas comandas falharam: ${cmdErr.message}. Cliente foi criado — você pode revisar.`,
      };
    }

    const txInserts = (createdCmds ?? []).map((c) => ({
      org_id: orgId,
      account_id: account.id,
      customer_id: customerId,
      professional_id: professional.id,
      direction: 'credit' as const,
      gross_amount: Number(c.total),
      fee_amount: 0,
      net_amount: Number(c.total),
      origin: 'command_payment' as const,
      description: 'Pix',
      reference_date: c.paid_at
        ? new Date(c.paid_at).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      source_type: 'command' as const,
      source_id: c.id,
      created_by: user.id,
    }));

    if (txInserts.length > 0) {
      await supabase.from('transactions').insert(txInserts);
    }

    revalidatePath('/pacientes');
    revalidatePath(`/pacientes/${customerId}`);

    return {
      ok: true,
      data: {
        patientId: customerId,
        message:
          'Cliente "Maria Silva (Demo)" criado com 5 atendimentos, 3 comandas pagas e 3 pagamentos.',
      },
    };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}
