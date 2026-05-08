import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorMessage } from '@/components/keyra';
import { requireAuth } from '@/lib/auth/require-auth';
import { requireRole } from '@/lib/auth/roles';

import {
  getPatientEncounters,
  getPatientPayments,
  getPatientProfile,
} from '../actions';
import { PacienteForm } from '../paciente-form';
import { PatientBillingSummary } from './patient-billing-summary';
import { PatientEncountersTable } from './patient-encounters-table';
import { PatientHeaderCard } from './patient-header-card';
import { PatientOverviewCard } from './patient-overview-card';
import { PatientPackageCard } from './patient-package-card';
import { PatientPaymentsTable } from './patient-payments-table';

type PageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Perfil completo do cliente — refinado conforme referência fornecida pela
 * idealizadora (2026-05-08, Linda Miller layout).
 *
 * Adaptação Editorial Beauty Luxury KEYRA:
 * - Layout 2-col: sidebar (header card + overview + pacote/assinatura) +
 *   coluna principal (4 KPIs financeiros + atendimentos + pagamentos)
 * - "Insurance" da referência → "Pacote ou assinatura" (placeholder até feature)
 * - 4 KPIs: Total gasto / Pendente / Atendimentos / Frequência
 * - Tabelas de Atendimentos e Pagamentos com placeholders quando vazias
 * - Form de edição preservado no rodapé (mantém compatibilidade com fluxo
 *   existente — Story 1.x cadastro)
 */
export default async function PacienteDetalhePage({ params }: PageProps) {
  const { orgId } = await requireAuth();
  await requireRole(orgId, 'viewer');
  const { id } = await params;

  const [profileRes, encountersRes, paymentsRes] = await Promise.all([
    getPatientProfile(id),
    getPatientEncounters(id),
    getPatientPayments(id),
  ]);

  if (!profileRes.ok) {
    if (profileRes.error.includes('não encontrado')) notFound();
    return (
      <div className="flex flex-col gap-4">
        <Link
          href="/pacientes"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para a lista
        </Link>
        <Card>
          <CardContent className="py-6">
            <ErrorMessage detail={profileRes.error} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const profile = profileRes.data;
  const encounters = encountersRes.ok ? encountersRes.data : [];
  const payments = paymentsRes.ok ? paymentsRes.data : [];

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/pacientes"
        className="inline-flex w-fit items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" aria-hidden="true" /> Voltar para a lista
      </Link>

      {/* Layout 2-col: sidebar (sticky em xl) + main */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
        {/* Coluna esquerda — sidebar */}
        <aside className="flex flex-col gap-4">
          <PatientHeaderCard
            fullName={profile.fullName}
            age={profile.age}
            phone={profile.phone}
            shortId={profile.shortId}
            archived={profile.archived}
          />
          <PatientOverviewCard
            shortId={profile.shortId}
            phone={profile.phone}
            email={profile.email}
            birthDate={profile.birthDate}
            age={profile.age}
            notes={profile.notes}
            createdAt={profile.createdAt}
            lastVisit={profile.metrics.lastVisit}
          />
          <PatientPackageCard />
        </aside>

        {/* Coluna principal — KPIs + tabelas */}
        <main className="flex min-w-0 flex-col gap-6">
          <PatientBillingSummary
            totalSpentCents={profile.metrics.totalSpentCents}
            pendingCents={profile.metrics.pendingCents}
            encountersTotal={profile.metrics.encountersTotal}
            appointmentsPerMonth={profile.metrics.appointmentsPerMonth}
          />
          <PatientEncountersTable rows={encounters} />
          <PatientPaymentsTable rows={payments} />
        </main>
      </div>

      {/* Form de edição preservado — mantém fluxo de cadastro existente */}
      <Card className="shadow-warm-sm">
        <CardHeader>
          <CardTitle className="font-serif">Editar dados</CardTitle>
          <CardDescription>
            As mudanças são salvas imediatamente ao clicar em Salvar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PacienteForm
            submitLabel="Salvar alterações"
            redirectTo="/pacientes"
            initial={{
              id: profile.id,
              fullName: profile.fullName,
              ...(profile.phone ? { phone: profile.phone } : {}),
              ...(profile.email ? { email: profile.email } : {}),
              ...(profile.birthDate ? { birthDate: profile.birthDate } : {}),
              ...(profile.notes ? { notes: profile.notes } : {}),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
