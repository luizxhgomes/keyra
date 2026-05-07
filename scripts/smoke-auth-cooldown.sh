#!/usr/bin/env bash
# =============================================================================
# KEYRA — smoke-auth-cooldown.sh
# =============================================================================
# Smoke programático que valida em prod (idempotente, sem side-effect via
# ROLLBACK) o comportamento do cooldown da Story auth.5:
#
#   - 1ª chamada da RPC para email novo → retorna `true`
#   - 2ª chamada imediata para mesmo email → retorna `false` (cooldown ativo)
#   - Chamada para email distinto → retorna `true` (cooldown é por-email)
#
# Cobre o smoke #3 da fiscalização ("Anti-bombing real" — AC2/AC3 da auth.5).
#
# Roda em prod com transação BEGIN/ROLLBACK — não polui dados reais.
#
# Exit codes:
#   0 — todos os asserts OK
#   1 — pelo menos um assert falhou
#   2 — pré-requisitos faltando ou conexão falhou
#
# Uso:
#   ./scripts/smoke-auth-cooldown.sh
#   ./scripts/smoke-auth-cooldown.sh --quiet
# =============================================================================

set -euo pipefail

KEYRA_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SECRETS="${KEYRA_ROOT}/.keyra-secrets"
QUIET="${1:-}"

log() { [[ "${QUIET}" != "--quiet" ]] && echo "$@"; }

# ---- Pré-requisitos ---------------------------------------------------------
REF_FILE="${SECRETS}/supabase-project-ref.txt"
PASS_FILE="${SECRETS}/supabase-db-password.txt"

if [[ ! -f "${REF_FILE}" ]] || [[ ! -f "${PASS_FILE}" ]]; then
  echo "❌ Secrets ausentes: ${REF_FILE} e/ou ${PASS_FILE}"
  exit 2
fi

REF="$(tr -d '[:space:]' < "${REF_FILE}")"
DB_PASS="$(tr -d '[:space:]' < "${PASS_FILE}")"

# psql via Homebrew libpq se necessário
if ! command -v psql >/dev/null 2>&1; then
  if [[ -d /opt/homebrew/opt/libpq/bin ]]; then
    export PATH="/opt/homebrew/opt/libpq/bin:$PATH"
  else
    echo "❌ psql não encontrado (brew install libpq + brew link --force libpq)"
    exit 2
  fi
fi

CONN="host=db.${REF}.supabase.co port=5432 user=postgres dbname=postgres sslmode=require"

# ---- Smoke transacional -----------------------------------------------------
TIMESTAMP=$(date +%s)
EMAIL_X="smoke-auth-cooldown-x-${TIMESTAMP}@example.com"
EMAIL_Y="smoke-auth-cooldown-y-${TIMESTAMP}@example.com"

log "🧪 Smoke transacional cooldown (email único: ${EMAIL_X})"
log ""

OUTPUT=$(PGPASSWORD="${DB_PASS}" psql "${CONN}" -t -A -F'|' -v ON_ERROR_STOP=1 <<SQL 2>&1
BEGIN;
SELECT 'first_call_x', public.request_password_reset_check_cooldown('${EMAIL_X}')::text;
SELECT 'second_call_x', public.request_password_reset_check_cooldown('${EMAIL_X}')::text;
SELECT 'other_email_y', public.request_password_reset_check_cooldown('${EMAIL_Y}')::text;
SELECT 'rows_inserted', count(*)::text FROM public.password_reset_attempts WHERE email_lower IN ('${EMAIL_X}', '${EMAIL_Y}');
ROLLBACK;
SQL
)

# ---- Asserts ----------------------------------------------------------------
ASSERTS_FAILED=0

assert_line() {
  local name="$1"; local expected="$2"
  local actual=$(echo "${OUTPUT}" | grep "^${name}|" | cut -d'|' -f2 | tr -d '[:space:]')
  if [[ "${actual}" == "${expected}" ]]; then
    log "  ✅ ${name} = ${actual}"
  else
    echo "  ❌ ${name} esperado '${expected}', obtido '${actual}'"
    ASSERTS_FAILED=$((ASSERTS_FAILED + 1))
  fi
}

assert_line "first_call_x"  "true"
assert_line "second_call_x" "false"
assert_line "other_email_y" "true"
assert_line "rows_inserted" "2"

log ""
if [[ ${ASSERTS_FAILED} -eq 0 ]]; then
  log "✅ Cooldown anti-bombing em prod funciona — 4/4 asserts PASS (ROLLBACK aplicado, zero side-effect)"
  exit 0
else
  echo "❌ ${ASSERTS_FAILED} asserts FAIL — RPC request_password_reset_check_cooldown fora de spec"
  echo "   Investigar: SELECT pg_get_functiondef('public.request_password_reset_check_cooldown(text)'::regprocedure);"
  exit 1
fi
