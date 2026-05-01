'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, LayoutDashboard, MoreHorizontal, Plus, Users } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Mobile bottom navigation (< lg). Mirrors `docs/ux/wireframes/05-navegacao.md` §5.
 *
 * 5 slots: Dashboard, Agenda, FAB (contextual), Pacientes, Mais. The FAB is a
 * placeholder click target until Story 2.4 wires the contextual create modal.
 */
const ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/pacientes', label: 'Pacientes', icon: Users },
  { href: '/mais', label: 'Mais', icon: MoreHorizontal },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-border bg-background lg:hidden"
    >
      {ITEMS.slice(0, 2).map((item) => (
        <NavButton key={item.href} item={item} isActive={pathname?.startsWith(item.href) ?? false} />
      ))}

      <button
        type="button"
        aria-label="Criar"
        className="relative -mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Plus className="h-6 w-6" aria-hidden="true" />
      </button>

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
