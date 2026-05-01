import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import {
  getCommand,
  listActiveServicesForPicker,
  listPaymentPickers,
  listPaymentsForCommand,
  type CommandStatus,
} from '../actions';
import { ComandaEditForm } from '../comanda-edit-form';
import { PaymentsCard } from '../payments-card';
import { ConsumoCard } from './consumo-card';

type PageProps = {
  params: Promise<{ id: string }>;
};

const STATUS_LABEL: Record<CommandStatus, string> = {
  open: 'Aberta',
  finalized: 'Finalizada',
  paid: 'Paga',
  cancelled: 'Cancelada',
};

const STATUS_BADGE: Record<CommandStatus, string> = {
  open: 'bg-amber-100 text-amber-900 hover:bg-amber-100',
  finalized: 'bg-blue-100 text-blue-900 hover:bg-blue-100',
  paid: 'bg-emerald-100 text-emerald-900 hover:bg-emerald-100',
  cancelled: 'bg-stone-200 text-stone-700 hover:bg-stone-200',
};

export default async function ComandaDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [cmdRes, pickerRes, paymentsRes, paymentPickersRes] = await Promise.all([
    getCommand(id),
    listActiveServicesForPicker(),
    listPaymentsForCommand(id),
    listPaymentPickers(),
  ]);

  if (!cmdRes.ok) notFound();
  const cmd = cmdRes.data;
  const services = pickerRes.ok ? pickerRes.data : [];
  const payments = paymentsRes.ok ? paymentsRes.data : [];
  const pickers = paymentPickersRes.ok
    ? paymentPickersRes.data
    : { methods: [], accounts: [] };

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        href="/comandas"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para comandas
      </Link>

      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Comanda · {cmd.customer_name ?? 'Cliente avulso'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {cmd.professional_name ?? 'Sem profissional'} ·{' '}
            {format(new Date(cmd.opened_at), "d 'de' MMMM, HH:mm", { locale: ptBR })}
            {cmd.appointment_id ? (
              <>
                {' · '}
                <Link
                  href={`/agenda?event=${cmd.appointment_id}`}
                  className="underline hover:text-foreground"
                >
                  Ver agendamento
                </Link>
              </>
            ) : null}
          </p>
        </div>
        <Badge variant="secondary" className={STATUS_BADGE[cmd.status]}>
          {STATUS_LABEL[cmd.status]}
        </Badge>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Itens</CardTitle>
          <CardDescription>
            Itens vindos do agendamento ficam imutáveis após pagar (snapshot de preço/custo
            preservado — ADR-013 #7). Edição manual permitida apenas em comandas abertas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ComandaEditForm
            commandId={cmd.id}
            status={cmd.status}
            initialItems={cmd.items}
            initialDiscount={cmd.discount_amount}
            servicesPicker={services}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pagamentos</CardTitle>
          <CardDescription>
            Cada pagamento registrado dispara automaticamente uma transação financeira
            (FR-FI-01) e atualiza o status da comanda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentsCard
            commandId={cmd.id}
            status={cmd.status}
            total={cmd.total}
            paidAmount={cmd.paid_amount}
            payments={payments}
            methods={pickers.methods}
            accounts={pickers.accounts}
          />
        </CardContent>
      </Card>

      <ConsumoCard commandId={cmd.id} status={cmd.status} />
    </div>
  );
}
