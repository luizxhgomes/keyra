'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const TABS = [
  { href: '/team', label: 'Membros', match: (p: string) => p === '/team' },
  { href: '/team/profissionais', label: 'Profissionais', match: (p: string) => p.startsWith('/team/profissionais') },
  { href: '/team/convites', label: 'Convites', match: (p: string) => p.startsWith('/team/convites') },
] as const;

export function TeamSubNav() {
  const pathname = usePathname() ?? '/team';

  return (
    <nav aria-label="Sub-navegação do time" className="border-b border-border">
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
