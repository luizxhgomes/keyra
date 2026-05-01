'use client';

import { useTransition } from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import { cloneFixedCostsFromLastMonth } from '../actions';

export function CloneFixedCostsButton() {
  const [isPending, startTransition] = useTransition();

  function onClick() {
    if (
      !confirm(
        'Lançar despesas fixas do mês passado no mês corrente? Lançamentos já existentes (mesma descrição+categoria) são pulados.',
      )
    )
      return;
    startTransition(async () => {
      const result = await cloneFixedCostsFromLastMonth();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const { created, skipped } = result.data;
      if (created === 0 && skipped === 0) {
        toast.info('Sem despesas fixas no mês passado para clonar.');
      } else {
        toast.success(
          `${created} ${created === 1 ? 'despesa criada' : 'despesas criadas'}` +
            (skipped > 0 ? ` · ${skipped} já existia${skipped > 1 ? 'm' : ''}` : ''),
        );
      }
    });
  }

  return (
    <Button type="button" onClick={onClick} disabled={isPending}>
      <Copy className="mr-2 h-4 w-4" />
      {isPending ? 'Clonando…' : 'Clonar fixos do mês passado'}
    </Button>
  );
}
