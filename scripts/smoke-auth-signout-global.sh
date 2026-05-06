#!/usr/bin/env bash
# =============================================================================
# KEYRA — smoke-auth-signout-global.sh
# =============================================================================
# Smoke MANUAL que valida o comportamento do `signOut({ scope: 'global' })`
# chamado pela Server Action setNewPasswordAction (Story auth.5 — R11):
#
#   1. Lista refresh_tokens ativos do user de teste ANTES
#   2. Chama Supabase Admin API: auth.admin.signOut(userId, scope='global')
#   3. Lista refresh_tokens ativos do user de teste DEPOIS
#   4. Asserta que count_after == 0
#
# Cobre o smoke #4 da fiscalização ("SignOut global" — R11 da auditoria).
#
# ⚠️ EFEITO COLATERAL: este smoke FAZ logout real do USER_TEST em todos os
# dispositivos. Não usar em prod sem coordenar com o user.
#
# Pré-requisito: USER_TEST_EMAIL precisa ter sessão ativa (refresh_tokens > 0)
# antes de rodar — caso contrário o smoke vira no-op.
#
# Exit codes:
#   0 — signOut global funciona (todos os refresh_tokens revogados)
#   1 — refresh_tokens persistem após signOut (R11 não está sendo aplicado)
#   2 — pré-requisitos faltando ou USER_TEST sem sessão ativa
#
# Uso:
#   USER_TEST_EMAIL=luizxhenriquepro@gmail.com ./scripts/smoke-auth-signout-global.sh
# =============================================================================

set -euo pipefail

KEYRA_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SECRETS="${KEYRA_ROOT}/.keyra-secrets"
USER_TEST_EMAIL="${USER_TEST_EMAIL:-}"

if [[ -z "${USER_TEST_EMAIL}" ]]; then
  echo "❌ USER_TEST_EMAIL não definido."
  echo "   Uso: USER_TEST_EMAIL=user@example.com ./scripts/smoke-auth-signout-global.sh"
  exit 2
fi

# ---- Pré-requisitos ---------------------------------------------------------
REF_FILE="${SECRETS}/supabase-project-ref.txt"
PASS_FILE="${SECRETS}/supabase-db-password.txt"
SERVICE_KEY_FILE="${SECRETS}/supabase-service-role.key"

for f in "${REF_FILE}" "${PASS_FILE}" "${SERVICE_KEY_FILE}"; do
  if [[ ! -f "${f}" ]]; then
    echo "❌ Secret ausente: ${f}"
    exit 2
  fi
done

REF="$(tr -d '[:space:]' < "${REF_FILE}")"
DB_PASS="$(tr -d '[:space:]' < "${PASS_FILE}")"
SERVICE_KEY="$(tr -d '[:space:]' < "${SERVICE_KEY_FILE}")"

if ! command -v psql >/dev/null 2>&1; then
  if [[ -d /opt/homebrew/opt/libpq/bin ]]; then
    export PATH="/opt/homebrew/opt/libpq/bin:$PATH"
  else
    echo "❌ psql não encontrado"; exit 2
  fi
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "❌ jq não instalado"; exit 2
fi

CONN="host=db.${REF}.supabase.co port=5432 user=postgres dbname=postgres sslmode=require"

# ---- Resolve user ID --------------------------------------------------------
USER_ID=$(PGPASSWORD="${DB_PASS}" psql "${CONN}" -t -A -c \
  "SELECT id FROM auth.users WHERE email = '${USER_TEST_EMAIL}';" | tr -d '[:space:]')

if [[ -z "${USER_ID}" ]]; then
  echo "❌ User '${USER_TEST_EMAIL}' não existe em auth.users"
  exit 2
fi

echo "🔍 User: ${USER_TEST_EMAIL} (id=${USER_ID})"

# ---- Conta refresh_tokens ANTES ---------------------------------------------
COUNT_BEFORE=$(PGPASSWORD="${DB_PASS}" psql "${CONN}" -t -A -c \
  "SELECT count(*) FROM auth.refresh_tokens WHERE user_id::text = '${USER_ID}' AND revoked = false;" | tr -d '[:space:]')

echo "📊 Refresh tokens ativos ANTES: ${COUNT_BEFORE}"

if [[ ${COUNT_BEFORE} -eq 0 ]]; then
  echo "⚠️  User não tem sessão ativa — smoke vira no-op."
  echo "   Logue-se primeiro em https://usekeyra.com/login com ${USER_TEST_EMAIL} e rode de novo."
  exit 2
fi

# ---- Chama Admin API signOut(scope=global) ----------------------------------
echo ""
echo "🔧 Chamando Admin API: signOut(${USER_ID}, scope='global')"

RESPONSE=$(curl -sS -w "\n%{http_code}" -X POST \
  "https://${REF}.supabase.co/auth/v1/admin/users/${USER_ID}/logout?scope=global" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}")

HTTP_CODE=$(echo "${RESPONSE}" | tail -n1)
BODY=$(echo "${RESPONSE}" | sed '$d')

if [[ "${HTTP_CODE}" != "204" ]] && [[ "${HTTP_CODE}" != "200" ]]; then
  echo "❌ Admin API retornou HTTP ${HTTP_CODE}: ${BODY}"
  exit 1
fi

echo "✅ Admin API HTTP ${HTTP_CODE}"

# ---- Conta refresh_tokens DEPOIS --------------------------------------------
sleep 1  # propagação interna do Supabase

COUNT_AFTER=$(PGPASSWORD="${DB_PASS}" psql "${CONN}" -t -A -c \
  "SELECT count(*) FROM auth.refresh_tokens WHERE user_id::text = '${USER_ID}' AND revoked = false;" | tr -d '[:space:]')

echo "📊 Refresh tokens ativos DEPOIS: ${COUNT_AFTER}"
echo ""

if [[ ${COUNT_AFTER} -eq 0 ]]; then
  echo "✅ R11 confirmado — signOut(scope=global) revogou todos os ${COUNT_BEFORE} refresh_tokens"
  exit 0
else
  echo "❌ FAIL — ${COUNT_AFTER} refresh_tokens persistem após signOut global"
  echo "   R11 da auditoria NÃO está sendo aplicado corretamente."
  echo "   Investigar: setNewPasswordAction realmente passa scope='global'?"
  exit 1
fi
