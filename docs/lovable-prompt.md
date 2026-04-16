# Prompt para o Lovable — KEYRA

> **Como usar:** copie tudo abaixo da linha "=== INÍCIO DO PROMPT ===" até "=== FIM DO PROMPT ===" e cole no Lovable como prompt inicial. Antes, configure no Lovable as variáveis de ambiente Supabase (passo na seção "Configuração no Lovable").

---

## Configuração no Lovable (antes de colar o prompt)

No Lovable, conecte o Supabase via **Project Settings → Integrations → Supabase**:

| Campo | Valor |
|-------|-------|
| Supabase URL | `https://oapdfhivzojyahvphebs.supabase.co` |
| Anon (public) key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hcGRmaGl2em9qeWFodnBoZWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNTA5MDksImV4cCI6MjA5MTkyNjkwOX0.Mn-gIkRzotTgnvmvV2WO2aCPsASYPf8Gp5Jg7n9MqPo` |
| Publishable key (alternativa nova) | `sb_publishable_FWMGOgbZgarjkeLtD_OUnw_YqtDNoLn` |

**NUNCA cole no Lovable:** `service_role` key, `secret` key ou senha do banco. O Lovable só precisa da chave anon/publishable (cliente).

---

=== INÍCIO DO PROMPT ===

# KEYRA — primeiro financeiro operacional para estética

Construa o KEYRA: um SaaS web responsivo onde profissionais de estética administram **agenda, atendimentos, financeiro e dashboard de lucro**, com a premissa de que **o financeiro é gerado AUTOMATICAMENTE pela operação** (não alimentado manualmente como ERPs tradicionais).

**Posicionamento:** "O primeiro financeiro operacional para estética."
**Idealizadora:** mentora financeira para profissionais de estética. O KEYRA suporta o trabalho dela com clientes não-financistas.
**Fluxo central inquebrável:** Serviço → Agenda → Comanda → Transação → DRE → Decisão.

---

## 1. Stack obrigatória

- **React 18 + TypeScript estrito** (sem `any`)
- **Vite** (Lovable padrão)
- **Tailwind CSS v4** + **shadcn/ui** (componentes copiados, não dependência de UI library fechada)
- **Supabase JS client v2** (`@supabase/supabase-js`) — backend já provisionado
- **TanStack Query v5** para fetching/cache
- **react-hook-form + Zod** para todos os formulários
- **date-fns** com locale **pt-BR** (NÃO Moment, NÃO Day.js)
- **Decimal.js** para QUALQUER cálculo monetário (NUNCA `Number()` em valores R$)
- **FullCalendar React** (`@fullcalendar/react`, `@fullcalendar/daygrid`, `@fullcalendar/timegrid`, `@fullcalendar/interaction`) para agenda
- **Recharts** apenas para 1 gráfico no sistema (dashboard)
- **lucide-react** para ícones

---

## 2. Princípios UX **INEGOCIÁVEIS** (a idealizadora rejeita o produto se violados)

1. **Números absolutos, NÃO gráficos.** "As pessoas não sabem ler gráficos." Máximo 1 gráfico em todo o sistema (dashboard, receita vs despesa 6 meses).
2. **Comparativos textuais.** Sempre escreva: "R$ 2.300 a mais que março" — nunca uma barra colorida comparativa.
3. **Dashboard de tela única.** Sem scroll vertical no desktop (1366×768). Mobile aceita scroll desde que os 4 KPIs principais + "hoje na agenda" fiquem acima da dobra.
4. **Simplicidade.** A usuária não é financista. Vocabulário coloquial: "Dinheiro que entrou", "Sobrou", "A receber" — não "Receita bruta", "EBITDA", "Contas a receber".
5. **ZERO AZUL como cor primária.** Estética/bem-estar pede tons quentes/orgânicos.

---

## 3. Design System

### Paleta (definida)

| Token | Hex | Uso |
|-------|-----|-----|
| `primary` (terracota) | `#C66A38` | CTAs, links, ícones ativos |
| `primary-foreground` | `#FFFFFF` | Texto sobre primary |
| `accent` (sálvia) | `#8FA68E` | Tags secundárias, success states sutis |
| `background` | `#FAFAF7` (off-white quente) | Fundo principal |
| `foreground` | `#1A1714` (quase preto morno) | Texto principal |
| `muted` | `#F0EDE8` | Cards secundários, separadores |
| `muted-foreground` | `#6B655F` | Texto secundário, labels |
| `border` | `#E8E3DC` | Bordas |
| `success` | `#5C8A5C` | Status "realizado", "pago" |
| `warning` | `#D4A04A` | Estoque baixo, faltas |
| `destructive` | `#B84545` | Cancelamento, exclusão (terracota escuro, NÃO vermelho puro) |

### Tipografia
- Família única: **Inter** (Google Fonts), variable.
- Escala: `text-5xl` (KPI grande, 48px) / `text-3xl` (titulos página) / `text-xl` (titulos card) / `text-base` (corpo) / `text-sm` (labels) / `text-xs` (metadados).
- Pesos: 400 (corpo), 500 (labels), 600 (títulos), 700 (KPIs grandes).

### Espaçamento
- Sistema 4/8: padding interno padrão `p-4` (16px) ou `p-6` (24px) em cards.
- Gap entre cards: `gap-4` mobile, `gap-6` desktop.
- Containers: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.

### Componentes shadcn/ui necessários (instalar via `npx shadcn@latest add`)
button, card, input, label, select, dialog, sheet, dropdown-menu, avatar, badge, tabs, table, form, toast (sonner), tooltip, separator, scroll-area, skeleton, switch, popover, calendar, command, alert.

### Componentes canônicos KEYRA (criar em `components/keyra/`)
- **`KPICard`** — número grande absoluto + label + comparativo textual (opcional ícone trend)
- **`ComparativoTexto`** — formata "R$ 2.300 a mais que março" / "↓ R$ 800 que março" / "no mesmo nível de março"
- **`AlertCard`** — severidade (info/warning/critical) + mensagem + ação opcional
- **`AgendamentoCard`** — paciente · serviço · profissional · status badge · horário
- **`ComandaItem`** — serviço/insumo · qtd · valor · trash
- **`StatusBadge`** — agendado | realizado | cancelado | falta | pago | aberto | finalizado
- **`DataTable`** — TanStack Table headless + shadcn Table
- **`MoneyInput`** — input máscara R$ com Decimal.js por baixo
- **`EmptyState`** — ilustração SVG simples + heading + ação principal
- **`Skeleton`** loading variants para KPI, lista, tabela

---

## 4. Conexão Supabase (já provisionado)

Backend já está pronto. **Não criar tabelas no Lovable** — apenas consumir as 21 existentes.

### Setup do client
Criar `src/lib/supabase.ts`:
```ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!
)
```

### Tipos TypeScript (gerar com supabase-cli)
```bash
npx supabase gen types typescript --project-id oapdfhivzojyahvphebs > src/lib/database.types.ts
```

### Auth
- Login por **email + magic link** (Supabase Auth `signInWithOtp`)
- Sem MFA no MVP
- JWT recebe claim custom `org_id` (Auth Hook ativado no projeto)

### Multi-tenancy
- Toda query usa o cliente padrão; **RLS no Supabase filtra automaticamente por `org_id`**
- Não passar `org_id` manualmente nas queries — o JWT já carrega
- Para trocar de organização (multi-org): atualizar `user_preferences.active_org_id` e re-autenticar (refreshSession)

---

## 5. Schema do banco (resumo das 21 tabelas — RLS ativa em todas)

### Tenancy
- `organizations` (tenant root) — id, name, slug, plan (trial/start/crescimento/autoridade), trial_ends_at
- `memberships` — user_id, org_id, role (owner/admin/professional/viewer)
- `organization_invites` — convites por email (token único)
- `user_preferences` — active_org_id, onboarding_done

### Catálogo
- `professionals` — name, email, default_commission_rate, color
- `customers` — name, email, phone, cpf (encrypted), birth_date, notes
- `service_categories` — name, color, sort_order
- `services` — name, category_id, price, unit_cost, duration_minutes, commission_rate
- `supplies` — name, sku, current_stock, min_stock, unit_cost
- `service_supplies` — service_id × supply_id × quantity (rateio)

### Agenda
- `appointments` — customer_id, service_id, professional_id, starts_at, ends_at, status (scheduled/done/cancelled/no_show), price_snapshot, commission_snapshot
  - **EXCLUDE constraint** já impede double-booking do mesmo profissional
  - **Trigger:** mudar status para `done` cria automaticamente `command` + `command_items`

### Operação financeira
- `commands` (comanda) — appointment_id, customer_id, professional_id, status (open/finalized/paid/cancelled), subtotal, discount_amount, total, paid_amount
- `command_items` — service_id, quantity, unit_price, unit_cost (snapshots imutáveis), commission_rate
- `accounts` — contas bancárias/caixa (name, type, opening_balance)
- `expense_categories` — kind (revenue/expense_fixed/expense_variable), name (plano de contas)
- `payment_methods` — Pix/cartão crédito/cartão débito/dinheiro (com fee_percent)
- `goals` — metas mensais/anuais
- `transactions` — direction (credit/debit), gross/fee/net, expense_category_id, professional_id
  - **Trigger:** insert em `payments` cria `transaction` automaticamente
- `payments` — gross_amount, fee_amount, net_amount, payment_method_id, account_id, paid_at
- `inventory_movements` — append-only ledger de estoque (auto-baixa quando comanda é paga)

### Compliance
- `audit_log` — append-only, todas as mutações registradas

### Views prontas para o dashboard (SELECT direto, sem joins manuais)
- `v_dashboard_kpis` — KPIs do mês corrente (faturamento, despesas, lucro, ticket médio)
- `v_dre_monthly` — DRE básica por mês
- `v_dre_by_service` — **DIFERENCIAL vs Conta Azul** — lucro por serviço
- `v_dre_by_professional` — lucro por profissional
- `v_cashflow_daily` — fluxo de caixa diário
- `v_receitas_previstas` — soma de `appointments.price_snapshot` onde status=scheduled

---

## 6. Telas a criar (priorizadas)

### A) Auth & Onboarding
1. **`/login`** — email + botão "Receber link mágico"; toast de confirmação; redirect para dashboard ou onboarding
2. **`/onboarding/nova-organizacao`** — form 1 step: nome da clínica + (opcional) CNPJ → `INSERT organizations + memberships(role=owner)` + `UPDATE user_preferences.active_org_id`
3. **`/onboarding/aceitar-convite/[token]`** — exibe org + role; aceitar = INSERT membership

### B) Layout app autenticado
- Sidebar fixa 240px no desktop (logo, nav, user menu no rodapé)
- Bottom nav 5 itens no mobile (Dashboard, Agenda, Pacientes, Financeiro, Mais)
- FAB contextual no mobile (ex: "+ Agendar" na tela Agenda)
- Header com switcher de organização (se user tem >1 org)

### C) Dashboard `/` (a tela mais importante)

**Layout grid 12 colunas desktop, 1 coluna mobile:**

```
┌──────────────────────────────────────────────────────────┐
│ KEYRA  ▾ Clínica Bella       Camila Silva ▾   ⚙        │  Header
├──────────────────────────────────────────────────────────┤
│ DINHEIRO QUE ENTROU NESTE MÊS                            │
│ R$ 24.750,00       text-5xl bold                         │  KPI principal
│ ↑ R$ 2.300 a mais que março                              │  ComparativoTexto
│                                                          │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│ │ DESPESAS │  │  SOBROU  │  │A RECEBER │                │  3 KPICards
│ │ R$ 9.120 │  │ R$ 15.6K │  │ R$ 8.450 │                │
│ │ R$ 800↓  │  │ R$ 1.500↑│  │ — março  │                │
│ └──────────┘  └──────────┘  └──────────┘                │
│                                                          │
│ ┌─────────────────────┐  ┌─────────────────────────────┐│
│ │ HOJE NA AGENDA      │  │ ALERTAS                     ││
│ │ • 09:00 Maria Limp. │  │ ⚠ 3 faltas esta semana     ││
│ │ • 11:00 João Botox  │  │ ⚠ Estoque baixo: ácido hi. ││
│ │ • 14:30 Ana Massagem│  │ ⚠ Margem do mês: 23% (↓ 5%)││
│ │ + 4 atendimentos    │  └─────────────────────────────┘│
│ └─────────────────────┘                                  │
│                                                          │
│ ┌─────────────────────┐  ┌─────────────────────────────┐│
│ │ INDICADORES         │  │ RECEITA × DESPESA (6 meses) ││
│ │ Ticket médio R$ 245 │  │  ▌▌▌▌▌▌  ← único gráfico    ││
│ │ Top serviço Botox   │  │  permitido em todo o sistema││
│ │ Comparec. 87%       │  └─────────────────────────────┘│
│ └─────────────────────┘                                  │
└──────────────────────────────────────────────────────────┘
```

**Dados:** consumir `v_dashboard_kpis`, `v_dre_monthly` (últimos 6 meses), `appointments` filtro hoje, `v_receitas_previstas`. Comparativo textual derivar 2 meses de `v_dre_monthly`.

**Empty state:** se `v_dashboard_kpis` retorna 0 em tudo → wizard "vamos cadastrar seu primeiro serviço" (CTA para `/servicos/novo`), SEM mostrar "R$ 0,00" frio.

### D) Agenda `/agenda`
- FullCalendar com views `dayGridMonth`, `timeGridWeek`, `timeGridDay` (default no mobile = `timeGridDay`)
- Eventos = `appointments` com cor por `professional.color`
- Click vazio → modal "Novo agendamento" (paciente + serviço + profissional + horário)
- Click evento → drawer lateral com detalhes + ações: Confirmar, **Marcar Realizado** (este botão **redireciona para a comanda** auto-criada), Cancelar, Marcar Falta
- Mostrar `price_snapshot` por agendamento + total de receita prevista do dia/semana no header

### E) Pacientes `/pacientes`
- Listagem com busca (`pg_trgm` no nome/email/CPF), ordenação, paginação
- Linha clicável → `/pacientes/[id]` com tabs: Dados / Histórico (appointments + commands) / Financeiro (LTV, ticket médio)
- Form CRUD com Zod (CPF opcional com validação dígitos verificadores)

### F) Serviços `/servicos`
- Listagem agrupada por `service_category`
- Form com: nome, categoria, preço, custo unitário, duração, comissão (default), insumos (multi-select de `supplies` com quantidade)

### G) Estoque `/estoque`
- Listagem de `supplies` com `current_stock`, `min_stock`, badge se abaixo do mínimo
- Form para entrada manual de estoque (insere `inventory_movement` tipo `purchase`)

### H) Comanda `/comandas/[id]`
- Detalhes da comanda (auto-criada pela trigger ao marcar agendamento como realizado)
- Lista de itens (do `command_items`) — permite adicionar mais itens (extras, insumos)
- Bloco de pagamento: forma (chips grandes Pix/cartão/dinheiro) + valor + botão "Registrar pagamento" → INSERT em `payments` (a trigger cria a transaction)
- Após pagamento, atualizar status para `paid` e mostrar lucro líquido (`total - sum(unit_cost * quantity)`)

### I) Financeiro `/financeiro`
- Tabs: Movimentações / DRE / Fluxo de Caixa
- **Movimentações:** DataTable com filtros (período, conta, categoria, profissional)
- **DRE:** consumir `v_dre_monthly`, `v_dre_by_service` (ver lucro por serviço — diferencial), `v_dre_by_professional`
- **Fluxo de Caixa:** `v_cashflow_daily`
- Botão "+ Nova despesa" abre form (insert `transactions` direction=debit)

### J) Configurações `/config`
- Tabs: Organização (nome, CNPJ, fuso) / Equipe (memberships + convidar) / Contas (bancos) / Plano de contas (`expense_categories`) / Métodos de pagamento

---

## 7. Fluxos críticos (testar end-to-end)

### Fluxo "Atendimento completo" (a essência do produto)
1. Usuária agenda Maria para "Limpeza de pele" com profissional Carla amanhã 09h
2. Sistema cria `appointment` com `price_snapshot=R$ 150` (receita prevista atualiza)
3. Amanhã 10h, usuária marca como **Realizado**
4. Trigger Postgres cria `command` + `command_item` automaticamente
5. UI redireciona para a comanda
6. Usuária registra pagamento R$ 150 em Pix
7. Trigger cria `transaction` (credit) + atualiza command para `paid` + cria `inventory_movement` rateando insumos
8. Dashboard atualiza: faturamento +R$ 150, lucro +R$ 110 (descontando custo)

**Tempo do passo 1 ao 8:** ≤ 90 segundos. Esta é a métrica norte (TTFL — Time To First Lucro).

### Fluxo "Despesa manual"
1. Usuária vai em Financeiro → "+ Nova despesa"
2. Categoria "Aluguel" (já no plano de contas pré-configurado), R$ 2.500, conta bancária
3. INSERT em `transactions` direction=debit
4. Dashboard atualiza despesas e lucro

---

## 8. Bibliotecas auxiliares específicas

- **`@hookform/resolvers/zod`** — integrar Zod com react-hook-form
- **`react-input-mask`** — máscara CPF/telefone
- **`sonner`** — toasts (já vem com shadcn)
- **`react-day-picker`** — date picker (vem com shadcn calendar)
- **`@tanstack/react-table`** — tabelas

---

## 9. Padrões de código

- **Cada query Supabase** isolada em `src/services/[entidade].ts` exportando funções tipadas
- **Cada formulário** usa schema Zod compartilhado em `src/schemas/[entidade].ts`
- **Toda lógica monetária** usa `Decimal.js` — converter na borda (input → string → Decimal → calcula → toFixed(2))
- **Toda data** formatada com `date-fns` locale pt-BR (`format(date, "dd 'de' MMMM", { locale: ptBR })`)
- **Acessibilidade WCAG AA**: contraste mínimo 4.5:1, foco visível, ARIA labels em ícones, navegação por teclado em modais
- **Loading states obrigatórios**: skeleton ou spinner em todo fetch
- **Error boundaries** em rotas principais
- **Sem `any`** em TypeScript — usar tipos gerados do Supabase

---

## 10. PROIBIÇÕES (rejeitar se aparecer)

- ❌ Criar mais de 1 gráfico (apenas o do dashboard)
- ❌ Usar `Number()` ou `parseFloat()` para valores monetários
- ❌ Usar azul (#06B6D4, #3B82F6 etc) como cor primária ou de destaque
- ❌ Mostrar "R$ 0,00" sem contexto — sempre empty state com call-to-action
- ❌ Termos contábeis (EBITDA, DRE pode mas explicar, "Receita Bruta") — preferir coloquial
- ❌ Modal sem fechar com ESC e click fora
- ❌ Formulário sem validação Zod
- ❌ Query Supabase sem error handling
- ❌ Inserir `org_id` manualmente em queries (RLS faz isso)
- ❌ Usar service_role key no client (apenas anon/publishable)

---

## 11. Documentos de referência

> Estes documentos vivem no repositório privado `github.com/luizxhgomes/keyra` mas o conteúdo principal já está sintetizado neste prompt. Se o Lovable suportar URLs externas, eu compartilho links públicos sob demanda.

- **PRD completo** (66 FRs + 27 NFRs + 27 CONs): rastreabilidade ao espírito do produto
- **ARCHITECTURE.md** (20 ADRs): decisões técnicas detalhadas
- **SCHEMA.md**: documentação detalhada das 21 tabelas e relações
- **wireframes/** (8 docs ASCII): wireframes detalhados de cada tela com anotações de hierarquia visual e estados
- **IMPLEMENTATION-MAP.md**: matriz feature × tela × tabela × ADR × story × status

Se algo neste prompt for ambíguo, **prefira:**
1. A simplicidade ao recurso brilhante
2. O número absoluto ao gráfico
3. O fluxo automatizado ao botão a mais
4. A consistência com shadcn/ui ao componente custom

---

## 12. Entregável esperado

Um app React+Vite+TS funcional onde, ao colar as credenciais Supabase no `.env`:
1. Login com email + magic link funciona
2. Onboarding cria 1ª organização
3. Cadastros (pacientes, serviços, insumos) funcionais
4. Agenda visual em dia/semana/mês com criação de agendamento
5. Marcar agendamento como "Realizado" abre a comanda automaticamente
6. Registrar pagamento na comanda atualiza dashboard em <1s
7. Dashboard de tela única com KPIs em números absolutos + comparativos textuais

**Critério de aceite:** o fluxo "agendar Maria → marcar realizado → pagar → ver lucro no dashboard" funciona em ≤ 90 segundos pela primeira vez. Esta é a NorthStar metric do produto (TTFL — Time To First Lucro).

---

**Ordem de construção sugerida (sprints curtos):**

1. Auth + Onboarding + layout autenticado (sidebar/bottom-nav)
2. Cadastros (pacientes → serviços → insumos)
3. Agenda + agendamento
4. Comanda automática + pagamento
5. Dashboard tela única
6. Financeiro (movimentações + DRE + fluxo)
7. Configurações + multi-org

Construa primeiro o esqueleto navegável de tudo, depois preencha cada tela com funcionalidade real. Mantenha skeleton loaders enquanto Supabase responde.

=== FIM DO PROMPT ===

---

## Após o Lovable gerar o app

1. **Conectar repositório:** Lovable permite "Connect to GitHub" — apontar para `luizxhgomes/keyra` (ou para um novo branch tipo `lovable-prototype`)
2. **Comparar com nossa stack:** o código gerado será Vite+React; nossa decisão arquitetural era Next.js 16 (ADR-001). Decidir:
   - (a) Manter Vite+React como protótipo visual e portar para Next.js 16 depois (recomendado se Lovable acelerou MUITO o design)
   - (b) Adotar Vite+React revisando ADR-001 (perde RSC + Server Actions, mas ganha simplicidade)
3. **Type generation:** rodar `npx supabase gen types typescript --project-id oapdfhivzojyahvphebs > src/lib/database.types.ts` para ter tipos das 21 tabelas
4. **Validar princípios UX:** abrir cada tela e checar contra os 5 princípios inegociáveis (zero gráfico exceto dashboard, comparativo textual, etc.)
5. **Testar fluxo norte:** agendar → realizar → pagar → ver lucro em ≤ 90s
