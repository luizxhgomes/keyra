# KEYRA — Status da Infraestrutura (snapshot vivo)

> **Última atualização:** 2026-04-16
> **Phase 0 — Story 0.1 (Environment Bootstrap):** ✅ concluída
> **Source of truth desta página:** atualizar manualmente quando algo mudar de provider/região/escopo.

---

## 1. GitHub

| Campo | Valor |
|-------|-------|
| **Org / Owner** | `luizxhgomes` |
| **Repo** | [`luizxhgomes/keyra`](https://github.com/luizxhgomes/keyra) |
| **Visibilidade** | private |
| **Branch default** | `main` |
| **Auth** | `gh` CLI global (conta `luizxhgomes` ativa) |
| **Auto-deploy → Vercel** | ✅ ligado (push em `main` dispara prod) |

---

## 2. Vercel

| Campo | Valor |
|-------|-------|
| **Account** | `luizhenriquexpro` (team `Ic4O6Zn5IgyquUubKmEdMWuX`) |
| **Project ID** | `prj_u7PLAiHd2ohU51jfipnpPjMdwvnH` |
| **Project name** | `keyra` |
| **Framework** | Next.js |
| **Production branch** | `main` |
| **Production URL (em uso)** | **`usekeyra.vercel.app`** ✅ HTTP 200 |
| **Domínio custom (pendente DNS)** | `keyra.app` — Cloudflare aponta para parking; ajustar A record para `76.76.21.21` |
| **Default Vercel** | `keyra-eight.vercel.app` ✅ HTTP 200 |
| **Alias alternativo** | `keyra-app.vercel.app` ✅ HTTP 200 |
| **Deployment protection** | desabilitada (público) |
| **Plano** | Hobby (Free) — *upgrade para Pro ($20/mês) avaliar quando passar de 100 GB bandwidth/mês ou precisar de log drains* |
| **DNS** | Cloudflare (NS: `edna.ns.cloudflare.com`, `theo.ns.cloudflare.com`) → IPs Vercel |

### Env vars cadastradas (todos targets: production, preview, development)

| Key | Tipo |
|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | plain |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | plain |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | plain |
| `SUPABASE_PROJECT_REF` | plain |
| `SUPABASE_SERVICE_ROLE_KEY` | encrypted |
| `SUPABASE_SECRET_KEY` | encrypted |
| `COLUMN_ENCRYPTION_KEY` | encrypted (256-bit hex, para `pgp_sym_encrypt` em CPF — ADR-017) |

---

## 3. Supabase

| Campo | Valor |
|-------|-------|
| **Organization** | `SealDigital` (`yitrkgqigdwkldinjyxu`) |
| **Project name** | `keyra-br` |
| **Project ref** | `oapdfhivzojyahvphebs` |
| **URL** | https://oapdfhivzojyahvphebs.supabase.co |
| **Studio** | https://supabase.com/dashboard/project/oapdfhivzojyahvphebs |
| **Região** | **`sa-east-1` (São Paulo)** |
| **Postgres** | 17 |
| **Plano** | Free (500 MB DB, 1 GB storage, 2 GB bandwidth/mês, 50K MAU, **pausa após 1 semana sem requests**) |
| **CLI link** | ✅ `supabase/config.toml` linkado |
| **search_path** | `public, extensions, pg_catalog` (database default + 4 roles) |

### Schema aplicado (2026-04-16)

| Métrica | Valor |
|---------|-------|
| Migrations no remoto | **19** (`20260416000100` → `20260416001900`) |
| Tabelas (`public`) | **21** |
| Tabelas com RLS habilitado | **21/21 (100%)** |
| Views (DRE + KPIs) | **6** (`v_dre_monthly`, `v_dre_by_service`, `v_dre_by_professional`, `v_cashflow_daily`, `v_dashboard_kpis`, `v_receitas_previstas`) |
| Funções | **15** (helpers, triggers, hook auth, audit) |
| Triggers críticos de automação | **2** ativos (`trg_appointments_done_to_command`, `trg_payments_to_transaction`) |
| Audit log | universal append-only + dedicado para `organizations` (migration 019) |

### Bloqueadores manuais — RESOLVIDOS

| # | Ação | Status |
|---|------|--------|
| 1 | Ativar Auth Hook `public.custom_access_token_hook` | ✅ ENABLED 2026-04-16 |
| 2 | Provisionar `COLUMN_ENCRYPTION_KEY` no Vercel | ✅ encrypted, 3 targets, 2026-04-16 |
| 3 | Confirmar JWT contém `org_id` após login real | ⏸️ validar quando 1º user logar (Story 1.2) |

### Projeto antigo (descomissionado)

| Campo | Valor |
|-------|-------|
| `Keyra` (antigo) | ref `ysuscgknjeaugzpsdbis`, região `us-east-2` (Ohio), **PAUSED** em 2026-04-16. Backup das chaves antigas em `.keyra-secrets/.backup-ohio-*` (gitignored). Manter por 7 dias e depois deletar. |

---

## 4. Domínio

| Campo | Valor |
|-------|-------|
| **Domínio principal** | `keyra.app` |
| **Registrar** | externo (já era seu antes do bootstrap) |
| **Autoridade DNS** | Cloudflare |
| **Aponta para** | Vercel (verified) |
| **Subdomínios planejados** | `app.keyra.app` (prod app), `staging.keyra.app` (staging — Phase 5+), `api.keyra.app` (reservado) |

---

## 5. Credenciais Locais

| Local | Conteúdo | Permissões |
|-------|---------|-----------|
| `.keyra-secrets/` | tokens isolados (Vercel, Supabase PAT, chaves projeto, senha DB) | dir 700, files 600 |
| `.env.local` | gerado por `./scripts/sync-env.sh` a partir de `.keyra-secrets/` | 600, gitignored |
| `.env.local.example` | template público (sem valores) | versionado |
| `scripts/keyra-shell.sh` | source para carregar envs no shell atual sem afetar global | versionado |
| `scripts/with-env.sh` | wrapper para rodar 1 comando com envs isoladas | versionado |
| `scripts/check-tokens.sh` | validador de credenciais contra APIs | versionado |

> Documentação detalhada: [`docs/setup/CREDENTIALS.md`](setup/CREDENTIALS.md).

---

## 6. Inventário de Stories Phase 0

| Story | Entregável | Status | Artefato |
|-------|-----------|--------|----------|
| 0.1 | Environment bootstrap | ✅ concluída | esta página |
| 0.2 | PRD formal | ✅ concluída | [`docs/prd/PRD-KEYRA.md`](prd/PRD-KEYRA.md) |
| 0.3 | Arquitetura fullstack | ✅ concluída | [`docs/architecture/ARCHITECTURE.md`](architecture/ARCHITECTURE.md) |
| 0.4 | Schema PostgreSQL + RLS multi-tenant | ⏸️ próximo (@data-engineer) | `supabase/migrations/*.sql` |
| 0.5 | Wireframes do dashboard | ⏸️ próximo (@ux-design-expert) | `docs/ux/wireframes/` |
| 0.6 | Pesquisa competitiva | ✅ concluída (Conta Azul, Gestek, Kamino) | [`docs/research/`](research/) |

---

## 7. Limites Conhecidos & Triggers de Upgrade

| Recurso | Limite atual | Trigger para upgrade |
|---------|-------------|---------------------|
| Supabase DB | 500 MB | Atingir 70% → migrar para Pro ($25/mês) |
| Supabase pause | 7 dias sem requests | **Configurar healthcheck cron antes de Phase 2** (evita pause em dev) |
| Vercel bandwidth | 100 GB/mês | Atingir 70% → Pro ($20/mês) |
| Vercel build minutes | 6.000/mês | Improvável atingir solo dev |
| Vercel commercial use | Hobby = uso pessoal apenas | **Antes de aceitar primeiro pagamento (Phase 5+) → Pro obrigatório** |

---

## 8. Riscos Operacionais Atuais

| Risco | Mitigação imediata | Quando virar prioridade |
|-------|-------------------|------------------------|
| Supabase Free pode pausar (7d sem requests) | Health-check Vercel cron Phase 1.1 | Imediato |
| Sem staging environment | Aceitável para Phase 1-4 (preview Vercel basta) | Phase 5 |
| Sem MFA em painel administrativo | Aceitável MVP | Phase 5 (B2B SaaS) |
| Tokens Vercel/Supabase PAT já apareceram em chat | Aceito risco; rotacionar antes de 1º pagante | Phase 4 |

---

*Atualizar esta página sempre que mudar provider, região, projeto, domínio ou plano.*
