'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  getUserOrganizationsAction,
  type UserOrganization,
} from '@/app/actions/get-user-organizations';
import { switchOrganizationAction } from '@/app/actions/switch-organization';
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
 * Header org switcher.
 *
 * Fetches memberships on mount via Server Action (not Supabase browser client)
 * to respect RLS uniformly with the rest of the app. Shows:
 *   - Loading state while fetching
 *   - Plain text if user has 1 org
 *   - Dropdown if user has ≥ 2 orgs
 *   - Nothing if user has 0 orgs (shouldn't happen inside /dashboard)
 *
 * On switch, refreshes the page so the new JWT claim (org_id) propagates
 * to Server Components and RLS policies.
 */
export function OrgSwitcher() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<UserOrganization[] | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await getUserOrganizationsAction();
      if (cancelled) return;
      if (result.success) {
        setOrgs(result.data);
      } else {
        toast.error('Não foi possível carregar suas clínicas', {
          description: result.error,
        });
        setOrgs([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Skeleton
  if (orgs === null) {
    return (
      <div
        className="inline-flex h-9 w-40 animate-pulse items-center gap-2 rounded-md border border-border bg-muted/50 px-3 text-sm text-muted-foreground"
        aria-label="Carregando clínicas"
      >
        <span className="sr-only">Carregando</span>
      </div>
    );
  }

  if (orgs.length === 0) {
    return null;
  }

  const active = orgs.find((o) => o.isActive) ?? orgs[0];
  if (!active) return null;

  if (orgs.length === 1) {
    return (
      <div className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground">
        <span className="truncate max-w-[12rem]">{active.name}</span>
      </div>
    );
  }

  function handleSwitch(orgId: string) {
    if (orgId === active?.orgId) return;
    startTransition(async () => {
      const result = await switchOrganizationAction({ orgId });
      if (result.success) {
        toast.success('Clínica trocada');
        // Hard nav to /dashboard so middleware + Server Components re-read
        // the refreshed session and RLS scope updates across the tree.
        router.replace('/dashboard');
        router.refresh();
      } else {
        toast.error('Não foi possível trocar', { description: result.error });
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        )}
        disabled={pending}
        aria-label="Trocar de clínica"
      >
        <span className="truncate max-w-[10rem]">{active.name}</span>
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[16rem]">
        <DropdownMenuLabel>Suas clínicas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {orgs.map((org) => (
          <DropdownMenuItem
            key={org.orgId}
            onSelect={() => handleSwitch(org.orgId)}
            className="flex items-center justify-between gap-2"
          >
            <span className="flex flex-col leading-tight">
              <span className="truncate font-medium">{org.name}</span>
              <span className="text-xs text-muted-foreground">{labelRole(org.role)}</span>
            </span>
            {org.isActive ? (
              <Check className="h-4 w-4 text-primary" aria-label="Clínica ativa" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function labelRole(role: UserOrganization['role']): string {
  switch (role) {
    case 'owner':
      return 'Proprietária';
    case 'admin':
      return 'Administradora';
    case 'professional':
      return 'Profissional';
    case 'viewer':
      return 'Visualização';
    default:
      return role;
  }
}
