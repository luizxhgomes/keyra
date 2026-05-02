import Link from 'next/link';
import {
  Calendar,
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

import { Card, CardContent } from '@/components/ui/card';
import { requireAuth } from '@/lib/auth/require-auth';

/**
 * `/mais` — hub mobile (Story 7.3).
 *
 * O `BottomNav` (mobile, < lg) só comporta 4 slots de navegação + FAB.
 * Tudo que não cabe lá vive aqui: lista vertical com todos os destinos
 * primários e secundários da Sidebar desktop.
 *
 * Por que não simplesmente esconder Sidebar e mostrar um drawer? A persona
 * (Camila — clínica de estética, mobile-first em recepção) prefere "um
 * lugar conhecido" a um drawer que aparece/some. Lista estática é mais
 * previsível e não exige aprender gesture novo.
 *
 * Em desktop (≥ lg) a página continua acessível, mas o usuário típico
 * vai pela Sidebar — não há link direto pra `/mais` em desktop.
 *
 * **Decisão UX (idealizadora):** rota também serve como "mapa do app" —
 * útil pra novo usuário entender o que existe sem precisar tour guiado.
 */
const ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, hint: 'Visão única do mês' },
  { href: '/agenda', label: 'Agenda', icon: Calendar, hint: 'Agendamentos do dia' },
  { href: '/comandas', label: 'Comandas', icon: Receipt, hint: 'Registro de atendimentos' },
  { href: '/pacientes', label: 'Pacientes', icon: Users, hint: 'Cadastro e histórico' },
  { href: '/servicos', label: 'Serviços', icon: Sparkles, hint: 'Catálogo e preços' },
  { href: '/financeiro', label: 'Financeiro', icon: Wallet, hint: 'Receitas, despesas, DRE' },
  { href: '/estoque', label: 'Estoque', icon: Package, hint: 'Insumos e movimentação' },
  { href: '/team', label: 'Time', icon: UserCog, hint: 'Profissionais e convites' },
  { href: '/configuracoes', label: 'Configurações', icon: Settings, hint: 'Conta, organização, sair' },
] as const;

export default async function MaisPage() {
  await requireAuth();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-display-hero text-foreground">Mais</h1>
        <p className="text-sm text-muted-foreground">
          Tudo que existe no KEYRA, num só lugar.
        </p>
      </header>

      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-4 px-4 py-4 text-sm transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="flex flex-1 flex-col">
                      <span className="font-medium text-foreground">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.hint}</span>
                    </span>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
