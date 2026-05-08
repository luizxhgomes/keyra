'use server';

import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireAuth } from '@/lib/auth/require-auth';
import { requireRole } from '@/lib/auth/roles';
import { createServerClient } from '@/lib/supabase/server';
import {
  changeAppointmentStatusSchema,
  createAppointmentSchema,
  type AppointmentStatusTo,
} from '@/lib/validators/appointment';

export type AgendaStatus = 'scheduled' | 'done' | 'cancelled' | 'no_show';

export type AgendaEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string | null;
  resourceId: string;
  extendedProps: {
    customerName: string | null;
    serviceName: string;
    professionalName: string;
    status: AgendaStatus;
    priceSnapshot: string;
    notes: string | null;
  };
};

export type AgendaProfessional = {
  id: string;
  display_name: string;
  color: string | null;
};

const rangeSchema = z.object({
  start: z.string().min(1),
  end: z.string().min(1),
  professionalId: z.string().uuid().optional(),
  /** Filtra para os status listados. Vazio/undefined = todos. */
  statusIn: z
    .array(z.enum(['scheduled', 'done', 'cancelled', 'no_show']))
    .optional(),
  /** Busca textual case-insensitive em cliente, serviço ou profissional. */
  search: z.string().trim().max(120).optional(),
});

const HARD_CAP = 200;

type AppointmentRow = {
  id: string;
  title: string | null;
  starts_at: string;
  ends_at: string;
  color: string | null;
  status: AgendaStatus;
  professional_id: string;
  price_snapshot: string | number;
  notes: string | null;
  customer: { full_name: string } | null;
  service: {
    name: string;
    category: { color: string | null } | null;
  } | null;
  professional: { display_name: string; color: string | null } | null;
};

export async function listAppointments(input: z.infer<typeof rangeSchema>): Promise<{
  events: AgendaEvent[];
  truncated: boolean;
}> {
  const { orgId } = await requireAuth();
  await requireRole(orgId, 'viewer');
  const parsed = rangeSchema.parse(input);

  const supabase = await createServerClient();

  let query = supabase
    .from('appointments')
    .select(
      `
        id, title, starts_at, ends_at, color, status, professional_id, price_snapshot, notes,
        customer:customers(full_name),
        service:services(name, category:service_categories(color)),
        professional:professionals(display_name, color)
      `,
    )
    .eq('org_id', orgId)
    .gte('starts_at', parsed.start)
    .lt('starts_at', parsed.end)
    .order('starts_at', { ascending: true })
    .limit(HARD_CAP + 1);

  if (parsed.professionalId) {
    query = query.eq('professional_id', parsed.professionalId);
  }

  if (parsed.statusIn && parsed.statusIn.length > 0 && parsed.statusIn.length < 4) {
    query = query.in('status', parsed.statusIn);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Erro ao carregar agenda: ${error.message}`);
  }

  let rows = (data ?? []) as unknown as AppointmentRow[];

  // Search post-filter (case-insensitive) — feito em memória para cobrir
  // joins (customer.full_name, service.name, professional.display_name) sem
  // precisar de RPC. Mantém limite de HARD_CAP da query.
  if (parsed.search && parsed.search.length > 0) {
    const q = parsed.search.toLowerCase();
    rows = rows.filter((r) => {
      const t = [
        r.customer?.full_name ?? '',
        r.service?.name ?? '',
        r.professional?.display_name ?? '',
        r.title ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return t.includes(q);
    });
  }

  const truncated = rows.length > HARD_CAP;
  const slice = truncated ? rows.slice(0, HARD_CAP) : rows;

  const events: AgendaEvent[] = slice.map((row) => {
    const fallbackColor =
      row.color ??
      row.professional?.color ??
      row.service?.category?.color ??
      null;

    const composedTitle =
      row.title ??
      `${row.service?.name ?? 'Serviço'} — ${row.customer?.full_name ?? 'Sem paciente'}`;

    return {
      id: row.id,
      title: composedTitle,
      start: row.starts_at,
      end: row.ends_at,
      color: fallbackColor,
      resourceId: row.professional_id,
      extendedProps: {
        customerName: row.customer?.full_name ?? null,
        serviceName: row.service?.name ?? 'Serviço',
        professionalName: row.professional?.display_name ?? 'Profissional',
        status: row.status,
        priceSnapshot: String(row.price_snapshot ?? '0'),
        notes: row.notes,
      },
    };
  });

  return { events, truncated };
}

// ---------------------------------------------------------------------------
// Refinamento Fase 1 — counts mensais (mini-calendário lateral)
// ---------------------------------------------------------------------------

export type AgendaMonthCounts = {
  /** Mapa diaDoMês (1-31) → total de agendamentos não cancelados naquele dia. */
  perDay: Record<number, number>;
  /** Total por status (scheduled/done/cancelled/no_show). */
  totals: Record<AgendaStatus, number>;
  /** Próximo agendamento futuro (em qualquer dia) ou null. */
  next: {
    id: string;
    starts_at: string;
    customerName: string | null;
    serviceName: string;
    professionalName: string;
  } | null;
};

const monthSchema = z.object({
  /** ISO date (YYYY-MM-DD) de qualquer dia do mês alvo. */
  monthDate: z.string().min(1),
  professionalId: z.string().uuid().optional(),
});

export async function getMonthCounts(
  input: z.infer<typeof monthSchema>,
): Promise<AgendaMonthCounts> {
  const { orgId } = await requireAuth();
  await requireRole(orgId, 'viewer');
  const parsed = monthSchema.parse(input);
  const supabase = await createServerClient();

  const ref = new Date(parsed.monthDate);
  const start = startOfMonth(ref).toISOString();
  const end = endOfMonth(ref).toISOString();

  let query = supabase
    .from('appointments')
    .select(
      `id, starts_at, status,
       customer:customers(full_name),
       service:services(name),
       professional:professionals(display_name)`,
    )
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .gte('starts_at', start)
    .lte('starts_at', end)
    .order('starts_at', { ascending: true });

  if (parsed.professionalId) {
    query = query.eq('professional_id', parsed.professionalId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Erro ao contar agendamentos: ${error.message}`);
  }

  const perDay: Record<number, number> = {};
  const totals: Record<AgendaStatus, number> = {
    scheduled: 0,
    done: 0,
    cancelled: 0,
    no_show: 0,
  };
  let next: AgendaMonthCounts['next'] = null;
  const now = new Date();

  for (const row of data ?? []) {
    const status = (row as { status: AgendaStatus }).status;
    totals[status] += 1;
    if (status !== 'cancelled') {
      const day = new Date((row as { starts_at: string }).starts_at).getDate();
      perDay[day] = (perDay[day] ?? 0) + 1;
    }
    const startsAt = new Date((row as { starts_at: string }).starts_at);
    if (
      !next &&
      status === 'scheduled' &&
      startsAt.getTime() >= now.getTime()
    ) {
      const c = (row as { customer: { full_name: string } | null }).customer;
      const s = (row as { service: { name: string } | null }).service;
      const p = (row as { professional: { display_name: string } | null })
        .professional;
      next = {
        id: (row as { id: string }).id,
        starts_at: (row as { starts_at: string }).starts_at,
        customerName: c?.full_name ?? null,
        serviceName: s?.name ?? 'Serviço',
        professionalName: p?.display_name ?? 'Profissional',
      };
    }
  }

  return { perDay, totals, next };
}

export async function listAgendaProfessionals(): Promise<AgendaProfessional[]> {
  const { orgId } = await requireAuth();
  await requireRole(orgId, 'viewer');

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('professionals')
    .select('id, display_name, color')
    .eq('org_id', orgId)
    .eq('active', true)
    .is('deleted_at', null)
    .order('display_name', { ascending: true });

  if (error) {
    throw new Error(`Erro ao listar profissionais: ${error.message}`);
  }
  return (data ?? []) as AgendaProfessional[];
}

// ---------------------------------------------------------------------------
// Story 2.5 — Criação de agendamento
// ---------------------------------------------------------------------------

export type AgendaPickerCustomer = { id: string; full_name: string };
export type AgendaPickerService = {
  id: string;
  name: string;
  price: string;
  duration_minutes: number | null;
  commission_rate: string | null;
};
export type AgendaPickerProfessional = {
  id: string;
  display_name: string;
  default_commission_rate: string;
};

/**
 * Carrega listas para os Selects do formulário de agendamento. Uma única
 * round-trip ao servidor cobre paciente, serviço e profissional, com filtros
 * de soft-delete e `active`.
 */
export async function listAgendaPickers(): Promise<{
  customers: AgendaPickerCustomer[];
  services: AgendaPickerService[];
  professionals: AgendaPickerProfessional[];
}> {
  const { orgId } = await requireAuth();
  await requireRole(orgId, 'professional');

  const supabase = await createServerClient();

  const [customersRes, servicesRes, professionalsRes] = await Promise.all([
    supabase
      .from('customers')
      .select('id, full_name')
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order('full_name', { ascending: true }),
    supabase
      .from('services')
      .select('id, name, price, duration_minutes, commission_rate')
      .eq('org_id', orgId)
      .eq('active', true)
      .is('deleted_at', null)
      .order('name', { ascending: true }),
    supabase
      .from('professionals')
      .select('id, display_name, default_commission_rate')
      .eq('org_id', orgId)
      .eq('active', true)
      .is('deleted_at', null)
      .order('display_name', { ascending: true }),
  ]);

  if (customersRes.error) throw new Error(`pacientes: ${customersRes.error.message}`);
  if (servicesRes.error) throw new Error(`serviços: ${servicesRes.error.message}`);
  if (professionalsRes.error) throw new Error(`profissionais: ${professionalsRes.error.message}`);

  return {
    customers: (customersRes.data ?? []) as AgendaPickerCustomer[],
    services: (servicesRes.data ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      price: String(s.price),
      duration_minutes: s.duration_minutes,
      commission_rate: s.commission_rate === null ? null : String(s.commission_rate),
    })),
    professionals: (professionalsRes.data ?? []).map((p) => ({
      id: p.id,
      display_name: p.display_name,
      default_commission_rate: String(p.default_commission_rate),
    })),
  };
}

export type CreateAppointmentResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string };

/**
 * Cria um agendamento. Snapshots de preço e comissão são calculados aqui
 * (ADR-013): vamos uma vez ao banco buscar serviço/profissional, materializamos
 * `price_snapshot` (= `services.price` no momento) e `commission_snapshot`
 * (= `services.commission_rate` ?? `professionals.default_commission_rate` ?? 0)
 * e fazemos o INSERT.
 *
 * Erros tratados:
 * - Serviço/profissional inexistente ou de outra org → 404 amigável.
 * - Profissional inativo → mensagem clara.
 * - Conflict no EXCLUDE constraint (PostgreSQL `23P01`) → "Horário
 *   indisponível para este profissional".
 */
export async function createAppointment(
  input: z.input<typeof createAppointmentSchema>,
): Promise<CreateAppointmentResult> {
  try {
    const { user, orgId } = await requireAuth();
    await requireRole(orgId, 'professional');

    const parsed = createAppointmentSchema.parse(input);
    const supabase = await createServerClient();

    const [serviceRes, professionalRes] = await Promise.all([
      supabase
        .from('services')
        .select('price, commission_rate, deleted_at, active')
        .eq('id', parsed.serviceId)
        .eq('org_id', orgId)
        .maybeSingle(),
      supabase
        .from('professionals')
        .select('default_commission_rate, active, deleted_at')
        .eq('id', parsed.professionalId)
        .eq('org_id', orgId)
        .maybeSingle(),
    ]);

    if (serviceRes.error) return { ok: false, error: serviceRes.error.message };
    if (!serviceRes.data || serviceRes.data.deleted_at || !serviceRes.data.active) {
      return { ok: false, error: 'Serviço não encontrado ou inativo.' };
    }
    if (professionalRes.error) return { ok: false, error: professionalRes.error.message };
    if (!professionalRes.data || professionalRes.data.deleted_at) {
      return { ok: false, error: 'Profissional não encontrado.' };
    }
    if (!professionalRes.data.active) {
      return { ok: false, error: 'Profissional inativo.' };
    }

    const startsAt = new Date(`${parsed.date}T${parsed.startTime}:00`);
    if (Number.isNaN(startsAt.getTime())) {
      return { ok: false, error: 'Data ou horário inválido.' };
    }
    const endsAt = new Date(startsAt.getTime() + parsed.durationMinutes * 60 * 1000);

    // Tipos gerados pelo Supabase mapeiam `numeric` para `number`. Para os
    // valores absolutos do KEYRA (price até 14 dígitos / 2 decimais; commission
    // 0-1 com 4 decimais) o range cabe sem perda em IEEE 754. O Postgres
    // re-armazena como `numeric` no INSERT preservando precisão; round-half-even
    // continua sendo aplicado no momento da agregação (DRE), não aqui.
    const priceSnapshot = Number(serviceRes.data.price);
    const commissionSnapshot = Number(
      serviceRes.data.commission_rate ??
        professionalRes.data.default_commission_rate ??
        0,
    );

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        org_id: orgId,
        customer_id: parsed.customerId ?? null,
        service_id: parsed.serviceId,
        professional_id: parsed.professionalId,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        price_snapshot: priceSnapshot,
        commission_snapshot: commissionSnapshot,
        notes: parsed.notes ?? null,
        created_by: user.id,
      })
      .select('id')
      .single();

    if (error) {
      // EXCLUDE constraint violation (PG SQLSTATE 23P01) — double-book.
      if (error.code === '23P01') {
        return {
          ok: false,
          error:
            'Horário indisponível para este profissional. Escolha outro horário ou outro profissional.',
        };
      }
      return { ok: false, error: error.message };
    }

    revalidatePath('/agenda');
    return { ok: true, data: { id: data.id } };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const first = err.issues[0];
      return { ok: false, error: first?.message ?? 'Dados inválidos.' };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Erro inesperado.',
    };
  }
}

// ---------------------------------------------------------------------------
// Story 2.6 — Transição de status do agendamento
// ---------------------------------------------------------------------------

export type ChangeAppointmentStatusResult =
  | { ok: true; data: { id: string; status: AppointmentStatusTo } }
  | { ok: false; error: string };

/**
 * Transiciona o status de um agendamento (Story 2.6).
 *
 * Transições permitidas (defendidas no Zod e novamente aqui):
 *   - scheduled → done | cancelled | no_show
 *   - done      → cancelled (caso de correção — estornar comanda é Phase 3+)
 *   - cancelled → ❌ read-only
 *   - no_show   → ❌ read-only
 *
 * Efeitos colaterais (todos no banco, defesa em profundidade):
 *   - `to=done`:      trigger `trg_appointments_done_to_command` cria
 *                      `commands` + `command_items` na mesma transação;
 *                      `done_at = now()` é setado pelo trigger.
 *   - `to=cancelled`: setamos `cancel_reason` + `cancelled_at` aqui;
 *                      `audit_log` registra via trigger genérico.
 *   - `to=no_show`:   transição direta; `audit_log` registra.
 */
export async function changeAppointmentStatus(
  input: z.input<typeof changeAppointmentStatusSchema>,
): Promise<ChangeAppointmentStatusResult> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'professional');

    const parsed = changeAppointmentStatusSchema.parse(input);
    const supabase = await createServerClient();

    // Lê estado atual para validar a transição. RLS garante isolamento por org.
    const { data: current, error: readErr } = await supabase
      .from('appointments')
      .select('id, status')
      .eq('id', parsed.appointmentId)
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .maybeSingle();

    if (readErr) {
      return { ok: false, error: `Erro ao localizar agendamento: ${readErr.message}` };
    }
    if (!current) {
      return { ok: false, error: 'Agendamento não encontrado.' };
    }

    // Defesa em profundidade — Zod já restringe `to`, mas a transição
    // depende do estado atual.
    const from = current.status as 'scheduled' | 'done' | 'cancelled' | 'no_show';
    const to = parsed.to;

    const allowed =
      (from === 'scheduled' && (to === 'done' || to === 'cancelled' || to === 'no_show')) ||
      (from === 'done' && to === 'cancelled');

    if (!allowed) {
      const labelFrom = STATUS_LABEL[from];
      const labelTo = STATUS_LABEL[to];
      return {
        ok: false,
        error: `Transição inválida: ${labelFrom} → ${labelTo}. Esta operação não é permitida.`,
      };
    }

    // Monta o patch. Trigger de banco cuida do `done_at` quando muda para done;
    // mantemos a definição local somente para `cancelled_at` + `cancel_reason`.
    const patch: {
      status: AppointmentStatusTo;
      cancelled_at?: string;
      cancel_reason?: string;
    } = { status: to };

    if (to === 'cancelled') {
      patch.cancelled_at = new Date().toISOString();
      patch.cancel_reason = parsed.cancelReason!.trim();
    }

    const { error: updateErr } = await supabase
      .from('appointments')
      .update(patch)
      .eq('id', parsed.appointmentId)
      .eq('org_id', orgId);

    if (updateErr) {
      return { ok: false, error: `Erro ao atualizar status: ${updateErr.message}` };
    }

    revalidatePath('/agenda');
    return { ok: true, data: { id: parsed.appointmentId, status: to } };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const first = err.issues[0];
      return { ok: false, error: first?.message ?? 'Dados inválidos.' };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Erro inesperado.',
    };
  }
}

const STATUS_LABEL: Record<AgendaStatus, string> = {
  scheduled: 'Agendado',
  done: 'Realizado',
  cancelled: 'Cancelado',
  no_show: 'Falta',
};

// ---------------------------------------------------------------------------
// Story 2.7 — Receita prevista
// ---------------------------------------------------------------------------

export type ReceitaPrevista = {
  /** Decimais como string para preservar precisão até o `formatBRL`. */
  today: string;
  week: string;
  month: string;
  /** Labels correlacionados com a data atual do usuário (pt-BR). */
  todayLabel: string;
  weekRangeLabel: string;
  monthLabel: string;
};

/**
 * Retorna a receita prevista para hoje, esta semana (segunda→domingo) e este
 * mês, somando `expected_revenue` da view `v_receitas_previstas` (ADR-013 #5,
 * FR-AG-04). A view já restringe a `status='scheduled' AND deleted_at IS NULL`,
 * portanto agendamentos `done`/`cancelled`/`no_show` somem da projeção
 * automaticamente — sem código extra na aplicação.
 *
 * Estratégia: 1 round-trip pegando todas as rows do mês corrente e
 * agregando em TS por buckets `today` / `week` / `month` com `date-fns` em
 * pt-BR (segunda como início de semana). Tech debt conhecido (item 3 do
 * `STATE.md §5`): a view usa `date_trunc('day', starts_at)` em UTC, então
 * agendamentos noturnos (>21h BRT) podem cair no bucket do dia seguinte.
 * Aceitável para o MVP — quando expandirmos para cross-TZ, adicionar
 * `AT TIME ZONE 'America/Sao_Paulo'` na view.
 */
export async function getReceitaPrevista(): Promise<ReceitaPrevista> {
  const { orgId } = await requireAuth();
  await requireRole(orgId, 'viewer');

  const supabase = await createServerClient();

  // Bounds calculados em TS — em produção (Vercel sa-east-1) o server roda em
  // UTC, mas as datas-limite ficam corretas porque comparamos timestamps.
  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);
  const weekStart = startOfWeek(now, { locale: ptBR });
  const weekEnd = endOfWeek(now, { locale: ptBR });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const { data, error } = await supabase
    .from('v_receitas_previstas')
    .select('day, expected_revenue')
    .eq('org_id', orgId)
    .gte('day', monthStart.toISOString())
    .lte('day', monthEnd.toISOString());

  if (error) {
    throw new Error(`Erro ao calcular receita prevista: ${error.message}`);
  }

  // Soma manualmente para preservar precisão. `expected_revenue` chega como
  // `number | null` (Supabase mapeia `numeric` → number). Para os ranges
  // KEYRA (até 14 dígitos) é seguro em IEEE 754; convertemos para string
  // ao retornar para que `formatBRL` aplique `ROUND_HALF_EVEN` se houver
  // decimais residuais.
  let todayCents = 0;
  let weekCents = 0;
  let monthCents = 0;
  const dayStartMs = dayStart.getTime();
  const dayEndMs = dayEnd.getTime();
  const weekStartMs = weekStart.getTime();
  const weekEndMs = weekEnd.getTime();

  for (const row of data ?? []) {
    if (!row.day || row.expected_revenue === null) continue;
    const dayMs = new Date(row.day).getTime();
    const cents = Math.round(Number(row.expected_revenue) * 100);
    monthCents += cents;
    if (dayMs >= weekStartMs && dayMs <= weekEndMs) weekCents += cents;
    if (dayMs >= dayStartMs && dayMs <= dayEndMs) todayCents += cents;
  }

  // Labels temporais correlacionados com a data atual do usuário.
  // Format pt-BR: "qua, 8 de mai", "5 a 11 de mai", "Maio 2026".
  const todayLabel = format(now, "EEE, d 'de' MMM", { locale: ptBR });
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
  const weekRangeLabel = sameMonth
    ? `${format(weekStart, 'd', { locale: ptBR })} a ${format(weekEnd, "d 'de' MMM", { locale: ptBR })}`
    : `${format(weekStart, "d 'de' MMM", { locale: ptBR })} a ${format(weekEnd, "d 'de' MMM", { locale: ptBR })}`;
  const monthLabel = format(now, "MMMM 'de' yyyy", { locale: ptBR });

  return {
    today: (todayCents / 100).toFixed(2),
    week: (weekCents / 100).toFixed(2),
    month: (monthCents / 100).toFixed(2),
    todayLabel,
    weekRangeLabel,
    monthLabel,
  };
}
