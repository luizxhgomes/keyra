#!/usr/bin/env bash
# Valida cada credencial contra a API do provider — sem expor secrets na saída
# Uso: ./scripts/check-tokens.sh

set -uo pipefail

KEYRA_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SECRETS="${KEYRA_ROOT}/.keyra-secrets"

red()    { printf "\033[31m%s\033[0m\n" "$*"; }
green()  { printf "\033[32m%s\033[0m\n" "$*"; }
yellow() { printf "\033[33m%s\033[0m\n" "$*"; }

read_token() {
  local f="${SECRETS}/$1"
  [[ -f "${f}" ]] && tr -d '[:space:]' < "${f}" || echo ""
}

echo "🔍 Validando credenciais em ${SECRETS}"
echo ""

# ---- GitHub PAT ----
GH=$(read_token github.token)
if [[ -z "${GH}" ]]; then
  red "✗ github.token  — ausente"
else
  user=$(curl -s -H "Authorization: Bearer ${GH}" -H "Accept: application/vnd.github+json" \
    https://api.github.com/user | grep -o '"login":[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
  if [[ -n "${user}" ]]; then
    green "✓ github.token   — usuário: ${user}"
  else
    red "✗ github.token   — token inválido ou sem permissão"
  fi
fi

# ---- Vercel ----
VC=$(read_token vercel.token)
if [[ -z "${VC}" ]]; then
  red "✗ vercel.token   — ausente"
else
  resp=$(curl -s -H "Authorization: Bearer ${VC}" https://api.vercel.com/v2/user)
  user=$(echo "${resp}" | grep -o '"username":[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
  if [[ -n "${user}" ]]; then
    green "✓ vercel.token   — usuário: ${user}"
  else
    red "✗ vercel.token   — token inválido"
  fi
fi

# ---- Supabase CLI PAT ----
SBP=$(read_token supabase.token)
if [[ -z "${SBP}" ]]; then
  yellow "⚠ supabase.token — ausente (PAT do CLI; opcional se você gerencia projetos pelo dashboard)"
else
  status=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer ${SBP}" \
    https://api.supabase.com/v1/projects)
  [[ "${status}" == "200" ]] && green "✓ supabase.token — válido (CLI/management API)" \
                             || red   "✗ supabase.token — HTTP ${status}"
fi

# ---- Supabase Project ----
REF=$(read_token supabase-project-ref.txt)
ANON=$(read_token supabase-anon.key)
if [[ -z "${REF}" || -z "${ANON}" ]]; then
  red "✗ supabase project — ref ou anon key faltando"
else
  status=$(curl -s -o /dev/null -w "%{http_code}" -H "apikey: ${ANON}" \
    "https://${REF}.supabase.co/auth/v1/health")
  if [[ "${status}" == "200" ]]; then
    green "✓ supabase project — ${REF}.supabase.co alive (auth/health 200)"
  else
    red "✗ supabase project — auth/health HTTP ${status}"
  fi
fi

# ---- Permissões ----
echo ""
echo "🔒 Permissões dos arquivos de secret:"
for f in "${SECRETS}"/*.key "${SECRETS}"/*.token "${SECRETS}"/*.txt; do
  [[ ! -f "${f}" ]] && continue
  perms=$(stat -f "%Lp" "${f}" 2>/dev/null || stat -c "%a" "${f}" 2>/dev/null)
  name=$(basename "${f}")
  if [[ "${perms}" == "600" ]]; then
    green "  ✓ ${name}: ${perms}"
  else
    yellow "  ⚠ ${name}: ${perms} — recomendado 600"
  fi
done

# ---- .env.local ----
if [[ -f "${KEYRA_ROOT}/.env.local" ]]; then
  perms=$(stat -f "%Lp" "${KEYRA_ROOT}/.env.local" 2>/dev/null || stat -c "%a" "${KEYRA_ROOT}/.env.local" 2>/dev/null)
  echo ""
  if [[ "${perms}" == "600" ]]; then
    green "✓ .env.local: ${perms}"
  else
    yellow "⚠ .env.local: ${perms} — rode: chmod 600 .env.local"
  fi
fi
