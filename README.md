# KEYRA

> O primeiro **financeiro operacional** para estética.

**KEYRA** = KEY (chave) + Receita + Acelerada.

## Visão

Resolver a desconexão entre operação e financeiro em clínicas e studios de estética. Diferente de ERPs tradicionais (alimentados manualmente pós-faturamento), o KEYRA gera o financeiro **automaticamente** a partir da operação:

```
Serviço → Agenda → Comanda → Transação → DRE → Decisão
```

## Os 4 Pilares

1. **Agenda** — origem do faturamento
2. **Serviços** — estrutura de monetização
3. **Financeiro** — registro e controle automático
4. **Inteligência** — análise de lucro e suporte à decisão

## Princípios UX inegociáveis

- Números absolutos, não gráficos
- Comparativos textuais ("R$ 2.300 a mais que o mês passado")
- Dashboard de tela única
- Simplicidade — a usuária não é financista

## Documentação

| Documento | Caminho |
|-----------|---------|
| PRD formal | [`docs/prd/PRD-KEYRA.md`](docs/prd/PRD-KEYRA.md) |
| Arquitetura fullstack | [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md) |
| EPIC mestre | [`docs/stories/EPIC-0-KEYRA-IMPLEMENTATION.md`](docs/stories/EPIC-0-KEYRA-IMPLEMENTATION.md) |
| Visão da idealizadora | [`docs/audios-idealizadora/contexto-completo-keyra.md`](docs/audios-idealizadora/contexto-completo-keyra.md) |
| Setup de credenciais | [`docs/setup/CREDENTIALS.md`](docs/setup/CREDENTIALS.md) |
| Pesquisa competitiva | [`docs/research/`](docs/research/) |

## Stack

- **Frontend / API:** Next.js 16 (App Router + Server Actions)
- **Banco / Auth / Storage:** Supabase (PostgreSQL com RLS multi-tenant)
- **Deploy:** Vercel
- **Jobs:** Inngest (decidido na arquitetura)
- **Pagamentos:** Stripe (SaaS billing) + Asaas (Pix operacional)

## Status

🚀 Greenfield — **Fase 0: 6/6 stories concluídas (100%)** + **schema aplicado no banco real**. Pronto para Fase 1.

> **Single source of truth de implementação:** [`docs/IMPLEMENTATION-MAP.md`](docs/IMPLEMENTATION-MAP.md) — matriz viva feature × tela × tabela × ADR × story.

| Story | Entregável | Status |
|-------|-----------|--------|
| 0.1 | Environment bootstrap (GitHub + Vercel + Supabase + domínio) | ✅ concluído |
| 0.2 | PRD formal (66 FRs / 27 NFRs / 27 CONs) | ✅ concluído |
| 0.3 | Arquitetura fullstack (20 ADRs) | ✅ concluído |
| 0.4 | Schema PostgreSQL + RLS (21 tabelas, 100% RLS, 19 migrations **aplicadas no remoto**) | ✅ concluído |
| 0.5 | Wireframes (8 arquivos, paleta terracota, 1 gráfico) | ✅ concluído |
| 0.6 | Pesquisa competitiva (Conta Azul, Gestek, Kamino) | ✅ concluído |

## Infraestrutura

| Recurso | URL / Identificador |
|---------|---------------------|
| Repositório | [github.com/luizxhgomes/keyra](https://github.com/luizxhgomes/keyra) (private) |
| **Aplicação (produção)** | **[usekeyra.vercel.app](https://usekeyra.vercel.app)** |
| Domínio custom (pendente DNS) | [keyra.app](https://keyra.app) — Cloudflare precisa apontar A record para `76.76.21.21` |
| Vercel project | `keyra` (Hobby plan, auto-deploy de `main`) |
| Supabase project | `keyra-br` (sa-east-1 / São Paulo, Postgres 17, Free plan) |

> Snapshot operacional vivo: [`docs/INFRA-STATUS.md`](docs/INFRA-STATUS.md)
> Setup de credenciais isoladas: [`docs/setup/CREDENTIALS.md`](docs/setup/CREDENTIALS.md)
> Mapa de implementação completo: [`docs/IMPLEMENTATION-MAP.md`](docs/IMPLEMENTATION-MAP.md)
> Schema do banco: [`docs/architecture/SCHEMA.md`](docs/architecture/SCHEMA.md)

## Próximos bloqueadores manuais (antes da Phase 1)

1. **Ativar Auth Hook** `public.custom_access_token_hook` no [Supabase Dashboard](https://supabase.com/dashboard/project/oapdfhivzojyahvphebs/auth/hooks)
2. Provisionar `COLUMN_ENCRYPTION_KEY` no Vercel (encrypt CPF)
3. Validar 3 perguntas UX com a idealizadora (paleta terracota, split de pagamento, formato de comparativo)

---

**Framework de desenvolvimento:** [Synkra AIOX](.aiox-core/) — orquestração multi-agente para desenvolvimento story-driven.
