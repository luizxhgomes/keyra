# 03 — Comanda (O FLUXO QUE FECHA O CICLO)

> **Rastreia:** FR-CO-01 a FR-CO-05, FR-FI-01, FR-ES-02
> **Route:** `/comandas/{id}`
> **Criada automaticamente ao marcar agendamento como "Realizado" (FR-AG-06 → FR-CO-01)**

---

## 1. Objetivo

A comanda é o **momento de fechamento do atendimento** — onde a operação vira
faturamento. É a ponte entre "paciente atendido" e "dinheiro na conta".

Exigências críticas:
1. **Criada automaticamente** (zero input manual exceto pagamento)
2. **Pagamento em < 15 segundos** (fluxo rápido entre atendimentos)
3. **Fechar comanda = criar transação financeira** (FR-FI-01, automático)
4. **Dedução de insumos do estoque** (FR-ES-02, automático)
5. **Edição manual permitida** (adicionar item, descontar valor)

---

## 2. Wireframe — Comanda recém-criada (após "Marcar como realizado")

```
┌──────────────────────────────────────────────────────────────────────┐
│ ← Comanda #1284                                  Camila (você)        │  breadcrumb
│ Terça, 16/04/2026 · 09:30                                             │
│ ────────────────────────────────────────────────────────────────────  │
│                                                                       │
│  ✓ Comanda criada a partir do atendimento de Ana Pereira.            │
│    Confira os itens e registre o pagamento.                           │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ PACIENTE                                                        │  │
│  │                                                                 │  │
│  │ Ana Pereira                                  (37 anos, 8ª visita)│
│  │ (11) 98765-4321                                                 │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ ITENS DA COMANDA                              [+ Adicionar item]│  │
│  │                                                                 │  │
│  │ ┌───────────────────────────────────────────────────────────┐   │  │
│  │ │ Botox (testa)                              R$ 450,00  [×] │   │  │
│  │ │ Profissional: Camila Souza                                │   │  │
│  │ │ Insumos consumidos (rateio automático):                   │   │  │
│  │ │   • 1 frasco ácido hialurônico   (−R$ 35,00 custo)        │   │  │
│  │ │   • 2 seringas descartáveis      (−R$ 8,00 custo)         │   │  │
│  │ └───────────────────────────────────────────────────────────┘   │  │
│  │                                                                 │  │
│  │                                                 Subtotal        │  │
│  │                                                 R$ 450,00       │  │
│  │                                                                 │  │
│  │                                                 Desconto        │  │
│  │                                                 [ R$ 0,00 ]     │  │
│  │                                                                 │  │
│  │                                                 Total           │  │
│  │                                                 R$ 450,00       │  │  text-3xl bold
│  │                                                                 │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ FORMA DE PAGAMENTO                                              │  │
│  │                                                                 │  │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐     │  │
│  │  │    🔷     │  │    💳     │  │    💳     │  │    💵     │     │  │
│  │  │   Pix     │  │  Crédito  │  │  Débito   │  │ Dinheiro  │     │  │
│  │  │           │  │           │  │           │  │           │     │  │
│  │  │  sem taxa │  │ taxa 3,5% │  │ taxa 1,5% │  │  sem taxa │     │  │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘     │  │
│  │                                                                 │  │
│  │  Valor recebido (após taxa): R$ 450,00                          │  │
│  │                                                                 │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  [  Salvar e confirmar pagamento  ]     [ Salvar sem cobrar ainda ]   │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

**Anotações:**
- Banner verde topo: confirma criação automática (reduz ansiedade)
- Insumos consumidos **exibidos em colapso dentro do item** (transparência sobre
  o rateio do estoque — FR-ES-02 automático, mas visível)
- Desconto é input inline editável (R$ ou %, **padrão R$**)
- 4 formas de pagamento como **cards selecionáveis grandes** (touch-friendly)
- Cada card mostra a **taxa aplicável** (CON-UX-05 — transparência sem jargão)
- "Valor recebido após taxa" atualiza reativamente ao selecionar forma
- CTA primário: "Salvar e confirmar pagamento" (ação final)
- CTA secundário: "Salvar sem cobrar" (caso vá cobrar depois — status "Finalizada" mas não "Paga")

---

## 3. Wireframe — Após pagamento confirmado (status: Paga)

```
┌──────────────────────────────────────────────────────────────────────┐
│ ← Comanda #1284                                  [✓ Paga]             │
│ Terça, 16/04/2026 · 09:30 · pago às 10:18                            │
│ ────────────────────────────────────────────────────────────────────  │
│                                                                       │
│  ✓ Pagamento registrado. R$ 450,00 entraram no financeiro.           │
│    [Ver no financeiro →]                                              │
│                                                                       │
│  PACIENTE: Ana Pereira                                                │
│                                                                       │
│  ITENS                                                                │
│  • Botox (testa)                                R$ 450,00             │
│    Lucro deste atendimento: R$ 325,00                                 │
│    (R$ 450 − R$ 43 insumos − R$ 82 taxa débito = R$ 325)              │
│                                                                       │
│  Total pago: R$ 450,00                                                │
│  Forma: 💳 Débito (taxa R$ 6,75 descontada)                           │
│  Valor líquido: R$ 443,25                                             │
│                                                                       │
│  [ Gerar recibo PDF ]  [ Editar comanda ]  [ Estornar ]               │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

**Anotações:**
- Status passa a `[✓ Paga]` no header (semantic-success)
- Banner topo: confirma propagação para financeiro + link para auditoria
- Exibe **lucro por atendimento** (FR-IN-01) — educa usuária sobre o que restou
  efetivamente
- Cálculo transparente inline: `valor - insumos - taxa = lucro` (CON-UX-02 comparativo textual)
- Ação "Estornar" só disponível no dia (D+0); após D+1 vira "Ajuste manual"

---

## 4. Wireframe — Adicionar item (produto extra ou serviço adicional)

```
┌────────────────────────────────────────────────────────┐
│  Adicionar item à comanda                      ✕       │
│ ──────────────────────────────────────────────────     │
│                                                        │
│  Tipo                                                  │
│  [◉ Serviço]  [ Produto ]  [ Desconto/Cortesia ]       │
│                                                        │
│  «Item»                                                │
│  [🔍 Buscar catálogo...                     ▾]         │
│                                                        │
│  Sugestões: ✨ Hidratação facial (R$ 80)               │
│             ✨ Máscara calmante (R$ 45)                │
│             ✨ Retorno em 30 dias (R$ 0 cortesia)      │
│                                                        │
│  «Quantidade»                                          │
│  [ 1 ]                                                 │
│                                                        │
│  «Valor unitário»                                      │
│  [ R$ 80,00 ]  ← editável (pode dar desconto no item)  │
│                                                        │
│                      [ Cancelar ]   [ Adicionar ]      │
└────────────────────────────────────────────────────────┘
```

**Anotações:**
- **Sugestões contextuais** baseadas no serviço principal (upsell sugerido — FR-IN-08 base)
- Tipo "Desconto/Cortesia" permite registrar que um item foi gratuito (importante
  para transparência contábil + relatórios de cortesias)

---

## 5. Mapeamento FR → Comportamento

| FR | Implementação |
|----|---------------|
| FR-CO-01 | Server Action `completeAppointment(id)`: transaction cria comanda + itens a partir do agendamento |
| FR-CO-02 | Botão `[+ Adicionar item]` abre modal; item input → appends à comanda |
| FR-CO-03 | Status: Aberta (em edição) → Finalizada (salva sem pagar) → Paga (com transação vinculada) |
| FR-CO-04 | Cards de forma de pagamento armazenam `payment_method` enum |
| FR-CO-05 | Taxa é `config.payment_fees[method]` (configurável em Configurações); aplicada inline no valor líquido |
| FR-FI-01 | Server Action `payOrder()` cria row em `transactions` atomicamente (mesma tx da comanda) |
| FR-ES-02 | Trigger DB `after_order_paid` deduz `inventory_movements` para cada insumo listado em `service_supplies` |

---

## 6. Estados (obrigatórios)

### 6.1 Loading — carregar comanda existente
- Skeleton: header, itens como linhas skeleton, total skeleton

### 6.2 Empty — comanda sem itens (deve ser raro, pois FR-CO-01 pré-preenche)
```
┌────────────────────────────────────────┐
│                                        │
│          Nenhum item ainda             │
│                                        │
│    [+ Adicionar primeiro item]         │
│                                        │
└────────────────────────────────────────┘
```

### 6.3 Error — falha ao salvar pagamento
```
⚠ Não conseguimos registrar o pagamento.

  Possíveis causas:
  • Conexão interrompida
  • Item sem preço definido
  • Estoque insuficiente para dedução automática

  [ Tentar de novo ]   [ Ver detalhes técnicos ]
```
**Crítico:** em erro de pagamento, NÃO salvar parcialmente — server action é atomic.
Usuária vê estado anterior (comanda sem status "Paga").

### 6.4 Status "Finalizada sem pagamento" (salvar sem cobrar ainda)
```
┌──────────────────────────────────────────────┐
│ Comanda #1284                  [Finalizada]  │
│                                              │
│ Total: R$ 450,00 · aguardando pagamento      │
│                                              │
│ [ Registrar pagamento agora ]                │
└──────────────────────────────────────────────┘
```
Aparece em "Comandas em aberto" no menu Financeiro (FR-FI-07 futuro).

### 6.5 Warning — estoque insuficiente
```
⚠ Atenção: estoque de ácido hialurônico baixo.
   Você tem 2 frascos, este atendimento consumirá 1.
   Depois desta comanda, restarão 1 frasco.
   [ Continuar assim ]   [ Ir para estoque ]
```
Não bloqueia — apenas alerta.

---

## 7. Mobile

```
┌──────────────────────────────┐
│ ← Comanda #1284              │
├──────────────────────────────┤
│ Ter 16/04 · 09:30            │
│                              │
│ ✓ Criada do atendimento de   │
│   Ana Pereira                │
├──────────────────────────────┤
│ ITENS                        │
│ ┌──────────────────────────┐ │
│ │ Botox (testa)            │ │
│ │ R$ 450,00        [×]     │ │
│ └──────────────────────────┘ │
│ [+ Adicionar item]           │
├──────────────────────────────┤
│ Subtotal   R$ 450,00         │
│ Desconto   R$ 0,00           │
│ ─────────────────────────    │
│ Total      R$ 450,00         │
├──────────────────────────────┤
│ FORMA DE PAGAMENTO           │
│ ┌──────────┐ ┌──────────┐    │
│ │ 🔷 Pix   │ │ 💳 Créd. │    │
│ └──────────┘ └──────────┘    │
│ ┌──────────┐ ┌──────────┐    │
│ │ 💳 Déb.  │ │ 💵 Dinh. │    │
│ └──────────┘ └──────────┘    │
├──────────────────────────────┤
│ [ Confirmar pagamento ]      │
│                              │
│ [ Salvar sem cobrar ainda ]  │
└──────────────────────────────┘
```

**Crítico em mobile:**
- CTAs ficam no bottom (sticky), grudados visualmente
- Cards de pagamento em grid 2×2 (touch targets 44×44 mín.)
- Swipe no item para remover (padrão mobile — com undo)

---

## 8. Micro-interações críticas

| Ação | Comportamento |
|------|---------------|
| Selecionar forma de pagamento | Valor líquido atualiza em < 100ms (calculado client-side) |
| Clicar [Confirmar pagamento] | Botão → loading spinner inline (NÃO modal) → success animation (check circular) → redirect para `/comandas/{id}?paid=true` |
| Desconto inline | Atualização reativa do total + destaque visual sutil no total |
| Adicionar item | Card aparece com animação `slide-in-top` 150ms |
| Remover item | Confirmação se valor > R$ 100; sem confirmação se < R$ 100 (UX por frequência) |

---

## 9. Acessibilidade

- Cards de forma de pagamento são `<button role="radio">` em `<fieldset role="radiogroup">`
- `aria-label` descritivo em cada: `"Pagar com Pix, sem taxa"`, `"Pagar com Crédito, taxa de 3,5%"`
- Total usa `aria-live="polite"` — atualiza em leitores de tela quando muda
- Ação `[Confirmar pagamento]` tem `aria-describedby` apontando para o total

---

## 10. Integridade financeira (NFR-FI-01 a NFR-FI-03)

- **Valores em centavos (integer)** — nunca float. Converter para display apenas
- Rounding: HALF_EVEN (banker's) — utility `centsToDecimal(cents)` em `lib/currency`
- Transação em DB: INSERT order + order_items + transaction em **1 commit atomic**
  (sobe erro em qualquer um → rollback tudo)
- Auditoria (NFR-SE-05): row em `audit_log` com `who`, `action: 'order.paid'`, `metadata: { order_id, total, payment_method }`

---

## 11. Decisões registradas

| ID | Decisão | Razão |
|----|---------|-------|
| CO-01 | Insumos consumidos visíveis dentro do item | Transparência — usuária precisa confiar no rateio automático |
| CO-02 | Formas de pagamento como cards grandes (não radio buttons) | Touch-friendly, visual claro, mostra taxa inline |
| CO-03 | 2 CTAs: "Confirmar pagamento" + "Salvar sem cobrar" | Realidade operacional (usuária pode querer cobrar depois) |
| CO-04 | Exibe "Lucro deste atendimento" após pagar | Reforça posicionamento "lucro por serviço" — diferencial vs Conta Azul |
| CO-05 | Desconto em R$ (não %) por padrão | CON-UX-02 — valor absoluto |
| CO-06 | Sugestões de upsell contextuais ao adicionar item | Base para FR-IN-08 (futuro), sem complexidade de IA ainda |
| CO-07 | Estornar só em D+0; após D+1 vira "Ajuste manual" | Integridade contábil — não permite apagar transação passada |
| CO-08 | Estoque insuficiente = warning, não bloqueio | Realidade — usuária pode ter comprado insumo sem registrar |

---

## 12. Dependências

**Bloqueia comanda:**
- `<StatusBadge>` (06-componentes-criticos)
- `<KPICard>` variante compacta
- Server Action `completeAppointment()` + `payOrder()` (atomic transaction)
- Trigger DB `after_order_paid` para dedução de estoque
- Config de taxas de pagamento (por organização) — schema `payment_fees` table

**Perguntas abertas:**
- **[VALIDAR com idealizadora]** Comanda permite "dividir pagamento" (parte Pix,
  parte cartão)? Realidade comum em salões. Se sim, adicionar na Fase 1; se não,
  deferir para Fase 5.
- **[VALIDAR]** Taxa de cartão é por organização ou por maquininha cadastrada?
  Impacta schema.
