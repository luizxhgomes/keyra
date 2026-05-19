#!/usr/bin/env bash
# scripts/check-design-system.sh
#
# Auditoria automatizada da regra de design system documentada em
# `.claude/rules/design-system.md`. Roda em CI (workflow rls-tests, job
# design-system-audit) e pode rodar local antes de push.
#
# Cobre `apps/web/src/**/*.tsx` — a camada de produto (React + Tailwind).
#
# HARD FAIL (barra o build):
#  C1) Classe de cor da paleta DEFAULT do Tailwind (princípio 2 — quente sempre,
#      frio nunca). Só tokens KEYRA são permitidos.
#  C2) Valor de espaçamento ARBITRÁRIO (princípio 1 — tokens são lei / princípio 6).
#
# WARN (reporta, não barra):
#  C3) HEX literal em .tsx que deveria ser constante de token (princípio 1).
#
# Órfãos tipográficos, alinhamento de cards e proporção de espaço vazio NÃO são
# estaticamente verificáveis — ficam no smoke visual do checklist da regra.
#
# Documentação completa: .claude/rules/design-system.md

set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="${ROOT_DIR}/apps/web/src"

HARD_FAIL=0

# Filtro: descarta linhas de comentário (// , * , /* , {/* ) — comentários não
# são código. Opera sobre a saída de `grep -rn` no formato `path:linha:conteúdo`.
DROP_COMMENTS=':[0-9]+:[[:space:]]*(//|\*|/\*|\{/\*|<!--)'

echo "🎨 Design System Audit (.claude/rules/design-system.md)"
echo "    Escopo: ${SRC_DIR}/**/*.tsx"
echo ""

# ---------------------------------------------------------------------------
# C1 — Paleta default do Tailwind (HARD FAIL)
# Famílias proibidas: frias (blue, sky, ...) e cinzas neutros (slate, gray, ...).
# Só a paleta KEYRA (cocoa, terracotta, amber, bronze, sand, ivory, gold, ...)
# é permitida.
# ---------------------------------------------------------------------------
FORBIDDEN_FAMILIES="slate|gray|zinc|neutral|stone|blue|sky|cyan|indigo|violet|purple|fuchsia|pink|rose|emerald|teal|lime|green|red|orange|yellow"
COLOR_PREFIXES="bg|text|border|ring|ring-offset|from|via|to|fill|stroke|divide|outline|accent|placeholder|caret|decoration|shadow"

echo "── C1 · Cores fora da paleta KEYRA ──────────────────────────────"
C1_HITS="$(grep -rnE "(${COLOR_PREFIXES})-(${FORBIDDEN_FAMILIES})-[0-9]" "${SRC_DIR}" --include="*.tsx" 2>/dev/null \
  | grep -vE "${DROP_COMMENTS}" || true)"
if [[ -n "${C1_HITS}" ]]; then
  echo "🔴 HARD FAIL — classe de cor da paleta default do Tailwind encontrada:"
  echo "${C1_HITS}" | sed 's/^/   /'
  echo "   → Migrar para tokens KEYRA (cocoa, terracotta, amber, bronze, sand,"
  echo "     ivory, mocha, rust, gold, champagne, success-leaf/deep)."
  HARD_FAIL=1
else
  echo "✅ Nenhuma cor fora da paleta KEYRA."
fi
echo ""

# ---------------------------------------------------------------------------
# C2 — Espaçamento arbitrário (HARD FAIL)
# Tokens são lei: p-[13px], gap-[27px] etc. são proibidos.
# ---------------------------------------------------------------------------
SPACING_PREFIXES="p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y"
echo "── C2 · Espaçamento arbitrário ──────────────────────────────────"
C2_HITS="$(grep -rnE "(^|[ \"'\`])(${SPACING_PREFIXES})-\[[0-9.]+(px|rem|em)\]" "${SRC_DIR}" --include="*.tsx" 2>/dev/null \
  | grep -vE "${DROP_COMMENTS}" || true)"
if [[ -n "${C2_HITS}" ]]; then
  echo "🔴 HARD FAIL — valor de espaçamento arbitrário encontrado:"
  echo "${C2_HITS}" | sed 's/^/   /'
  echo "   → Usar a escala de tokens (p-4, gap-6, ...) ou um token semântico"
  echo "     de tailwind.config.ts (gap-section, p-card-x, ...)."
  HARD_FAIL=1
else
  echo "✅ Nenhum valor de espaçamento arbitrário."
fi
echo ""

# ---------------------------------------------------------------------------
# C3 — HEX literal em .tsx (WARN)
# Exclui arquivos onde HEX inline é inevitável: ícones gerados, OG images,
# metadata de tema, fallback de erro fora do React tree.
# ---------------------------------------------------------------------------
echo "── C3 · HEX literais (tech-debt, não barra) ─────────────────────"
C3_HITS="$(grep -rnE "#[0-9a-fA-F]{3,8}\b" "${SRC_DIR}" --include="*.tsx" 2>/dev/null \
  | grep -vE "/(global-error|apple-icon|icon|opengraph-image|layout)\.tsx:" \
  | grep -vE "${DROP_COMMENTS}" || true)"
if [[ -n "${C3_HITS}" ]]; then
  C3_COUNT="$(echo "${C3_HITS}" | wc -l | tr -d ' ')"
  echo "🟡 WARN — ${C3_COUNT} HEX literal(is) que deveriam ser constantes de token:"
  echo "${C3_HITS}" | sed 's/^/   /'
  echo "   → Migrar progressivamente para constantes de docs/brand/03-identity/tokens.json."
else
  echo "✅ Nenhum HEX literal pendente."
fi
echo ""

# ---------------------------------------------------------------------------
echo "─────────────────────────────────────────────────────────────────"
if [[ "${HARD_FAIL}" -eq 1 ]]; then
  echo "❌ Design System Audit FALHOU. Corrija as violações HARD FAIL acima."
  exit 1
fi
echo "✅ Design System Audit PASSOU."
exit 0
