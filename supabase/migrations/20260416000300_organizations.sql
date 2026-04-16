-- =============================================================================
-- KEYRA — Migration 003: Organizations, Memberships, Invites
-- Story 0.4 — @data-engineer (Dara)
--
-- Purpose: Multi-tenant root entities.
-- Traceability: ADR-011, ADR-012; FR-MT-01, FR-MT-02, FR-MT-03, FR-MT-04;
--               NFR-MT-01, NFR-MT-02.
--
-- Design notes:
--   - organizations is NOT tenant-scoped itself — it IS the tenant.
--   - memberships joins auth.users (Supabase) to organizations.
--   - invites allows inviting users before they have a Supabase account.
--   - Role hierarchy: owner > admin > professional > viewer (see helpers).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- organizations — the tenant root (clinic / studio)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  slug             citext UNIQUE,                    -- optional pretty URL / invite key
  cnpj             text NULL,                        -- optional (MEI may not have)
  legal_name       text NULL,
  timezone         text NOT NULL DEFAULT 'America/Sao_Paulo',
  locale           text NOT NULL DEFAULT 'pt-BR',
  currency         text NOT NULL DEFAULT 'BRL' CHECK (currency = 'BRL'),  -- MVP BR-only (CON-FI-01)
  -- Billing / plan (Stripe mirror, ADR-016)
  plan             text NOT NULL DEFAULT 'trial'
                   CHECK (plan IN ('trial','start','crescimento','autoridade','canceled')),
  subscription_status text NOT NULL DEFAULT 'trialing'
                   CHECK (subscription_status IN ('trialing','active','past_due','canceled','incomplete','paused')),
  trial_ends_at    timestamptz NULL,
  -- Audit
  created_by       uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  deleted_at       timestamptz NULL
);

COMMENT ON TABLE public.organizations IS
  'KEYRA tenant root (clinic/studio). FR-MT-01. Not tenant-scoped by org_id — it IS the tenant.';
COMMENT ON COLUMN public.organizations.plan IS 'SaaS plan mirrored from Stripe (ADR-016).';
COMMENT ON COLUMN public.organizations.subscription_status IS 'Stripe subscription status mirror.';

CREATE INDEX IF NOT EXISTS organizations_slug_idx ON public.organizations (slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS organizations_deleted_at_idx ON public.organizations (deleted_at);

CREATE TRIGGER organizations_set_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- memberships — (user_id, org_id, role) join table (ADR-012)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.memberships (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id       uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role         text NOT NULL CHECK (role IN ('owner','admin','professional','viewer')),
  display_name text NULL,                                        -- optional per-org display
  invited_by   uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at   timestamptz NULL,
  accepted_at  timestamptz NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz NULL,
  UNIQUE (user_id, org_id)
);

COMMENT ON TABLE public.memberships IS
  'KEYRA ADR-012: user × organization × role. Source of truth for JWT org_id hook.';

CREATE INDEX IF NOT EXISTS memberships_user_id_idx ON public.memberships (user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS memberships_org_id_idx  ON public.memberships (org_id)  WHERE deleted_at IS NULL;

CREATE TRIGGER memberships_set_updated_at
  BEFORE UPDATE ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Prevent org_id mutation on memberships — if you need to move a user to another
-- org, DELETE + INSERT (different invite).
CREATE TRIGGER memberships_enforce_org_id
  BEFORE UPDATE OF org_id ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION public.enforce_org_id_immutability();

-- -----------------------------------------------------------------------------
-- organization_invites — pending invites sent by email (user may not exist yet)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organization_invites (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email        citext NOT NULL,
  role         text NOT NULL CHECK (role IN ('owner','admin','professional','viewer')),
  token        text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  invited_by   uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at   timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  accepted_at  timestamptz NULL,
  accepted_by  uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, email)
);

COMMENT ON TABLE public.organization_invites IS
  'KEYRA FR-MT-02: pending invites by email. Consumed when user signs up or accepts.';

CREATE INDEX IF NOT EXISTS organization_invites_email_idx ON public.organization_invites (email);
CREATE INDEX IF NOT EXISTS organization_invites_token_idx ON public.organization_invites (token) WHERE accepted_at IS NULL;

CREATE TRIGGER organization_invites_set_updated_at
  BEFORE UPDATE ON public.organization_invites
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
