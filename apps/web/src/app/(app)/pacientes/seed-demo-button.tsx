'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

import { seedDemoPatient } from './actions';

/**
 * Botão "Criar dados de demonstração" — chama Server Action que popula
 * 1 cliente fictício "Maria Silva (Demo)" com 5 atendimentos, 3 comandas
 * pagas e 3 transações.
 *
 * Ao concluir, redireciona para o perfil do cliente recém-criado para
 * o usuário ver todos os KPIs e tabelas populados.
 */
export function SeedDemoButton() {
  const [pending, start] = useTransition();
  const router = useRouter();

  function handleClick() {
    start(async () => {
      const result = await seedDemoPatient();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.data.message);
      router.push(`/pacientes/${result.data.patientId}`);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-full border border-mocha-300/40 bg-ivory-50 px-4 py-2 text-sm font-medium text-cocoa-800 transition-all hover:border-cocoa-700/50 hover:bg-ivory-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
      {pending ? 'Criando demonstração…' : 'Criar cliente de demonstração'}
    </button>
  );
}
