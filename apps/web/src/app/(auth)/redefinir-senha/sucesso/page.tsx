import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

import { JourneyProgress } from '@/components/auth/JourneyProgress';

export const metadata: Metadata = {
  title: 'Senha alterada · KEYRA',
  description: 'Sua nova senha foi salva. Faça login para continuar.',
};

/**
 * Tela de fechamento da jornada de recovery — Story auth.9.
 *
 * Pública (sem guard) porque a sessão já foi destruída pelo signOut(scope:'global')
 * que setNewPasswordAction chamou. Render é só copy + CTA — sem dado sensível.
 *
 * Risco aceito: alguém pode acessar /redefinir-senha/sucesso direto sem ter
 * feito reset. Vê tela de "Senha alterada, faça login" e clica no botão. Pior
 * caso é confusão pequena, não vazamento de dado.
 */
export default function RedefinirSenhaSucessoPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background: 'radial-gradient(circle at 50% 0%, hsl(21 56% 50% / 0.08), transparent 60%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center rounded-3xl border border-border bg-card p-8 shadow-warm-xl animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-warm-lg">
          <span className="text-xl font-bold tracking-tight">K</span>
        </div>

        <h2 className="mb-1 text-center text-2xl font-bold tracking-tight text-primary">KEYRA</h2>
        <p className="mb-6 text-center text-xs text-muted-foreground">Pronto, tudo certo</p>

        <JourneyProgress step={4} />

        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-success-leaf/20">
          <CheckCircle2 className="h-10 w-10 text-success-leaf" aria-hidden="true" />
        </div>

        <h3 className="mb-2 text-center text-lg font-semibold text-foreground">
          Senha alterada com sucesso!
        </h3>

        <p className="mb-6 text-center text-sm leading-relaxed text-muted-foreground">
          Por segurança, suas outras sessões foram desconectadas. Faça login com a nova senha
          para continuar.
        </p>

        <Link
          href="/login?password_changed=1"
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-warm-md transition-all duration-200 hover:bg-primary-600 hover:shadow-warm-md"
        >
          Fazer login
        </Link>
      </div>

      <p className="relative z-10 mt-6 text-xs text-muted-foreground">
        <Link href="/" className="transition-colors duration-150 hover:text-foreground">
          ← Voltar para a página inicial
        </Link>
      </p>
    </div>
  );
}
