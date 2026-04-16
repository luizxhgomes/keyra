#!/usr/bin/env bash
# KEYRA isolated shell — carrega tokens de .keyra-secrets/ APENAS na sessão atual
# Uso: source ./scripts/keyra-shell.sh
#
# Não altera autenticação global de gh/vercel/supabase.
# As envs vivem só no shell que sourceou este arquivo.

KEYRA_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SECRETS_DIR="${KEYRA_ROOT}/.keyra-secrets"

if [[ ! -d "${SECRETS_DIR}" ]]; then
  echo "❌ ${SECRETS_DIR} não existe"
  return 1 2>/dev/null || exit 1
fi

read_token() {
  local file="${SECRETS_DIR}/$1"
  [[ -f "${file}" ]] && tr -d '[:space:]' < "${file}" || echo ""
}

load_var() {
  local file="$1" var="$2"
  local val
  val="$(read_token "${file}")"
  if [[ -n "${val}" ]]; then
    export "${var}=${val}"
    echo "  ✓ ${var}"
  else
    echo "  ✗ ${var} (faltando ${file})"
  fi
}

echo "🔐 KEYRA — carregando tokens isolados (sessão atual apenas)"

# GitHub
load_var "github.token"   "GH_TOKEN"
load_var "github.token"   "GITHUB_TOKEN"

# Vercel
load_var "vercel.token"   "VERCEL_TOKEN"

# Supabase CLI (PAT)
load_var "supabase.token" "SUPABASE_ACCESS_TOKEN"

# Supabase project (cliente + servidor)
REF="$(read_token supabase-project-ref.txt)"
if [[ -n "${REF}" ]]; then
  export NEXT_PUBLIC_SUPABASE_URL="https://${REF}.supabase.co"
  export SUPABASE_PROJECT_REF="${REF}"
  echo "  ✓ NEXT_PUBLIC_SUPABASE_URL"
fi
load_var "supabase-anon.key"          "NEXT_PUBLIC_SUPABASE_ANON_KEY"
load_var "supabase-publishable.key"   "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
load_var "supabase-service-role.key"  "SUPABASE_SERVICE_ROLE_KEY"
load_var "supabase-secret.key"        "SUPABASE_SECRET_KEY"

# Application secret
load_var "column-encryption-key.txt"  "COLUMN_ENCRYPTION_KEY"

export KEYRA_ROOT
export KEYRA_ENV_LOADED=1

echo ""
echo "Ambiente KEYRA ativo neste shell (não afeta sua autenticação global)."
echo "Para sair: 'exit' ou abra outro terminal."
