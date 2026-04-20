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

import { archiveCategory } from '../actions';

export function CategoriaActions({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function onArchive() {
    const ok = confirm(
      'Arquivar esta categoria? Serviços vinculados ficam sem categoria (não são removidos).',
    );
    if (!ok) return;
    startTransition(async () => {
      const result = await archiveCategory({ id });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success('Categoria arquivada.');
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isPending} aria-label="Ações da categoria">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onArchive} className="text-destructive">
          Arquivar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
