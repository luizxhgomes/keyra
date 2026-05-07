'use client';

import Link from 'next/link';
import { useTransition } from 'react';
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

import { archivePatient, unarchivePatient } from './actions';

export function PacienteRowActions({ id, archived }: { id: string; archived: boolean }) {
  const [isPending, startTransition] = useTransition();

  function onArchive() {
    const ok = confirm('Arquivar este paciente? Registros históricos continuam intactos.');
    if (!ok) return;
    startTransition(async () => {
      const result = await archivePatient({ id });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success('Paciente arquivado. Não aparece mais nas listagens ativas.');
    });
  }

  function onUnarchive() {
    startTransition(async () => {
      const result = await unarchivePatient({ id });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success('Paciente reativado. Volta para as listagens ativas.');
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={isPending}
          aria-label="Ações do paciente"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Link href={`/pacientes/${id}`}>
          <DropdownMenuItem>Editar</DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        {archived ? (
          <DropdownMenuItem onClick={onUnarchive}>Reativar</DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={onArchive} className="text-destructive">
            Arquivar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
