import Link from 'next/link';
import { Plus, Search, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/keyra';
import { requireAuth } from '@/lib/auth/require-auth';
import { createServerClient } from '@/lib/supabase/server';

import { PacienteRowActions } from './paciente-row-actions';

const PAGE_SIZE = 20;

type PageProps = {
  searchParams: Promise<{ q?: string; page?: string; archived?: string }>;
};

export default async function PacientesPage({ searchParams }: PageProps) {
  const { orgId } = await requireAuth();
  const params = await searchParams;
  const q = (params.q ?? '').trim();
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const showArchived = params.archived === '1';
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createServerClient();

  let query = supabase
    .from('customers')
    .select('id, full_name, phone, email, birth_date, deleted_at, created_at', {
      count: 'exact',
    })
    .eq('org_id', orgId)
    .order('full_name', { ascending: true });

  if (!showArchived) {
    query = query.is('deleted_at', null);
  }
  if (q) {
    query = query.ilike('full_name', `%${q}%`);
  }

  const { data: patients, count } = await query.range(from, to);

  const totalPages = count ? Math.max(1, Math.ceil(count / PAGE_SIZE)) : 1;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  function qs(next: Record<string, string | number | undefined>): string {
    const merged = new URLSearchParams();
    if (q) merged.set('q', q);
    if (showArchived) merged.set('archived', '1');
    for (const [k, v] of Object.entries(next)) {
      if (v === undefined) merged.delete(k);
      else merged.set(k, String(v));
    }
    const s = merged.toString();
    return s ? `?${s}` : '';
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pacientes</h1>
          <p className="text-sm text-muted-foreground">
            {count ?? 0} {count === 1 ? 'paciente' : 'pacientes'}
            {showArchived ? ' (incluindo arquivados)' : ''}
          </p>
        </div>
        <Link href="/pacientes/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Novo paciente
          </Button>
        </Link>
      </header>

      <form
        action="/pacientes"
        method="get"
        className="flex flex-wrap items-center gap-2"
        role="search"
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nome..."
            className="pl-9"
          />
        </div>
        {showArchived ? <input type="hidden" name="archived" value="1" /> : null}
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
        <Link
          href={showArchived ? '/pacientes' : '/pacientes?archived=1'}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {showArchived ? 'Ocultar arquivados' : 'Mostrar arquivados'}
        </Link>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Lista</CardTitle>
          <CardDescription>
            Clique no nome para editar. Busca é fuzzy (não precisa de acentos).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!patients || patients.length === 0 ? (
            q ? (
              <EmptyState
                icon={Search}
                title="Nada por aqui"
                description={`Nenhum paciente encontrado para "${q}". Tente outro termo ou limpe a busca.`}
              />
            ) : (
              <EmptyState
                icon={Users}
                title="Você ainda não tem pacientes"
                description="Cadastre quem atende você para ver histórico, ticket médio e LTV de cada cliente."
                action={{
                  label: 'Cadastrar paciente',
                  href: '/pacientes/novo',
                }}
              />
            )
          ) : (
            <ul className="divide-y divide-border">
              {patients.map((p) => {
                const isArchived = !!p.deleted_at;
                return (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link
                        href={`/pacientes/${p.id}`}
                        className="text-sm font-medium hover:text-primary"
                      >
                        {p.full_name}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">
                        {[p.phone, p.email].filter(Boolean).join(' · ') ||
                          'Sem telefone ou email'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isArchived ? <Badge variant="outline">Arquivado</Badge> : null}
                      <PacienteRowActions id={p.id} archived={isArchived} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 ? (
        <nav
          aria-label="Paginação"
          className="flex items-center justify-between text-sm text-muted-foreground"
        >
          <span>
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            {hasPrev ? (
              <Link href={`/pacientes${qs({ page: page - 1 })}`}>
                <Button variant="ghost" size="sm">
                  Anterior
                </Button>
              </Link>
            ) : null}
            {hasNext ? (
              <Link href={`/pacientes${qs({ page: page + 1 })}`}>
                <Button variant="ghost" size="sm">
                  Próxima
                </Button>
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
