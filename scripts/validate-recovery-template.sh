#!/usr/bin/env bash
# =============================================================================
# KEYRA — validate-recovery-template.sh
# =============================================================================
# Smoke programático que valida em prod (idempotente, sem side-effect):
#   - mailer_subjects_recovery == "Redefinir sua senha do KEYRA"
#   - mailer_templates_recovery_content contém substrings críticas (v3.0 brand-aligned):
#       - "Criar nova senha"        (botão CTA — voz Mentora v3.0)
#       - "#B8612B" ou "#b8612b"    (terracotta-600 — cor canônica brand v1.0)
#       - "Fraunces"                (mistura tipográfica brand)
#       - "token_hash="             (token hash flow para SSR)
#       - "30 minutos"              (alinhado com mailer_otp_exp=1800)
#       - "KEYRA"                   (wordmark)
#
# Cobre o smoke #6 da fiscalização ("Email de recovery chega com identidade
# KEYRA" — AC7 da auth.5).
#
# Exit codes:
#   0 — todos os asserts OK
#   1 — pelo menos um assert falhou
#   2 — pré-requisitos faltando (token/ref ausentes, jq não instalado)
#
# Uso:
#   ./scripts/validate-recovery-template.sh             # rodar via shell
#   ./scripts/validate-recovery-template.sh --quiet     # menos verboso
# =============================================================================

set -euo pipefail

KEYRA_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SECRETS="${KEYRA_ROOT}/.keyra-secrets"
QUIET="${1:-}"

log() { [[ "${QUIET}" != "--quiet" ]] && echo "$@"; }

# ---- Pré-requisitos ---------------------------------------------------------
# Aceita env vars (CI: GitHub Actions secrets) OU arquivos locais (.keyra-secrets/).
TOKEN="${SUPABASE_ACCESS_TOKEN:-}"
REF="${SUPABASE_PROJECT_REF:-}"

if [[ -z "${TOKEN}" ]]; then
  TOKEN_FILE="${SECRETS}/supabase.token"
  if [[ -f "${TOKEN_FILE}" ]]; then
    TOKEN="$(tr -d '[:space:]' < "${TOKEN_FILE}")"
  fi
fi

if [[ -z "${REF}" ]]; then
  REF_FILE="${SECRETS}/supabase-project-ref.txt"
  if [[ -f "${REF_FILE}" ]]; then
    REF="$(tr -d '[:space:]' < "${REF_FILE}")"
  fi
fi

if [[ -z "${TOKEN}" ]] || [[ -z "${REF}" ]]; then
  echo "❌ Faltando SUPABASE_ACCESS_TOKEN e/ou SUPABASE_PROJECT_REF (env ou .keyra-secrets/)"
  exit 2
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "❌ jq não instalado (brew install jq / apt install jq)"
  exit 2
fi

API_URL="https://api.supabase.com/v1/projects/${REF}/config/auth"

# ---- GET config -------------------------------------------------------------
log "🔍 GET ${API_URL}"
RESPONSE=$(curl -sS -H "Authorization: Bearer ${TOKEN}" "${API_URL}")

GOT_SUBJECT=$(echo "${RESPONSE}" | jq -r '.mailer_subjects_recovery // ""')
GOT_CONTENT=$(echo "${RESPONSE}" | jq -r '.mailer_templates_recovery_content // ""')

# ---- Asserts ----------------------------------------------------------------
EXPECTED_SUBJECT="Redefinir sua senha do KEYRA"
ASSERTS_FAILED=0

assert_equals() {
  local name="$1"; local expected="$2"; local actual="$3"
  if [[ "${actual}" == "${expected}" ]]; then
    log "  ✅ ${name}"
  else
    echo "  ❌ ${name}"
    echo "     esperado: '${expected}'"
    echo "     obtido:   '${actual}'"
    ASSERTS_FAILED=$((ASSERTS_FAILED + 1))
  fi
}

assert_contains() {
  local name="$1"; local needle="$2"; local haystack="$3"
  if [[ "${haystack}" == *"${needle}"* ]]; then
    log "  ✅ ${name} (contém '${needle}')"
  else
    echo "  ❌ ${name} — substring AUSENTE: '${needle}'"
    ASSERTS_FAILED=$((ASSERTS_FAILED + 1))
  fi
}

log ""
log "🧪 Validações:"
assert_equals "Subject" "${EXPECTED_SUBJECT}" "${GOT_SUBJECT}"
assert_contains "CTA do botão (v3.0 voz Mentora)" "Criar nova senha"                                  "${GOT_CONTENT}"
assert_contains "Terracotta-600 canônica (brand)" "#B8612B"                                           "${GOT_CONTENT}"
assert_contains "Tipografia brand (Fraunces)"     "Fraunces"                                          "${GOT_CONTENT}"
assert_contains "Token hash flow (SSR)"           "token_hash={{ .TokenHash }}&type=recovery"         "${GOT_CONTENT}"
assert_contains "URL custom KEYRA"                "https://usekeyra.com/auth/callback"                "${GOT_CONTENT}"
assert_contains "Disclaimer 30 min"               "30 minutos"                                        "${GOT_CONTENT}"
assert_contains "Wordmark"                        "KEYRA"                                             "${GOT_CONTENT}"
assert_contains "Tamanho mínimo HTML"             "<!doctype html>"                                   "${GOT_CONTENT}"

# Anti-regressão: garante que NÃO está mais usando ConfirmationURL (legacy implicit
# grant flow — quebrado em SSR, foi a causa raiz do bug de fiscalização 2026-05-06).
if [[ "${GOT_CONTENT}" == *"{{ .ConfirmationURL }}"* ]]; then
  echo "  ❌ REGRESSÃO: template voltou a usar {{ .ConfirmationURL }} (hash fragment — quebra SSR!)"
  ASSERTS_FAILED=$((ASSERTS_FAILED + 1))
else
  log "  ✅ Sem .ConfirmationURL legacy (anti-regressão)"
fi

log ""
if [[ ${ASSERTS_FAILED} -eq 0 ]]; then
  log "✅ Template recovery em prod com identidade KEYRA — 9/9 asserts PASS"
  exit 0
else
  echo "❌ ${ASSERTS_FAILED} asserts FAIL — template em prod fora de spec"
  echo "   Reaplique via: ./scripts/configure-supabase-recovery-template.sh"
  exit 1
fi
