import Link from 'next/link';
import { Building2, ChevronRight, LogOut, Mail, ShieldCheck, UserCog } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signOutAction } from '@/app/actions/sign-out';
import { requireAuth } from '@/lib/auth/require-auth';
import { getCurrentRole } from '@/lib/auth/roles';
import { createServerClient } from '@/lib/supabase/server';

/**
 * `/configuracoes` — hub de configurações (Story 7.3).
 *
 * MVP enxuto: mostra **dados da conta + organização** e dá saída segura
 * (sair, ir pra time). Conforme integrações forem chegando (NF-e, billing
 * Stripe, integrações externas) cada uma vira sub-rota:
 *   /configuracoes/perfil
 *   /configuracoes/organizacao
 *   /configuracoes/cobranca
 *   /configuracoes/integracoes
 *
 * Por ora, página única com seções — evita over-engineering.
 *
 * **Decisão (idealizadora):** plano + status do trial ficam visíveis aqui
 * pra Camila saber a qualquer momento "quando vence" sem precisar abrir
 * o email da Stripe. Quando billing real chegar (Phase 7), esta seção
 * vira link pra `/configuracoes/cobranca`.
 */
const PLAN_LABEL: Record<string, string> = {
  trial: 'Período de teste',
  start: 'Plano Start',
  crescimento: 'Plano Crescimento',
  autoridade: 'Plano Autoridade',
  canceled: 'Cancelado',
};

const STATUS_LABEL: Record<string, string> = {
  trialing: 'em teste',
  active: 'ativo',
  past_due: 'em atraso',
  canceled: 'cancelado',
  incomplete: 'incompleto',
  paused: 'pausado',
};

const ROLE_LABEL: Record<string, string> = {
  owner: 'Proprietária',
  admin: 'Administradora',
  manager: 'Gerente',
  finance: 'Financeiro',
  professional: 'Profissional',
  viewer: 'Visualizadora',
};

function formatTrialEnd(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

export default async function ConfiguracoesPage() {
  const { user, orgId } = await requireAuth();
  const role = (await getCurrentRole(orgId)) ?? 'viewer';

  const supabase = await createServerClient();
  const { data: org } = await supabase
    .from('organizations')
    .select('name, plan, subscription_status, trial_ends_at')
    .eq('id', orgId)
    .single();

  const planLabel = org ? (PLAN_LABEL[org.plan] ?? org.plan) : 'Carregando…';
  const statusLabel = org ? (STATUS_LABEL[org.subscription_status] ?? org.subscription_status) : '';
  const trialEnds = org ? formatTrialEnd(org.trial_ends_at) : null;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-display-hero text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground">Conta, organização e acesso.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-primary" aria-hidden="true" />
            Organização
          </CardTitle>
          <CardDescription>Dados da clínica conectada nesta sessão.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Row label="Nome" value={org?.name ?? '—'} />
          <Row
            label="Plano"
            value={
              <span className="flex items-center gap-2">
                <span className="font-medium">{planLabel}</span>
                {statusLabel && (
                  <Badge variant="secondary" className="text-xs">
                    {statusLabel}
                  </Badge>
                )}
              </span>
            }
          />
          {trialEnds && <Row label="Teste termina em" value={trialEnds} />}
          <Row
            label="Seu papel"
            value={<span className="font-medium">{ROLE_LABEL[role] ?? role}</span>}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            Conta
          </CardTitle>
          <CardDescription>Login conectado e atalhos.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col">
          <Row
            label="Email"
            value={
              <span className="flex items-center gap-2 text-foreground">
                <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                {user.email ?? '—'}
              </span>
            }
          />

          <div className="mt-4 flex flex-col divide-y divide-border rounded-md border border-border">
            <Link
              href="/team"
              className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
            >
              <UserCog className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="flex-1 font-medium text-foreground">Time e convites</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </Link>
          </div>

          <form action={signOutAction} className="mt-6">
            <Button type="submit" variant="destructive" className="w-full sm:w-auto">
              <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
              Sair da conta
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">KEYRA · versão 0.1.0</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}
