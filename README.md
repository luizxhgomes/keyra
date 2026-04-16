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

🚧 Greenfield — Fase 0 em execução.

| Story | Entregável | Status |
|-------|-----------|--------|
| 0.1 | Environment bootstrap | 🟡 em andamento |
| 0.2 | PRD formal | ✅ concluído |
| 0.3 | Arquitetura fullstack | ✅ concluído |
| 0.4 | Schema + RLS | ⏸️ próximo |
| 0.5 | Wireframes | ⏸️ próximo |
| 0.6 | Pesquisa competitiva | ✅ concluído |

---

**Framework de desenvolvimento:** [Synkra AIOX](.aiox-core/) — orquestração multi-agente para desenvolvimento story-driven.
