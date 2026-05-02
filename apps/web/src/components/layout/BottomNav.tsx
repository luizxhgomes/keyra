'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, LayoutDashboard, MoreHorizontal, Plus, Users } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Mobile bottom navigation (< lg). Mirrors `docs/ux/wireframes/05-navegacao.md` §5.
 *
 * 5 slots: Dashboard, Agenda, FAB (contextual), Pacientes, Mais.
 *
 * Story 5.7 — FAB ganhou destino real (`/agenda?novo=1`).
 * Story 6.5 (AC2) — FAB **contextual por rota**: em `/pacientes` cadastra
 * paciente, em `/financeiro/despesas` cria despesa, etc. `getFabAction`
 * mapeia 6 rotas + fallback default.
 */
const ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/pacientes', label: 'Pacientes', icon: Users },
  { href: '/mais', label: 'Mais', icon: MoreHorizontal },
] as const;

/**
 * Story 6.5 (AC2) — função pura para mapear pathname → ação contextual do FAB.
 *
 * Testabilidade futura: snapshot tests cobrindo cada branch sem montar componente.
 * Default: `/agenda?novo=1` (criar agendamento — ação mais frequente da Camila).
 */
export function getFabAction(pathname: string | null): { href: string; label: string } {
  if (!pathname) return { href: '/agenda?novo=1', label: 'Criar novo agendamento' };
  if (pathname.startsWith('/pacientes')) {
    return { href: '/pacientes/novo', label: 'Cadastrar novo paciente' };
  }
  if (pathname.startsWith('/servicos')) {
    return { href: '/servicos/novo', label: 'Cadastrar novo serviço' };
  }
  if (pathname.startsWith('/financeiro/despesas')) {
    return { href: '/financeiro/despesas/nova', label: 'Cadastrar nova despesa' };
  }
  if (pathname.startsWith('/estoque/insumos')) {
    return { href: '/estoque/insumos/novo', label: 'Cadastrar novo insumo' };
  }
  if (pathname.startsWith('/comandas')) {
    return {
      href: '/agenda?novo=1',
      label: 'Criar agendamento (gera comanda automática)',
    };
  }
  return { href: '/agenda?novo=1', label: 'Criar novo agendamento' };
}

export function BottomNav() {
  const pathname = usePathname();
  const fabAction = getFabAction(pathname);

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-border bg-background lg:hidden"
    >
      {ITEMS.slice(0, 2).map((item) => (
        <NavButton key={item.href} item={item} isActive={pathname?.startsWith(item.href) ?? false} />
      ))}

      <Link
        href={fabAction.href}
        aria-label={fabAction.label}
        className="relative -mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Plus className="h-6 w-6" aria-hidden="true" />
      </Link>

      {ITEMS.slice(2).map((item) => (
        <NavButton key={item.href} item={item} isActive={pathname?.startsWith(item.href) ?? false} />
      ))}
    </nav>
  );
}

function NavButton({
  item,
  isActive,
}: {
  item: { href: string; label: string; icon: typeof LayoutDashboard };
  isActive: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        'flex flex-col items-center gap-1 px-3 py-1 text-xs font-medium transition-colors',
        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  );
}
