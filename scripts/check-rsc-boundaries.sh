#!/usr/bin/env bash
# scripts/check-rsc-boundaries.sh
#
# Verificação automatizada das regras RSC boundary documentadas em
# `docs/dev/rsc-boundary-rules.md`. Roda em CI (workflow rls-tests) e
# pode rodar local antes de push.
#
# Falha o build se encontrar:
#  R1) Client Component declarando prop pública tipada como LucideIcon
#  R3) Hook usando `useSyncExternalStore` (deprecated nesta codebase)
#
# Uso:
#   ./scripts/check-rsc-boundaries.sh
#
# Documentação completa: docs/dev/rsc-boundary-rules.md

set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="${ROOT_DIR}/apps/web/src"

ERROR_FILE="$(mktemp)"
trap "rm -f $ERROR_FILE" EXIT

echo "🔍 RSC Boundary Audit (docs/dev/rsc-boundary-rules.md)"
echo ""

# ---------------------------------------------------------------------------
# Regra 1 — Client Component com prop pública `icon?: LucideIcon`
# ---------------------------------------------------------------------------
# Heurística: arquivo com 'use client' que tem `icon?: LucideIcon` ou
# `icon: LucideIcon` em interface/type EXPORTED (linha começa com `export`).
# Tipos internos (ex: const SEVERITY: Record<..., { icon: LucideIcon }>)
# são OK porque não cruzam fronteira RSC.
echo "Regra 1: LucideIcon em prop pública de Client Component"

while IFS= read -r file; do
  if grep -qE "^[[:space:]]*['\"]use client['\"]" "$file"; then
    # Capturar bloco que começa em "export interface XxxProps" ou "export type XxxProps"
    # e termina no fechamento `}`. Procurar `icon: LucideIcon` ou `icon?: LucideIcon` dentro.
    in_props=0
    line_no=0
    while IFS= read -r line; do
      line_no=$((line_no + 1))
      # Detecta início de interface/type Props pública
      if echo "$line" | grep -qE "^export (interface|type) [A-Z][a-zA-Z]*Props"; then
        in_props=1
      fi
      if [[ $in_props -eq 1 ]]; then
        # Detecta fim do bloco (linha que é só "}" no início da coluna)
        if echo "$line" | grep -qE "^}"; then
          in_props=0
          continue
        fi
        # Detecta violação dentro do bloco de Props
        if echo "$line" | grep -qE "(^[[:space:]]+icon[?:]?: LucideIcon|: LucideIcon[^a-zA-Z])"; then
          # Ignora linhas em comentário
          if ! echo "$line" | grep -qE "^[[:space:]]*(//|\*)"; then
            echo "❌ R1: $file:$line_no" >> "$ERROR_FILE"
            echo "    $line" >> "$ERROR_FILE"
          fi
        fi
      fi
    done < "$file"
  fi
done < <(find "$SRC_DIR/components" "$SRC_DIR/lib" -type f \( -name "*.tsx" -o -name "*.ts" \) 2>/dev/null)

echo ""

# ---------------------------------------------------------------------------
# Regra 3 — useSyncExternalStore (deprecated nesta codebase)
# ---------------------------------------------------------------------------
# Procurar IMPORT real (não comentários ou strings em docs).
# Padrões válidos de import:
#   import { useSyncExternalStore } from 'react';
#   import {..., useSyncExternalStore, ...} from 'react';
echo "Regra 3: useSyncExternalStore proibido"

while IFS=: read -r file line_no line; do
  # Pula se a linha é comentário (// ou *)
  if echo "$line" | grep -qE "^[[:space:]]*(//|\*|/\*)"; then
    continue
  fi
  # Pula se está dentro de string (heurística simples: contém quote antes do match)
  echo "❌ R3: $file:$line_no" >> "$ERROR_FILE"
  echo "    $line" >> "$ERROR_FILE"
done < <(grep -rn "useSyncExternalStore" "$SRC_DIR" --include="*.tsx" --include="*.ts" 2>/dev/null | grep -E "(^|[[:space:],{}])useSyncExternalStore[(\b]" || true)

echo ""

# ---------------------------------------------------------------------------
# Resultado
# ---------------------------------------------------------------------------
if [[ -s "$ERROR_FILE" ]]; then
  echo "❌ RSC Boundary Audit: violações encontradas"
  echo ""
  cat "$ERROR_FILE"
  echo ""
  echo "📖 Correção: docs/dev/rsc-boundary-rules.md"
  exit 1
fi

echo "✅ RSC Boundary Audit: PASS"
exit 0
