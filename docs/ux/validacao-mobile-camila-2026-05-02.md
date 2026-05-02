# Validação Mobile com Camila — KEYRA Sprint 6 (2026-05-02)

**Persona:** Camila, 34 anos, biomedicina estética, 3 profissionais. Mobile-first.
**Viewport alvo:** 375×667 (iPhone SE 1ª gen — pior caso da base). Validar também 390×844 (iPhone 14).
**Modo:** desktop com DevTools emulando mobile **ou** celular real conectado na mesma rede WiFi.

---

## Setup (escolher 1 dos 2 caminhos)

### Caminho A — Desktop com DevTools mobile (mais rápido)

1. **Chrome/Edge**: abrir `http://localhost:3000`
2. Pressionar `F12` para DevTools
3. Toggle "Device Toolbar" (`Ctrl+Shift+M` Win/`Cmd+Shift+M` Mac)
4. Selecionar **iPhone SE** (375×667) no dropdown
5. Definir DPR como **2** (Pixel ratio) — simula tela retina
6. **Ativar throttling** "Slow 4G" em Network tab (Camila usa 4G real, não Wi-Fi corporativo)

**Atalhos úteis:**
- `Ctrl+Shift+P` → "show rendering" → ativar **prefers-reduced-motion: reduce** para testar AC3 da Story 6.2
- DevTools → Issues panel: detecta problemas de a11y/contrast em tempo real

### Caminho B — Celular real (mais fiel)

1. Abra no celular: **`http://192.168.0.50:3000`** (mesma rede WiFi do laptop)
2. Adicione à tela inicial (PWA-like)
3. Abra em modo paisagem **e** retrato — ambos devem funcionar

---

## Pré-flight (5 minutos antes da validação)

- [ ] Conta de teste em produção ou seed local (você precisa estar logado para acessar telas autenticadas)
- [ ] Pelo menos 1 paciente, 1 serviço, 1 profissional cadastrados (J2-J6 dependem disso)
- [ ] Pelo menos 1 agendamento marcado para hoje (J2)
- [ ] **Opcional**: 1 alerta crítico simulado (queda de lucro > 20% via SQL direto se quiser testar `criticalEntrance` da 6.2)

---

## Jornada 1 — Onboarding (Camila no dia 1)

**Cenário:** Camila acabou de criar a conta. Dashboard ainda zerado.

### Passos

1. Logar via magic link (J1.1) → conferir email da KEYRA chega com remetente "KEYRA <no-reply@usekeyra.com>"
2. Após magic link, fluxo de onboarding (organização nova) → criar org "Clínica Camila Bilinski"
3. Cair em `/dashboard` zerado

### O que validar (mobile 375px)

- [ ] **H1 "Dashboard"** com `text-display-hero` (56px peso 200) — Inter Variable carregada (não fallback system)
- [ ] Subtítulo "Visão única do seu mês — números absolutos, sem gráfico." cabe em 1-2 linhas
- [ ] **noData EmptyState** aparece com `Sparkles` icon — texto "Conclua atendimentos para ver os números" + descrição
- [ ] **AlertasCard** mostra `CheckCircle2` "Nenhum alerta esta semana — sua operação está sob controle" (empty positivo da 5.7)
- [ ] **MetaCard** com EmptyState `Target` + CTA "Criar meta" → toca o CTA → vai para `/financeiro/metas`
- [ ] Em `/financeiro/metas` o H2 está `text-h2` (24px peso 600), não mais `text-lg`
- [ ] Cadastrar primeira meta → voltar pro dashboard → **MetaCard agora mostra ProgressRow** com valores zerados em `tabular-nums`

### Checks de motion (Sprint 6.2)

- [ ] Primeira renderização do dashboard: `routeTransition` (400ms fadeRise) é perceptível mas não atrapalha
- [ ] EmptyStates entram com `fadeRiseSlow` (cards "aparecem", não estão estáticos)
- [ ] **Scroll para baixo**: AlertasCard, AgendaHojeCard, IndicadoresCard, MetaCard entram **um por um** conforme entram no viewport (`whileInView` + `once: true`)

### Checks de spacing (anti-grep AC2.12)

- [ ] Cards do dashboard mantêm gap consistente de 24px (`gap-6`) — sem pulos de layout durante animação
- [ ] Tokens `card-x`/`card-y` (24px padding interno) preservam respiração mesmo em 375px

---

## Jornada 2 — Dia típico mobile (Camila chega de manhã)

**Cenário:** Camila abre o app no celular antes da primeira cliente.

### Passos

1. Toca ícone KEYRA → cai em `/dashboard`
2. Passa o olho nos 4 KPI hero (Receita, Receita prevista, Despesas, Lucro)
3. Ver alertas pendentes (estoque baixo)
4. Olhar agenda do dia
5. Toca o **FAB `+`** no BottomNav (centro) → abre sheet de novo agendamento
6. Cria agendamento

### O que validar (mobile 375px)

- [ ] **4 KPI hero** em grid 1 col mobile (cada um ocupa largura total)
  - Valor com `text-kpi-hero` (56px peso 600) e `tabular-nums` (sem column jitter)
  - Label "RECEITA REALIZADA" em `text-label uppercase`
  - Sombra sutil com `shadow-sm` — toque/hover muda para `shadow-md`
- [ ] **AlertasCard**: alerta de estoque entra com fadeRise (warning bg-amber-50 + AlertTriangle text-alerta)
  - Botão `[Investigar →]` com `min-h-[44px]` (toque AA confortável)
  - Botão `[Silenciar 7 dias]` com `min-h-[44px]` — toca, alerta some imediatamente
  - Recarregar página → alerta continua silenciado (localStorage persiste)
- [ ] **AgendaHojeCard**: lista de horários com profissional + serviço + cliente
- [ ] **FAB centro do BottomNav**:
  - Em `/dashboard`: `aria-label="Criar novo agendamento"` (default)
  - Toque → navega para `/agenda?novo=1` → sheet abre automaticamente
  - Sheet de novo agendamento: 5 fields (paciente, serviço, profissional, data, hora)
  - Preview em tempo real: término calculado, receita prevista, comissão

### Smoke crítico — alerta CRITICAL

Se houver alerta `severity=critical` (queda de lucro > 20%):
- [ ] Card entra com **`criticalEntrance`** — slideInDown 300ms **+** pulseOnce 1500ms (1 ciclo único)
- [ ] **NÃO mostra botão "Silenciar 7 dias"** (severity critical é não-silenciável por design)
- [ ] Bg vermelho claro `bg-red-50` + ícone `AlertOctagon text-prejuizo`

---

## Jornada 3 — Fechamento de mês (Camila no último dia)

**Cenário:** Camila quer fechar o mês — ver lucro, comparar mês passado, decidir.

### Passos

1. Toca FAB → não, vai pelo Sidebar/BottomNav direto
2. `/financeiro` → escolhe DRE
3. `/financeiro/dre` → lê o resultado em < 3 segundos
4. `/financeiro/dre-por-servico` → identifica top 3 e prejuízos
5. `/financeiro/fluxo-caixa` → vê saldo

### O que validar (mobile 375px)

#### `/financeiro/dre` (Story 6.4)

- [ ] **H2 "DRE — abril/2026"** com `text-h2` (24px peso 600)
- [ ] Tabela DRE com 4 colunas — em 375px **cabe sem scroll horizontal** (texto pequeno mas legível)
- [ ] Linha **`revenueNet` (subtotal)**: `bg-muted/30` + `text-h3` (20px peso 600) + `border-t-2 border-border` em cima
- [ ] Linha **`netProfit` (final)**: `bg-muted/50` + `text-h2` (24px peso 600) + `border-t-2 border-border` + cor `text-secondary` (sálvia) se ≥ 0 ou `text-destructive` se < 0 — **linha inteira** ganha cor (rótulo + valor)
- [ ] **Critério de J3 (auditoria baziotti)**: em < 3 segundos olhando a tabela, você identifica se o mês foi positivo ou negativo
- [ ] Coluna "% sobre receita" mantida (decisão da idealizadora — ratio analítico) com texto pequeno
- [ ] Coluna "vs mês passado" usa `<ComparativoTexto>` — "R$ 1.847 a mais que março" (absoluto, NÃO percentual)
- [ ] Espaçamento `py-stack-loose` (24px) entre linhas — tabela respira, não comprime

#### `/financeiro/dre-por-servico`

- [ ] H2 com `text-h2`
- [ ] Tabela 7 colunas — `<div className="overflow-x-auto">` permite scroll lateral
- [ ] Lucro positivo na coluna "Lucro" com `text-lucro` (sálvia, NÃO mais `text-emerald-700`)
- [ ] Top 3 com badge "Top" `border-emerald-500` (preservado, out-of-scope da 6.0)
- [ ] Margem < 20% com badge "Margem baixa" `border-amber-500`
- [ ] Prejuízo com badge `border-destructive`

#### `/financeiro/fluxo-caixa`

- [ ] H2 `text-h2`
- [ ] 3 SummaryCells em grid 1 col mobile: Saldo atual / Entradas / Receita prevista
- [ ] Tabela diária com saldo acumulado em `tabular-nums text-lucro` (positivo) ou `text-destructive` (negativo)
- [ ] Cap de 365 dias funciona: se intervalo > 365, mostra `<EmptyState icon={Clock}>` "Período muito longo"

---

## Jornada 4 — Convidando profissional (Camila contrata)

**Cenário:** Camila contratou nova profissional, precisa dar acesso ao app.

### Passos

1. Sidebar/BottomNav → `/team`
2. Vê membros atuais (lista) + "Convites pendentes" (vazio)
3. EmptyState convites pendentes → CTA "Enviar convite"
4. `/team/convites` → form de convite por email
5. Envia → email é disparado pelo Resend
6. Email chega na inbox da convidada

### O que validar (mobile 375px)

- [ ] `/team` H1 "Time" com `text-display`
- [ ] Card "Membros" lista usuários atuais com badge de role
- [ ] Card "Convites pendentes": **EmptyState** com `Mail` icon + CTA "Enviar convite"
- [ ] **Toque no CTA** → leva para `/team/convites` (não 404, não erro)
- [ ] `/team/convites` form com email + role select + botão "Enviar"
- [ ] Botão tem `font-semibold` (Story 6.1) — peso 600 visualmente forte
- [ ] **Botão `min-h-[44px]`** confortável para toque

### Smoke crítico — FAB contextual em `/team`

- [ ] Em `/team`: FAB do BottomNav com `aria-label="Criar novo agendamento"` (fallback default da 6.5)
- [ ] Toque → vai para `/agenda?novo=1` (NÃO para `/team/convites` — convite é via página, não FAB)

---

## Jornada 5 — Alerta de estoque baixo

**Cenário:** Camila vê alerta "Estoque baixo" no dashboard, quer entender quais insumos.

### Passos

1. `/dashboard` → AlertasCard mostra "Estoque baixo: 3 insumos abaixo do nível"
2. Toca `[Investigar →]` → vai para `/estoque/insumos`
3. Vê lista de insumos com badge "Recompra" naqueles em estoque baixo
4. Toca um insumo → `/estoque/insumos/[id]` → ajusta `reorder_level` ou registra entrada manual

### O que validar (mobile 375px)

- [ ] `/estoque/insumos` H2 "Insumos" com `text-h2`
- [ ] Lista de insumos com badge "Recompra" via `<StatusBadge>` (warning amber)
- [ ] **FAB contextual em `/estoque/insumos`**: `aria-label="Cadastrar novo insumo"` → toque → `/estoque/insumos/novo`
- [ ] Form de novo insumo com Zod validation; campo `unit_cost` com vírgula brasileira aceita
- [ ] `/estoque/movimentacoes`: lista read-only com `<StatusBadge>` por tipo (entrada/saída/consumo/perda)
- [ ] Empty state com `<ArrowDownCircle>` "Sem movimentações ainda" (não `<p>` plano)

---

## Jornada 6 — Cancelamento/falta

**Cenário:** Cliente cancela última hora. Camila precisa atualizar status para que receita prevista caia.

### Passos

1. `/agenda` → click no evento da cliente que cancelou
2. EventDetailSheet abre lateralmente (mobile bottom-sheet)
3. Toca "Cancelar" → AlertDialog com combobox de motivo
4. Seleciona "Cliente cancelou" → confirma
5. Evento aparece em cinza com `<StatusBadge status="cancelado">`
6. Receita prevista no card sticky no topo cai automaticamente

### O que validar (mobile 375px)

- [ ] `/agenda` toolbar funciona em mobile (Hoje/Anterior/Próximo + filtro profissional)
- [ ] FullCalendar default = `timeGridDay` em mobile (não `timeGridWeek`)
- [ ] Toque em evento → sheet abre **bottom-sheet** mobile
- [ ] Sheet com badge azul "Agendado" (StatusBadge) + 3 botões
- [ ] AlertDialog "Cancelar" tem combobox + textarea — botões `[Confirmar][Cancelar]` com `min-h-[44px]`
- [ ] Após confirmar → toast Sonner sucesso em **sálvia** (não emerald default — Story 6.2 AC2.6)
- [ ] **`<ReceitaCard>` sticky** no topo da agenda atualiza automaticamente (revalidatePath chamado pela mutation)
- [ ] Comparativo na receita: "R$ X a menos que ontem" (textual absoluto, não %)

---

## Smoke geral em mobile 375px

### Touch targets

- [ ] **TODOS** os botões clicáveis cumprem 44×44px mínimo
- [ ] FAB do BottomNav: 56px (`h-14 w-14`)
- [ ] Links da Sidebar (em desktop, ignora em mobile): `py-3` ≈ 48px
- [ ] AlertCard `[Investigar →]` e `[Silenciar 7 dias]`: `min-h-[44px]`

### Tipografia

- [ ] Display 56px peso 200 lê bem (não fica fino demais em telas baixa-densidade)
- [ ] Body 16px line-height 1.5 não cansa
- [ ] Tabular-nums em todos os números monetários — colunas alinhadas

### Cores e contraste

- [ ] `text-lucro` (sálvia #457A50) sobre branco: legível
- [ ] `text-lucro` sobre `bg-muted/30`: ainda legível? (concern C1 da 6.0 — ~4.2:1 marginal AA)
- [ ] `text-destructive` (vermelho terra) sobre branco: passa AA
- [ ] **Sem azul-corporativo** em nenhum lugar (princípio inegociável)
- [ ] **Sem rosa-bebê** (princípio inegociável da idealizadora)

### Motion

- [ ] Animações duram **menos de 300ms** (exceto rota 400ms e `pulseOnce` 1500ms)
- [ ] **Sem morphing de dígitos** em KPI value (AnimatePresence mode="wait")
- [ ] **Espaçamentos preservados** durante animação (`transform`, não `margin`/`padding`)
- [ ] Toggle DevTools `prefers-reduced-motion: reduce` → **TODAS** as animações zeram

### Pt-BR

- [ ] Acentuação correta em **toda** copy de UI (sem "nao", "voce", "acao", "portugues")
- [ ] Tom mentora confiável: "Você silenciou todos os alertas ativos. Eles voltam automaticamente após 7 dias..."
- [ ] Sem inglês solto em copy ("loading", "submit", "delete")

---

## Resultado da validação — preencher após percorrer

| Jornada | Status | Issues encontradas |
|---------|--------|---------------------|
| J1 — Onboarding | ☐ OK / ☐ PARCIAL / ☐ FALHA | |
| J2 — Dia típico mobile | ☐ OK / ☐ PARCIAL / ☐ FALHA | |
| J3 — Fechamento de mês | ☐ OK / ☐ PARCIAL / ☐ FALHA | |
| J4 — Convidando profissional | ☐ OK / ☐ PARCIAL / ☐ FALHA | |
| J5 — Alerta de estoque | ☐ OK / ☐ PARCIAL / ☐ FALHA | |
| J6 — Cancelamento/falta | ☐ OK / ☐ PARCIAL / ☐ FALHA | |

### Issues catalogadas (preencher)

| # | Severidade | Tela | Descrição | Fix sugerido |
|---|------------|------|-----------|--------------|
| | HIGH/MEDIUM/LOW | | | |

---

## Próximos passos após validação

- **Tudo OK**: produto pronto para go-to-market. Considerar Phase 5+ ou primeira validação com Camila real.
- **Issues HIGH**: abrir Story 6.6 (higienização pós-validação) com pre-implementação Phase 2.5.
- **Issues MEDIUM**: backlog. Não bloqueia.
- **Issues LOW**: backlog cosmético. Opportunistic cleanup.

---

## Apêndice: comandos rápidos durante validação

```bash
# Status do dev server
ps aux | grep "next dev" | grep -v grep

# Reiniciar dev server se travar
kill $(pgrep -f "next dev") && pnpm dev &

# Ver logs em tempo real
tail -f /private/tmp/claude-501/-Users-luizhenrique-keyra/4c7c63cb-e2d2-40a3-ba27-788680de61e8/tasks/bezjrn3j8.output

# Forçar rebuild
rm -rf apps/web/.next && pnpm dev

# Validar HTTP rápido
curl -s -o /dev/null -w "%{http_code}\n" -A "Mozilla/5.0 (iPhone) Mobile" http://localhost:3000/dashboard
```
