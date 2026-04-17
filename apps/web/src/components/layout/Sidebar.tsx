'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  LayoutDashboard,
  Package,
  Settings,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Desktop sidebar (≥ lg). Mirrors `docs/ux/wireframes/05-navegacao.md` §2.
 *
 * 7 navigation items, no submenus (per NAV-02). Active state uses primary
 * background + left border to satisfy WCAG without relying on color alone.
 */
const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/pacientes', label: 'Pacientes', icon: Users },
  { href: '/servicos', label: 'Serviços', icon: Sparkles },
  { href: '/financeiro', label: 'Financeiro', icon: Wallet },
  { href: '/estoque', label: 'Estoque', icon: Package },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();

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
        {NAV_ITEMS.map((item) => {
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
        })}
      </nav>

      <div className="border-t border-border p-4">
        {/* TODO (Story 1.2): user menu (avatar + dropdown sair/perfil) */}
        <div className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-muted-foreground">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase">
            ?
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-foreground">Convidada</span>
            <span className="text-xs">Story 1.2 ativa login</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
