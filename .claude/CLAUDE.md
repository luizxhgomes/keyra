# Synkra AIOX Development Rules for Claude Code

You are working with Synkra AIOX, an AI-Orchestrated System for Full Stack Development.

## REGRA PRIMÁRIA — Idioma e Ortografia (NON-NEGOTIABLE)

**Todo conteúdo criado, editado ou gerado neste diretório DEVE ser escrito em português brasileiro (pt-BR) com ortografia e acentuação corretas.** Esta regra tem precedência sobre qualquer outra diretriz de estilo e aplica-se a TODA ação iniciada neste diretório.

**Escopo de aplicação (tudo sem exceção):**
- Respostas ao usuário no chat
- Comentários e docstrings em código
- Mensagens de commit, PRs, issues e changelogs
- Documentação (`docs/`, `README`, `*.md`), stories, specs, PRDs, epics
- Textos de UI, copy, labels, mensagens de erro, toasts, notificações
- Logs, mensagens de CLI, output de scripts
- Nomes de variáveis semânticas quando fizer sentido (ex.: `mensagemErro`) — mantenha identificadores técnicos consagrados em inglês (APIs, libs, frameworks)

**Requisitos ortográficos (obrigatório):**
- Usar TODOS os diacríticos corretamente: `ã`, `õ`, `á`, `é`, `í`, `ó`, `ú`, `â`, `ê`, `ô`, `à`, `ç`
- NUNCA substituir acentos por ASCII puro (ex.: escrever "não", nunca "nao"; "ação", nunca "acao"; "português", nunca "portugues")
- NUNCA misturar inglês no meio do texto quando houver equivalente natural em pt-BR
- Respeitar crase, hífen e acordo ortográfico vigente (AO1990)
- Concordância verbal e nominal corretas

**Exceções permitidas (mantêm-se em inglês):**
- Identificadores técnicos: nomes de funções, classes, tipos, arquivos, pastas
- Termos consagrados sem tradução natural: `commit`, `branch`, `pull request`, `deploy`, `build`, `endpoint`, `payload`, `schema`, `migration`
- Código-fonte, comandos de terminal, nomes de pacotes
- Citações literais de documentação/erros de ferramentas externas

**Verificação antes de finalizar qualquer saída:** reler o conteúdo produzido e confirmar que todos os acentos estão presentes e a ortografia está correta. Se encontrar qualquer "nao", "esta", "voce", "acao", "portugues" sem acento, CORRIGIR antes de entregar.

<!-- AIOX-MANAGED-START: core-framework -->
## Core Framework Understanding

Synkra AIOX is a meta-framework that orchestrates AI agents to handle complex development workflows. Always recognize and work within this architecture.
<!-- AIOX-MANAGED-END: core-framework -->

<!-- AIOX-MANAGED-START: constitution -->
## Constitution

O AIOX possui uma **Constitution formal** com princípios inegociáveis e gates automáticos.

**Documento completo:** `.aiox-core/constitution.md`

**Princípios fundamentais:**

| Artigo | Princípio | Severidade |
|--------|-----------|------------|
| I | CLI First | NON-NEGOTIABLE |
| II | Agent Authority | NON-NEGOTIABLE |
| III | Story-Driven Development | MUST |
| IV | No Invention | MUST |
| V | Quality First | MUST |
| VI | Absolute Imports | SHOULD |

**Gates automáticos bloqueiam violações.** Consulte a Constitution para detalhes completos.
<!-- AIOX-MANAGED-END: constitution -->

<!-- AIOX-MANAGED-START: sistema-de-agentes -->
## Sistema de Agentes

### Ativação de Agentes
Use `@agent-name` ou `/AIOX:agents:agent-name`:

| Agente | Persona | Escopo Principal |
|--------|---------|------------------|
| `@dev` | Dex | Implementação de código |
| `@qa` | Quinn | Testes e qualidade |
| `@architect` | Aria | Arquitetura e design técnico |
| `@pm` | Morgan | Product Management |
| `@po` | Pax | Product Owner, stories/epics |
| `@sm` | River | Scrum Master |
| `@analyst` | Alex | Pesquisa e análise |
| `@data-engineer` | Dara | Database design |
| `@ux-design-expert` | Uma | UX/UI design |
| `@devops` | Gage | CI/CD, git push (EXCLUSIVO) |

### Comandos de Agentes
Use prefixo `*` para comandos:
- `*help` - Mostrar comandos disponíveis
- `*create-story` - Criar story de desenvolvimento
- `*task {name}` - Executar task específica
- `*exit` - Sair do modo agente
<!-- AIOX-MANAGED-END: sistema-de-agentes -->

<!-- AIOX-MANAGED-START: agent-system -->
## Agent System

### Agent Activation
- Agents are activated with @agent-name syntax: @dev, @qa, @architect, @pm, @po, @sm, @analyst
- The master agent is activated with @aiox-master
- Agent commands use the * prefix: *help, *create-story, *task, *exit

### Agent Context
When an agent is active:
- Follow that agent's specific persona and expertise
- Use the agent's designated workflow patterns
- Maintain the agent's perspective throughout the interaction
<!-- AIOX-MANAGED-END: agent-system -->

<!-- AIOX-MANAGED-START: especialistas-keyra -->
## Especialistas KEYRA

Além dos 10 agentes core do AIOX, o KEYRA mantém **4 especialistas de domínio** em `.aiox-core/development/agents/`. São invocáveis exatamente como os core agents (`@nome` ou `/AIOX:agents:nome`).

| Agente | Persona | Quando invocar | Comandos-chave (verificados) |
|--------|---------|----------------|-------------------------------|
| `@finance-domain-expert` | Valéria | DRE, precificação, margem, custos fixos/variáveis, validação de fórmulas financeiras | `*validate-dre`, `*validate-pricing`, `*pricing-analysis`, `*cost-structure`, `*profit-per-service`, `*review-financial-logic` |
| `@document-processor` | Íris | OCR, parsing de extratos bancários, extratos de maquininhas (Cielo/Rede/Stone), pipelines de reconciliação | `*parse-bank-statement`, `*parse-card-statement`, `*design-ocr-pipeline`, `*reconciliation-flow`, `*extract-transactions` |
| `@compliance-br` | Têmis | LGPD, dados sensíveis (CPF), regras fiscais, NFS-e, retenção, isolamento multitenant | `*lgpd-audit`, `*tax-rules`, `*nf-compliance`, `*data-mapping`, `*pii-inventory`, `*right-to-delete` |
| `@growth-product` | Gaia | Monetização SaaS, tiers de pricing, paywall, onboarding, growth metrics, conversion funnel | `*pricing-tiers`, `*paywall-design`, `*feature-matrix`, `*onboarding-flow`, `*growth-metrics`, `*conversion-funnel`, `*upgrade-triggers` |

### Gates obrigatórios (não-negociáveis)

- **Gate financeiro:** stories que tocam `transactions`, `dre`, `services.price/cost`, `payments`, fórmulas de margem ou DRE por serviço → revisão de `@finance-domain-expert *review-financial-logic` antes do QA gate.
- **Gate de compliance:** stories que tocam dados pessoais (CPF, telefone, email), uploads de extratos, integrações externas com pagamento ou WhatsApp → revisão de `@compliance-br *lgpd-audit` antes do QA gate.
- **Gate de growth:** stories que tocam paywall, gating de feature, tiers, onboarding, billing → revisão de `@growth-product *review-growth` antes do QA gate.

Esses gates são **adicionais** ao QA gate normal de Quinn (`@qa`) — não o substituem.
<!-- AIOX-MANAGED-END: especialistas-keyra -->

<!-- AIOX-MANAGED-START: squads -->
## Squads — Composições pré-configuradas

O diretório `squads/` agrega 5 squads (cada um com `squad.yaml`, agentes, workflows, tasks, templates, checklists e config próprios). Disparar via `@aiox-master *workflow {nome-do-workflow-yaml-sem-extensao}`.

| Squad | Fase KEYRA | Status atual | Workflow principal | Composição |
|-------|-----------|--------------|--------------------|------------|
| `squad-keyra-bootstrap` | Fase 0 (planejamento) | ✅ Cumprido — referência arquivada | `keyra-fase-0` | pm + architect + data-engineer + analyst + ux-design-expert + finance + document + compliance |
| `squad-keyra-core` | Fases 2-4 (MVP) | ✅ MVP feature-complete; reativar em refactors core | `keyra-sdc-com-gate-financeiro` | sm + po + dev + data-engineer + qa + devops + finance + compliance |
| `squad-keyra-integrations` | Fase 7 (Asaas, WhatsApp, NFS-e, OCR de PDFs) | 🔮 Pós-MVP — ativar quando começar Asaas/PIX | `keyra-integracoes-spec-sdc` | sm + po + dev + qa + devops + architect + document + finance + compliance |
| `squad-keyra-intelligence` | Fases 5-6 (motor de precificação, projeções, what-if) | 🔮 Pós-MVP — ativar quando começar precificação inteligente | `keyra-inteligencia-spec-sdc` | sm + po + dev + qa + devops + architect + data-engineer + finance |
| `deep-research` | Genérico (qualquer projeto) | 🟢 Em uso ativo (Trinks, Belle, Gestek em `docs/research/`) | `deep-research-pipeline` + `strategic-research-pipeline` | research-lead + source-analyst + strategy-analyst + synthesis-writer (próprios do squad) |

Cada squad tem `README.md` com missão, entregáveis e instruções de uso. **Leia antes de modificar.**

### Gatilhos → Squad/Agente (mapeamento prático)

| Gatilho na conversa | Recurso | Como invocar |
|---------------------|---------|--------------|
| "pesquisar concorrente" / "benchmark" | deep-research | `/deep-research:research-lead` então `*benchmark` |
| "engenharia reversa de site/produto" | deep-research | `/deep-research:research-lead` então `*reverse-engineer` |
| "validar DRE / precificação / margem" | Valéria | `@finance-domain-expert *validate-dre` |
| "auditar LGPD / dados sensíveis / CPF" | Têmis | `@compliance-br *lgpd-audit` |
| "regras fiscais / NFS-e / regime tributário" | Têmis | `@compliance-br *tax-rules` ou `*nf-compliance` |
| "parsear extrato bancário/PDF" | Íris | `@document-processor *parse-bank-statement` |
| "começar Fase 7 (integrações)" | squad-keyra-integrations | `@aiox-master *workflow keyra-integracoes-spec-sdc` |
| "começar Fases 5-6 (inteligência)" | squad-keyra-intelligence | `@aiox-master *workflow keyra-inteligencia-spec-sdc` |
| "story financeira touch DRE/preço" | SDC + gate financeiro | `@aiox-master *workflow keyra-sdc-com-gate-financeiro` |
<!-- AIOX-MANAGED-END: squads -->

<!-- AIOX-MANAGED-START: deep-research-squad -->
## Squad deep-research — Pesquisa profissional

4 agentes próprios em `squads/deep-research/agents/`, com comandos slash já registrados em `.claude/commands/deep-research/`. Invocáveis via `/deep-research:{agent-name}`.

| Agente | Comandos-chave | Quando usar |
|--------|----------------|-------------|
| `🔬 research-lead` | `*research`, `*scope`, `*consolidate`, `*benchmark`, `*strategies`, `*sales-strategy`, `*positioning`, `*reverse-engineer`, `*full-strategic` | Coordenar qualquer pesquisa multi-fonte |
| `🔍 source-analyst` | `*search`, `*validate`, `*triangulate`, `*validate-benchmark`, `*validate-strategy` | Validar credibilidade e triangular fontes |
| `📐 strategy-analyst` | `*benchmark`, `*strategies`, `*sales-strategy`, `*positioning`, `*reverse-engineer` | Análise estratégica (Porter, Blue Ocean, Wardley, Business Model Canvas) |
| `📝 synthesis-writer` | `*synthesize`, `*summarize`, `*recommend`, `*write-benchmark`, `*write-catalog`, `*write-playbook` | Gerar reports estruturados a partir dos templates do squad |

### Modos do `strategic-research-pipeline`

`benchmark` · `strategy-collection` · `sales-analysis` · `positioning-analysis` · `reverse-engineering` · `full`

### Outputs

`docs/research/` (organizado por tipo: `benchmarks/`, `strategies/`, `sales/`, `positioning/`, `reverse-engineering/`, `reports/`, `validated-findings/`).

**Use no lugar de Web fetch ad-hoc** para qualquer decisão estratégica/competitiva — garante triangulação de fontes, validação por source-analyst e report estruturado.
<!-- AIOX-MANAGED-END: deep-research-squad -->

## Development Methodology

### Story-Driven Development
1. **Work from stories** - All development starts with a story in `docs/stories/`
2. **Update progress** - Mark checkboxes as tasks complete: [ ] → [x]
3. **Track changes** - Maintain the File List section in the story
4. **Follow criteria** - Implement exactly what the acceptance criteria specify

### Code Standards
- Write clean, self-documenting code
- Follow existing patterns in the codebase
- Include comprehensive error handling
- Add unit tests for all new functionality
- Use TypeScript/JavaScript best practices

### Testing Requirements
- Run all tests before marking tasks complete
- Ensure linting passes: `npm run lint`
- Verify type checking: `npm run typecheck`
- Add tests for new features
- Test edge cases and error scenarios

<!-- AIOX-MANAGED-START: framework-structure -->
## AIOX Framework Structure

```
aiox-core/
├── agents/         # Agent persona definitions (YAML/Markdown)
├── tasks/          # Executable task workflows
├── workflows/      # Multi-step workflow definitions
├── templates/      # Document and code templates
├── checklists/     # Validation and review checklists
└── rules/          # Framework rules and patterns

docs/
├── stories/        # Development stories (numbered)
├── prd/            # Product requirement documents
├── architecture/   # System architecture documentation
└── guides/         # User and developer guides
```
<!-- AIOX-MANAGED-END: framework-structure -->

<!-- AIOX-MANAGED-START: framework-boundary -->
## Framework vs Project Boundary

O AIOX usa um modelo de 4 camadas (L1-L4) para separar artefatos do framework e do projeto. Deny rules em `.claude/settings.json` reforçam isso deterministicamente.

| Camada | Mutabilidade | Paths | Notas |
|--------|-------------|-------|-------|
| **L1** Framework Core | NEVER modify | `.aiox-core/core/`, `.aiox-core/constitution.md`, `bin/aiox.js`, `bin/aiox-init.js` | Protegido por deny rules |
| **L2** Framework Templates | NEVER modify | `.aiox-core/development/tasks/`, `.aiox-core/development/templates/`, `.aiox-core/development/checklists/`, `.aiox-core/development/workflows/`, `.aiox-core/infrastructure/` | Extend-only |
| **L3** Project Config | Mutable (exceptions) | `.aiox-core/data/`, `agents/*/MEMORY.md`, `core-config.yaml` | Allow rules permitem |
| **L4** Project Runtime | ALWAYS modify | `docs/stories/`, `packages/`, `squads/`, `tests/` | Trabalho do projeto |

**Toggle:** `core-config.yaml` → `boundary.frameworkProtection: true/false` controla se deny rules são ativas (default: true para projetos, false para contribuidores do framework).

> **Referência formal:** `.claude/settings.json` (deny/allow rules), `.claude/rules/agent-authority.md`
<!-- AIOX-MANAGED-END: framework-boundary -->

<!-- AIOX-MANAGED-START: rules-system -->
## Rules System

O AIOX carrega regras contextuais de `.claude/rules/` automaticamente. Regras com frontmatter `paths:` só carregam quando arquivos correspondentes são editados.

| Rule File | Description |
|-----------|-------------|
| `agent-authority.md` | Agent delegation matrix and exclusive operations |
| `agent-handoff.md` | Agent switch compaction protocol for context optimization |
| `agent-memory-imports.md` | Agent memory lifecycle and CLAUDE.md ownership |
| `coderabbit-integration.md` | Automated code review integration rules |
| `ids-principles.md` | Incremental Development System principles |
| `mcp-usage.md` | MCP server usage rules and tool selection priority |
| `story-lifecycle.md` | Story status transitions and quality gates |
| `workflow-execution.md` | 4 primary workflows (SDC, QA Loop, Spec Pipeline, Brownfield) |

> **Diretório:** `.claude/rules/` — rules são carregadas automaticamente pelo Claude Code quando relevantes.

## RSC Boundary Rules — LEITURA OBRIGATÓRIA antes de Done

**Documento:** [`docs/dev/rsc-boundary-rules.md`](../docs/dev/rsc-boundary-rules.md)

Origem: 2026-05-02. Dashboard ficou completamente quebrado em produção por mais de 1 hora apesar das Sprints 5/6/7 terem fechado "Done" com deploys READY. Bugs `digest 3213099672` (forwardRef cruzando Server↔Client) e hidratação inconsistente (`useSyncExternalStore`) NÃO foram pegos por TypeScript, ESLint, build, nem QA gate — só apareceram quando a idealizadora abriu produção autenticada.

**4 regras inegociáveis:**

1. **Nunca passar `forwardRef`** (Lucide icons, shadcn/ui Card/Button) **como prop através da fronteira Server↔Client**
2. **Client Component não pode importar Server Component diretamente**
3. **`useSyncExternalStore` proibido nesta codebase** (instabilidade SSR Next 16) — usar `useState + useEffect + queueMicrotask`
4. **Build verde NÃO é funcional** — smoke test ponta-a-ponta com idealizadora em mobile real é critério de Done não negociável

**Auditoria automatizada:** `scripts/check-rsc-boundaries.sh` roda em CI (workflow `rls-tests.yml` job `rsc-audit`). PR não merge se falhar.

**Aplicabilidade:** qualquer agente AIOX que toque `apps/web/src/app/(app)/**`, `'use client'` boundary, `components/keyra/**`, `lib/hooks/**`, `lib/motion/**`, ou Server Action consumida por Client.

Antes de marcar story Done: ler `docs/dev/rsc-boundary-rules.md` (4 regras + checklist de PR + histórico de violações). Sem essa validação, story volta com NO-GO retroativo.
<!-- AIOX-MANAGED-END: rules-system -->

<!-- AIOX-MANAGED-START: code-intelligence -->
## Code Intelligence

O AIOX possui um sistema de code intelligence opcional que enriquece operações com dados de análise de código.

| Status | Descrição | Comportamento |
|--------|-----------|---------------|
| **Configured** | Provider ativo e funcional | Enrichment completo disponível |
| **Fallback** | Provider indisponível | Sistema opera normalmente sem enrichment — graceful degradation |
| **Disabled** | Nenhum provider configurado | Funcionalidade de code-intel ignorada silenciosamente |

**Graceful Fallback:** Code intelligence é sempre opcional. `isCodeIntelAvailable()` verifica disponibilidade antes de qualquer operação. Se indisponível, o sistema retorna o resultado base sem modificação — nunca falha.

**Diagnóstico:** `aiox doctor` inclui check de code-intel provider status.

> **Referência:** `.aiox-core/core/code-intel/` — provider interface, enricher, client
<!-- AIOX-MANAGED-END: code-intelligence -->

<!-- AIOX-MANAGED-START: graph-dashboard -->
## Graph Dashboard

O CLI `aiox graph` visualiza dependências, estatísticas de entidades e status de providers.

### Comandos

```bash
aiox graph --deps                        # Dependency tree (ASCII)
aiox graph --deps --format=json          # Output como JSON
aiox graph --deps --format=html          # Interactive HTML (abre browser)
aiox graph --deps --format=mermaid       # Mermaid diagram
aiox graph --deps --format=dot           # DOT format (Graphviz)
aiox graph --deps --watch                # Live mode com auto-refresh
aiox graph --deps --watch --interval=10  # Refresh a cada 10 segundos
aiox graph --stats                       # Entity stats e cache metrics
```

**Formatos de saída:** ascii (default), json, dot, mermaid, html

> **Referência:** `.aiox-core/core/graph-dashboard/` — CLI, renderers, data sources
<!-- AIOX-MANAGED-END: graph-dashboard -->

## Workflow Execution

### Task Execution Pattern
1. Read the complete task/workflow definition
2. Understand all elicitation points
3. Execute steps sequentially
4. Handle errors gracefully
5. Provide clear feedback

### Interactive Workflows
- Workflows with `elicit: true` require user input
- Present options clearly
- Validate user responses
- Provide helpful defaults

## Best Practices

### When implementing features:
- Check existing patterns first
- Reuse components and utilities
- Follow naming conventions
- Keep functions focused and testable
- Document complex logic

### When working with agents:
- Respect agent boundaries
- Use appropriate agent for each task
- Follow agent communication patterns
- Maintain agent context

### When handling errors:
```javascript
try {
  // Operation
} catch (error) {
  console.error(`Error in ${operation}:`, error);
  // Provide helpful error message
  throw new Error(`Failed to ${operation}: ${error.message}`);
}
```

## Git & GitHub Integration

### Commit Conventions
- Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, etc.
- Reference story ID: `feat: implement IDE detection [Story 2.1]`
- Keep commits atomic and focused

### GitHub CLI Usage
- Ensure authenticated: `gh auth status`
- Use for PR creation: `gh pr create`
- Check org access: `gh api user/memberships`

<!-- AIOX-MANAGED-START: aiox-patterns -->
## AIOX-Specific Patterns

### Working with Templates
```javascript
const template = await loadTemplate('template-name');
const rendered = await renderTemplate(template, context);
```

### Agent Command Handling
```javascript
if (command.startsWith('*')) {
  const agentCommand = command.substring(1);
  await executeAgentCommand(agentCommand, args);
}
```

### Story Updates
```javascript
// Update story progress
const story = await loadStory(storyId);
story.updateTask(taskId, { status: 'completed' });
await story.save();
```
<!-- AIOX-MANAGED-END: aiox-patterns -->

## Environment Setup

### Required Tools
- Node.js 18+
- GitHub CLI
- Git
- Your preferred package manager (npm/yarn/pnpm)

### Configuration Files
- `.aiox/config.yaml` - Framework configuration
- `.env` - Environment variables
- `aiox.config.js` - Project-specific settings

<!-- AIOX-MANAGED-START: common-commands -->
## Common Commands

### AIOX Master Commands
- `*help` - Show available commands
- `*create-story` - Create new story
- `*task {name}` - Execute specific task
- `*workflow {name}` - Run workflow

### Development Commands
- `npm run dev` - Start development
- `npm test` - Run tests
- `npm run lint` - Check code style
- `npm run build` - Build project
<!-- AIOX-MANAGED-END: common-commands -->

## Debugging

### Enable Debug Mode
```bash
export AIOX_DEBUG=true
```

### View Agent Logs
```bash
tail -f .aiox/logs/agent.log
```

### Trace Workflow Execution
```bash
npm run trace -- workflow-name
```

## Claude Code Specific Configuration

### Performance Optimization
- Prefer batched tool calls when possible for better performance
- Use parallel execution for independent operations
- Cache frequently accessed data in memory during sessions

### Tool Usage Guidelines
- Always use the Grep tool for searching, never `grep` or `rg` in bash
- Use the Task tool for complex multi-step operations
- Batch file reads/writes when processing multiple files
- Prefer editing existing files over creating new ones

### Session Management
- Track story progress throughout the session
- Update checkboxes immediately after completing tasks
- Maintain context of the current story being worked on
- Save important state before long-running operations

### Error Recovery
- Always provide recovery suggestions for failures
- Include error context in messages to user
- Suggest rollback procedures when appropriate
- Document any manual fixes required

### Testing Strategy
- Run tests incrementally during development
- Always verify lint and typecheck before marking complete
- Test edge cases for each new feature
- Document test scenarios in story files

### Documentation
- Update relevant docs when changing functionality
- Include code examples in documentation
- Keep README synchronized with actual behavior
- Document breaking changes prominently

---
*Synkra AIOX Claude Code Configuration v2.0*
