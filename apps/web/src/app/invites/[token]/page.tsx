import Link from 'next/link';
import { redirect } from 'next/navigation';

import { signOutAction } from '@/app/actions/sign-out';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { createServerClient } from '@/lib/supabase/server';

import { AcceptInviteClient } from './accept-invite-client';

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function InviteAcceptPage({ params }: PageProps) {
  const { token } = await params;

  const supabase = await createServerClient();

  // We use the service-level view here but RLS lets the caller read their own
  // invite only if their email matches. For anonymous visitors this returns
  // null — we still show a generic "sign in to continue" state.
  const { data: invite } = await supabase
    .from('organization_invites')
    .select(
      'id, email, role, org_id, expires_at, accepted_at, organizations:organizations!inner(name)',
    )
    .eq('token', token)
    .maybeSingle();

  const user = await getCurrentUser();

  // Not logged in? Bounce to login preserving return path.
  if (!user) {
    const returnTo = `/invites/${encodeURIComponent(token)}`;
    redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  }

  // Token bogus / already consumed / revoked
  if (!invite) {
    return (
      <InviteShell
        title="Convite inválido"
        description="O link que você recebeu não é mais válido. Peça um novo convite para quem enviou o original."
      >
        <Link href="/dashboard">
          <Button>Ir para o painel</Button>
        </Link>
      </InviteShell>
    );
  }

  if (invite.accepted_at) {
    return (
      <InviteShell
        title="Convite já utilizado"
        description="Este convite já foi aceito. Acesse o painel para continuar."
      >
        <Link href="/dashboard">
          <Button>Ir para o painel</Button>
        </Link>
      </InviteShell>
    );
  }

  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return (
      <InviteShell
        title="Convite expirado"
        description="Este convite passou do prazo de 72 horas. Peça um novo para quem enviou o original."
      >
        <Link href="/dashboard">
          <Button>Ir para o painel</Button>
        </Link>
      </InviteShell>
    );
  }

  const userEmail = user.email?.toLowerCase() ?? '';
  const inviteEmail = invite.email.toLowerCase();
  if (userEmail !== inviteEmail) {
    return (
      <InviteShell
        title="Email diferente"
        description={`Este convite foi enviado para ${invite.email}. Saia da sua conta atual e entre com a conta correta.`}
      >
        <form action={signOutAction}>
          <Button type="submit" variant="secondary">
            Sair da conta
          </Button>
        </form>
      </InviteShell>
    );
  }

  // Happy path → render client form that calls the Server Action.
  const orgName =
    (invite as unknown as { organizations?: { name?: string } }).organizations?.name ??
    'a organização';

  return (
    <InviteShell
      title={`Você foi convidado(a) para ${orgName}`}
      description={`Papel: ${labelForRole(invite.role as 'admin' | 'professional' | 'viewer' | 'owner')}. Aceite para entrar na organização e começar a usar o KEYRA.`}
    >
      <AcceptInviteClient token={token} orgName={orgName} />
    </InviteShell>
  );
}

function InviteShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">{children}</CardContent>
      </Card>
    </main>
  );
}

function labelForRole(role: 'owner' | 'admin' | 'professional' | 'viewer'): string {
  switch (role) {
    case 'owner':
      return 'proprietário(a)';
    case 'admin':
      return 'administrador(a)';
    case 'professional':
      return 'profissional';
    case 'viewer':
      return 'espectador(a)';
  }
}
