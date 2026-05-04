'use client';

import { useTransition } from 'react';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

import { signOutAction } from '@/app/actions/sign-out';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

/**
 * Header user menu.
 *
 * Recebe email + displayName do Server Component pai (Story auth.7).
 * displayName vem do JWT custom claim `full_name` (Auth Hook estendido na
 * Story auth.1) com fallback no email — sem round-trip cliente.
 *
 * Avatar mostra initial do displayName (que é o full_name quando preenchido,
 * ou primeira letra do email quando não).
 */
export function UserMenu({ email, displayName }: { email: string; displayName: string }) {
  const [pending, startTransition] = useTransition();

  const initial = displayName.trim().charAt(0).toUpperCase() || '?';

  function handleSignOut() {
    startTransition(async () => {
      try {
        await signOutAction();
      } catch (error) {
        // `redirect()` throws NEXT_REDIRECT, which Next handles — but if the
        // Supabase call above throws (network, etc.) before the redirect,
        // we surface it here.
        if (error instanceof Error && error.message !== 'NEXT_REDIRECT') {
          toast.error('Não foi possível sair', { description: error.message });
        }
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold uppercase text-primary-700 hover:bg-primary-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
        aria-label={`Menu de ${email}`}
        disabled={pending}
      >
        {initial}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[16rem]">
        <DropdownMenuLabel>Conta</DropdownMenuLabel>
        <div className="px-2 pb-2 text-sm">
          <p className="truncate text-foreground" title={email}>
            {email}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            handleSignOut();
          }}
          disabled={pending}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span>{pending ? 'Saindo...' : 'Sair'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
