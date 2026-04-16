#!/usr/bin/env bash
# Regenera .env.local a partir de .keyra-secrets/ (fonte da verdade)
# Uso: ./scripts/sync-env.sh

set -euo pipefail

KEYRA_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SECRETS="${KEYRA_ROOT}/.keyra-secrets"
ENV_FILE="${KEYRA_ROOT}/.env.local"

read_or_empty() {
  local f="${SECRETS}/$1"
  [[ -f "${f}" ]] && tr -d '[:space:]' < "${f}" || echo ""
}

REF=$(read_or_empty supabase-project-ref.txt)
ANON=$(read_or_empty supabase-anon.key)
PUB=$(read_or_empty supabase-publishable.key)
SR=$(read_or_empty supabase-service-role.key)
SEC=$(read_or_empty supabase-secret.key)
SBP=$(read_or_empty supabase.token)
VC=$(read_or_empty vercel.token)
GH=$(read_or_empty github.token)

URL=""
[[ -n "${REF}" ]] && URL="https://${REF}.supabase.co"

cat > "${ENV_FILE}" <<EOF
# Auto-gerado por ./scripts/sync-env.sh — NÃO EDITAR À MÃO
# Fonte da verdade: .keyra-secrets/

# ---- Supabase (cliente) ----
NEXT_PUBLIC_SUPABASE_URL=${URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON}
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${PUB}

# ---- Supabase (servidor) ----
SUPABASE_SERVICE_ROLE_KEY=${SR}
SUPABASE_SECRET_KEY=${SEC}
SUPABASE_PROJECT_REF=${REF}
SUPABASE_ACCESS_TOKEN=${SBP}

# ---- Vercel ----
VERCEL_TOKEN=${VC}

# ---- GitHub ----
GH_TOKEN=${GH}
GITHUB_TOKEN=${GH}
EOF

chmod 600 "${ENV_FILE}"
echo "✓ ${ENV_FILE} regenerado (chmod 600)"
