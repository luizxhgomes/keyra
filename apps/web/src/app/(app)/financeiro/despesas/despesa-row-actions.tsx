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

import { archiveExpense, unarchiveExpense } from '../actions';

export function DespesaRowActions({ id, archived }: { id: string; archived: boolean }) {
  const [isPending, startTransition] = useTransition();

  function onArchive() {
    if (!confirm('Arquivar despesa? Histórico contábil é preservado.')) return;
    startTransition(async () => {
      const result = await archiveExpense(id);
      if (!result.ok) toast.error(result.error);
      else toast.success('Despesa arquivada.');
    });
  }

  function onUnarchive() {
    startTransition(async () => {
      const result = await unarchiveExpense(id);
      if (!result.ok) toast.error(result.error);
      else toast.success('Despesa reativada.');
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isPending} aria-label="Ações da despesa">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Link href={`/financeiro/despesas/${id}`}>
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
