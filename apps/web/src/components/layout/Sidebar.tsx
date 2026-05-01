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
 * 7 navigation items, no submenus (per NAV-02). Active state uses primary
 * background + left border to satisfy WCAG without relying on color alone.
 */
const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/comandas', label: 'Comandas', icon: Receipt },
  { href: '/pacientes', label: 'Pacientes', icon: Users },
  { href: '/servicos', label: 'Serviços', icon: Sparkles },
  { href: '/financeiro', label: 'Financeiro', icon: Wallet },
  { href: '/estoque', label: 'Estoque', icon: Package },
  { href: '/team', label: 'Time', icon: UserCog },
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
        <p className="px-2 text-xs text-muted-foreground">
          Org switcher e menu da conta estão no topo direito.
        </p>
      </div>
    </aside>
  );
}
