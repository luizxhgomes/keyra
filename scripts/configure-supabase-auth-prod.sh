#!/usr/bin/env bash
# =============================================================================
# KEYRA — configure-supabase-auth-prod.sh
# =============================================================================
# Aplica configuração endurecida de Auth no projeto Supabase de produção via
# Management API e VALIDA via GET subsequente (idempotente).
#
# Story auth.0 do EPIC-AUTH-V2 — mitigação dos riscos R1, R2, R11, R12, R20, R22
# da auditoria preventiva (`docs/audit/auth-v2-security-audit.md`).
#
# Lição operacional incorporada (descoberta em 2026-05-03 — memory
# `feedback_supabase_patch_silent_drop.md`):
#   PATCH retorna HTTP 200 mesmo silenciosamente ignorando campos com nome
#   incorreto. Os naming canônicos do Management API divergem dos nomes "óbvios":
#     ❌ secure_password_change → ✅ security_update_password_require_reauthentication
#     ❌ session_timebox        → ✅ sessions_timebox        (note plural; Pro Plan)
#     ❌ session_inactivity_timeout → ✅ sessions_inactivity_timeout (idem)
#   Portanto, o script SEMPRE faz GET após PATCH e valida campo a campo.
#
# Pré-requisitos:
#   - .keyra-secrets/supabase.token       (Management API access token, sbp_*)
#   - .keyra-secrets/supabase-project-ref.txt
#
# Uso:
#   ./scripts/configure-supabase-auth-prod.sh           # aplica + valida
#   ./scripts/configure-supabase-auth-prod.sh --dry-run # mostra payload sem aplicar
# =============================================================================

set -euo pipefail

KEYRA_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SECRETS="${KEYRA_ROOT}/.keyra-secrets"
DRY_RUN="false"

if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN="true"
fi

# ---- Pré-requisitos -----------------------------------------------------------
TOKEN_FILE="${SECRETS}/supabase.token"
REF_FILE="${SECRETS}/supabase-project-ref.txt"

if [[ ! -f "${TOKEN_FILE}" ]]; then
  echo "❌ ${TOKEN_FILE} não encontrado. Pegue um access token em https://supabase.com/dashboard/account/tokens"
  exit 1
fi

if [[ ! -f "${REF_FILE}" ]]; then
  echo "❌ ${REF_FILE} não encontrado."
  exit 1
fi

TOKEN="$(tr -d '[:space:]' < "${TOKEN_FILE}")"
REF="$(tr -d '[:space:]' < "${REF_FILE}")"

if [[ -z "${TOKEN}" ]] || [[ -z "${REF}" ]]; then
  echo "❌ Token ou project ref vazio."
  exit 1
fi

API_BASE="https://api.supabase.com/v1/projects/${REF}/config/auth"

echo "📡 Configurando Supabase Auth do projeto ${REF}..."
echo "    (dry-run = ${DRY_RUN})"
echo ""

# ---- Configurações universais (Free Plan suporta) ----------------------------
# Naming validado contra GET /v1/projects/{ref}/config/auth em 2026-05-03.
PAYLOAD=$(cat <<'JSON'
{
  "mailer_autoconfirm": false,
  "password_min_length": 10,
  "password_required_characters": "abcdefghijklmnopqrstuvwxyz:ABCDEFGHIJKLMNOPQRSTUVWXYZ:0123456789",
  "security_update_password_require_reauthentication": true,
  "mailer_otp_exp": 1800,
  "rate_limit_email_sent": 30,
  "refresh_token_rotation_enabled": true
}
JSON
)

echo "📦 Payload (configurações universais — Free Plan OK):"
echo "${PAYLOAD}" | sed 's/^/    /'
echo ""

if [[ "${DRY_RUN}" == "true" ]]; then
  echo "🟡 DRY-RUN — nada foi enviado."
  exit 0
fi

HTTP=$(curl -sS -o /tmp/keyra-auth-cfg-resp.json -w "%{http_code}" \
  -X PATCH \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  --data "${PAYLOAD}" \
  "${API_BASE}")

if [[ "${HTTP}" =~ ^2[0-9][0-9]$ ]]; then
  echo "✅ PATCH universal HTTP ${HTTP}"
else
  echo "❌ Falha PATCH universal (HTTP ${HTTP})"
  cat /tmp/keyra-auth-cfg-resp.json
  exit 2
fi
echo ""

# ---- Pro Plan only: sessions_timebox + sessions_inactivity_timeout ----------
SESSION_PAYLOAD=$(cat <<'JSON'
{
  "sessions_timebox": 604800,
  "sessions_inactivity_timeout": 28800
}
JSON
)

HTTP_SESS=$(curl -sS -o /tmp/keyra-auth-sess-resp.json -w "%{http_code}" \
  -X PATCH \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  --data "${SESSION_PAYLOAD}" \
  "${API_BASE}")

if [[ "${HTTP_SESS}" =~ ^2[0-9][0-9]$ ]]; then
  echo "✅ sessions_timebox + sessions_inactivity_timeout aplicados (HTTP ${HTTP_SESS})"
elif [[ "${HTTP_SESS}" == "402" ]]; then
  echo "⏸️  sessions_timebox/sessions_inactivity_timeout SKIPPED — requer Supabase Pro Plan (HTTP 402)"
  echo "    R22 da auditoria fica parcialmente mitigado até upgrade Pro acontecer"
else
  echo "⚠️  sessions_timebox/sessions_inactivity_timeout SKIPPED (HTTP ${HTTP_SESS})"
  echo "    Resp: $(cat /tmp/keyra-auth-sess-resp.json | head -c 200)"
fi
echo ""

# ---- Validação via GET (defesa contra silent-drop) --------------------------
echo "🔍 Validando configuração aplicada via GET..."
GET_RESP=$(curl -sS -H "Authorization: Bearer ${TOKEN}" "${API_BASE}")

check_field() {
  local key="$1"
  local expected="$2"
  local actual
  actual=$(echo "${GET_RESP}" | python3 -c "import json,sys; d=json.load(sys.stdin); v=d.get('${key}'); print(json.dumps(v))" 2>/dev/null || echo "null")
  if [[ "${actual}" == "${expected}" ]]; then
    echo "  ✅ ${key} = ${actual}"
    return 0
  else
    echo "  ❌ ${key} = ${actual} (esperado ${expected})"
    return 1
  fi
}

ANY_FAIL=0
check_field "mailer_autoconfirm" "false" || ANY_FAIL=1
check_field "password_min_length" "10" || ANY_FAIL=1
check_field "password_required_characters" '"abcdefghijklmnopqrstuvwxyz:ABCDEFGHIJKLMNOPQRSTUVWXYZ:0123456789"' || ANY_FAIL=1
check_field "security_update_password_require_reauthentication" "true" || ANY_FAIL=1
check_field "mailer_otp_exp" "1800" || ANY_FAIL=1
check_field "rate_limit_email_sent" "30" || ANY_FAIL=1
check_field "refresh_token_rotation_enabled" "true" || ANY_FAIL=1

if [[ "${ANY_FAIL}" -ne 0 ]]; then
  echo ""
  echo "❌ Pelo menos um campo universal não aplicou. Investigar acima."
  exit 3
fi

echo ""
echo "🟢 Todos os 7 campos universais validados via GET."
echo ""

# ---- Marca timestamp de aplicação --------------------------------------------
APPLIED_AT="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "${APPLIED_AT}" > "${SECRETS}/auth-config-applied-at.txt"
chmod 600 "${SECRETS}/auth-config-applied-at.txt"
echo "🕐 Rastreio em ${SECRETS}/auth-config-applied-at.txt (${APPLIED_AT})"
echo ""
echo "Próximos passos:"
echo "  • Validar no painel: https://supabase.com/dashboard/project/${REF}/auth/providers"
echo "  • Story auth.0 task: marcar AC2 como ✅ no story file"
