#!/usr/bin/env bash
# =============================================================================
# KEYRA — configure-supabase-auth-prod.sh
# =============================================================================
# Aplica configuração endurecida de Auth no projeto Supabase de produção via
# Management API (idempotente — pode rodar quantas vezes quiser).
#
# Story auth.0 do EPIC-AUTH-V2 — mitigação dos riscos R1, R2, R11, R12, R20, R22
# da auditoria preventiva (`docs/audit/auth-v2-security-audit.md`).
#
# Pré-requisitos:
#   - .keyra-secrets/supabase.token       (Management API access token, sbp_*)
#   - .keyra-secrets/supabase-project-ref.txt
#
# Uso:
#   ./scripts/configure-supabase-auth-prod.sh           # aplica
#   ./scripts/configure-supabase-auth-prod.sh --dry-run # mostra payload sem aplicar
#
# Saída: relatório com ✅ / ❌ por config aplicada e ISO timestamp salvo em
# .keyra-secrets/auth-config-applied-at.txt para rastreio.
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

# ---- Configurações a aplicar --------------------------------------------------
# Cada item: chave da Management API + valor + descrição da mitigação
# Lista canônica de campos: https://api.supabase.com/api/v1#tag/Auth-(Beta)
#
# Observação: a Management API espera os nomes oficiais (não os do GoTrue).
# Mapeamento conhecido (validado em 2026-05-03):
#   GoTrue                       → Management API
#   GOTRUE_MAILER_AUTOCONFIRM    → mailer_autoconfirm
#   GOTRUE_PASSWORD_MIN_LENGTH   → password_min_length
#   GOTRUE_PASSWORD_REQUIRED_CH  → password_required_characters
#   GOTRUE_SECURE_PASSWORD_CHANGE→ secure_password_change
#   GOTRUE_MAILER_OTP_EXP        → mailer_otp_exp
#   GOTRUE_RATE_LIMIT_EMAIL_SENT → rate_limit_email_sent
#   GOTRUE_REFRESH_TOKEN_ROTATION_ENABLED → refresh_token_rotation_enabled
#   GOTRUE_SESSION_TIMEBOX       → (atualmente requer Pro plan; se 4xx, registramos como SKIPPED)
#   GOTRUE_SESSION_INACTIVITY_TIMEOUT → idem

# Build do payload em uma única chamada (mais idempotente que 8 chamadas separadas).
PAYLOAD=$(cat <<JSON
{
  "mailer_autoconfirm": false,
  "password_min_length": 10,
  "password_required_characters": "abcdefghijklmnopqrstuvwxyz:ABCDEFGHIJKLMNOPQRSTUVWXYZ:0123456789",
  "secure_password_change": true,
  "mailer_otp_exp": 1800,
  "rate_limit_email_sent": 30,
  "refresh_token_rotation_enabled": true
}
JSON
)

echo "📦 Payload base (configurações universais):"
echo "${PAYLOAD}" | sed 's/^/    /'
echo ""

if [[ "${DRY_RUN}" == "true" ]]; then
  echo "🟡 DRY-RUN — nada foi enviado. Saia com qualquer chamada real."
  exit 0
fi

HTTP=$(curl -sS -o /tmp/keyra-auth-cfg-resp.json -w "%{http_code}" \
  -X PATCH \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  --data "${PAYLOAD}" \
  "${API_BASE}")

if [[ "${HTTP}" =~ ^2[0-9][0-9]$ ]]; then
  echo "✅ Configurações universais aplicadas (HTTP ${HTTP})"
else
  echo "❌ Falha aplicando configurações universais (HTTP ${HTTP})"
  cat /tmp/keyra-auth-cfg-resp.json
  exit 2
fi

# ---- Configurações que podem requerer plano pago -----------------------------
# session_timebox e session_inactivity_timeout estão atrás do plano Pro em
# alguns períodos; tratamos 4xx como SKIPPED (não falha o script).
SESSION_PAYLOAD=$(cat <<JSON
{
  "session_timebox": 604800,
  "session_inactivity_timeout": 28800
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
  echo "✅ session_timebox + inactivity_timeout aplicados (HTTP ${HTTP_SESS})"
else
  echo "⚠️  session_timebox/inactivity_timeout SKIPPED (HTTP ${HTTP_SESS}) — plano não suporta ou campo indisponível"
  echo "    Resp: $(cat /tmp/keyra-auth-sess-resp.json | head -c 200)"
fi

# ---- Marca timestamp de aplicação --------------------------------------------
APPLIED_AT="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "${APPLIED_AT}" > "${SECRETS}/auth-config-applied-at.txt"
chmod 600 "${SECRETS}/auth-config-applied-at.txt"
echo ""
echo "🟢 Pronto. Rastreio em ${SECRETS}/auth-config-applied-at.txt (${APPLIED_AT})"
echo ""
echo "Próximos passos:"
echo "  • Validar no painel: https://supabase.com/dashboard/project/${REF}/auth/providers"
echo "  • Story auth.0 task: marcar AC2 como ✅ no story file"
