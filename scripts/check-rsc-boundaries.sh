#!/usr/bin/env bash
# scripts/check-rsc-boundaries.sh
#
# Verificação automatizada das regras RSC boundary documentadas em
# `docs/dev/rsc-boundary-rules.md`. Roda em CI (workflow rls-tests) e
# pode rodar local antes de push.
#
# Cobre TODA a árvore `apps/web/src/**`.
#
# Falha o build se encontrar:
#  R1) Client Component declarando prop pública tipada como LucideIcon
#  R3) Uso real de `useSyncExternalStore` (deprecated nesta codebase)
#  R4) Server Component passando Lucide icon como prop para Client Component
#      (resolução real de import — sem falsos positivos com Server→Server)
#
# Documentação completa: docs/dev/rsc-boundary-rules.md

set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="${ROOT_DIR}/apps/web/src"

ERROR_FILE="$(mktemp)"
trap "rm -f $ERROR_FILE" EXIT

echo "🔍 RSC Boundary Audit (docs/dev/rsc-boundary-rules.md)"
echo "    Escopo: $SRC_DIR/**"
echo ""

# ---------------------------------------------------------------------------
# Helper: checa se um caminho de módulo (resolvido) é Client Component
# Args: $1 = path absoluto ao arquivo .tsx ou .ts
# Stdout: "client" ou "server" ou "unknown"
# ---------------------------------------------------------------------------
classify_module() {
  local path="$1"
  if [[ ! -f "$path" ]]; then
    echo "unknown"
    return
  fi
  if head -5 "$path" | grep -qE "^[[:space:]]*['\"]use client['\"]"; then
    echo "client"
  else
    echo "server"
  fi
}

# Helper: resolve import path relativo (alias @/ ou ./ ../) a caminho absoluto
# Args: $1 = arquivo origem, $2 = especificador de import
# Stdout: caminho absoluto resolvido (com extensão .tsx ou .ts) ou ""
resolve_import() {
  local from="$1"
  local spec="$2"
  local from_dir
  from_dir="$(dirname "$from")"

  local target=""
  if [[ "$spec" == @/* ]]; then
    target="$SRC_DIR/${spec#@/}"
  elif [[ "$spec" == ./* || "$spec" == ../* ]]; then
    target="$from_dir/$spec"
  else
    # node_modules ou outro alias — fora do escopo
    echo ""
    return
  fi

  # Tenta extensões e index
  for ext in ".tsx" ".ts" "/index.tsx" "/index.ts"; do
    if [[ -f "${target}${ext}" ]]; then
      # Resolve symlinks/relativos via cd + pwd (sem usar realpath para portabilidade)
      local dir
      dir="$(cd "$(dirname "${target}${ext}")" && pwd)"
      echo "${dir}/$(basename "${target}${ext}")"
      return
    fi
  done
  echo ""
}

# ---------------------------------------------------------------------------
# Regra 1 — Client Component com prop pública `icon: LucideIcon`
# ---------------------------------------------------------------------------
echo "Regra 1: LucideIcon em prop pública de Client Component"

while IFS= read -r file; do
  if ! grep -qE "^[[:space:]]*['\"]use client['\"]" "$file"; then
    continue
  fi

  in_props=0
  line_no=0
  while IFS= read -r line; do
    line_no=$((line_no + 1))

    if echo "$line" | grep -qE "^export (interface|type) [A-Z][a-zA-Z]*Props"; then
      in_props=1
      continue
    fi

    if [[ $in_props -eq 1 ]]; then
      if echo "$line" | grep -qE "^}"; then
        in_props=0
        continue
      fi
      if echo "$line" | grep -qE "^[[:space:]]*(//|\*|/\*)"; then
        continue
      fi
      if echo "$line" | grep -qE "(^[[:space:]]+icon[?]?: LucideIcon|: LucideIcon[^a-zA-Z])"; then
        echo "❌ R1: $file:$line_no" >> "$ERROR_FILE"
        echo "    $line" >> "$ERROR_FILE"
      fi
    fi
  done < "$file"
done < <(find "$SRC_DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) 2>/dev/null)

echo ""

# ---------------------------------------------------------------------------
# Regra 3 — useSyncExternalStore proibido (uso real, não comentário/string)
# ---------------------------------------------------------------------------
echo "Regra 3: useSyncExternalStore proibido"

while IFS=: read -r file line_no line; do
  if echo "$line" | grep -qE "^[[:space:]]*(//|\*|/\*)"; then
    continue
  fi
  case "$line" in
    *\'useSyncExternalStore\'*|*\"useSyncExternalStore\"*|*\`useSyncExternalStore\`*) continue ;;
  esac
  echo "❌ R3: $file:$line_no" >> "$ERROR_FILE"
  echo "    $line" >> "$ERROR_FILE"
done < <(grep -rn "useSyncExternalStore" "$SRC_DIR" --include="*.tsx" --include="*.ts" 2>/dev/null \
  | grep -E "(^|[[:space:],{}\(])useSyncExternalStore[(\b]" \
  || true)

echo ""

# ---------------------------------------------------------------------------
# Regra 4 — Server Component passando Lucide icon como prop PARA Client
# Resolve imports reais para evitar falsos positivos Server→Server.
# ---------------------------------------------------------------------------
echo "Regra 4: Server passando Lucide icon como prop a Client Component"

while IFS= read -r file; do
  # Pula arquivos Client (já cobertos pela R1)
  if grep -qE "^[[:space:]]*['\"]use client['\"]" "$file"; then
    continue
  fi

  # Coleta ícones Lucide importados neste arquivo
  lucide_imports=$(grep -E "^import \{[^}]*\} from ['\"]lucide-react['\"]" "$file" 2>/dev/null \
    | sed -E "s/^import \{([^}]+)\}.*/\1/" \
    | tr ',' '\n' \
    | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' \
    | sed 's/^type //' \
    | grep -E "^[A-Z][a-zA-Z0-9]+$" \
    || true)
  if [[ -z "$lucide_imports" ]]; then
    continue
  fi

  # Coleta TODOS imports de componentes/módulos locais com seus paths.
  # Bash 3.x do macOS não tem associative arrays — usa arquivo TSV: NAME<TAB>PATH
  IMPORT_TSV="$(mktemp)"
  while IFS= read -r imp_line; do
    spec=$(echo "$imp_line" | sed -E "s/.*from ['\"]([^'\"]+)['\"].*/\1/")
    names=$(echo "$imp_line" | sed -E "s/^import [^{]*\{([^}]+)\}.*/\1/" \
      | tr ',' '\n' \
      | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' \
      | sed 's/^type //' \
      | grep -E "^[A-Z][a-zA-Z0-9]*$" \
      || true)
    [[ -z "$names" ]] && continue
    [[ "$spec" != @/* && "$spec" != ./* && "$spec" != ../* ]] && continue

    resolved=$(resolve_import "$file" "$spec")
    [[ -z "$resolved" ]] && continue

    while IFS= read -r name; do
      [[ -z "$name" ]] && continue
      printf '%s\t%s\n' "$name" "$resolved" >> "$IMPORT_TSV"
    done <<< "$names"
  done < <(grep -E "^import \{[^}]+\} from ['\"](@/|\\./|\\.\\./)" "$file" 2>/dev/null || true)

  # Para cada Lucide icon importado, busca padrão `<Component ... icon={IconName} ...>`
  while IFS= read -r icon; do
    [[ -z "$icon" ]] && continue
    # grep busca: `<UpperCaseName ... icon={Icon ` cobrindo casos com/sem fechamento na mesma linha
    matches=$(grep -nE "<[A-Z][a-zA-Z0-9]+[^>]*icon=\{${icon}[ }/]" "$file" 2>/dev/null || true)
    [[ -z "$matches" ]] && continue

    while IFS=: read -r line_no line; do
      if echo "$line" | grep -qE "^[[:space:]]*(//|\*)"; then
        continue
      fi
      # Extrai nome do componente que recebe o icon (primeira tag após `<`)
      consumer=$(echo "$line" | grep -oE "<[A-Z][a-zA-Z0-9]+" | head -1 | sed 's/<//')
      [[ -z "$consumer" ]] && continue

      consumer_path=""
      if [[ -f "$IMPORT_TSV" ]]; then
        consumer_path=$(awk -F'\t' -v n="$consumer" '$1==n {print $2; exit}' "$IMPORT_TSV")
      fi
      if [[ -z "$consumer_path" ]]; then
        # Componente local definido no mesmo arquivo (ex: function NoDataInline)
        # OR import de pacote externo. Server→pacote externo geralmente OK.
        # Pula esses casos.
        continue
      fi

      consumer_kind=$(classify_module "$consumer_path")
      if [[ "$consumer_kind" == "client" ]]; then
        echo "❌ R4: $file:$line_no" >> "$ERROR_FILE"
        echo "    $line" >> "$ERROR_FILE"
        echo "    Server passando '$icon' (Lucide) para Client Component '<$consumer>' definido em $consumer_path" >> "$ERROR_FILE"
      fi
    done <<< "$matches"
  done <<< "$lucide_imports"

  rm -f "$IMPORT_TSV"
done < <(find "$SRC_DIR" -type f -name "*.tsx" 2>/dev/null)

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
