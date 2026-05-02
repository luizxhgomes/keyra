import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Mail, UserCog } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/keyra';
import { requireAuth } from '@/lib/auth/require-auth';
import { getCurrentRole, type MembershipRole } from '@/lib/auth/roles';
import { createServerClient } from '@/lib/supabase/server';

import { MemberActions } from './member-actions';

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Membros</CardTitle>
          <CardDescription>
            Usuários com acesso ao app desta organização.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(!memberships || memberships.length === 0) ? (
            <EmptyState
              icon={UserCog}
              title="Você ainda é a única pessoa no time"
              description="Convide profissionais para acessar a agenda, criar comandas e cobrar pelos atendimentos delas."
              action={{ label: 'Convidar pessoa', href: '/team/convites' }}
            />
          ) : (
            <ul className="divide-y divide-border">
              {memberships.map((m) => {
                const role = m.role as MembershipRole;
                const isSelf = m.user_id === user.id;
                return (
                  <li key={m.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {m.display_name ?? 'Sem nome cadastrado'}
                        {isSelf ? (
                          <span className="ml-2 text-xs text-muted-foreground">(você)</span>
                        ) : null}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        desde {formatDistanceToNow(new Date(m.created_at), { locale: ptBR, addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant="secondary">{labelForRole(role)}</Badge>
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

      <Card>
        <CardHeader>
          <CardTitle>Convites pendentes</CardTitle>
          <CardDescription>
            Convites enviados por email aguardando aceite.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(!pendingInvites || pendingInvites.length === 0) ? (
            <EmptyState
              icon={Mail}
              title="Nenhum convite aguardando resposta"
              description="Quando você enviar um convite por email, ele aparece aqui até a pessoa aceitar (72h pra expirar)."
              action={{ label: 'Enviar convite', href: '/team/convites' }}
            />
          ) : (
            <ul className="divide-y divide-border">
              {pendingInvites.map((inv) => {
                const expiresAt = new Date(inv.expires_at);
                const isExpired = expiresAt < new Date();
                return (
                  <li key={inv.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{inv.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {isExpired
                          ? 'Expirado — reenvie para estender o prazo'
                          : `expira ${formatDistanceToNow(expiresAt, { locale: ptBR, addSuffix: true })}`}
                      </p>
                    </div>
                    <Badge variant={isExpired ? 'destructive' : 'secondary'}>
                      {labelForRole(inv.role as MembershipRole)}
                    </Badge>
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
