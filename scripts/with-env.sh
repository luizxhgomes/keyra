#!/usr/bin/env bash
# KEYRA wrapper — executa UM comando com tokens carregados, sem poluir shell global
# Uso: ./scripts/with-env.sh gh repo view luizxhgomes/keyra
#      ./scripts/with-env.sh vercel projects ls
#      ./scripts/with-env.sh supabase projects list

set -euo pipefail

KEYRA_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SECRETS="${KEYRA_ROOT}/.keyra-secrets"

if [[ $# -eq 0 ]]; then
  echo "Uso: $0 <comando> [args...]"
  exit 1
fi

read_token() {
  local f="${SECRETS}/$1"
  [[ -f "${f}" ]] && tr -d '[:space:]' < "${f}" || echo ""
}

GH=$(read_token github.token)
VC=$(read_token vercel.token)
SBP=$(read_token supabase.token)
REF=$(read_token supabase-project-ref.txt)
ANON=$(read_token supabase-anon.key)
PUB=$(read_token supabase-publishable.key)
SR=$(read_token supabase-service-role.key)
SEC=$(read_token supabase-secret.key)
CEK=$(read_token column-encryption-key.txt)

env_args=()
[[ -n "${GH}" ]]   && env_args+=("GH_TOKEN=${GH}" "GITHUB_TOKEN=${GH}")
[[ -n "${VC}" ]]   && env_args+=("VERCEL_TOKEN=${VC}")
[[ -n "${SBP}" ]]  && env_args+=("SUPABASE_ACCESS_TOKEN=${SBP}")
[[ -n "${REF}" ]]  && env_args+=("NEXT_PUBLIC_SUPABASE_URL=https://${REF}.supabase.co" "SUPABASE_PROJECT_REF=${REF}")
[[ -n "${ANON}" ]] && env_args+=("NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON}")
[[ -n "${PUB}" ]]  && env_args+=("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${PUB}")
[[ -n "${SR}" ]]   && env_args+=("SUPABASE_SERVICE_ROLE_KEY=${SR}")
[[ -n "${SEC}" ]]  && env_args+=("SUPABASE_SECRET_KEY=${SEC}")
[[ -n "${CEK}" ]]  && env_args+=("COLUMN_ENCRYPTION_KEY=${CEK}")

exec env "${env_args[@]}" "$@"
