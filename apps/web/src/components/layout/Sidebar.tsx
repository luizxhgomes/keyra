'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
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
 * Desktop sidebar (≥ lg) — Story 6.5 + HOTFIX 2026-05-02.
 *
 * Mudanças 2026-05-02:
 * - **Sticky top-0 h-screen** — não some mais ao fazer scroll do conteúdo.
 * - **Toggle minimizar** — usuária pode colapsar para barra estreita só com
 *   ícones. Estado persistido em localStorage (`keyra:sidebar-collapsed`).
 * - **Renames**: "Pacientes" → "Clientes", "Comandas" → "Serviços",
 *   "Serviços" → "Catálogo" (decisão da idealizadora; URLs mantidas para
 *   não quebrar links salvos).
 *
 * Story 6.5 (AC1) — 7 itens primários + 2 secundários (Time, Configurações)
 * separados por `border-t border-border`.
 */
const NAV_PRIMARY = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/comandas', label: 'Serviços', icon: Receipt },
  { href: '/pacientes', label: 'Clientes', icon: Users },
  { href: '/servicos', label: 'Catálogo', icon: Sparkles },
  { href: '/financeiro', label: 'Financeiro', icon: Wallet },
  { href: '/estoque', label: 'Estoque', icon: Package },
] as const;

const NAV_SECONDARY = [
  { href: '/team', label: 'Time', icon: UserCog },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
] as const;

const STORAGE_KEY = 'keyra:sidebar-collapsed';

function readCollapsed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function Sidebar() {
  const pathname = usePathname();
  // Server snapshot e primeiro render: false (expandida — default).
  // Cliente lê localStorage no useEffect (Regra 3 RSC: sem useSyncExternalStore).
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setCollapsed(readCollapsed());
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
    } catch {
      // localStorage indisponível (incognito iOS) — só atualiza state local.
    }
  }

  function renderItem(item: { href: string; label: string; icon: typeof LayoutDashboard }) {
    const isActive = pathname?.startsWith(item.href) ?? false;
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        title={collapsed ? item.label : undefined}
        aria-label={collapsed ? item.label : undefined}
        className={cn(
          'flex items-center gap-3 rounded-md border-l-4 text-sm font-medium transition-colors',
          collapsed ? 'justify-center px-2 py-3' : 'px-4 py-3',
          isActive
            ? 'border-primary bg-primary-50 text-primary-700'
            : 'border-transparent text-foreground hover:bg-muted',
        )}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
        {collapsed ? null : <span className="truncate">{item.label}</span>}
      </Link>
    );
  }

  return (
    <aside
      aria-label="Navegação principal"
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 border-r border-border bg-background lg:flex lg:flex-col',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Story auth.9 — bolha "K" coerente com tela auth (light KEYRA) */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-border',
          collapsed ? 'justify-center px-2' : 'gap-3 px-5',
        )}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
          title={collapsed ? 'KEYRA' : undefined}
          aria-label="KEYRA — ir para Dashboard"
        >
          {/* Story brand.7 — bolha "K." com ponto signature gold consistente
              com header fixo do brandbook preview.html. Wordmark expandido
              em Fraunces editorial. */}
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-warm-sm transition-transform duration-fast ease-out-soft hover:scale-110">
            <span className="font-serif text-sm font-bold tracking-tight">K<span className="text-gold-300">.</span></span>
          </span>
          {!collapsed && (
            <span className="font-serif text-lg font-bold tracking-tight text-foreground">
              KEYRA<span className="text-gold-500">.</span>
            </span>
          )}
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {NAV_PRIMARY.map(renderItem)}
      </nav>

      <div className="flex flex-col gap-1 border-t border-border p-3">
        {NAV_SECONDARY.map(renderItem)}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          aria-pressed={collapsed}
          className={cn(
            'mt-1 flex items-center gap-3 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
            collapsed ? 'justify-center px-2 py-3' : 'px-4 py-3',
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 shrink-0" aria-hidden="true" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
