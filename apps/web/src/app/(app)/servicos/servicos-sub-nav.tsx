'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const TABS = [
  {
    href: '/servicos',
    label: 'Serviços',
    match: (p: string) => p === '/servicos' || p.startsWith('/servicos/novo') || /^\/servicos\/[^/]+$/.test(p),
  },
  {
    href: '/servicos/categorias',
    label: 'Categorias',
    match: (p: string) => p.startsWith('/servicos/categorias'),
  },
] as const;

export function ServicosSubNav() {
  const pathname = usePathname() ?? '/servicos';

  return (
    <nav aria-label="Sub-navegação de serviços" className="border-b border-border">
      <ul className="flex gap-4">
        {TABS.map((tab) => {
          const isActive = tab.match(pathname);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={cn(
                  'inline-block border-b-2 px-1 pb-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
