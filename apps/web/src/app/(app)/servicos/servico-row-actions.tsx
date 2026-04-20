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

import { archiveService } from './actions';

export function ServicoRowActions({ id, active }: { id: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();

  function onArchive() {
    const ok = confirm(
      'Arquivar este serviço? Ele some da agenda mas atendimentos históricos preservam os dados.',
    );
    if (!ok) return;
    startTransition(async () => {
      const result = await archiveService({ id });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success('Serviço arquivado.');
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={isPending}
          aria-label="Ações do serviço"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Link href={`/servicos/${id}`}>
          <DropdownMenuItem>Editar</DropdownMenuItem>
        </Link>
        {active ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onArchive} className="text-destructive">
              Arquivar
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
