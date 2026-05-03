#!/usr/bin/env bash
# =============================================================================
# KEYRA — configure-supabase-auth-hooks.sh
# =============================================================================
# Registra/atualiza Supabase Auth Hooks via Management API.
# Idempotente — pode rodar quantas vezes quiser.
#
# Story auth.1 do EPIC-AUTH-V2 — registra:
#   - hook_before_user_created → public.before_user_created_block_disposable_emails
#     (R13 da auditoria — bloqueia signups com emails descartáveis)
#
# O hook custom_access_token_hook já está registrado (auth.0 / migration 004).
# Esta migration apenas estendeu a função; o registro continua válido.
#
# Pré-requisitos:
#   - .keyra-secrets/supabase.token        (Management API access token)
#   - .keyra-secrets/supabase-project-ref.txt
#   - Migration 20260503000100 já aplicada (função existe no banco)
#
# Uso:
#   ./scripts/configure-supabase-auth-hooks.sh           # aplica
#   ./scripts/configure-supabase-auth-hooks.sh --dry-run # mostra payload
#
# Lição operacional incorporada (memory `feedback_supabase_patch_silent_drop.md`):
#   PATCH retorna HTTP 200 mesmo silenciosamente ignorando campos. Validamos
#   sempre via GET após PATCH.
# =============================================================================

set -euo pipefail

KEYRA_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SECRETS="${KEYRA_ROOT}/.keyra-secrets"
DRY_RUN="false"

if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN="true"
fi

TOKEN_FILE="${SECRETS}/supabase.token"
REF_FILE="${SECRETS}/supabase-project-ref.txt"

if [[ ! -f "${TOKEN_FILE}" ]] || [[ ! -f "${REF_FILE}" ]]; then
  echo "❌ Pré-requisitos ausentes em ${SECRETS}/"
  exit 1
fi

TOKEN="$(tr -d '[:space:]' < "${TOKEN_FILE}")"
REF="$(tr -d '[:space:]' < "${REF_FILE}")"

API_BASE="https://api.supabase.com/v1/projects/${REF}/config/auth"

PAYLOAD=$(cat <<'JSON'
{
  "hook_before_user_created_enabled": true,
  "hook_before_user_created_uri": "pg-functions://postgres/public/before_user_created_block_disposable_emails"
}
JSON
)

echo "📡 Registrando hook before_user_created no projeto ${REF}..."
echo "    (dry-run = ${DRY_RUN})"
echo ""
echo "📦 Payload:"
echo "${PAYLOAD}" | sed 's/^/    /'
echo ""

if [[ "${DRY_RUN}" == "true" ]]; then
  echo "🟡 DRY-RUN — nada foi enviado."
  exit 0
fi

HTTP=$(curl -sS -o /tmp/keyra-auth-hooks-resp.json -w "%{http_code}" \
  -X PATCH \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  --data "${PAYLOAD}" \
  "${API_BASE}")

if [[ "${HTTP}" =~ ^2[0-9][0-9]$ ]]; then
  echo "✅ PATCH HTTP ${HTTP}"
else
  echo "❌ PATCH falhou (HTTP ${HTTP})"
  cat /tmp/keyra-auth-hooks-resp.json | head -c 500
  exit 2
fi
echo ""

# ---- Validação via GET (defesa contra silent-drop) --------------------------
echo "🔍 Validando registro via GET..."
GET_RESP=$(curl -sS -H "Authorization: Bearer ${TOKEN}" "${API_BASE}")

ENABLED=$(echo "${GET_RESP}" | python3 -c "import json,sys; print(json.load(sys.stdin).get('hook_before_user_created_enabled'))")
URI=$(echo "${GET_RESP}" | python3 -c "import json,sys; print(json.load(sys.stdin).get('hook_before_user_created_uri'))")

if [[ "${ENABLED}" == "True" ]] && [[ "${URI}" == "pg-functions://postgres/public/before_user_created_block_disposable_emails" ]]; then
  echo "  ✅ hook_before_user_created_enabled = True"
  echo "  ✅ hook_before_user_created_uri    = ${URI}"
else
  echo "  ❌ Hook NÃO foi registrado corretamente"
  echo "     enabled = ${ENABLED}"
  echo "     uri     = ${URI}"
  exit 3
fi

echo ""
echo "🟢 Hook before_user_created ativo. Próximo signup com email descartável (mailinator, 10minutemail etc.) será rejeitado com 422."
echo ""
echo "Para revogar (caso necessário):"
echo "  curl -X PATCH -H \"Authorization: Bearer \${TOKEN}\" -H 'Content-Type: application/json' \\"
echo "    --data '{\"hook_before_user_created_enabled\": false}' ${API_BASE}"
