# Copy Guidelines KEYRA

**Status:** ativo a partir da Story 5.6 (2026-05-01).
**Persona:** mulheres empreendedoras donas de clínicas de estética. Não-financistas, tocam o negócio entre atendimentos.
**Tom-norte:** mentora confiável. Não fria. Não maternal. Não técnica.

---

## Tradução de termos técnicos → humanos

Quando você está escrevendo copy de UI (botões, labels, mensagens, descrições), prefira o lado humano da tabela:

| Técnico | Humano (preferir) |
|---------|-------------------|
| `paid` / "pago pelo cliente" | "paga" |
| `done` / "atendimento finalizado" | "concluído" |
| `cancelled` | "cancelado" |
| `no_show` | "falta" |
| `MTD` / `month to date` | "este mês" |
| `YTD` / `year to date` | "este ano" |
| `revenue` / "receita realizada" | "dinheiro que entrou" |
| `expense` | "despesa" |
| `net profit` | "lucro líquido" / "o que sobrou" |
| `gross revenue` | "receita bruta" / "antes das taxas" |
| `BOM` (bill of materials) | "insumos do serviço" |
| "use o botão acima" | CTA real (Link/Button apontando direto) |
| `slot` | "horário" |
| `user` / `usuário` | "você" |
| "informação" | "info" só em badges; senão "dado" / "número" |
| `record` / "registro" | "lançamento" / "movimento" |
| `transaction` | "movimento" / "lançamento" |
| `status='open'` | "comanda aberta" |
| `status='finalized'` | "comanda finalizada" (pronta para receber pagamento) |
| `status='paid'` | "comanda paga" |

**DRE** mantém — é termo brasileiro e a persona-target convive com contador. **Comissão**, **insumo**, **estoque** ficam.

## Formato pt-BR (regras inegociáveis)

- **Acentuação correta sempre**: `não`, `ação`, `está`, `é`, `também`, `informações`, `você`. NUNCA ASCII puro.
- **Datas**: `format(date, "d 'de' MMM yyyy", { locale: ptBR })` — ex.: "12 de mai. 2026", não "May 12, 2026".
- **Moeda**: `formatBRL(value)` — sempre `R$ 1.234,56`. Nunca `BRL` ou `$1,234.56`.
- **Plurais**: usar formas em pt-BR. `1 atendimento` / `2 atendimentos`. Lógica de plural inline: `{n} {n === 1 ? 'cliente' : 'clientes'}`.
- **Você** (e variações: "sua clínica", "seu time", "seus serviços").

## Padrões de mensagem

### Sucesso (toast)

| Contexto | Copy |
|----------|------|
| Cadastro criado | "{Recurso} cadastrado." |
| Edição salva | "Alterações salvas." |
| Soft-delete | "{Recurso} arquivado." |
| Reativação | "{Recurso} reativado." |
| Status change | "{Ação} feita. {Consequência amigável.}" |

Exemplo bom: "Atendimento concluído. Comanda gerada automaticamente." — diz o que aconteceu + o efeito.

Exemplo ruim: "Status updated successfully." — frio, técnico, sem contexto.

### Erro

Componente `<ErrorMessage>` (`components/keyra/`) padroniza:
- **Título humano**: "Não conseguimos carregar agora."
- **Detalhe técnico** em fonte mono pequena, ao lado de "Se persistir, [detalhe]".
- **Recovery action** quando faz sentido (botão "Tentar novamente").

### Empty state

Componente `<EmptyState>` (`components/keyra/`) padroniza:
- **Ícone outline 24px** em círculo de fundo `bg-muted`.
- **Título** afirmativo ou contextual: "Você ainda não tem pacientes" / "Nada nesse filtro".
- **Descrição** que reforça o valor da feature: "Cadastre quem atende você para ver histórico, ticket médio e LTV de cada cliente."
- **CTA real** apontando para criação ou alternativa.

NÃO escrever: "use o botão acima", "vá em X para fazer Y", "configure antes de usar".

### Confirmação destrutiva

`confirm()` JS nativo é provisório. Quando virar AlertDialog (Story 6.x), seguir padrão:
- **Título** com a pergunta direta: "Arquivar este insumo?"
- **Descrição** do impacto: "Movimentações históricas e BOMs já feitos continuam intactos."
- **Botões**: "Não cancelar" (default focus) + "Confirmar arquivamento" (variant destructive).

## Tom-norte exemplificado

| Tema | Frio (evitar) | KEYRA (preferir) |
|------|---------------|------------------|
| Empty pacientes | "Nenhum paciente cadastrado." | "Você ainda não tem pacientes." |
| Empty agenda | "Sem dados para hoje." | "Nada agendado para hoje." |
| Alerta de queda | "Lucro -23% MoM." | "Atenção: você ganhou R$ X a menos esse mês comparado a {mês passado}. Vale olhar os custos." |
| Sucesso pagamento | "Payment registered." | "Pagamento de R$ 200 registrado." |
| Erro fetch | "Error: {message}" | `<ErrorMessage>` — "Não conseguimos carregar agora." + detalhe pequeno. |
| CTA criação | "Adicionar registro" | "Cadastrar paciente" |

## Checklist final (revisar antes de mergir qualquer copy nova)

- [ ] Toda palavra com acento? `não`, `ação`, `é`, `também`?
- [ ] Usei "você" no lugar de "user/usuário"?
- [ ] Empty state tem CTA real (Link/Button) — não "use o botão acima"?
- [ ] Erro humanizado via `<ErrorMessage>` — não "Erro: {message}"?
- [ ] Status traduzido (`paga`, não `paid`)?
- [ ] Plurais corretos com lógica inline (`{n} {n === 1 ? 'a' : 'b'}`)?
- [ ] Datas via `date-fns` com `locale: ptBR`?
- [ ] Moeda via `formatBRL` ou `formatCentsBRL`?
- [ ] Tom de mentora (não fria, não maternal, não técnica)?
