import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAuth } from '@/lib/auth/require-auth';
import { createServerClient } from '@/lib/supabase/server';

import { PacienteForm } from '../paciente-form';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PacienteEditarPage({ params }: PageProps) {
  const { orgId } = await requireAuth();
  const { id } = await params;

  const supabase = await createServerClient();

  const { data: patient } = await supabase
    .from('customers')
    .select('id, full_name, phone, email, birth_date, notes, deleted_at, created_at')
    .eq('id', id)
    .eq('org_id', orgId)
    .maybeSingle();

  if (!patient) {
    notFound();
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/pacientes" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para a lista
      </Link>

      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{patient.full_name}</h1>
          <p className="text-sm text-muted-foreground">Editar cadastro.</p>
        </div>
        {patient.deleted_at ? <Badge variant="outline">Arquivado</Badge> : null}
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Dados do paciente</CardTitle>
          <CardDescription>As mudanças são salvas imediatamente ao clicar em Salvar.</CardDescription>
        </CardHeader>
        <CardContent>
          <PacienteForm
            submitLabel="Salvar alterações"
            redirectTo="/pacientes"
            initial={{
              id: patient.id,
              fullName: patient.full_name,
              ...(patient.phone ? { phone: patient.phone } : {}),
              ...(patient.email ? { email: patient.email } : {}),
              ...(patient.birth_date ? { birthDate: patient.birth_date } : {}),
              ...(patient.notes ? { notes: patient.notes } : {}),
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de atendimentos</CardTitle>
          <CardDescription>Em construção — será preenchido pela Story 2.4.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Ainda sem atendimentos cadastrados.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Link href="/pacientes">
          <Button variant="ghost">Voltar</Button>
        </Link>
      </div>
    </div>
  );
}
