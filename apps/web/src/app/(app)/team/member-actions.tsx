'use client';

import { useState, useTransition } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { MembershipRole } from '@/lib/auth/roles-shared';
import {
  MEMBERSHIP_ROLES,
  canAssignRole,
  canModifyMember,
} from '@/lib/auth/roles-shared';

import { changeMemberRole, removeMember } from './actions';

type Props = {
  membershipId: string;
  currentRole: MembershipRole;
  actorRole: MembershipRole;
  isSelf: boolean;
};

const ROLE_LABEL: Record<MembershipRole, string> = {
  owner: 'Proprietário',
  admin: 'Administrador',
  professional: 'Profissional',
  viewer: 'Espectador',
};

export function MemberActions({ membershipId, currentRole, actorRole, isSelf }: Props) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const canModify = canModifyMember(actorRole, currentRole);
  if (!canModify) return null;

  const assignableRoles = MEMBERSHIP_ROLES.filter((r) => r !== currentRole && canAssignRole(actorRole, r));

  function onRoleChange(role: MembershipRole) {
    startTransition(async () => {
      const result = await changeMemberRole({ membershipId, role });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`Papel atualizado para ${ROLE_LABEL[role]}.`);
      setOpen(false);
    });
  }

  function onRemove() {
    const ok = confirm(
      isSelf
        ? 'Tem certeza que deseja sair desta organização? Você precisará de um novo convite para voltar.'
        : 'Remover este membro desta organização?',
    );
    if (!ok) return;
    startTransition(async () => {
      const result = await removeMember({ membershipId });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success('Membro removido.');
      setOpen(false);
      if (isSelf) {
        window.location.href = '/onboarding/nova-organizacao';
      }
    });
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isPending} aria-label="Ações do membro">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {assignableRoles.length > 0 ? (
          <>
            {assignableRoles.map((r) => (
              <DropdownMenuItem key={r} onClick={() => onRoleChange(r)}>
                Mudar para {ROLE_LABEL[r]}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem onClick={onRemove} className="text-destructive">
          {isSelf ? 'Sair da organização' : 'Remover membro'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
