# 01 — Dashboard (A TELA MAIS IMPORTANTE)

> **Rastreia:** FR-DA-01 a FR-DA-09, FR-IN-01, FR-IN-06
> **Princípios-chave:** CON-UX-01 (números absolutos), CON-UX-02 (comparativos textuais), CON-UX-03 (tela única), CON-UX-04 (1 gráfico)
> **Route:** `/dashboard` (home após login)

---

## 1. Objetivo

**Em 3 segundos** a usuária deve conseguir responder:

1. Quanto dinheiro entrou este mês?
2. Quanto sobrou (lucro)?
3. O que tenho que fazer hoje?
4. Tem alguma coisa errada que eu preciso olhar?

Esta tela é o ponto de contato diário da usuária com o KEYRA. Todo o resto do
sistema existe para alimentar este dashboard automaticamente.

**Anti-padrão explícito (Conta Azul):** dashboards saturados de gráficos que
exigem interpretação. Descartado — ver `docs/research/2026-04-12-conta-azul-reverse-engineering.md`.

---

## 2. Wireframe — Desktop (viewport 1366×768, sem scroll)

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ KEYRA         Clínica Bella ▾              🔔 3    Camila Souza ▾    ⚙             │  h-16
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
│                                                                                    │
│  ┌──────┐  Abril · 2026                                     [◉ Mês] ( Semana )     │
│  │  📅  │                                                                           │
│  │  📊  │  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  👥  │  │                                                                    │  │
│  │  ✨  │  │   DINHEIRO QUE ENTROU ESTE MÊS                                     │  │
│  │  💼  │  │                                                                    │  │
│  │  📦  │  │   R$ 24.750,00                                                     │  │  text-5xl bold
│  │  ⚙   │  │                                                                    │  │
│  │      │  │   ↑ R$ 2.300 a mais que março          [Ver detalhes →]            │  │
│  │      │  └────────────────────────────────────────────────────────────────────┘  │
│  │      │                                                                           │
│  │      │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐              │
│  │      │  │ DESPESAS       │  │ SOBROU         │  │ A RECEBER      │              │
│  │      │  │                │  │                │  │ (agenda futura)│              │
│  │      │  │ R$ 9.120,00    │  │ R$ 15.630,00   │  │ R$ 31.200,00   │              │  text-4xl
│  │      │  │                │  │                │  │                │              │
│  │      │  │ ↓ R$ 430 menos │  │ ↑ R$ 2.730 mais│  │ em 47 horários │              │
│  │      │  │   que março    │  │   que março    │  │   marcados     │              │
│  │      │  └────────────────┘  └────────────────┘  └────────────────┘              │
│  │      │                                                                           │
│  │      │  ┌──────────────────────────────┐  ┌──────────────────────────────────┐  │
│  │      │  │  HOJE NA AGENDA (16/04)      │  │  O QUE VALE A PENA OLHAR          │  │
│  │      │  │                              │  │                                   │  │
│  │      │  │  08:00  Maria Silva          │  │  ⚠  3 clientes faltaram esta     │  │
│  │      │  │         Limpeza de pele      │  │     semana (R$ 540 perdidos)      │  │
│  │      │  │         [Agendado]           │  │                                   │  │
│  │      │  │  ─────────────────────────   │  │  ⚠  Ácido hialurônico: 2 frascos │  │
│  │      │  │  09:30  Ana Pereira          │  │     restantes (recompra urgente)  │  │
│  │      │  │         Botox (testa)        │  │                                   │  │
│  │      │  │         [Realizado]          │  │  ℹ  Peeling está com margem      │  │
│  │      │  │  ─────────────────────────   │  │     baixa (18%) — ver serviço    │  │
│  │      │  │  11:00  Julia Mendes         │  │                                   │  │
│  │      │  │         Preenchimento labial │  │                                   │  │
│  │      │  │         [Agendado]           │  │                                   │  │
│  │      │  │  ─────────────────────────   │  │                                   │  │
│  │      │  │  14:00  Carla Dias           │  │                                   │  │
│  │      │  │         Microagulhamento     │  │                                   │  │
│  │      │  │  ─────────────────────────   │  │                                   │  │
│  │      │  │  15:30  + 2 agendamentos     │  │                                   │  │
│  │      │  │                              │  │                                   │  │
│  │      │  │  Total previsto: R$ 2.850    │  │                                   │  │
│  │      │  │          [Ver agenda →]      │  │                                   │  │
│  │      │  └──────────────────────────────┘  └──────────────────────────────────┘  │
│  │      │                                                                           │
│  │      │  ┌──────────────────────────────┐  ┌──────────────────────────────────┐  │
│  │      │  │  INDICADORES DO MÊS          │  │  RECEITA vs DESPESAS (6 meses)   │  │
│  │      │  │                              │  │                                   │  │
│  │      │  │  Valor médio por cliente     │  │     ▓▓▓▓▓ receita                │  │
│  │      │  │  R$ 185,00                   │  │     ░░░░░ despesa                │  │
│  │      │  │                              │  │                                   │  │
│  │      │  │  Serviço mais vendido        │  │     Nov  Dez  Jan  Fev  Mar  Abr │  │
│  │      │  │  Limpeza de pele (34×)       │  │      ▓    ▓    ▓    ▓    ▓    ▓  │  │
│  │      │  │                              │  │      ░    ░    ░    ░    ░    ░  │  │
│  │      │  │  Serviço mais lucrativo      │  │                                   │  │
│  │      │  │  Botox (R$ 480 de sobra)     │  │     ÚNICO gráfico do sistema      │  │
│  │      │  │                              │  │     (barra dupla · Recharts)      │  │
│  │      │  │  Taxa de comparecimento      │  │                                   │  │
│  │      │  │  87%                         │  │                                   │  │
│  │      │  └──────────────────────────────┘  └──────────────────────────────────┘  │
│  └──────┘                                                                           │
└────────────────────────────────────────────────────────────────────────────────────┘
```

**Grid detalhado (Tailwind):**

```tsx
<div className="grid grid-cols-12 gap-4 p-6">
  {/* Linha 1 — KPI hero + 3 KPIs secundários */}
  <section className="col-span-12">
    <KPICard.Hero />  {/* Faturamento, full width */}
  </section>
  <section className="col-span-4"><KPICard variant="secondary" label="Despesas"/></section>
  <section className="col-span-4"><KPICard variant="secondary" label="Sobrou"/></section>
  <section className="col-span-4"><KPICard variant="secondary" label="A receber"/></section>

  {/* Linha 2 — Agenda do dia + Alertas */}
  <section className="col-span-6"><AgendaHojeCard /></section>
  <section className="col-span-6"><AlertasCard /></section>

  {/* Linha 3 — Indicadores + gráfico único */}
  <section className="col-span-6"><IndicadoresCard /></section>
  <section className="col-span-6"><ReceitaVsDespesaChart /></section>
</div>
```

---

## 3. Wireframe — Mobile (360-390px)

Em mobile, a regra CON-UX-03 relaxa: aceita scroll, **mas** os 4 KPIs
financeiros + "Hoje na agenda" DEVEM estar acima da dobra (primeira viewport).

```
┌──────────────────────────────┐
│ KEYRA              🔔  ⚙     │  ← top bar
├──────────────────────────────┤
│ Clínica Bella ▾              │  ← org switcher
├──────────────────────────────┤
│                              │
│  DINHEIRO QUE ENTROU         │
│                              │
│  R$ 24.750,00                │  ← text-4xl em mobile
│                              │
│  ↑ R$ 2.300 a mais que       │
│    março                     │
├──────────────────────────────┤
│ ┌──────────┐ ┌─────────────┐ │
│ │ DESPESAS │ │  SOBROU     │ │  ← KPIs em 2 col
│ │ R$ 9.120 │ │ R$ 15.630   │ │
│ │ ↓ 430    │ │ ↑ 2.730     │ │
│ └──────────┘ └─────────────┘ │
│ ┌──────────────────────────┐ │
│ │ A RECEBER                │ │
│ │ R$ 31.200 (47 horários)  │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│  HOJE NA AGENDA (16/04)      │
│  ● 08:00 Maria / Limpeza     │
│  ● 09:30 Ana / Botox [✓]     │
│  ● 11:00 Julia / Preench.    │
│  ● 14:00 Carla / Microag.    │
│  + 2 agendamentos            │
│  Total previsto: R$ 2.850    │
├──────────────────────────────┤
│  ⚠ 3 clientes faltaram       │
│  ⚠ Ácido: 2 frascos          │
│  ℹ Peeling com margem baixa  │
├──────────────────────────────┤
│  INDICADORES                 │
│  Ticket médio: R$ 185        │
│  Top: Limpeza (34×)          │
│  Comparecimento: 87%         │
├──────────────────────────────┤
│  RECEITA × DESPESA           │
│  [gráfico 6 meses]           │
└──────────────────────────────┘
[ 🏠 ] [ 📅 ] [ 👥 ] [ 💼 ] [⋯]  ← bottom nav
```

**Dobra:** as primeiras 3 seções (KPI hero + 3 secundários + Hoje na agenda)
cabem em 640px verticais — alvo de viewport mobile padrão.

---

## 4. Mapeamento FR → Componente

| FR | Componente no wireframe | Implementação |
|----|------------------------|---------------|
| FR-DA-01 | Layout grid 12-col desktop | Sem scroll em 1366×768 |
| FR-DA-02 | Todos os KPIs (números) | Componente `<KPICard>` |
| FR-DA-03 | "Dinheiro que entrou" + "Despesas" + "Sobrou" + "A receber" | 4 KPIs em linha 1 |
| FR-DA-04 | "Hoje na agenda" (card linha 2, esquerda) | `<AgendaHojeCard>` |
| FR-DA-05 | "Indicadores do mês" | `<IndicadoresCard>` |
| FR-DA-06 | Texto `↑ R$ 2.300 a mais que março` | `<ComparativoTexto>` |
| FR-DA-07 | (pós-MVP Fase 6) — "Faltam R$ X para a meta" | aparece substituindo "A receber" quando meta cadastrada |
| FR-DA-08 | Card "Receita vs Despesas" (linha 3, direita) | `<ReceitaVsDespesaChart>` (Recharts) — ÚNICO gráfico |
| FR-DA-09 | Card "O que vale a pena olhar" | `<AlertasCard>` — agrega alertas de faltas, estoque, margem |
| FR-IN-01 | Serviço mais lucrativo no IndicadoresCard | — |
| FR-IN-06 | (pós-MVP Fase 6) — progresso vs meta | aparece como sub-badge no KPI hero |

---

## 5. Anotações de hierarquia visual

1. **Faturamento do mês (KPI hero)** — texto maior, peso bold, full-width.
   É a PRIMEIRA coisa que o olho bate ao abrir o dashboard.
2. **Comparativo abaixo** — em `text-sm` com ícone `↑`/`↓` colorido (verde/terra).
   Nunca mais importante que o número absoluto.
3. **3 KPIs secundários** — todos na MESMA altura, mesma escala. Evita
   hierarquizar "lucro > despesa" — são informação paritária.
4. **Hoje na agenda + Alertas** — altura igual, lado a lado. Usuária escolhe
   para onde olhar primeiro (operação vs problemas).
5. **Indicadores + Gráfico** — na linha mais baixa da tela. São informação
   *contextual*, não acionável imediatamente. Ordem intencional: indicadores
   (números) VÊM ANTES do gráfico (da esquerda pra direita em leitura LTR).

---

## 6. Micro-interações

- **KPI hero [Ver detalhes →]** — abre `/financeiro?periodo=abril-2026`
- **Agenda card [Ver agenda →]** — abre `/agenda?view=dia&date=2026-04-16`
- **Alerta "3 clientes faltaram"** — abre `/agenda?filter=falta&periodo=7d`
- **Alerta "Ácido hialurônico"** — abre `/estoque/ácido-hialurônico`
- **Alerta "Peeling margem baixa"** — abre `/servicos/peeling`
- **Card hover** — `hover:shadow-sm transition-shadow duration-150`
- **Cards NÃO são botões** — só as `[Ações]` internas são clicáveis
  (evita UX ambíguo de "o que acontece se eu clicar aqui?")

---

## 7. Estados (obrigatórios — Article V)

### 7.1 Loading
```
┌────────────────────────────────────┐
│ DINHEIRO QUE ENTROU ESTE MÊS       │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                 │  ← Skeleton (shadcn)
│ ▓▓▓▓▓▓▓▓▓▓▓▓                       │
└────────────────────────────────────┘
```
- Skeleton preserva layout (evita CLS)
- Timeout de 10s → transita para Error

### 7.2 Empty (usuária nova, sem dados)
```
┌────────────────────────────────────────────────────┐
│                                                    │
│              ✨                                     │
│                                                    │
│   Você ainda não tem atendimentos finalizados.     │
│                                                    │
│   Para ver números aqui, você precisa:             │
│   1. ✓ Cadastrar seus serviços                     │
│   2. ◯ Agendar um cliente                          │
│   3. ◯ Marcar o atendimento como realizado         │
│                                                    │
│        [Cadastrar primeiro serviço]                │
│                                                    │
└────────────────────────────────────────────────────┘
```
- Em vez de mostrar "R$ 0,00" frio (desmotivador), guia onboarding
- Conecta com CON-UX-06 (NorthStar — primeiro lucro em 24h)

### 7.3 Parcial (sem agendamentos hoje, mas com histórico financeiro)
```
┌──────────────────────────────────────────┐
│ HOJE NA AGENDA (16/04)                   │
│                                          │
│        Sem atendimentos marcados         │
│                                          │
│        [+ Agendar paciente]              │
└──────────────────────────────────────────┘
```

### 7.4 Error
```
┌────────────────────────────────────────────────┐
│ Não conseguimos carregar seus dados agora.     │
│                                                │
│ Isso normalmente é temporário.                 │
│                                                │
│ [Tentar de novo]   [Falar com suporte]         │
└────────────────────────────────────────────────┘
```

### 7.5 Success — o wireframe principal (seções 2 e 3)

---

## 8. Performance (NFR-PE-01 — carrega em < 2s em 4G)

- **Streaming SSR** do dashboard: KPI hero renderiza primeiro (RSC + server fetch)
- Agenda do dia e alertas podem hidratar depois (Suspense boundaries)
- Gráfico (Recharts) é **client-side** com Suspense (lazy import)
- Alertas cached server-side por 5min (se organização pequena) ou 1min (ativa)
- **Skeleton obrigatório** em cada Suspense boundary

---

## 9. Acessibilidade (WCAG AA)

- `<h1>` na página: "Dashboard" (visualmente oculto com sr-only, texto visível "Abril · 2026")
- Cada seção é um `<section>` com `aria-labelledby` apontando ao H2 da seção
- KPI hero: `<div role="group" aria-label="Dinheiro que entrou este mês">` com o
  valor em um `<span aria-live="polite">` (para atualizar sem flash)
- Gráfico único tem `<table class="sr-only">` com dados tabulares idênticos
- Alertas são `<div role="status">` para leitores de tela anunciarem
- Contraste de comparativos (`text-lucro`, `text-prejuizo`) >= 4.5:1 em `bg-neutral-50`

---

## 10. Decisões registradas

| ID | Decisão | Razão |
|----|---------|-------|
| DASH-01 | KPI hero é "Faturamento" (não "Lucro") | Número que a usuária percebe primeiro ao vender — alinha com linguagem coloquial "dinheiro que entrou" |
| DASH-02 | "A receber" em vez de "Receita prevista" | CON-UX-05 (linguagem sem jargão) |
| DASH-03 | Ordem dos KPIs: Entrou → Despesas → Sobrou → A receber | Narrativa natural: ganhei, gastei, sobrou, vou receber |
| DASH-04 | "Sobrou" em vez de "Lucro" | Palavra coloquial — a idealizadora reforçou isso |
| DASH-05 | Alertas como cards textuais (não badges) | CON-UX-01 — texto é entendido; badge colorido exige interpretação |
| DASH-06 | Card "A receber" mostra nº de horários marcados | Reforça a ligação agenda→financeiro (posicionamento) |
| DASH-07 | Gráfico em barra dupla (não linha) | Receita e despesa são categóricos/mensais, não contínuos |
| DASH-08 | Empty state é wizard, não só "sem dados" | Suporta NorthStar (primeiro lucro em 24h) |
| DASH-09 | Cards não são clicáveis (só CTAs internos) | Evita UX ambíguo de "onde vai me levar se eu clicar?" |

---

## 11. Dependências para implementação

**Bloqueia dashboard:**
- `<KPICard>` (06-componentes-criticos)
- `<ComparativoTexto>` (06-componentes-criticos)
- `<AlertCard>` (06-componentes-criticos)
- `<StatusBadge>` (06-componentes-criticos)
- `<PageLayout>` com sidebar (05-navegacao)
- Dados reais fluindo do Pilar 1 (Agenda) e Pilar 3 (Comanda/Financeiro)

**Recomendação:** implementar dashboard **por último** do MVP. Antes, implementar:
1. Navegação + layouts
2. Cadastros (serviços, pacientes, profissionais)
3. Agenda (cria agendamento → gera receita prevista)
4. Comanda (realizado → comanda → pagamento → transação)
5. **Dashboard** — agora com dados reais para validar números

Isso também respeita Article IV: não inventar dados fake — mostrar só o que existe.
