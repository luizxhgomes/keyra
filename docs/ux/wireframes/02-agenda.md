# 02 — Agenda

> **Rastreia:** FR-AG-01 a FR-AG-06
> **Route:** `/agenda`
> **Dependências:** FullCalendar (ADR-002) + shadcn Dialog + AgendamentoCard

---

## 1. Objetivo

A agenda é o **coração operacional** do KEYRA — é aqui que a receita é gerada.
Uma ação na agenda (marcar "realizado") dispara toda a cadeia financeira:
`Agenda → Comanda → Transação → DRE`.

Prioridades:
1. **Criar um agendamento em < 30 segundos** (fluxo mais frequente)
2. **Alternar visões** diária / semanal / mensal com zero fricção
3. **Marcar atendimento como realizado em 1 clique** (abre comanda automaticamente)
4. **Mostrar receita prevista** do dia/semana/mês visível (ponte visual com o dashboard)

---

## 2. Wireframe — Desktop (visão SEMANAL, default)

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ ← Agenda                                                                           │  h-16
│                                                                                    │
│  [ Hoje ]  [<]  15-21 Abril 2026  [>]      (Dia) [◉ Semana] ( Mês )                │
│                                                                                    │
│  Filtros: Profissional ▾  Status ▾                     [+ Novo agendamento]        │
│                                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │       Seg 15    Ter 16 ★   Qua 17    Qui 18    Sex 19    Sáb 20   (Dom)      │  │
│  │                                                                              │  │
│  │ 08:00                                                                        │  │
│  │       ┌─────────┐ ┌─────────┐                                                │  │
│  │       │Maria S. │ │Ana P.   │                                                │  │
│  │ 09:00 │Limpeza  │ │Botox    │                                                │  │
│  │       │60 min   │ │45 min   │                                                │  │
│  │       │[Agend.] │ │[✓ Real.]│                                                │  │
│  │ 10:00 └─────────┘ └─────────┘                                                │  │
│  │                                                                              │  │
│  │ 11:00           ┌─────────┐ ┌─────────┐                                      │  │
│  │                 │Julia M. │ │Bruna L. │                                      │  │
│  │                 │Preench. │ │Peeling  │                                      │  │
│  │ 12:00           │90 min   │ │45 min   │                                      │  │
│  │                 │[Agend.] │ │[✗ Falta]│                                      │  │
│  │                 └─────────┘ └─────────┘                                      │  │
│  │ 13:00                                                                        │  │
│  │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ almoço ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    │  │
│  │ 14:00           ┌─────────┐                                                  │  │
│  │                 │Carla D. │                                                  │  │
│  │                 │Microag. │                                                  │  │
│  │ 15:00           │60 min   │                                                  │  │
│  │                 │[Agend.] │                                                  │  │
│  │                 └─────────┘                                                  │  │
│  │ 16:00                                                                        │  │
│  │ 17:00                                                                        │  │
│  │ 18:00                                                                        │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                    │
│  Resumo desta semana:                                                              │
│    • 18 agendamentos   • A receber: R$ 3.420   • Realizados: 7 (R$ 1.290 pagos)   │
│    • 2 faltas (R$ 340 perdidos)                                                    │
└────────────────────────────────────────────────────────────────────────────────────┘
```

**Observações:**
- Dia atual (Ter 16) tem ★ e coluna com `bg-primary-50` sutil
- Hora atual tem linha horizontal sublinhando na coluna do dia atual
- Slot de almoço (13:00) aparece como divisor visual (configurável)
- Cards ocupam altura proporcional à duração (60 min = 60px, etc — com mínimo de 40px para legibilidade)

---

## 3. Wireframe — Visão DIÁRIA (foco em um dia)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ ← Agenda · Terça, 16 de Abril                                                  │
│                                                                                │
│  [ Hoje ]  [<]  16 Abril 2026  [>]         [◉ Dia] ( Semana ) ( Mês )          │
│                                                                                │
│  Filtros: Profissional ▾  Status ▾                   [+ Novo agendamento]      │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │ 08:00  ┌───────────────────────────────────────────────────────────────┐ │  │
│  │        │ 08:00 - 09:00   [Agendado]                                    │ │  │
│  │        │ Maria Silva  ·  Limpeza de pele profunda                      │ │  │
│  │ 09:00  │ Camila (você)    R$ 180,00                                    │ │  │
│  │        │                      [Marcar como realizado]  [Editar] [...]  │ │  │
│  │        └───────────────────────────────────────────────────────────────┘ │  │
│  │ 09:30  ┌───────────────────────────────────────────────────────────────┐ │  │
│  │        │ 09:30 - 10:15   [✓ Realizado · comanda R$ 450 paga]           │ │  │
│  │        │ Ana Pereira  ·  Botox (testa)                                 │ │  │
│  │ 10:00  │ Camila (você)    R$ 450,00                                    │ │  │
│  │        │                                   [Ver comanda →]             │ │  │
│  │        └───────────────────────────────────────────────────────────────┘ │  │
│  │ 10:30                                                                   │  │
│  │ 11:00  ┌───────────────────────────────────────────────────────────────┐ │  │
│  │        │ 11:00 - 12:30   [Agendado]                                    │ │  │
│  │        │ Julia Mendes  ·  Preenchimento labial                         │ │  │
│  │ 12:00  │ Camila (você)    R$ 650,00                                    │ │  │
│  │        │                      [Marcar como realizado]  [Editar] [...]  │ │  │
│  │        └───────────────────────────────────────────────────────────────┘ │  │
│  │ 12:30  (almoço — livre)                                                 │  │
│  │ ...                                                                     │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                │
│  Total do dia: 6 atendimentos · R$ 2.850 previsto · R$ 450 já pago            │
└────────────────────────────────────────────────────────────────────────────────┘
```

Visão diária dá **mais espaço para ações inline** (botão "Marcar como realizado"
direto no card sem precisar abrir detalhes).

---

## 4. Wireframe — Visão MENSAL

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ← Agenda · Abril 2026                                                        │
│                                                                              │
│  [ Hoje ]  [<]  Abril 2026  [>]          ( Dia ) ( Semana ) [◉ Mês]          │
│                                                                              │
│  Filtros: Profissional ▾  Status ▾                 [+ Novo agendamento]      │
│                                                                              │
│  ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐                                 │
│  │ Seg │ Ter │ Qua │ Qui │ Sex │ Sáb │ Dom │                                 │
│  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤                                 │
│  │  1  │  2  │  3  │  4  │  5  │  6  │  7  │                                 │
│  │ 4 ag│ 6 ag│ 5 ag│ 3 ag│ 7 ag│ 2 ag│  —  │                                 │
│  │ R$  │ R$  │ R$  │ R$  │ R$  │ R$  │     │                                 │
│  │ 820 │1200 │ 990 │ 540 │1450 │ 380 │     │                                 │
│  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤                                 │
│  │  8  │  9  │ 10  │ 11  │ 12  │ 13  │ 14  │                                 │
│  │ 5 ag│ 4 ag│ 6 ag│ 5 ag│ 8 ag│ 3 ag│  —  │                                 │
│  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤                                 │
│  │ 15  │ 16★ │ 17  │ 18  │ 19  │ 20  │ 21  │                                 │
│  │ 5 ag│ 6 ag│ 4 ag│ 3 ag│ 7 ag│ 2 ag│  —  │                                 │
│  │ R$  │ R$  │ R$  │ R$  │ R$  │ R$  │     │                                 │
│  │ 890 │2850 │ 790 │ 620 │1320 │ 420 │     │                                 │
│  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤                                 │
│  │ 22  │ 23  │ 24  │ 25  │ 26  │ 27  │ 28  │                                 │
│  │ ... │ ... │ ... │ ... │ ... │ ... │     │                                 │
│  └─────┴─────┴─────┴─────┴─────┴─────┴─────┘                                 │
│                                                                              │
│  Total do mês: 89 agendamentos · R$ 24.750 previsto                          │
└──────────────────────────────────────────────────────────────────────────────┘
```

Mensal: célula mostra **número de agendamentos + valor total previsto** (CON-UX-01
— número absoluto, não dots/bolinhas coloridas). Clique na célula abre o dia.

---

## 5. Modal — Criação rápida de agendamento

```
┌───────────────────────────────────────────────────────┐
│  Novo agendamento                              ✕      │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    │
│                                                       │
│  «Paciente»                                           │
│  [🔍 Buscar ou cadastrar...            ▾]             │  Combobox
│                                                       │
│  «Serviço»                                            │
│  [Limpeza de pele profunda (60 min)    ▾]             │
│                                                       │
│  «Profissional»                                       │
│  [Camila Souza (você)                   ▾]            │
│                                                       │
│  «Data e hora»                                        │
│  [16/04/2026]  [08:00]                                │
│                                                       │
│  «Observações» (opcional)                             │
│  ┌─────────────────────────────────────────────────┐  │
│  │                                                 │  │
│  │                                                 │  │
│  └─────────────────────────────────────────────────┘  │
│                                                       │
│  💡 Este agendamento vai gerar R$ 180,00 de receita   │
│     prevista no dia 16/04.                            │
│                                                       │
│                      [ Cancelar ]   [ Agendar ]       │
└───────────────────────────────────────────────────────┘
```

**Anotações:**
- Combobox de paciente usa shadcn `<Command>`: digita nome → sugere
  existentes, ou opção "Cadastrar novo paciente" inline (não sai do fluxo)
- Serviço mostra duração e valor — ao selecionar, preenche
  automaticamente hora fim (start + duração)
- Callout 💡 explicita a ligação com o financeiro (educa usuária sobre o fluxo)
- Validação Zod: paciente required, serviço required, data >= hoje, hora
  válida (não sobreposição com outros agendamentos do mesmo profissional)

---

## 6. Card de agendamento — detalhes

```
Dimensões: min-w-[180px]  (grid semanal) / w-full (visão diária)

┌─────────────────────────┐
│ 08:00 - 09:00           │  ← header: horário + status badge
│ [Agendado]              │
│                         │
│ Maria Silva             │  ← paciente (bold)
│ Limpeza de pele         │  ← serviço
│                         │
│ Camila (você)           │  ← profissional (text-xs text-muted)
│ R$ 180,00               │  ← valor (tabular-nums)
└─────────────────────────┘
```

### Cores por status (semânticas, mas SEMPRE acompanhadas de ícone+texto)

| Status | Ícone | Cor do card | Cor do badge |
|--------|-------|-------------|--------------|
| `Agendado` | Clock | `border-l-primary-500`, `bg-primary-50` | `bg-primary-100 text-primary-700` |
| `Realizado` | CheckCircle2 | `border-l-secondary-500`, `bg-secondary-50` | `bg-secondary-100 text-secondary-700` |
| `Cancelado` | XCircle | `border-l-neutral-400`, `bg-neutral-100` + opacity 70 | `bg-neutral-200 text-neutral-600` |
| `Falta` | Ban | `border-l-prejuizo`, `bg-neutral-50` + linha diagonal sutil | `bg-red-100 text-red-700` |

**Crítico (NFR-UX-02):** status nunca só pela cor — sempre texto + ícone.

---

## 7. Drawer lateral — detalhes do agendamento

Clique no card → abre `<Sheet>` lateral (shadcn) à direita:

```
                                    ┌────────────────────────────────────┐
                                    │ Agendamento                   ✕    │
                                    │ Terça, 16/04 · 08:00 - 09:00       │
                                    │ ────────────────────────────────── │
                                    │                                    │
                                    │ Paciente                           │
                                    │ Maria Silva     (37 anos, 5ª visita)│
                                    │                                    │
                                    │ Serviço                            │
                                    │ Limpeza de pele profunda           │
                                    │ 60 min · R$ 180,00                 │
                                    │                                    │
                                    │ Profissional                       │
                                    │ Camila Souza (você)                │
                                    │                                    │
                                    │ Observações                        │
                                    │ Pele seca, alergia a ácido glicólico│
                                    │                                    │
                                    │ Histórico deste cliente            │
                                    │ • 10/03  Limpeza de pele  (pago)   │
                                    │ • 15/02  Peeling          (pago)   │
                                    │                                    │
                                    │ ────────────────────────────────── │
                                    │                                    │
                                    │ [ Marcar como realizado ]          │
                                    │ [ Cancelar ]  [ Marcar falta ]     │
                                    │                                    │
                                    │ [ Reagendar ] [ Editar ]           │
                                    └────────────────────────────────────┘
```

**[Marcar como realizado]** dispara:
1. Status → Realizado
2. Cria comanda automaticamente (FR-CO-01)
3. Redireciona para `/comandas/{id}?created=true`
4. Toast: "Atendimento finalizado! Comanda criada — registre o pagamento."

---

## 8. Visão MOBILE

Mobile default: **visão diária** (mês e semana viram listas verticais).

```
┌──────────────────────────────┐
│ ← Agenda                     │
├──────────────────────────────┤
│ Terça, 16 de abril      ▾    │  ← tap abre date picker
├──────────────────────────────┤
│ [◉ Dia] ( Semana ) ( Mês )   │
├──────────────────────────────┤
│ 08:00                        │
│ ┌──────────────────────────┐ │
│ │ [Agendado]               │ │
│ │ Maria Silva              │ │
│ │ Limpeza de pele · 60min  │ │
│ │ R$ 180,00                │ │
│ │     [Marcar realizado →] │ │
│ └──────────────────────────┘ │
│ 09:30                        │
│ ┌──────────────────────────┐ │
│ │ [✓ Realizado · pago]     │ │
│ │ Ana Pereira              │ │
│ │ Botox · 45min            │ │
│ │ R$ 450,00                │ │
│ │           [Ver comanda →]│ │
│ └──────────────────────────┘ │
│ ...                          │
├──────────────────────────────┤
│ 6 atend. · R$ 2.850 previsto │
└──────────────────────────────┘
[ 🏠 ] [●📅] [ 👥 ] [ 💼 ] [⋯]
```

**FAB (Floating Action Button)** canto inferior direito: `[+]` → abre modal de criação.

---

## 9. Mapeamento FR → Componente

| FR | Implementação |
|----|---------------|
| FR-AG-01 | Toggle (Dia/Semana/Mês) com shadcn `<Tabs>` + FullCalendar views |
| FR-AG-02 | Modal de criação com combobox paciente/serviço/profissional + date picker |
| FR-AG-03 | Drawer com ações: Realizado / Cancelar / Falta |
| FR-AG-04 | Callout 💡 no modal + rodapé "A receber" no dashboard |
| FR-AG-05 | Filtro "Profissional" + coluna mostra todos os profissionais visíveis para o dono |
| FR-AG-06 | Ação "Marcar como realizado" cria comanda (server action → FR-CO-01) |

---

## 10. Estados obrigatórios

### 10.1 Loading (grid inteiro)
- Skeleton com shape de grid (7 colunas, altura das horas)
- Para visão mensal: skeleton de 35 células

### 10.2 Empty (semana sem agendamentos)
```
┌──────────────────────────────────────────┐
│                                          │
│              📅                           │
│                                          │
│    Nenhum agendamento nesta semana       │
│                                          │
│    Aproveite para bloquear horários ou   │
│    cadastrar novos pacientes.            │
│                                          │
│       [+ Novo agendamento]                │
│                                          │
└──────────────────────────────────────────┘
```

### 10.3 Error (falha ao carregar)
- Toast + inline `<Alert>` com `[Tentar de novo]`
- Cache offline: se dados de 5min atrás disponíveis, exibir com aviso
  "Atualizado há 5 minutos — reconectando..."

### 10.4 Conflito (agendamento sobreposto ao criar)
```
⚠ Este horário conflita com:
  Ana Pereira · Botox · 09:30-10:15

  [ Agendar mesmo assim ]  [ Escolher outro horário ]
```
Agendar mesmo assim permitido (multi-profissional; ou sobreposição intencional).

---

## 11. Atalhos de teclado

| Atalho | Ação |
|--------|------|
| `t` | Hoje |
| `→` / `←` | Próximo / anterior |
| `d` | Visão diária |
| `w` | Visão semanal |
| `m` | Visão mensal |
| `n` | Novo agendamento |
| `ESC` | Fecha modal / drawer |

Documentar em help inline (`?` abre popover com atalhos).

---

## 12. Acessibilidade

- Cada slot de agendamento é `<button>` com `aria-label` descritivo:
  `"Agendamento 08:00 a 09:00, Maria Silva, Limpeza de pele, status agendado. Pressione Enter para abrir detalhes."`
- Navegação por teclado: Tab percorre agendamentos em ordem temporal
- Status: combinação ícone + texto + borda colorida (não SÓ cor)
- FullCalendar: verificar plugin `@fullcalendar/a11y` (nativo do framework)

---

## 13. Decisões registradas

| ID | Decisão | Razão |
|----|---------|-------|
| AG-01 | Default desktop = visão semanal | Melhor visibilidade da capacidade produtiva sem ser genérico demais (mensal) |
| AG-02 | Default mobile = visão diária | Viewport pequeno — semanal fica ilegível |
| AG-03 | Célula mensal mostra nº + valor (não barras) | CON-UX-01 — número absoluto |
| AG-04 | Callout R$ no modal de criação | Educa usuária sobre ligação agenda→financeiro (posicionamento do produto) |
| AG-05 | Ação "Marcar realizado" redireciona para comanda | Reduz fricção — próximo passo natural é cobrar |
| AG-06 | Combobox de paciente com "cadastrar novo inline" | NorthStar — minimizar saltos entre telas no onboarding |
| AG-07 | Agendamentos sobrepostos permitidos com warning | Realidade operacional (atrasos, overbooking intencional multi-profissional) |

---

## 14. Dependências

- FullCalendar v6+ com views: `dayGridMonth`, `timeGridWeek`, `timeGridDay`, `listDay`
- Plugin `@fullcalendar/resource-timegrid` para agenda multi-profissional (avaliar licença — Premium)
  - **[VALIDAR]** Fase 7 quando adicionar multi-profissional avançado
- date-fns com locale pt-BR para formatação
- Server Action: `createAppointment()` com criação atômica (appointment + receita prevista)
