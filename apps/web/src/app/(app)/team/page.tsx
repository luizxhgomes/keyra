import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Mail, UserCog, Users } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EmptyState } from '@/components/keyra';
import { requireAuth } from '@/lib/auth/require-auth';
import { getCurrentRole, type MembershipRole } from '@/lib/auth/roles';
import { createServerClient } from '@/lib/supabase/server';
import { cn } from '@/lib/utils';

import { MemberActions } from './member-actions';

/**
 * Time — refinado conforme padrão Editorial Beauty Luxury KEYRA (2026-05-08).
 * Mantém lógica de membros + convites pendentes; refina visual com avatar
 * gradient, badges paleta KEYRA, cards com warm shadows.
 */
export default async function TeamIndexPage() {
  const { user, orgId } = await requireAuth();
  const actorRole = (await getCurrentRole(orgId)) ?? 'viewer';

  const supabase = await createServerClient();

  const { data: memberships } = await supabase
    .from('memberships')
    .select('id, user_id, role, display_name, created_at')
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  const { data: pendingInvites } = await supabase
    .from('organization_invites')
    .select('id, email, role, created_at, expires_at')
    .eq('org_id', orgId)
    .is('accepted_at', null)
    .order('created_at', { ascending: false });

  const totalMembers = memberships?.length ?? 0;
  const totalInvites = pendingInvites?.length ?? 0;
  const nonExpiredInvites =
    pendingInvites?.filter((i) => new Date(i.expires_at) >= new Date()).length ??
    0;

  return (
    <div className="flex flex-col gap-6">
      {/* Mini-stats inline */}
      <section
        aria-label="Resumo do time"
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        <MiniStat
          icon={Users}
          label="Membros ativos"
          value={String(totalMembers)}
          accent="cocoa"
        />
        <MiniStat
          icon={Mail}
          label="Convites pendentes"
          value={String(nonExpiredInvites)}
          accent="amber"
          helper={
            totalInvites > nonExpiredInvites
              ? `${totalInvites - nonExpiredInvites} expirado(s)`
              : nonExpiredInvites === 0
                ? 'Nada esperando'
                : ''
          }
        />
        <MiniStat
          icon={UserCog}
          label="Seu papel"
          value={labelForRole(actorRole)}
          accent="terracota"
        />
      </section>

      <Card className="shadow-warm-sm">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Membros</CardTitle>
          <CardDescription>
            Usuários com acesso ao app desta organização.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!memberships || memberships.length === 0 ? (
            <EmptyState
              icon={UserCog}
              title="Você ainda é a única pessoa no time"
              description="Convide profissionais para acessar a agenda, criar comandas e cobrar pelos atendimentos delas."
              action={{ label: 'Convidar pessoa', href: '/team/convites' }}
            />
          ) : (
            <ul className="divide-y divide-mocha-300/20">
              {memberships.map((m) => {
                const role = m.role as MembershipRole;
                const isSelf = m.user_id === user.id;
                const displayName = m.display_name ?? 'Sem nome cadastrado';
                const initial = displayName.charAt(0).toUpperCase();
                return (
                  <li
                    key={m.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div
                        aria-hidden="true"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300/40 to-terracotta-500/30 text-sm font-semibold text-cocoa-800"
                      >
                        {initial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {displayName}
                          {isSelf ? (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (você)
                            </span>
                          ) : null}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          desde{' '}
                          {formatDistanceToNow(new Date(m.created_at), {
                            locale: ptBR,
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <RolePill role={role} />
                      <MemberActions
                        membershipId={m.id}
                        currentRole={role}
                        actorRole={actorRole}
                        isSelf={isSelf}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-warm-sm">
        <CardHeader>
          <CardTitle className="font-serif text-xl">
            Convites pendentes
          </CardTitle>
          <CardDescription>
            Convites enviados por email aguardando aceite.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!pendingInvites || pendingInvites.length === 0 ? (
            <EmptyState
              icon={Mail}
              title="Nenhum convite aguardando resposta"
              description="Quando você enviar um convite por email, ele aparece aqui até a pessoa aceitar (72h pra expirar)."
              action={{ label: 'Enviar convite', href: '/team/convites' }}
            />
          ) : (
            <ul className="divide-y divide-mocha-300/20">
              {pendingInvites.map((inv) => {
                const expiresAt = new Date(inv.expires_at);
                const isExpired = expiresAt < new Date();
                return (
                  <li
                    key={inv.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div
                        aria-hidden="true"
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                          isExpired
                            ? 'bg-mocha-300/30 text-mocha-300'
                            : 'bg-gradient-to-br from-amber-300/30 to-amber-500/15 text-amber-500',
                        )}
                      >
                        <Mail className="h-4 w-4" strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {inv.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isExpired
                            ? 'Expirado — reenvie para estender o prazo'
                            : `expira ${formatDistanceToNow(expiresAt, {
                                locale: ptBR,
                                addSuffix: true,
                              })}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isExpired ? (
                        <span className="rounded-full border border-rust-800/30 bg-rust-800/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-rust-800">
                          Expirado
                        </span>
                      ) : null}
                      <RolePill role={inv.role as MembershipRole} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  accent,
  helper,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  accent: 'cocoa' | 'amber' | 'terracota';
  helper?: string;
}) {
  const accentClass = {
    cocoa: 'bg-gradient-to-br from-cocoa-700/20 to-cocoa-900/10 text-cocoa-800',
    amber: 'bg-gradient-to-br from-amber-300/30 to-amber-500/10 text-amber-500',
    terracota:
      'bg-gradient-to-br from-terracotta-500/25 to-rust-800/10 text-terracotta-500',
  }[accent];

  return (
    <Card className="flex items-start gap-3 p-4 shadow-warm-sm">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${accentClass}`}
        aria-hidden="true"
      >
        <Icon className="h-4 w-4" strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 font-serif text-xl font-light leading-none tracking-tight text-foreground">
          {value}
        </p>
        {helper && (
          <p className="mt-0.5 text-[10px] text-muted-foreground">{helper}</p>
        )}
      </div>
    </Card>
  );
}

function RolePill({ role }: { role: MembershipRole }) {
  const styles: Record<MembershipRole, string> = {
    owner:
      'border-cocoa-900/30 bg-cocoa-900/10 text-cocoa-900',
    admin: 'border-terracotta-500/30 bg-terracotta-500/10 text-terracotta-500',
    professional: 'border-amber-500/30 bg-amber-300/15 text-amber-500',
    viewer: 'border-mocha-300/40 bg-ivory-50 text-mocha-300',
  };
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
        styles[role],
      )}
    >
      {labelForRole(role)}
    </span>
  );
}

function labelForRole(role: MembershipRole): string {
  switch (role) {
    case 'owner':
      return 'Proprietário';
    case 'admin':
      return 'Administrador';
    case 'professional':
      return 'Profissional';
    case 'viewer':
      return 'Espectador';
  }
}
