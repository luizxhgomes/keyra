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

import { archiveSupply, unarchiveSupply } from '../actions';

export function InsumoRowActions({ id, archived }: { id: string; archived: boolean }) {
  const [isPending, startTransition] = useTransition();

  function onArchive() {
    const ok = confirm(
      'Arquivar este insumo? Movimentações históricas e BOMs já feitos continuam intactos.',
    );
    if (!ok) return;
    startTransition(async () => {
      const result = await archiveSupply({ id });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success('Insumo arquivado.');
    });
  }

  function onUnarchive() {
    startTransition(async () => {
      const result = await unarchiveSupply({ id });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success('Insumo reativado.');
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={isPending}
          aria-label="Ações do insumo"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Link href={`/estoque/insumos/${id}`}>
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
