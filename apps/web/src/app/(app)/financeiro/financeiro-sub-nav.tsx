'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/financeiro/dre', label: 'DRE' },
  { href: '/financeiro/dre-por-servico', label: 'DRE / serviço' },
  { href: '/financeiro/dre-por-profissional', label: 'DRE / profissional' },
  { href: '/financeiro/transacoes', label: 'Transações' },
  { href: '/financeiro/receitas', label: 'Receitas' },
  { href: '/financeiro/despesas', label: 'Despesas' },
  { href: '/financeiro/custos-fixos', label: 'Custos fixos' },
  { href: '/financeiro/fluxo-caixa', label: 'Fluxo de caixa' },
  { href: '/financeiro/metas', label: 'Metas' },
  { href: '/financeiro/categorias', label: 'Categorias' },
] as const;

export function FinanceiroSubNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Submenu de Financeiro" className="border-b border-border overflow-x-auto">
      <ul className="flex gap-1 whitespace-nowrap">
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
