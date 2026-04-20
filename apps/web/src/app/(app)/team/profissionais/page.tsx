import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAuth } from '@/lib/auth/require-auth';
import { createServerClient } from '@/lib/supabase/server';

import { ProfissionalActions } from './profissional-actions';
import { ProfissionalForm } from './profissional-form';

export default async function ProfissionaisPage() {
  const { orgId } = await requireAuth();
  const supabase = await createServerClient();

  const { data: professionals } = await supabase
    .from('professionals')
    .select('id, display_name, email, specialty, color, default_commission_rate, active')
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .order('display_name', { ascending: true });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <Card>
        <CardHeader>
          <CardTitle>Profissionais cadastrados</CardTitle>
          <CardDescription>
            Pessoas que realizam serviços. Podem ou não ter acesso ao app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(!professionals || professionals.length === 0) ? (
            <p className="text-sm text-muted-foreground">
              Ainda sem profissionais cadastrados. Use o formulário ao lado.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {professionals.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0 flex items-center gap-3">
                    {p.color ? (
                      <span
                        aria-hidden="true"
                        className="inline-block h-6 w-6 rounded-full border border-border"
                        style={{ backgroundColor: p.color }}
                      />
                    ) : null}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {p.display_name}
                        {!p.active ? (
                          <span className="ml-2 text-xs text-muted-foreground">(inativo)</span>
                        ) : null}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {[p.specialty, p.email].filter(Boolean).join(' · ') ||
                          'Sem especialidade ou email'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline">
                      Comissão: {formatCommission(p.default_commission_rate)}
                    </Badge>
                    <ProfissionalActions id={p.id} active={p.active} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Novo profissional</CardTitle>
            <CardDescription>
              Email é opcional. Para dar acesso ao app, depois envie um convite.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfissionalForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function formatCommission(rate: number | null | undefined): string {
  if (rate === null || rate === undefined) return '0%';
  return `${Math.round(rate * 100)}%`;
}
