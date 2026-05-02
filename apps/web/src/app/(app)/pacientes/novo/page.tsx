import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAuth } from '@/lib/auth/require-auth';

import { PacienteForm } from '../paciente-form';

export default async function NovoPacientePage() {
  await requireAuth();

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h1 className="text-display">Novo cliente</h1>
        <p className="text-sm text-muted-foreground">Preencha os dados para cadastrar.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Informações básicas</CardTitle>
          <CardDescription>Apenas o nome é obrigatório.</CardDescription>
        </CardHeader>
        <CardContent>
          <PacienteForm submitLabel="Cadastrar cliente" />
        </CardContent>
      </Card>
    </div>
  );
}
