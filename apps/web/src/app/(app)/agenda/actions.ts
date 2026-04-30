'use server';

import { z } from 'zod';

import { requireAuth } from '@/lib/auth/require-auth';
import { requireRole } from '@/lib/auth/roles';
import { createServerClient } from '@/lib/supabase/server';

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

  const { data, error } = await query;
  if (error) {
    throw new Error(`Erro ao carregar agenda: ${error.message}`);
  }

  const rows = (data ?? []) as unknown as AppointmentRow[];
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
