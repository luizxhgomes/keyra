#!/usr/bin/env bash
# Phase 2.6 / Gate G5 — Dead Link Audit (Story 7.4)
#
# Escaneia todos `href="/..."` e `<Link href="/...">` em `apps/web/src/`
# e valida que cada rota interna corresponde a uma `page.tsx` real em
# `apps/web/src/app/`. Falha o build se encontrar dead link.
#
# **Por que existe:** `/mais` e `/configuracoes` foram referenciadas em
# Sidebar/BottomNav SEM existir como rota — só descobrimos via validação
# manual no mobile da idealizadora (Story 7.3). Phase 2.6 instaura este
# gate como rede automática contra a regressão.
#
# Uso:
#   ./scripts/audit-dead-links.sh             # local, exit 1 em falha
#   ./scripts/audit-dead-links.sh --quiet     # só falha, sem output
#
# **Limitações conhecidas:**
# - Hrefs montados em runtime (`href={\`/pacientes/${id}\`}`) não são
#   verificados — só literais estáticos.
# - Catch-all routes (`[[...slug]]`) sempre matcham, então auditoria é
#   conservadora (false negatives possíveis em rotas dinâmicas mais raras).
# - Query strings (`?novo=1`) e fragments são ignorados antes do match.

set -euo pipefail

cd "$(dirname "$0")/.."

QUIET=false
if [[ "${1:-}" == "--quiet" ]]; then
  QUIET=true
fi

SRC_DIR="apps/web/src"
APP_DIR="$SRC_DIR/app"

if [[ ! -d "$APP_DIR" ]]; then
  echo "ERRO: $APP_DIR não encontrado" >&2
  exit 2
fi

# 1. Coleta rotas existentes a partir das page.tsx
#    Normalização:
#      apps/web/src/app/(app)/dashboard/page.tsx → /dashboard
#      apps/web/src/app/(auth)/login/page.tsx    → /login
#      apps/web/src/app/page.tsx                 → /
#      apps/web/src/app/pacientes/[id]/page.tsx  → /pacientes/[id]
EXISTING_ROUTES=$(
  find "$APP_DIR" -name "page.tsx" -type f 2>/dev/null \
    | sed "s|$APP_DIR||" \
    | sed 's|/page\.tsx$||' \
    | sed 's|/([^/)]*)||g' \
    | sed 's|^$|/|' \
    | sort -u
)

# 2. Coleta rotas referenciadas em código:
#    a) href="/..."           — JSX literal
#    b) href='/...'           — JSX literal (single quote)
#    c) redirect('/...')      — server actions
#    d) router.push('/...')   — client navigation
#    e) router.replace('/...')
#
# Filtra: externos (http/mailto/tel), assets, query strings, hashes, vars
# (`${var}`). Hrefs dinâmicos `/pacientes/${id}` são pulados (cobertura
# parcial — limitação documentada no header).
USED_HREFS=$(
  {
    grep -rEho 'href="/[A-Za-z0-9/_-]+' "$SRC_DIR" 2>/dev/null \
      | sed -E 's/href="//' || true
    grep -rEho "href='/[A-Za-z0-9/_-]+" "$SRC_DIR" 2>/dev/null \
      | sed -E "s/href='//" || true
    grep -rEho "redirect\(['\"]/[A-Za-z0-9/_-]+" "$SRC_DIR" 2>/dev/null \
      | sed -E "s/redirect\(['\"]+//" || true
    grep -rEho "router\.(push|replace)\(['\"]/[A-Za-z0-9/_-]+" "$SRC_DIR" 2>/dev/null \
      | sed -E "s/router\.(push|replace)\(['\"]+//" || true
  } \
    | grep -vE '\.(png|svg|jpg|jpeg|webp|ico|css|js|json|woff2?|ttf)$' \
    | grep -v '\${' \
    | grep -v '^/$' \
    | sort -u
)

# 3. Para cada href usado, normaliza dynamic segments
#    /pacientes/abc123  →  /pacientes/[id]   (se existir)
#    /servicos/def      →  /servicos/[id]    (se existir)
DEAD_LINKS=()

while IFS= read -r href; do
  [[ -z "$href" ]] && continue

  # Match exato
  if echo "$EXISTING_ROUTES" | grep -qxF "$href"; then
    continue
  fi

  # Tentativa de match com dynamic segment substituído
  matched=false
  parent_path=$(dirname "$href")
  while [[ "$parent_path" != "/" && "$parent_path" != "." ]]; do
    # tenta substituir último segmento do href por `[*]` em qualquer rota existente
    pattern_count=$(echo "$EXISTING_ROUTES" | awk -v p="$parent_path" '
      $0 ~ "^" p "/\\[" { count++ } END { print count+0 }
    ')
    if [[ "$pattern_count" -gt 0 ]]; then
      matched=true
      break
    fi
    parent_path=$(dirname "$parent_path")
  done

  if [[ "$matched" == false ]]; then
    DEAD_LINKS+=("$href")
  fi
done <<< "$USED_HREFS"

# 4. Reporta
if [[ ${#DEAD_LINKS[@]} -eq 0 ]]; then
  if [[ "$QUIET" == false ]]; then
    echo "✓ Dead Link Audit OK — todos hrefs internos apontam para rotas existentes."
    echo "  Rotas verificadas: $(echo "$EXISTING_ROUTES" | wc -l | tr -d ' ')"
    echo "  Hrefs verificados: $(echo "$USED_HREFS" | wc -l | tr -d ' ')"
  fi
  exit 0
fi

echo "✗ Dead Link Audit FALHOU — ${#DEAD_LINKS[@]} link(s) interno(s) sem rota correspondente:" >&2
for link in "${DEAD_LINKS[@]}"; do
  echo "  • $link" >&2
done
echo >&2
echo "Resolva criando page.tsx em apps/web/src/app/{rota}/page.tsx ou removendo o href." >&2
exit 1
