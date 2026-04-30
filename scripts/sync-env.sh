#!/usr/bin/env bash
# Regenera .env.local a partir de .keyra-secrets/ (fonte da verdade)
# Uso: ./scripts/sync-env.sh

set -euo pipefail

KEYRA_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SECRETS="${KEYRA_ROOT}/.keyra-secrets"
ENV_FILE="${KEYRA_ROOT}/.env.local"
# Next.js lê env vars de apps/web/.env.local (cwd da Next app).
# Mantemos a raiz como fonte da verdade e espelhamos para a app.
APP_ENV_FILE="${KEYRA_ROOT}/apps/web/.env.local"

read_or_empty() {
  local f="${SECRETS}/$1"
  [[ -f "${f}" ]] && tr -d '[:space:]' < "${f}" || echo ""
}

# Preserva espaços internos (ex.: "KEYRA <no-reply@usekeyra.com>"); apenas
# apara whitespace nas pontas e quebra de linha final.
read_line_or_empty() {
  local f="${SECRETS}/$1"
  if [[ -f "${f}" ]]; then
    head -n1 "${f}" | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//'
  else
    echo ""
  fi
}

REF=$(read_or_empty supabase-project-ref.txt)
ANON=$(read_or_empty supabase-anon.key)
PUB=$(read_or_empty supabase-publishable.key)
SR=$(read_or_empty supabase-service-role.key)
SEC=$(read_or_empty supabase-secret.key)
SBP=$(read_or_empty supabase.token)
VC=$(read_or_empty vercel.token)
GH=$(read_or_empty github.token)
CEK=$(read_or_empty column-encryption-key.txt)
RESEND=$(read_or_empty resend-api.key)
EMAIL_FROM_VAL=$(read_line_or_empty email-from.txt)

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

# ---- Application secrets ----
COLUMN_ENCRYPTION_KEY=${CEK}

# ---- Email transacional (Resend, ADR-021) ----
RESEND_API_KEY=${RESEND}
EMAIL_FROM=${EMAIL_FROM_VAL}

# ---- Vercel ----
VERCEL_TOKEN=${VC}

# ---- GitHub ----
GH_TOKEN=${GH}
GITHUB_TOKEN=${GH}
EOF

chmod 600 "${ENV_FILE}"
echo "✓ ${ENV_FILE} regenerado (chmod 600)"

# Espelha para apps/web/ se a pasta existir (pós Story 1.1)
if [[ -d "$(dirname "${APP_ENV_FILE}")" ]]; then
  # Filtra vars sensíveis que a Next app não precisa (tokens Vercel/GH/Supabase admin CLI)
  grep -Ev '^(VERCEL_TOKEN|GH_TOKEN|GITHUB_TOKEN|SUPABASE_ACCESS_TOKEN)=' "${ENV_FILE}" > "${APP_ENV_FILE}"
  chmod 600 "${APP_ENV_FILE}"
  echo "✓ ${APP_ENV_FILE} espelhado (chmod 600)"
fi
