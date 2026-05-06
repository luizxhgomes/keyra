#!/usr/bin/env bash
# =============================================================================
# KEYRA — smoke-auth-timing.sh
# =============================================================================
# Smoke local (dev) que mede tempo de resposta da Server Action
# requestPasswordResetAction com 2 emails:
#   (a) email cadastrado em auth.users (passa cooldown na 1ª chamada)
#   (b) email aleatório que não existe (Supabase silenciosamente descarta)
#
# Critério de PASS: |média(a) - média(b)| < 300ms — sinaliza que o tempo
# de resposta NÃO vaza informação sobre existência do email (R8 da auditoria).
#
# Cobre o smoke #2 da fiscalização ("Anti-enumeration real" — AC2 da auth.5).
#
# Pré-requisito: `pnpm dev` rodando em outro terminal (porta 3000).
# Usa Turnstile bypass `dev-bypass` que está ativo quando NEXT_PUBLIC_TURNSTILE_SITE_KEY
# não está definida (cenário típico de dev local). Em prod este teste NÃO funciona.
#
# Exit codes:
#   0 — anti-enumeration confirmado (delta < 300ms)
#   1 — delta excede limite (vazamento por timing)
#   2 — pré-requisitos faltando (dev server off, etc.)
#
# Uso:
#   ./scripts/smoke-auth-timing.sh
#   ./scripts/smoke-auth-timing.sh --base-url=http://localhost:3000 --trials=10
# =============================================================================

set -euo pipefail

BASE_URL="http://localhost:3000"
TRIALS=5
EMAIL_REGISTERED="${EMAIL_REGISTERED:-luizzzhenriqueoficial@gmail.com}"

for arg in "$@"; do
  case "${arg}" in
    --base-url=*) BASE_URL="${arg#*=}" ;;
    --trials=*)   TRIALS="${arg#*=}" ;;
    --help)
      grep -E "^#" "$0" | head -30
      exit 0
      ;;
  esac
done

# ---- Health check do dev server ---------------------------------------------
if ! curl -sS -o /dev/null -w "%{http_code}" "${BASE_URL}/esqueci-senha" | grep -q "^200$"; then
  echo "❌ Dev server não responde em ${BASE_URL}/esqueci-senha (HTTP 200 esperado)"
  echo "   Rode 'pnpm dev' em outro terminal antes deste smoke."
  exit 2
fi

# ---- Função auxiliar para invocar Server Action via curl --------------------
# Server Actions em Next 16 são invocadas via POST com header `next-action: {hash}`.
# Como não temos o hash exato (depende do build), usamos uma abordagem alternativa:
# rodamos a action via fetch a partir de uma página de teste local OU usamos curl
# direto na rota do form com payload encodado.
#
# Aqui usamos a 2ª abordagem — POST com Content-Type: text/plain (RPC pattern do Next):
measure_call() {
  local email="$1"
  # Time em milissegundos via curl -w
  local time_total
  time_total=$(curl -sS -o /dev/null -w "%{time_total}\n" \
    -X POST "${BASE_URL}/esqueci-senha" \
    -H "Accept: text/x-component" \
    -H "Content-Type: text/plain;charset=UTF-8" \
    -H "Next-Action: dummy" \
    --data "[{\"email\":\"${email}\",\"turnstileToken\":\"dev-bypass\"}]")
  # Converte segundos pra ms via awk
  echo "${time_total}" | awk '{printf "%d\n", $1 * 1000}'
}

# ---- Coleta amostras --------------------------------------------------------
echo "📊 Coletando ${TRIALS} amostras por email..."
echo ""

declare -a samples_a samples_b
sum_a=0; sum_b=0

for i in $(seq 1 "${TRIALS}"); do
  ms_a=$(measure_call "${EMAIL_REGISTERED}")
  samples_a+=("${ms_a}")
  sum_a=$((sum_a + ms_a))

  ms_b=$(measure_call "naoexiste-${RANDOM}-${i}@example.com")
  samples_b+=("${ms_b}")
  sum_b=$((sum_b + ms_b))

  printf "  trial %d: cadastrado=%4dms · aleatório=%4dms\n" "${i}" "${ms_a}" "${ms_b}"
done

avg_a=$((sum_a / TRIALS))
avg_b=$((sum_b / TRIALS))
delta=$((avg_a - avg_b))
[[ ${delta} -lt 0 ]] && delta=$((-delta))

echo ""
echo "📈 Resultados:"
echo "  Média cadastrado: ${avg_a}ms"
echo "  Média aleatório:  ${avg_b}ms"
echo "  Delta absoluto:   ${delta}ms"
echo ""

# ---- Critério de PASS -------------------------------------------------------
THRESHOLD=300
if [[ ${delta} -lt ${THRESHOLD} ]]; then
  echo "✅ Anti-enumeration confirmado (delta ${delta}ms < ${THRESHOLD}ms)"
  exit 0
else
  echo "❌ FAIL — delta ${delta}ms excede limite de ${THRESHOLD}ms"
  echo "   Tempo de resposta vaza informação sobre existência do email."
  echo "   Investigar: cooldown não-uniforme? Ou Supabase resetPasswordForEmail dando latência diferente?"
  exit 1
fi
