#!/usr/bin/env bash
# =============================================================================
# KEYRA — configure-supabase-recovery-template.sh
# =============================================================================
# Aplica o template de email de recovery (esqueci senha) em pt-BR no Supabase
# de produção via Management API e VALIDA via GET subsequente (idempotente).
#
# Story auth.5 do EPIC-AUTH-V2 — AC7.
#
# Lição operacional incorporada (memory `feedback_supabase_patch_silent_drop.md`):
#   PATCH retorna HTTP 200 mesmo silenciosamente ignorando campos com nome
#   incorreto. Naming canônico aqui (validado em sessão pós-Sprint 7 magic-link):
#     - mailer_subjects_recovery
#     - mailer_templates_recovery_content
#
# Pré-requisitos:
#   - .keyra-secrets/supabase.token            (Management API access token, sbp_*)
#   - .keyra-secrets/supabase-project-ref.txt
#   - supabase/email-templates/recovery.html   (gerado nesta story)
#   - jq instalado
#
# Uso:
#   ./scripts/configure-supabase-recovery-template.sh           # aplica + valida
#   ./scripts/configure-supabase-recovery-template.sh --dry-run # mostra payload sem aplicar
# =============================================================================

set -euo pipefail

KEYRA_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SECRETS="${KEYRA_ROOT}/.keyra-secrets"
TEMPLATE_FILE="${KEYRA_ROOT}/supabase/email-templates/recovery.html"
DRY_RUN="false"

if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN="true"
fi

# ---- Pré-requisitos ---------------------------------------------------------
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

if [[ ! -f "${TEMPLATE_FILE}" ]]; then
  echo "❌ ${TEMPLATE_FILE} não encontrado. Gere o template HTML primeiro."
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "❌ jq não instalado (brew install jq)."
  exit 1
fi

TOKEN="$(tr -d '[:space:]' < "${TOKEN_FILE}")"
REF="$(tr -d '[:space:]' < "${REF_FILE}")"

if [[ -z "${TOKEN}" ]] || [[ -z "${REF}" ]]; then
  echo "❌ Token ou project ref vazio."
  exit 1
fi

API_BASE="https://api.supabase.com/v1/projects/${REF}/config/auth"
SUBJECT="Redefinir sua senha do KEYRA"

# ---- Snapshot defensivo ANTES de mexer (rollback fácil) ---------------------
SNAPSHOT_FILE="${SECRETS}/recovery-template-snapshot-pre-$(date +%Y%m%d-%H%M%S).json"
echo "📸 Snapshot do template atual em ${SNAPSHOT_FILE}"
curl -s -H "Authorization: Bearer ${TOKEN}" "${API_BASE}" \
  | jq '{mailer_subjects_recovery, mailer_templates_recovery_content}' \
  > "${SNAPSHOT_FILE}"
chmod 600 "${SNAPSHOT_FILE}"

# ---- Construir payload com template HTML inteiro como JSON string -----------
TEMPLATE_CONTENT="$(cat "${TEMPLATE_FILE}")"

PAYLOAD="$(jq -n \
  --arg subject "${SUBJECT}" \
  --arg content "${TEMPLATE_CONTENT}" \
  '{mailer_subjects_recovery: $subject, mailer_templates_recovery_content: $content}')"

echo "📡 Configurando template recovery do projeto ${REF}..."
echo "    (dry-run = ${DRY_RUN})"
echo "    Subject: ${SUBJECT}"
echo "    Template: ${#TEMPLATE_CONTENT} chars"
echo ""

if [[ "${DRY_RUN}" == "true" ]]; then
  echo "📋 Payload (truncado):"
  echo "${PAYLOAD}" | jq '. | {mailer_subjects_recovery, mailer_templates_recovery_content: (.mailer_templates_recovery_content | .[:120] + "...")}'
  echo ""
  echo "✅ Dry-run completo. Re-rode sem --dry-run para aplicar."
  exit 0
fi

# ---- PATCH ------------------------------------------------------------------
RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "${PAYLOAD}" \
  "${API_BASE}")

HTTP_CODE=$(echo "${RESPONSE}" | tail -n1)
BODY=$(echo "${RESPONSE}" | sed '$d')

if [[ "${HTTP_CODE}" != "200" ]]; then
  echo "❌ PATCH falhou (HTTP ${HTTP_CODE}):"
  echo "${BODY}" | jq . 2>/dev/null || echo "${BODY}"
  exit 1
fi

echo "✅ PATCH HTTP 200 retornado."
echo ""

# ---- Validação via GET (defesa contra silent-drop) --------------------------
echo "🔍 Validando via GET (defesa contra silent-drop)..."
sleep 1  # dá tempo do Supabase propagar internamente

GET_RESPONSE=$(curl -s -H "Authorization: Bearer ${TOKEN}" "${API_BASE}")
GOT_SUBJECT=$(echo "${GET_RESPONSE}" | jq -r '.mailer_subjects_recovery // ""')
GOT_CONTENT=$(echo "${GET_RESPONSE}" | jq -r '.mailer_templates_recovery_content // ""')

ERRORS=0
if [[ "${GOT_SUBJECT}" != "${SUBJECT}" ]]; then
  echo "❌ Subject não bate. Esperado: '${SUBJECT}' · Got: '${GOT_SUBJECT}'"
  ERRORS=$((ERRORS + 1))
fi

if [[ "${#GOT_CONTENT}" -lt 1000 ]]; then
  echo "❌ Template não bate. Esperado: ${#TEMPLATE_CONTENT} chars · Got: ${#GOT_CONTENT} chars"
  ERRORS=$((ERRORS + 1))
fi

if [[ "${ERRORS}" -gt 0 ]]; then
  echo ""
  echo "❌ Validação falhou. Verifique o naming dos campos (silent-drop)."
  echo "   Restore via: cat ${SNAPSHOT_FILE} | jq -c . | curl -X PATCH -H 'Authorization: Bearer ${TOKEN}' -H 'Content-Type: application/json' -d @- ${API_BASE}"
  exit 1
fi

echo "✅ Validação OK. Template recovery em prod com identidade KEYRA."
echo ""
echo "🧪 Smoke recomendado:"
echo "   1. Acesse https://usekeyra.com/esqueci-senha"
echo "   2. Use seu email de teste"
echo "   3. Confira inbox — subject deve ser: ${SUBJECT}"
