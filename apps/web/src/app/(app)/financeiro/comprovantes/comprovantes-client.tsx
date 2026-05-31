'use client';

import { useRef, useState, useTransition } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Camera, Check, FileImage, FileText, Loader2, Sparkles, Upload, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { EmptyState } from '@/components/keyra';
import { cn } from '@/lib/utils';
import { formatBRL } from '@/lib/money';
import { DOCUMENT_TYPE_LABELS } from '@/lib/receipts/schema';

import {
  confirmReceipt,
  getReceiptDetail,
  getReceipts,
  processReceipt,
  rejectReceipt,
  uploadReceipt,
  type ReceiptDetail,
  type ReceiptListItem,
} from './actions';

const ACCEPT =
  'image/jpeg,image/png,image/webp,image/heic,application/pdf,text/plain,text/markdown,text/html,' +
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document,' +
  'application/vnd.oasis.opendocument.text,application/epub+zip';

const STATUS_META: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Aguardando', cls: 'bg-muted text-muted-foreground' },
  processing: { label: 'Lendo com IA…', cls: 'bg-accent text-accent-foreground' },
  needs_review: { label: 'Para revisar', cls: 'bg-primary/15 text-primary' },
  confirmed: { label: 'Lançado', cls: 'bg-success-leaf/20 text-success-deep' },
  rejected: { label: 'Descartado', cls: 'bg-muted text-muted-foreground' },
  failed: { label: 'Não foi possível ler', cls: 'bg-destructive/15 text-destructive' },
};

export function ComprovantesClient({ initialReceipts }: { initialReceipts: ReceiptListItem[] }) {
  const [receipts, setReceipts] = useState<ReceiptListItem[]>(initialReceipts);
  const [busy, setBusy] = useState(false);
  const [detail, setDetail] = useState<ReceiptDetail | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  async function reload() {
    const res = await getReceipts();
    if (res.ok) setReceipts(res.data);
  }

  async function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    setBusy(true);
    try {
      for (const file of Array.from(list)) {
        const fd = new FormData();
        fd.append('file', file);
        const up = await uploadReceipt(fd);
        if (!up.ok) {
          toast.error(`${file.name}: ${up.error}`);
          continue;
        }
        if (up.data.duplicate) {
          toast.info(`${file.name} já tinha sido anexado.`);
          continue;
        }
        toast.success(`${file.name} anexado. Lendo com IA…`);
        await reload();
        const proc = await processReceipt(up.data.receiptId);
        if (proc.ok && proc.data.status === 'needs_review') {
          toast.success(`${file.name}: leitura pronta — revise e confirme.`);
        } else if (proc.ok && proc.data.status === 'failed') {
          toast.warning(`${file.name}: não foi possível ler — você pode lançar manualmente.`);
        }
        await reload();
      }
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
      if (cameraRef.current) cameraRef.current.value = '';
    }
  }

  async function openReview(id: string) {
    setOpeningId(id);
    const res = await getReceiptDetail(id);
    setOpeningId(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setDetail(res.data);
  }

  return (
    <div className="space-y-6">
      {/* Área de upload */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6" />}
          </span>
          <div className="space-y-1">
            <p className="font-serif text-lg text-foreground">Anexe um comprovante</p>
            <p className="max-w-md text-sm text-muted-foreground text-pretty">
              Foto, print ou PDF de um Pix, boleto, nota ou recibo. A IA lê o valor, a data e o
              tipo — você só confere e confirma.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button type="button" onClick={() => fileRef.current?.click()} disabled={busy}>
              <Upload className="mr-2 h-4 w-4" /> Escolher arquivo
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => cameraRef.current?.click()}
              disabled={busy}
            >
              <Camera className="mr-2 h-4 w-4" /> Usar câmera
            </Button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={(e) => void handleFiles(e.target.files)}
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => void handleFiles(e.target.files)}
          />
        </CardContent>
      </Card>

      {/* Lista */}
      {receipts.length === 0 ? (
        <EmptyState
          title="Nenhum comprovante ainda"
          description="Anexe o primeiro acima. Ele fica guardado aqui e vira lançamento depois da sua confirmação."
        />
      ) : (
        <ul className="space-y-3">
          {receipts.map((r) => {
            const meta = STATUS_META[r.status] ?? STATUS_META.pending!;
            const isImage = r.normalized_kind === 'image' || r.mime_type.startsWith('image/');
            const amount = r.extraction ? formatBRL(r.extraction.gross_amount) : null;
            const canReview = r.status === 'needs_review';
            const canRetry = r.status === 'failed';
            return (
              <li key={r.id}>
                <Card>
                  <CardContent className="flex items-center gap-4 py-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      {isImage ? <FileImage className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {r.original_filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(r.created_at), "d 'de' MMM',' HH:mm", { locale: ptBR })}
                        {amount ? ` · ${amount}` : ''}
                        {r.extraction?.direction
                          ? ` · ${r.extraction.direction === 'credit' ? 'Receita' : 'Despesa'}`
                          : ''}
                      </p>
                      {r.status === 'failed' && r.extraction_error ? (
                        <p className="mt-1 text-xs text-destructive">{r.extraction_error}</p>
                      ) : null}
                    </div>
                    <Badge className={cn('shrink-0 border-0', meta.cls)}>{meta.label}</Badge>
                    {canReview ? (
                      <Button
                        size="sm"
                        onClick={() => void openReview(r.id)}
                        disabled={openingId === r.id}
                      >
                        {openingId === r.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Revisar'
                        )}
                      </Button>
                    ) : null}
                    {canRetry ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          void processReceipt(r.id).then(() => reload())
                        }
                      >
                        Tentar de novo
                      </Button>
                    ) : null}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {detail ? (
        <ReviewSheet
          key={detail.id}
          detail={detail}
          onClose={() => setDetail(null)}
          onDone={async () => {
            setDetail(null);
            await reload();
          }}
        />
      ) : null}
    </div>
  );
}

function ReviewSheet({
  detail,
  onClose,
  onDone,
}: {
  detail: ReceiptDetail;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const ex = detail.extraction;
  const [pending, startTransition] = useTransition();
  const [direction, setDirection] = useState<'credit' | 'debit'>(ex?.direction ?? 'debit');
  const [amount, setAmount] = useState<string>(ex ? String(ex.gross_amount) : '');
  const [refDate, setRefDate] = useState<string>(
    ex?.reference_date ?? new Date().toISOString().slice(0, 10),
  );
  const [description, setDescription] = useState<string>(ex?.description ?? '');
  const [accountId, setAccountId] = useState<string>(detail.accounts[0]?.id ?? '');
  const [categoryId, setCategoryId] = useState<string>('');

  function submit() {
    const value = Number(amount.replace(',', '.'));
    if (!Number.isFinite(value) || value <= 0) {
      toast.error('Informe um valor maior que zero.');
      return;
    }
    if (!accountId) {
      toast.error('Selecione a conta.');
      return;
    }
    startTransition(async () => {
      const res = await confirmReceipt({
        receiptId: detail.id,
        direction,
        grossAmount: value,
        referenceDate: refDate,
        ...(description.trim() ? { description: description.trim() } : {}),
        accountId,
        ...(direction === 'debit' && categoryId ? { expenseCategoryId: categoryId } : {}),
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(
        direction === 'credit'
          ? 'Receita lançada. Já entrou no fluxo de caixa.'
          : 'Despesa lançada. O DRE deste mês foi recalculado.',
      );
      await onDone();
    });
  }

  function reject() {
    startTransition(async () => {
      const res = await rejectReceipt(detail.id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.info('Comprovante descartado.');
      await onDone();
    });
  }

  return (
    <Sheet open onOpenChange={(o) => (!o ? onClose() : undefined)}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-serif">Revisar comprovante</SheetTitle>
          <SheetDescription>
            A IA leu os dados abaixo. Confira, ajuste se precisar e confirme — só então vira um
            lançamento.
            {ex ? ` Confiança da leitura: ${Math.round(ex.confidence * 100)}%.` : ''}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 py-4">
          {/* Preview do artefato normalizado (nunca o original cru) */}
          {detail.previewUrls.length > 0 ? (
            <div className="space-y-2">
              {detail.previewUrls.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={url}
                  alt={`Página ${i + 1} do comprovante`}
                  className="w-full rounded-md border border-border"
                />
              ))}
            </div>
          ) : detail.previewText ? (
            <pre className="max-h-60 overflow-auto rounded-md border border-border bg-muted p-3 text-xs whitespace-pre-wrap text-muted-foreground">
              {detail.previewText}
            </pre>
          ) : null}

          {ex?.document_type ? (
            <p className="text-sm text-muted-foreground">
              Tipo identificado:{' '}
              <span className="text-foreground">{DOCUMENT_TYPE_LABELS[ex.document_type]}</span>
              {ex.counterparty ? ` · ${ex.counterparty}` : ''}
            </p>
          ) : null}

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Tipo de lançamento</Label>
              <Select value={direction} onValueChange={(v) => setDirection(v as 'credit' | 'debit')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Receita (entrou)</SelectItem>
                  <SelectItem value="debit">Despesa (saiu)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt-amount">Valor (R$)</Label>
              <Input
                id="receipt-amount"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt-date">Data</Label>
              <Input
                id="receipt-date"
                type="date"
                value={refDate}
                onChange={(e) => setRefDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt-desc">Descrição</Label>
              <Input
                id="receipt-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex.: Pagamento de fornecedor"
              />
            </div>

            <div className="space-y-2">
              <Label>Conta</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a conta" />
                </SelectTrigger>
                <SelectContent>
                  {detail.accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {direction === 'debit' && detail.expenseCategories.length > 0 ? (
              <div className="space-y-2">
                <Label>Categoria (opcional)</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sem categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {detail.expenseCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>
        </div>

        <SheetFooter className="flex-row gap-3">
          <Button type="button" variant="ghost" onClick={reject} disabled={pending}>
            <X className="mr-2 h-4 w-4" /> Descartar
          </Button>
          <Button type="button" className="flex-1" onClick={submit} disabled={pending}>
            {pending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Confirmar lançamento
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
