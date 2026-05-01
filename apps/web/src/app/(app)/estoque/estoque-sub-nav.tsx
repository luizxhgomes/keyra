'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

/**
 * Sub-nav do módulo `/estoque` (Insumos · Movimentações). Espelha o padrão
 * de `/servicos` (servicos-sub-nav) — duas abas pequenas no topo da página
 * para alternar entre as listas sem mudar de rota raiz.
 */
const ITEMS = [
  { href: '/estoque/insumos', label: 'Insumos' },
  { href: '/estoque/movimentacoes', label: 'Movimentações' },
] as const;

export function EstoqueSubNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Submenu de Estoque" className="border-b border-border">
      <ul className="flex gap-1">
        {ITEMS.map((item) => {
          const isActive = pathname?.startsWith(item.href) ?? false;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'inline-flex items-center border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
