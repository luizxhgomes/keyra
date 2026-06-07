import Link from 'next/link';
import { ArrowLeft, Check, Crown, Sprout, TrendingUp } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAuth } from '@/lib/auth/require-auth';
import { createServerClient } from '@/lib/supabase/server';

/**
 * `/configuracoes/plano` — vitrine de planos (informativa).
 *
 * Contexto soft-launch: durante o beta o acesso é **gratuito**. Esta página não
 * cobra nada — mostra o plano atual da clínica e o que cada tier inclui, para a
 * Camila enxergar a trilha de evolução. Valores ficam de fora de propósito: o
 * pricing absoluto ainda é decisão da idealizadora (PRD §AUTO-05) e o beta é
 * gratuito. Quando o billing real chegar (pós-MVP), cada tier ganha um CTA de
 * checkout; por ora é descrição honesta.
 *
 * Resolve o link do dashboard (`upgrade-cta-card.tsx` → "Ver planos"), que
 * antes apontava para uma rota inexistente (404 autenticado).
 */

type TierId = 'start' | 'crescimento' | 'autoridade';

type Tier = {
  id: TierId;
  name: string;
  icon: typeof Sprout;
  audience: string;
  tagline: string;
  features: string[];
};

const TIERS: Tier[] = [
  {
    id: 'start',
    name: 'Start',
    icon: Sprout,
    audience: 'Profissional autônoma',
    tagline: 'O essencial para a operação virar financeiro sozinha.',
    features: [
      'Agenda e atendimentos',
      'Comandas e pagamentos',
      'Financeiro automático (receitas e despesas)',
      'DRE mensal simples',
    ],
  },
  {
    id: 'crescimento',
    name: 'Crescimento',
    icon: TrendingUp,
    audience: 'Studio ou clínica (2 a 5 profissionais)',
    tagline: 'A inteligência que separa lucro de faturamento.',
    features: [
      'Tudo do Start',
      'DRE detalhada por serviço',
      'Lucro por serviço e por profissional',
      'Precificação e metas',
      'Estoque e insumos',
      'Projeções de caixa',
    ],
  },
  {
    id: 'autoridade',
    name: 'Autoridade',
    icon: Crown,
    audience: 'Rede ou power user',
    tagline: 'IA, integrações e mentoria para escalar com autoridade.',
    features: [
      'Tudo do Crescimento',
      'Recomendações de preço por IA',
      'Integrações (Asaas, WhatsApp, NFS-e)',
      'Multi-unidade',
      'Mentoria mensal incluída',
    ],
  },
];

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

export default async function PlanoPage() {
  const { orgId } = await requireAuth();

  const supabase = await createServerClient();
  const { data: org } = await supabase
    .from('organizations')
    .select('plan, subscription_status, trial_ends_at')
    .eq('id', orgId)
    .single();

  const currentPlan = org?.plan ?? 'trial';
  const statusLabel = org ? (STATUS_LABEL[org.subscription_status] ?? org.subscription_status) : '';
  const trialEnds = org ? formatTrialEnd(org.trial_ends_at) : null;

  // Durante o teste, o acesso liberado é o do plano Crescimento (trial 14 dias
  // no Crescimento — PRD §AUTO-06). Por isso o destaque vai para esse tier.
  const highlightTier: TierId = currentPlan === 'trial' ? 'crescimento' : (currentPlan as TierId);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <Link
          href="/configuracoes"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Configurações
        </Link>
        <div>
          <h1 className="font-serif text-display-hero text-foreground">Planos</h1>
          <p className="text-sm text-muted-foreground">
            A trilha de evolução da KEYRA, do essencial ao crescimento com autoridade.
          </p>
        </div>
      </header>

      <Card className="border-success-leaf/40 bg-success-leaf/5">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-base">
            Seu acesso agora
            <Badge variant="success">Beta gratuito</Badge>
          </CardTitle>
          <CardDescription>
            Durante o beta, sua clínica usa a KEYRA sem cobrança. Os valores de cada plano serão
            anunciados antes de qualquer mudança.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Plano atual</span>
            <span className="flex items-center gap-2 text-sm text-foreground">
              <span className="font-medium">{PLAN_LABEL[currentPlan] ?? currentPlan}</span>
              {statusLabel && (
                <Badge variant="secondary" className="text-xs">
                  {statusLabel}
                </Badge>
              )}
            </span>
          </div>
          {trialEnds && (
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Teste termina em
              </span>
              <span className="text-sm text-foreground">{trialEnds}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {TIERS.map((tier) => {
          const isCurrent = tier.id === highlightTier;
          return (
            <Card
              key={tier.id}
              className={
                isCurrent
                  ? 'flex h-full flex-col border-2 border-primary shadow-warm-md'
                  : 'flex h-full flex-col'
              }
            >
              <CardHeader className="gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <tier.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  {isCurrent && <Badge variant="default">Seu plano</Badge>}
                </div>
                <CardTitle className="font-serif text-xl">{tier.name}</CardTitle>
                <CardDescription>{tier.audience}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <p className="text-sm text-foreground">{tier.tagline}</p>
                <ul className="flex flex-1 flex-col gap-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-success-deep"
                        aria-hidden="true"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-auto text-xs text-muted-foreground">
                  {isCurrent ? 'Liberado no seu acesso atual.' : 'Disponível durante o beta.'}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Valores e cobrança serão comunicados com antecedência. Nada muda sem aviso.
      </p>
    </div>
  );
}
