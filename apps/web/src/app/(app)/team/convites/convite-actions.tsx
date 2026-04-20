'use client';

import { useTransition } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { resendInvite, revokeInvite } from '../actions';

export function ConviteActions({ inviteId }: { inviteId: string }) {
  const [isPending, startTransition] = useTransition();

  function onResend() {
    startTransition(async () => {
      const result = await resendInvite({ inviteId });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success('Convite reenviado.');
    });
  }

  function onRevoke() {
    const ok = confirm('Revogar este convite? O link atual deixará de funcionar.');
    if (!ok) return;
    startTransition(async () => {
      const result = await revokeInvite({ inviteId });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success('Convite revogado.');
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isPending} aria-label="Ações do convite">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onResend}>Reenviar</DropdownMenuItem>
        <DropdownMenuItem onClick={onRevoke} className="text-destructive">
          Revogar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
