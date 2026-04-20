import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAuth } from '@/lib/auth/require-auth';
import type { MembershipRole } from '@/lib/auth/roles';
import { createServerClient } from '@/lib/supabase/server';

import { ConviteActions } from './convite-actions';
import { ConviteForm } from './convite-form';

export default async function ConvitesPage() {
  const { orgId } = await requireAuth();

  const supabase = await createServerClient();

  const { data: invites } = await supabase
    .from('organization_invites')
    .select('id, email, role, created_at, expires_at, accepted_at')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });

  const pending = (invites ?? []).filter((i) => !i.accepted_at);
  const accepted = (invites ?? []).filter((i) => i.accepted_at);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Convites pendentes</CardTitle>
            <CardDescription>
              Cada convite expira em 72 horas. Você pode reenviar para estender o prazo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum convite pendente.</p>
            ) : (
              <ul className="divide-y divide-border">
                {pending.map((inv) => {
                  const expiresAt = new Date(inv.expires_at);
                  const isExpired = expiresAt < new Date();
                  return (
                    <li key={inv.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{inv.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {isExpired
                            ? 'Expirado — reenvie para estender'
                            : `expira ${formatDistanceToNow(expiresAt, { locale: ptBR, addSuffix: true })}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={isExpired ? 'destructive' : 'secondary'}>
                          {labelForRole(inv.role as MembershipRole)}
                        </Badge>
                        <ConviteActions inviteId={inv.id} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {accepted.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Convites aceitos</CardTitle>
              <CardDescription>Histórico dos convites consumidos.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-border">
                {accepted.map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between gap-3 py-3">
                    <p className="text-sm truncate">{inv.email}</p>
                    <Badge variant="outline">{labelForRole(inv.role as MembershipRole)}</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Novo convite</CardTitle>
            <CardDescription>Envie um convite por email.</CardDescription>
          </CardHeader>
          <CardContent>
            <ConviteForm />
          </CardContent>
        </Card>
      </div>
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
