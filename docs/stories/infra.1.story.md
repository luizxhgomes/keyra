# Story infra.1: Migração para a nova conta Supabase e fim da pausa do banco

## Status

InReview

## Executor

- **executor:** @dev
- **quality_gate:** @devops
- **quality_gate_tools:** [typecheck, lint, build, rsc-gate, check-design-system, run-rls-tests]

## Story

**Como** dona da Keyra,
**Eu quero** o banco ativo numa conta nova e protegido contra nova pausa,
**Para que** o app volte a funcionar e não pare de novo por falta de uso.

## Contexto

Em 04/11/2026 o projeto `keyra-br` do plano Free estava `INACTIVE`, com login e páginas legais fora do ar. O risco constava no `docs/STATE.md`, mas o cron de manutenção nunca foi criado. O dono decidiu mudar de conta e isolar as chaves na pasta keyra.

## Acceptance Criteria

1. O projeto novo fica na região `sa-east-1`, como prometem os Termos e a Privacidade.
2. Estrutura e contagem de linhas do projeto novo conferem com o backup de 07/10/2026.
3. A configuração de autenticação fica igual à do projeto anterior, conferida por GET.
4. `GET /api/health` faz uma consulta real ao banco e responde 200, ou 503 em caso de falha.
5. A Vercel chama `/api/health` uma vez por dia.
6. As chaves da Keyra ficam só em `.keyra-secrets/`, e `with-env.sh` as entrega comando a comando.
7. Depois do merge, `https://usekeyra.com/api/health` responde 200 em produção.

## File List

- `apps/web/src/app/api/health/route.ts` (novo)
- `apps/web/vercel.json`
- `.gitignore`, `.mcp.json`, `apps/web/.mcp.json`, `package.json`
- `scripts/with-env.sh`, `scripts/verify-comprovantes-1-prod.sql`; removido `scripts/keyra-shell.sh`
- `CLAUDE.md`, `README.md`, `docs/INFRA-STATUS.md`, `docs/architecture/ARCHITECTURE.md`, `docs/setup/CREDENTIALS.md`, `docs/setup/google-oauth-setup.md`
