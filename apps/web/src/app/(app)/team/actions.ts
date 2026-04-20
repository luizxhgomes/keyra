'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireAuth } from '@/lib/auth/require-auth';
import {
  AuthorizationError,
  MEMBERSHIP_ROLES,
  type MembershipRole,
  canAssignRole,
  canModifyMember,
  requireRole,
} from '@/lib/auth/roles';
import { sendEmail } from '@/lib/email/send';
import { createServerClient } from '@/lib/supabase/server';
import { getAbsoluteUrl } from '@/lib/url';
import { InviteEmail } from '@/emails/invite-email';

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const emailSchema = z.string().email('Email inválido').toLowerCase().trim();

const inviteSchema = z.object({
  email: emailSchema,
  role: z.enum(['admin', 'professional', 'viewer']),
});

const professionalSchema = z.object({
  id: z.string().uuid().optional(),
  displayName: z.string().min(1, 'Nome é obrigatório').max(120),
  email: z
    .string()
    .email('Email inválido')
    .toLowerCase()
    .trim()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  specialty: z.string().max(120).optional().or(z.literal('').transform(() => undefined)),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Cor deve ser hex #RRGGBB')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  defaultCommissionPercent: z
    .number()
    .min(0, 'Mínimo 0%')
    .max(100, 'Máximo 100%')
    .optional(),
  active: z.boolean().optional(),
});

const roleChangeSchema = z.object({
  membershipId: z.string().uuid(),
  role: z.enum(MEMBERSHIP_ROLES),
});

const inviteIdSchema = z.object({
  inviteId: z.string().uuid(),
});

const membershipIdSchema = z.object({
  membershipId: z.string().uuid(),
});

const professionalIdSchema = z.object({
  id: z.string().uuid(),
});

// ---------------------------------------------------------------------------
// Error helpers
// ---------------------------------------------------------------------------

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function toError(err: unknown, fallback = 'Erro inesperado.'): string {
  if (err instanceof AuthorizationError) return err.message;
  if (err instanceof z.ZodError) {
    return err.issues.map((i) => i.message).join(' · ');
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

// ---------------------------------------------------------------------------
// Invites
// ---------------------------------------------------------------------------

const INVITE_TTL_HOURS = 72;

export async function createInvite(
  input: z.infer<typeof inviteSchema>,
): Promise<ActionResult<{ inviteId: string }>> {
  try {
    const { user, orgId } = await requireAuth();
    const actorRole = await requireRole(orgId, 'admin');

    const parsed = inviteSchema.parse(input);

    if (!canAssignRole(actorRole, parsed.role)) {
      throw new AuthorizationError('Você não pode atribuir esse papel.');
    }

    const supabase = await createServerClient();

    // Check if there's already a pending invite (not accepted yet).
    const { data: existing } = await supabase
      .from('organization_invites')
      .select('id, accepted_at')
      .eq('org_id', orgId)
      .eq('email', parsed.email)
      .maybeSingle();

    if (existing && !existing.accepted_at) {
      return {
        ok: false,
        error: 'Já existe um convite pendente para este email.',
      };
    }

    // If there's an accepted invite, delete it so the UNIQUE(org_id, email) allows a new one.
    if (existing?.accepted_at) {
      await supabase.from('organization_invites').delete().eq('id', existing.id);
    }

    const expiresAt = new Date(Date.now() + INVITE_TTL_HOURS * 60 * 60 * 1000).toISOString();

    const { data: invite, error: insertError } = await supabase
      .from('organization_invites')
      .insert({
        org_id: orgId,
        email: parsed.email,
        role: parsed.role,
        invited_by: user.id,
        expires_at: expiresAt,
      })
      .select('id, token')
      .single();

    if (insertError || !invite) {
      return { ok: false, error: insertError?.message ?? 'Não foi possível criar o convite.' };
    }

    // Fetch org name + inviter display name for the email body.
    const { orgName, inviterName } = await getInviteContext(orgId, user.id);

    const inviteUrl = await getAbsoluteUrl(`/invites/${invite.token}`);

    await sendEmail({
      to: parsed.email,
      subject: `Convite para ${orgName} no KEYRA`,
      react: InviteEmail({
        orgName,
        inviterName,
        role: parsed.role,
        inviteUrl,
        expiresInHours: INVITE_TTL_HOURS,
      }),
      idempotencyKey: `invite:${invite.id}`,
      tags: [
        { name: 'kind', value: 'invite' },
        { name: 'org_id', value: orgId },
      ],
    });

    revalidatePath('/team');
    revalidatePath('/team/convites');

    return { ok: true, data: { inviteId: invite.id } };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

export async function resendInvite(
  input: z.infer<typeof inviteIdSchema>,
): Promise<ActionResult> {
  try {
    const { user, orgId } = await requireAuth();
    await requireRole(orgId, 'admin');

    const { inviteId } = inviteIdSchema.parse(input);
    const supabase = await createServerClient();

    const { data: existing, error: fetchError } = await supabase
      .from('organization_invites')
      .select('id, email, role, org_id, accepted_at')
      .eq('id', inviteId)
      .eq('org_id', orgId)
      .maybeSingle();

    if (fetchError || !existing) {
      return { ok: false, error: 'Convite não encontrado.' };
    }
    if (existing.accepted_at) {
      return { ok: false, error: 'Este convite já foi aceito.' };
    }

    // Regenerate token + bump expires_at.
    const expiresAt = new Date(Date.now() + INVITE_TTL_HOURS * 60 * 60 * 1000).toISOString();
    const { data: updated, error: updateError } = await supabase
      .from('organization_invites')
      .update({
        // Token defaults via DB only on INSERT; regenerate client-side here.
        token: cryptoRandomHex(48),
        expires_at: expiresAt,
      })
      .eq('id', inviteId)
      .select('token')
      .single();

    if (updateError || !updated) {
      return { ok: false, error: updateError?.message ?? 'Não foi possível reenviar.' };
    }

    const { orgName, inviterName } = await getInviteContext(orgId, user.id);
    const inviteUrl = await getAbsoluteUrl(`/invites/${updated.token}`);

    await sendEmail({
      to: existing.email,
      subject: `Lembrete: convite para ${orgName} no KEYRA`,
      react: InviteEmail({
        orgName,
        inviterName,
        role: existing.role as Exclude<MembershipRole, 'owner'>,
        inviteUrl,
        expiresInHours: INVITE_TTL_HOURS,
      }),
      idempotencyKey: `invite-resend:${inviteId}:${expiresAt}`,
      tags: [
        { name: 'kind', value: 'invite-resend' },
        { name: 'org_id', value: orgId },
      ],
    });

    revalidatePath('/team');
    revalidatePath('/team/convites');

    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

export async function revokeInvite(
  input: z.infer<typeof inviteIdSchema>,
): Promise<ActionResult> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'admin');

    const { inviteId } = inviteIdSchema.parse(input);
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('organization_invites')
      .delete()
      .eq('id', inviteId)
      .eq('org_id', orgId)
      .is('accepted_at', null);

    if (error) return { ok: false, error: error.message };

    revalidatePath('/team');
    revalidatePath('/team/convites');
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

// ---------------------------------------------------------------------------
// Members (roles)
// ---------------------------------------------------------------------------

export async function changeMemberRole(
  input: z.infer<typeof roleChangeSchema>,
): Promise<ActionResult> {
  try {
    const { user, orgId } = await requireAuth();
    const actorRole = await requireRole(orgId, 'admin');

    const { membershipId, role: targetRole } = roleChangeSchema.parse(input);
    const supabase = await createServerClient();

    const { data: membership, error: fetchError } = await supabase
      .from('memberships')
      .select('id, user_id, role')
      .eq('id', membershipId)
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .maybeSingle();

    if (fetchError || !membership) {
      return { ok: false, error: 'Membro não encontrado.' };
    }

    const currentRole = membership.role as MembershipRole;

    if (!canModifyMember(actorRole, currentRole)) {
      return { ok: false, error: 'Você não pode modificar este membro.' };
    }
    if (!canAssignRole(actorRole, targetRole)) {
      return { ok: false, error: 'Você não pode atribuir esse papel.' };
    }
    if (currentRole === targetRole) {
      return { ok: true, data: undefined }; // No-op
    }

    // Invariant: never leave 0 owners. If demoting an owner, count other owners.
    if (currentRole === 'owner' && targetRole !== 'owner') {
      const { data: ownersCount, error: countError } = await supabase.rpc(
        'count_org_owners',
        { p_org_id: orgId },
      );
      if (countError) {
        return { ok: false, error: 'Falha ao validar invariante de owners.' };
      }
      const count = Number(ownersCount ?? 0);
      if (count <= 1) {
        return {
          ok: false,
          error: 'Não é possível rebaixar o último proprietário da organização.',
        };
      }
    }

    // Self-demotion safety: if the actor is the only owner and demoting themselves.
    if (
      membership.user_id === user.id &&
      currentRole === 'owner' &&
      targetRole !== 'owner'
    ) {
      const { data: ownersCount } = await supabase.rpc('count_org_owners', {
        p_org_id: orgId,
      });
      if (Number(ownersCount ?? 0) <= 1) {
        return {
          ok: false,
          error: 'Você é o último proprietário — promova outro membro antes de se rebaixar.',
        };
      }
    }

    const { error: updateError } = await supabase
      .from('memberships')
      .update({ role: targetRole })
      .eq('id', membershipId);

    if (updateError) return { ok: false, error: updateError.message };

    revalidatePath('/team');
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

export async function removeMember(
  input: z.infer<typeof membershipIdSchema>,
): Promise<ActionResult> {
  try {
    const { user, orgId } = await requireAuth();
    const actorRole = await requireRole(orgId, 'admin');

    const { membershipId } = membershipIdSchema.parse(input);
    const supabase = await createServerClient();

    const { data: membership, error: fetchError } = await supabase
      .from('memberships')
      .select('id, user_id, role')
      .eq('id', membershipId)
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .maybeSingle();

    if (fetchError || !membership) {
      return { ok: false, error: 'Membro não encontrado.' };
    }

    const currentRole = membership.role as MembershipRole;
    if (!canModifyMember(actorRole, currentRole)) {
      return { ok: false, error: 'Você não pode remover este membro.' };
    }

    // Never remove the last owner.
    if (currentRole === 'owner') {
      const { data: ownersCount } = await supabase.rpc('count_org_owners', {
        p_org_id: orgId,
      });
      if (Number(ownersCount ?? 0) <= 1) {
        return {
          ok: false,
          error: 'Não é possível remover o último proprietário.',
        };
      }
    }

    // Prevent accidental self-removal when actor is the only owner (covered above),
    // but still warn if removing self for any role.
    const isSelf = membership.user_id === user.id;

    const { error: updateError } = await supabase
      .from('memberships')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', membershipId);

    if (updateError) return { ok: false, error: updateError.message };

    revalidatePath('/team');

    return { ok: true, data: undefined, ...(isSelf ? { selfRemoved: true } : {}) } as ActionResult;
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

// ---------------------------------------------------------------------------
// Professionals (CRUD)
// ---------------------------------------------------------------------------

export async function upsertProfessional(
  input: z.infer<typeof professionalSchema>,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'admin');

    const parsed = professionalSchema.parse(input);
    const supabase = await createServerClient();

    const commissionRate =
      parsed.defaultCommissionPercent !== undefined
        ? parsed.defaultCommissionPercent / 100
        : undefined;

    const payload = {
      org_id: orgId,
      display_name: parsed.displayName,
      ...(parsed.email ? { email: parsed.email } : {}),
      ...(parsed.specialty ? { specialty: parsed.specialty } : {}),
      ...(parsed.color ? { color: parsed.color } : {}),
      ...(commissionRate !== undefined ? { default_commission_rate: commissionRate } : {}),
      active: parsed.active ?? true,
    };

    if (parsed.id) {
      const { error } = await supabase
        .from('professionals')
        .update(payload)
        .eq('id', parsed.id)
        .eq('org_id', orgId);
      if (error) return { ok: false, error: error.message };
      revalidatePath('/team/profissionais');
      return { ok: true, data: { id: parsed.id } };
    }

    const { data, error } = await supabase
      .from('professionals')
      .insert(payload)
      .select('id')
      .single();

    if (error || !data) {
      return { ok: false, error: error?.message ?? 'Falha ao criar profissional.' };
    }
    revalidatePath('/team/profissionais');
    return { ok: true, data: { id: data.id } };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

export async function deactivateProfessional(
  input: z.infer<typeof professionalIdSchema>,
): Promise<ActionResult> {
  try {
    const { orgId } = await requireAuth();
    await requireRole(orgId, 'admin');

    const { id } = professionalIdSchema.parse(input);
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('professionals')
      .update({ active: false, deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('org_id', orgId);

    if (error) return { ok: false, error: error.message };
    revalidatePath('/team/profissionais');
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: toError(err) };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getInviteContext(
  orgId: string,
  userId: string,
): Promise<{ orgName: string; inviterName: string }> {
  const supabase = await createServerClient();

  const [{ data: org }, { data: inviter }] = await Promise.all([
    supabase.from('organizations').select('name').eq('id', orgId).maybeSingle(),
    supabase
      .from('memberships')
      .select('display_name')
      .eq('user_id', userId)
      .eq('org_id', orgId)
      .maybeSingle(),
  ]);

  const orgName = org?.name ?? 'KEYRA';
  const inviterName = inviter?.display_name ?? 'Um administrador';
  return { orgName, inviterName };
}

/** Generates a hex string of `length` chars (length must be even). */
function cryptoRandomHex(length: number): string {
  const bytes = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, length);
}
