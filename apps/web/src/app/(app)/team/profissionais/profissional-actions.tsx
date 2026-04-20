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

import { deactivateProfessional } from '../actions';

export function ProfissionalActions({ id, active }: { id: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();

  function onDeactivate() {
    const ok = confirm(
      'Desativar este profissional? Atendimentos históricos continuarão intactos, mas ele não poderá ser agendado.',
    );
    if (!ok) return;
    startTransition(async () => {
      const result = await deactivateProfessional({ id });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success('Profissional desativado.');
    });
  }

  if (!active) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isPending} aria-label="Ações do profissional">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onDeactivate} className="text-destructive">
          Desativar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
