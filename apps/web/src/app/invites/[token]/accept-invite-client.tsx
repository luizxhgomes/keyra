'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import { acceptInvite } from './actions';

export function AcceptInviteClient({ token, orgName }: { token: string; orgName: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAccept() {
    setError(null);
    startTransition(async () => {
      const result = await acceptInvite({ token });
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success(`Bem-vindo(a) ao ${orgName}!`);
      // Hard refresh to force middleware to re-read the JWT claims.
      window.location.href = '/dashboard';
    });
  }

  return (
    <>
      <Button onClick={handleAccept} disabled={isPending}>
        {isPending ? 'Aceitando...' : 'Aceitar convite'}
      </Button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}
