'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  Sparkles,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Desktop sidebar (≥ lg). Mirrors `docs/ux/wireframes/05-navegacao.md` §2.
 *
 * Story 6.5 (AC1) — 7 itens primários + 2 secundários (Time, Configurações)
 * separados por `border-t border-border`. Hierarquia visual clara: trabalho
 * diário acima, configuração abaixo. Active state usa primary background +
 * left border para satisfazer WCAG sem depender só de cor.
 */
const NAV_PRIMARY = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/comandas', label: 'Comandas', icon: Receipt },
  { href: '/pacientes', label: 'Pacientes', icon: Users },
  { href: '/servicos', label: 'Serviços', icon: Sparkles },
  { href: '/financeiro', label: 'Financeiro', icon: Wallet },
  { href: '/estoque', label: 'Estoque', icon: Package },
] as const;

const NAV_SECONDARY = [
  { href: '/team', label: 'Time', icon: UserCog },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  function renderItem(item: { href: string; label: string; icon: typeof LayoutDashboard }) {
    const isActive = pathname?.startsWith(item.href) ?? false;
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center gap-3 rounded-md border-l-4 px-4 py-3 text-sm font-medium transition-colors',
          isActive
            ? 'border-primary bg-primary-50 text-primary-700'
            : 'border-transparent text-foreground hover:bg-muted',
        )}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <aside
      aria-label="Navegação principal"
      className="hidden w-60 shrink-0 border-r border-border bg-background lg:flex lg:flex-col"
    >
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight text-primary">
          KEYRA
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_PRIMARY.map(renderItem)}
      </nav>

      <div className="flex flex-col gap-1 border-t border-border p-3">
        {NAV_SECONDARY.map(renderItem)}
      </div>
    </aside>
  );
}
