export const MEMBERSHIP_ROLES = ['owner', 'admin', 'professional', 'viewer'] as const;
export type MembershipRole = (typeof MEMBERSHIP_ROLES)[number];

/**
 * Role rank — higher is more privileged. Mirrors `public.is_org_member(uuid, text)`
 * SQL hierarchy. Pure function, safe to import from client code.
 */
const ROLE_RANK: Record<MembershipRole, number> = {
  viewer: 1,
  professional: 2,
  admin: 3,
  owner: 4,
};

export function roleRank(role: MembershipRole): number {
  return ROLE_RANK[role];
}

export function canManageTeam(role: MembershipRole): boolean {
  return role === 'owner' || role === 'admin';
}

export function canInvite(role: MembershipRole): boolean {
  return canManageTeam(role);
}

export function canAssignRole(
  actorRole: MembershipRole,
  targetRole: MembershipRole,
): boolean {
  if (!canManageTeam(actorRole)) return false;
  if (targetRole === 'owner') return actorRole === 'owner';
  return roleRank(actorRole) >= roleRank(targetRole);
}

export function canModifyMember(
  actorRole: MembershipRole,
  currentRole: MembershipRole,
): boolean {
  if (!canManageTeam(actorRole)) return false;
  if (currentRole === 'owner') return actorRole === 'owner';
  return roleRank(actorRole) >= roleRank(currentRole);
}

export class AuthorizationError extends Error {
  constructor(message = 'Você não tem permissão para executar esta ação.') {
    super(message);
    this.name = 'AuthorizationError';
  }
}
