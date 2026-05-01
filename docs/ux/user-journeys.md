# Jornadas de Usuário — KEYRA

**Status:** ativo a partir de 2026-05-01.
**Persona-norte:** Camila, 34 anos, dona da Clínica Estética da Camila em São Paulo. Atende biomedicina estética + harmonização facial. 3 profissionais (Camila + 2 esteticistas). Sem assistente. Toca WhatsApp + agenda + caixa entre atendimentos. Ensino superior, não-financista. Já usou Trinks no passado, abandonou por achar "antiquado e complicado". Hoje toca a clínica em planilha + WhatsApp + agenda Google.

**Por que isso importa:** as 6 jornadas abaixo são a **fonte de verdade** para validar que o KEYRA funciona end-to-end. Toda story Done precisa garantir que as jornadas que ela toca continuam fluindo (checklist de validação ao fim de cada jornada). Sem isso, o sistema pode ter typecheck verde e jornada quebrada.

---

## Jornada 1 — Primeira semana de uso (onboarding)

**Contexto:** Camila acabou de pagar o primeiro mês, recebeu o convite, vai configurar a clínica.

| # | Ação | Tela | Dados criados | Validação esperada |
|---|------|------|---------------|---------------------|
| 1 | Recebe email de convite com magic link | (email) | — | Email chega < 60s, branding KEYRA, botão "Acessar a KEYRA" funciona |
| 2 | Clica no link, autentica | `/login` → `/onboarding/nova-organizacao` | sessão | Magic link autentica, redireciona pro onboarding |
| 3 | Preenche "Clínica Estética da Camila" + CNPJ | `/onboarding/nova-organizacao` | `organizations`, `memberships` (owner), seed de plano de contas, payment_methods, accounts | RPC `create_organization_with_owner` cria org + seed em uma transação |
| 4 | É redirecionada para `/dashboard` | `/dashboard` | — | Dashboard renderiza vazio amigável: "Conclua atendimentos pra ver os números aqui" |
| 5 | Abre `/team/profissionais`, cadastra 2 esteticistas (Bruna e Rita) | `/team/profissionais` | 2× `professionals` | Form aceita nome + email + comissão %, lista atualiza, sem erro |
| 6 | Abre `/servicos`, cadastra 4 serviços (Limpeza R$ 180, Drenagem R$ 220, Massagem R$ 160, Botox R$ 800) | `/servicos/novo` | 4× `services` | Form valida preço >= 0, duração em min, comissão entre 0-100% |
| 7 | Cadastra 2 categorias de serviço (Facial, Corporal) | `/servicos/categorias` | 2× `service_categories` | Categorias aparecem no select do form de serviço |
| 8 | Cadastra 3 insumos (Toxina 100u R$ 5/u · Algodão pacote R$ 0,50/un · Gel hidratante 50ml R$ 12) | `/estoque/insumos/novo` | 3× `supplies` | Custo unitário aceita decimal, badge "recompra" aparece quando estoque ≤ reorder |
| 9 | Vincula Toxina 50u ao serviço Botox no card BOM | `/servicos/[id]` (tab Insumos) | 1× `service_supplies` | services.unit_cost recalcula para 50 × 5 = R$ 250 |
| 10 | Cadastra 5 pacientes (clientes recorrentes que ela já atende) | `/pacientes/novo` | 5× `customers` | CPF mascarado, telefone com máscara BR, busca fuzzy funciona |
| 11 | Define meta do mês: receita R$ 15.000, lucro R$ 8.000 | `/financeiro/metas` | 1× `goals` | Card "Meta do mês" aparece no dashboard |

**Tempo estimado:** 25-40 minutos. Validação ponta-a-ponta: ao final, dashboard mostra meta, agenda vazia, KPIs zerados, todos os cadastros refletidos.

---

## Jornada 2 — Dia típico de trabalho (heavy use)

**Contexto:** Camila chega às 8h30, primeira sessão começa 9h. Toca tudo entre atendimentos no celular (mobile crítico).

| # | Ação | Tela | Dados criados/modificados | Validação esperada |
|---|------|------|----------------------------|---------------------|
| 1 | Abre KEYRA no celular pela manhã | `/dashboard` (mobile) | — | Carrega < 2s, KPIs visíveis (receita realizada · prevista · despesas · lucro), agenda do dia mostra 6 horários, BottomNav funciona |
| 2 | Toca em "Agenda" no BottomNav | `/agenda` (mobile, view dia) | — | View do dia em mobile, scroll vertical funciona, evento clicável |
| 3 | Atende cliente Maria (Limpeza) → toca no evento → "Concluir atendimento" | sheet detalhe → AlertDialog | `appointments.status='done'` + trigger gera `commands` + `command_items` | Toast "Atendimento concluído. Comanda gerada automaticamente." Sheet fecha. Evento muda cor (verde sálvia) |
| 4 | Cliente Maria pediu sérum extra (R$ 80) → toca em "Comandas" → última comanda | `/comandas/[id]` | — | Status "Aberta", item "Limpeza" snapshotado |
| 5 | Adiciona item "Sérum Hidratante R$ 80" via picker | comanda-edit-form | `command_items` (novo) → trigger recompõe `commands.subtotal` | Subtotal: R$ 260 (180+80), total: 260 |
| 6 | Aplica desconto R$ 20 (cliente fiel) | comanda-edit-form (input desconto) | `commands.discount_amount=20` → GENERATED `total=240` | Total: R$ 240 |
| 7 | Finaliza comanda | botão "Finalizar comanda" → AlertDialog | `commands.status='finalized'` | Status muda para "Finalizada", controles de edição somem, botão "Registrar pagamento" aparece |
| 8 | Cliente paga R$ 240 via Pix → registra pagamento | sheet `<PaymentForm>` | `payments` (gross 240, fee 0, net 240) → trigger cria `transactions` (credit) + atualiza comanda para `paid` + dispara `_consume_command_inventory` | Toast "Pagamento de R$ 240,00 registrado.". Comanda vira "Paga". ConsumoCard aparece (se houver BOM) |
| 9 | Volta para a agenda, atende próximo cliente | `/agenda` | — | Página recompõe (revalidatePath), KPIs do dashboard atualizam ao voltar |
| 10 | Final do dia, verifica dashboard | `/dashboard` | — | Receita realizada subiu R$ 240, lucro do mês atualizado, agenda do dia mostra X concluídos |

**Tempo estimado:** ~6-10 atendimentos/dia × 90s de KEYRA por atendimento = **9-15 min/dia** de uso ativo. Validação: cada interação leva ≤ 2 cliques sem precisar buscar nada.

---

## Jornada 3 — Fechamento de mês (visão financeira)

**Contexto:** Último dia útil do mês, Camila quer entender o resultado, definir meta do próximo mês.

| # | Ação | Tela | Dados criados/modificados | Validação esperada |
|---|------|------|----------------------------|---------------------|
| 1 | Lança despesas mensais (aluguel R$ 3.500, luz R$ 380, internet R$ 150, salário Bruna R$ 2.800, salário Rita R$ 2.800) | `/financeiro/despesas/nova` × 5 | 5× `transactions` (debit) com is_fixed=true | Cada despesa salva, aparece em /financeiro/despesas, soma do mês atualiza |
| 2 | Abre `/financeiro/dre` para ver resultado | `/financeiro/dre` | — | DRE narrativa: Receita Bruta − Taxas − Custos Variáveis − Comissões − Custos Fixos − Despesas = Lucro Líquido. Comparativo vs mês passado em cada linha |
| 3 | Olha `/financeiro/dre-por-servico` para entender quais procedimentos foram mais lucrativos | `/financeiro/dre-por-servico` | — | Tabela ordenada por lucro DESC. Top 3 com badge verde, margem baixa âmbar, prejuízo vermelho. Camila vê que "Botox" é o mais rentável |
| 4 | Confere `/financeiro/dre-por-profissional` | `/financeiro/dre-por-profissional` | — | Lista profissionais por lucro líquido (após comissão). Camila aparece em 1º (proprietária + executora) |
| 5 | Verifica `/financeiro/fluxo-caixa` para projeção | `/financeiro/fluxo-caixa` | — | Saldo atual, tabela diária, receita prevista do próximo mês via `v_receitas_previstas` |
| 6 | Define meta para próximo mês: receita R$ 18.000, lucro R$ 10.000 | `/financeiro/metas` | 1× `goals` | Meta nova entra na lista, card "Meta do mês" do dashboard atualiza no virar do mês |
| 7 | Bate olho final no `/dashboard` antes de sair | `/dashboard` | — | KPIs consolidados + alertas (se houver: queda de lucro, margem baixa, alta no-show, estoque baixo) + meta atualizada |

**Tempo estimado:** ~30-45 min/mês. Validação: Camila consegue tomar decisão "vou parar de oferecer drenagem porque é o serviço de menor margem" sem precisar de planilha.

---

## Jornada 4 — Convidando profissional novo

**Contexto:** Camila contratou nova esteticista Patrícia. Quer dar acesso à agenda dela.

| # | Ação | Tela | Dados criados/modificados | Validação esperada |
|---|------|------|----------------------------|---------------------|
| 1 | Cadastra Patrícia em `/team/profissionais` | `/team/profissionais` | 1× `professionals` | Form aceita nome + email + cor (pra agenda) + comissão padrão + centro de custo |
| 2 | Cria convite em `/team/convites/novo` | `/team/convites/novo` | 1× `organization_invites` + email enviado via Resend | Email chega na caixa da Patrícia em < 60s com link `https://usekeyra.com/invites/{token}` |
| 3 | Patrícia clica no link, magic link autentica, aceita o convite | `/invites/[token]` → `/login?next=/invites/...` → `/dashboard` | `memberships` (role: professional) + `accepted_at` no convite | Patrícia entra no dashboard com role professional (vê só agenda dela + comandas dela) |
| 4 | Camila vê Patrícia em `/team` como membro ativo | `/team` | — | Lista membros mostra Patrícia com badge "professional" |
| 5 | Camila cria agendamento atribuindo Patrícia como profissional | `/agenda` | `appointments.professional_id` | Filtro "Por profissional" no toolbar inclui Patrícia |

**Tempo estimado:** 5 min Camila + 2 min Patrícia. Validação: Patrícia vê a própria agenda mas não vê DRE da clínica (RLS por role).

---

## Jornada 5 — Lidando com alerta (estoque baixo)

**Contexto:** Camila vê alerta no dashboard sobre 3 insumos abaixo do nível de recompra.

| # | Ação | Tela | Dados criados/modificados | Validação esperada |
|---|------|------|----------------------------|---------------------|
| 1 | Abre dashboard, vê alerta `<AlertCard severity="warning">` | `/dashboard` | — | Card aparece apenas quando há alerta ativo. Cor âmbar, ícone TrendingAlert, descrição "3 insumos abaixo do nível de recompra" |
| 2 | Clica em "Investigar →" | redireciona para `/estoque/insumos` | — | Lista de insumos abre com filtro implícito ou destaque dos com badge "Recompra" |
| 3 | Identifica os 3 insumos críticos (Toxina, Algodão, Gel) | `/estoque/insumos` | — | Badge "Recompra" visível em cada um |
| 4 | Compra os insumos no fornecedor (offline) | (offline) | — | — |
| 5 | Volta no KEYRA → registra entrada manual (Phase 5+, hoje só via SQL) | (Phase 5+ UI) | `inventory_movements` (entry, +N) → trigger atualiza `supplies.current_stock` | Estoque sobe acima do reorder_level → alerta some do dashboard no próximo carregamento |

**Tempo estimado:** 3 min de KEYRA + tempo de compra. Validação: o alerta DESAPARECE no dashboard sem ela precisar fazer nada manual após estoque normalizar.

**Nota:** entrada manual de estoque é Phase 5 — registrar como tech debt UX que a Jornada 5 fica truncada no MVP.

---

## Jornada 6 — Cliente cancelando ou faltando

**Contexto:** Cliente Joana liga 2h antes da sessão cancelando. Camila precisa registrar no sistema.

| # | Ação | Tela | Dados criados/modificados | Validação esperada |
|---|------|------|----------------------------|---------------------|
| 1 | Abre `/agenda`, encontra agendamento da Joana | `/agenda` (week ou day view) | — | Evento clicável, sheet de detalhes abre |
| 2 | Toca em "Cancelar" no sheet | sheet detalhe → AlertDialog `<CancelAppointmentDialog>` | — | Dialog abre com combobox de motivos pré-definidos + textarea livre |
| 3 | Escolhe "Paciente desmarcou" → confirma | combobox + Confirmar | `appointments.status='cancelled'` + `cancelled_at` + `cancel_reason='Paciente desmarcou'` | Toast "Agendamento cancelado.", evento muda para opacity-40, dashboard atualiza receita prevista |
| 4 | Verifica que receita prevista do mês caiu (`/dashboard` → KPI Receita prevista) | `/dashboard` | — | Card "Receita prevista" mostra valor menor (revalidatePath foi chamado) |
| 5 | Caso de FALTA (cliente não apareceu) — Camila marca após 30 min do horário | sheet → "Falta (no_show)" → AlertDialog confirmação | `appointments.status='no_show'` | Toast "Falta registrada." Se acumular 25%+ no mês, alerta de "alta taxa de faltas" aparece no dashboard |

**Tempo estimado:** 1 min/cancelamento. Validação: Camila vê impacto no caixa imediatamente (não precisa esperar relatório mensal).

---

## Como aplicar essas jornadas no fluxo de stories

### Para stories NOVAS (a partir de Sprint 6)

Cada story deve incluir uma seção `## Validação de jornada de usuário` listando:

1. **Jornadas afetadas** (das 6 acima): J1 / J2 / J3 / J4 / J5 / J6.
2. **Passos da(s) jornada(s) tocados**: ex.: "J2 passo 7-8".
3. **Checklist de validação ponta-a-ponta** (ao fim da implementação, simular o passo manualmente em prod ou em smoke transacional):
   - [ ] Persona consegue executar o passo sem ler documentação?
   - [ ] Toast/feedback aparece em ≤ 1s da ação?
   - [ ] Dado persistido reflete na próxima tela aberta (revalidatePath funciona)?
   - [ ] Se dispara trigger de banco, o efeito do trigger é visível na UI sem reload?
   - [ ] Mobile e desktop funcionam (quando aplicável)?

### Para stories já FECHADAS (Sprint 1-5)

Adicionar checklist retroativo no QA Results de cada story na próxima sessão de manutenção. Não vamos voltar e adicionar agora — registramos como dívida de validação.

### Smoke ponta-a-ponta antes de cada Sprint fechar

A partir da Sprint 6, abrir o smoke não só transacional (psql + ROLLBACK) mas também **simulação de jornada em prod**:
- Abrir `https://usekeyra.com` no celular real (não só desktop).
- Executar a Jornada 2 (dia típico) inteira do início ao fim.
- Validar que cada passo funciona sem rolar console, sem erro, sem precisar refrescar.

---

## Tom-norte para validações

- **Persona não-financista**: se uma tela exige que ela saiba o que é "DRE" ou "MTD" sem contexto, está mal documentada. Copy precisa de carinho extra (ver `docs/ux/copy-guidelines.md`).
- **Mobile crítico**: Camila usa celular entre atendimentos 80% das vezes. Toda jornada precisa funcionar em viewport 375px sem desktop.
- **Speed > recursos**: ela tem 90s entre clientes. Cada interação precisa caber em 2 toques no celular. Nada de "vá em X → depois em Y → depois clique em Z".

---

## Manutenção deste documento

| Quando atualizar | O quê |
|------------------|-------|
| Nova feature que muda fluxo da persona | Adicionar/atualizar passos da jornada afetada |
| Persona muda (research nova) | Reformular contexto + jornadas |
| Story de pós-MVP (Phase 5+) introduz novo cenário | Criar Jornada 7+ se for uso recorrente |
