# 04 — Cadastros (Padrão CRUD)

> **Rastreia:** FR-PA-01..02, FR-SV-01..04, FR-ES-01, FR-FI-02..03, FR-CP-01..02
> **Routes:** `/pacientes`, `/servicos`, `/insumos`, `/financeiro/despesas`

---

## 1. Objetivo

Definir o **padrão único** de formulário CRUD para todos os cadastros do MVP.
A usuária vai preencher estes formulários muitas vezes — padrão unificado reduz
curva de aprendizado.

Princípios:
1. **Label em cima do input** (não ao lado) — mobile-first, mais legível
2. **Validação inline com Zod** (mostra erro ao sair do campo, não só no submit)
3. **Autosave rascunho** em cadastros longos (servicos e insumos) — evita perda
4. **1 ação primária** por tela — nunca 2 botões "Salvar" e "Salvar e novo"
   competindo em peso visual

---

## 2. Padrão de listagem (aplicável a todos)

```
┌──────────────────────────────────────────────────────────────────────┐
│ ← Pacientes                                     [+ Novo paciente]    │
│                                                                      │
│ [🔍 Buscar por nome, telefone ou e-mail...]   Filtro ▾  Exportar ▾   │
│                                                                      │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ Nome                Telefone            Última visita    Ações   │ │
│ │ ────────────────────────────────────────────────────────────     │ │
│ │ Ana Pereira         (11) 98765-4321     12/04/2026      [...]    │ │
│ │ Bruna Lima          (11) 99876-5432     08/04/2026      [...]    │ │
│ │ Carla Dias          (11) 97654-3210     02/04/2026      [...]    │ │
│ │ Julia Mendes        (11) 91234-5678     —               [...]    │ │
│ │ Maria Silva         (11) 98123-4567     10/03/2026      [...]    │ │
│ │ ...                                                              │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│ Mostrando 5 de 127 pacientes                           [< 1 2 3 >]   │
└──────────────────────────────────────────────────────────────────────┘
```

**Componentes:**
- Tabela: `<Table>` do shadcn + TanStack Table (headless)
- Busca: `<Input>` com debounce 300ms + ícone `<Search>` dentro
- Filtro: `<DropdownMenu>` com checkboxes de filtros salvos
- Exportar: `<DropdownMenu>` com opções CSV/PDF
- Paginação: componente próprio `<Pagination>` (compõe `<Button>`s)

**Click em linha:** abre `<Sheet>` lateral com detalhes (não navega). Edição inline no sheet.
**Ações `[...]`:** DropdownMenu com "Editar" / "Ver detalhes" / "Excluir" (com confirmação).

---

## 3. Padrão de formulário — estrutura canônica

```
┌────────────────────────────────────────────────────────────┐
│ ← Novo paciente                                            │  breadcrumb
│ Cadastre os dados do paciente. Só nome e telefone são      │  description
│ obrigatórios — o resto você preenche quando tiver tempo.   │
│ ────────────────────────────────────────────────────────── │
│                                                            │
│  «Nome completo» *                                         │
│  [                                              ]          │
│                                                            │
│  «Telefone» *                                              │
│  [ (11) 98765-4321                              ]          │
│                                                            │
│  «E-mail»                                                  │
│  [ maria@exemplo.com                            ]          │
│                                                            │
│  «Data de nascimento»                                      │
│  [ 15/03/1985 ]                                            │
│                                                            │
│  «Observações»                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                            │
│  ────────────────────────────────────────────────────────  │
│                                                            │
│                            [ Cancelar ]   [ Salvar ]       │
└────────────────────────────────────────────────────────────┘
```

**Regras de estilo:**
- Label **acima** do input, `text-sm font-medium text-neutral-700`
- Asterisco `*` = obrigatório (cor `text-prejuizo`)
- Helper text abaixo: `text-xs text-neutral-500`
- Erro: `text-xs text-prejuizo` + borda do input `border-prejuizo`
- Spacing vertical entre campos: `space-y-4` (16px)
- Rodapé com `<Separator>` + CTAs alinhados à direita (desktop) ou full-width (mobile)
- CTA primário (`Salvar`) = `<Button>` (variant default, primary-500)
- CTA secundário (`Cancelar`) = `<Button variant="ghost">`

---

## 4. Cadastros do MVP — campos específicos

### 4.1 Pacientes (FR-PA-01)

| Campo | Tipo | Obrigatório | Zod |
|-------|------|-------------|-----|
| Nome completo | text | ✓ | `z.string().min(2).max(120)` |
| Telefone | text (masked) | ✓ | `z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/)` |
| E-mail | email | — | `z.string().email().optional()` |
| Data de nascimento | date | — | `z.date().max(new Date()).optional()` |
| Observações | textarea | — | `z.string().max(1000).optional()` |

### 4.2 Serviços (FR-SV-01, FR-SV-02, FR-SV-03)

Formulário mais longo — usa seções visuais.

```
┌────────────────────────────────────────────────────────────┐
│ ← Novo serviço                                             │
│ ────────────────────────────────────────────────────────── │
│                                                            │
│  IDENTIFICAÇÃO                                             │
│                                                            │
│  «Nome do serviço» *                                       │
│  [                                              ]          │
│                                                            │
│  «Categoria» *                                             │
│  [ Facial ▾ ]                                              │
│                                                            │
│  «Duração» *                                               │
│  [ 60 minutos ▾ ]                                          │
│                                                            │
│  ────────────────────────────────────────────────────────  │
│                                                            │
│  PREÇO E CUSTO                                             │
│                                                            │
│  «Preço de venda» *                                        │
│  [ R$ 0,00 ]                                               │
│                                                            │
│  «Comissão do profissional»                                │
│  ( 0% )  (10%)  (15%)  (◉ 20%)  (25%)  ( Outro: [  %] )    │
│                                                            │
│  💡 Lucro estimado (sem insumos): R$ 144,00 (80%)          │
│                                                            │
│  ────────────────────────────────────────────────────────  │
│                                                            │
│  INSUMOS UTILIZADOS (rateio automático por atendimento)    │
│                                                            │
│  [+ Adicionar insumo]                                      │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Ácido hialurônico       1 frasco   R$ 35,00   [×]    │  │
│  │ Seringa descartável     2 unidades R$ 8,00    [×]    │  │
│  │ Álcool 70%              0,1 litro  R$ 2,00    [×]    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  Custo total de insumos: R$ 45,00                          │
│                                                            │
│  💡 Lucro real (preço − insumos − comissão):               │
│     R$ 180 − R$ 45 − R$ 36 = R$ 99,00 (55%)                │
│                                                            │
│  ────────────────────────────────────────────────────────  │
│                                                            │
│                            [ Cancelar ]   [ Salvar serviço]│
└────────────────────────────────────────────────────────────┘
```

**Anotações:**
- Callouts `💡` recalculam lucro reativamente (Zustand ou react-hook-form watch)
- Comissão como radio chips (valores pré-definidos comuns + "Outro" com input)
- Lista de insumos é componente `<FieldArray>` com react-hook-form
- Autosave rascunho a cada 5s (indicador sutil: "Salvo há 3 segundos")

### 4.3 Insumos (FR-ES-01)

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Nome | text | ✓ |
| Unidade de medida | select (un, ml, g, litro, frasco, etc) | ✓ |
| Custo unitário | currency | ✓ |
| Quantidade em estoque | number | ✓ |
| Nível mínimo (alerta) | number | — |
| Fornecedor (nome) | text | — |
| Fornecedor (telefone) | phone | — |

### 4.4 Despesas (FR-FI-02, FR-FI-03)

```
┌────────────────────────────────────────────────────────────┐
│ ← Nova despesa                                             │
│ ────────────────────────────────────────────────────────── │
│                                                            │
│  «Descrição» *                                             │
│  [ Aluguel do consultório                       ]          │
│                                                            │
│  «Valor» *                                                 │
│  [ R$ 1.800,00 ]                                           │
│                                                            │
│  «Data» *                                                  │
│  [ 05/04/2026 ]                                            │
│                                                            │
│  «Categoria» *                                             │
│  [ Aluguel ▾ ]                                             │
│  ( sugestões: Aluguel · Energia · Internet · Salários ·    │
│    Marketing · Material de limpeza · Outros )              │
│                                                            │
│  «Tipo de custo» *                                         │
│  [◉ Fixo (todo mês)]  [ Variável (por atendimento) ]       │
│                                                            │
│  «Forma de pagamento»                                      │
│  [ Débito automático ▾ ]                                   │
│                                                            │
│  «Fornecedor» (opcional)                                   │
│  [                                              ]          │
│                                                            │
│  ☐ Esta é uma despesa recorrente (repetir mensalmente)     │
│                                                            │
│                            [ Cancelar ]   [ Salvar ]       │
└────────────────────────────────────────────────────────────┘
```

**Anotações:**
- Categorias pré-configuradas (FR-FI-05 — plano de contas estética)
- Recorrência: se marcado, gera transações futuras automaticamente (cron job mensal)
- "Tipo de custo" usa linguagem coloquial (CON-UX-05): "todo mês" / "por atendimento"
  em vez de "fixo" / "variável"

---

## 5. Estados do formulário

### 5.1 Em edição (padrão)
- CTA "Salvar" = `<Button>` habilitado
- Autosave badge sutil: "Alterado" (canto superior direito do form)

### 5.2 Salvando
- CTA "Salvar" = `<Button disabled>` com spinner inline e texto "Salvando..."
- Inputs ficam `readonly` para evitar conflito

### 5.3 Salvo (feedback de sucesso)
- Toast sonner: "Paciente cadastrado!" (4s)
- Redireciona para listagem (`/pacientes`) ou permanece com "Salvo!" badge
  sutil (decisão por tipo de cadastro — ver abaixo)
- **Pacientes** → redireciona para listagem
- **Serviços** → permanece na tela (autosave ongoing) com opção "Cadastrar outro"
- **Insumos** → redireciona para listagem
- **Despesas** → redireciona para `/financeiro/despesas`

### 5.4 Erro de validação (client-side, Zod)
- Campos com erro: `border-prejuizo ring-2 ring-prejuizo-200`
- Mensagem abaixo do campo: `text-xs text-prejuizo`
- Scroll automático para primeiro campo com erro
- `aria-invalid="true"` + `aria-describedby` apontando para mensagem

### 5.5 Erro de servidor (ex: duplicado)
```
⚠ Já existe um paciente com este telefone.
   [ Ver paciente existente ]   [ Continuar mesmo assim ]
```
Não apaga dados do form — usuária pode ajustar e retentar.

### 5.6 Empty state da listagem
```
┌────────────────────────────────────────────────┐
│                                                │
│                   👥                            │
│                                                │
│        Nenhum paciente cadastrado              │
│                                                │
│  Cadastre seus pacientes para começar a        │
│  agendar atendimentos.                         │
│                                                │
│       [+ Cadastrar primeiro paciente]          │
│                                                │
│  Ou [Importar de planilha CSV →] (pós-MVP)     │
│                                                │
└────────────────────────────────────────────────┘
```

---

## 6. Exclusão — confirmação

Padrão: `<AlertDialog>` do shadcn (diferente de Dialog comum).

```
┌────────────────────────────────────────────────┐
│  Excluir paciente?                             │
│                                                │
│  Maria Silva tem 3 agendamentos futuros.       │
│  Excluir este paciente vai:                    │
│   • Cancelar os agendamentos                   │
│   • Preservar histórico financeiro (auditoria) │
│   • NÃO afetar comandas já pagas               │
│                                                │
│  Esta ação não pode ser desfeita.              │
│                                                │
│             [ Cancelar ]   [ Excluir paciente ]│  prejuizo variant
└────────────────────────────────────────────────┘
```

**Impacto explícito** — não apenas "tem certeza?" genérico.

---

## 7. Mobile

Formulários mobile: **full-screen** (não modal), com header fixo e CTA sticky no
bottom.

```
┌──────────────────────────────┐
│ ← Novo paciente         ✕    │  h-14 sticky
├──────────────────────────────┤
│                              │
│  «Nome completo» *           │
│  [                         ] │
│                              │
│  «Telefone» *                │
│  [ (11) 98765-4321         ] │
│                              │
│  ...                         │
│                              │
│  (scroll)                    │
│                              │
├──────────────────────────────┤
│ [      Salvar paciente     ] │  sticky bottom
└──────────────────────────────┘
```

Listagens mobile: cards em vez de tabela (linhas muito largas para celular).

```
┌──────────────────────────────┐
│ ← Pacientes        [+ Novo]  │
├──────────────────────────────┤
│ [🔍 Buscar pacientes...]     │
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │ Ana Pereira              │ │
│ │ (11) 98765-4321          │ │
│ │ Última visita: 12/04     │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ Bruna Lima               │ │
│ │ (11) 99876-5432          │ │
│ │ Última visita: 08/04     │ │
│ └──────────────────────────┘ │
│ ...                          │
└──────────────────────────────┘
```

---

## 8. Acessibilidade

- `<Label htmlFor>` associado a cada input (não usar `aria-label` sozinho em forms)
- Erros: `aria-invalid="true"` + `aria-describedby="{field}-error"`
- Campos obrigatórios: asterisco visual + `aria-required="true"`
- AlertDialog: focus trap + ESC fecha + foco retorna
- Dentro de formulário longo: `<fieldset>` + `<legend>` para seções (Identificação, Preço, etc)
- Máscara de telefone/moeda: usar `<input inputMode="tel">` / `inputMode="decimal"` para teclado certo em mobile

---

## 9. Decisões registradas

| ID | Decisão | Razão |
|----|---------|-------|
| CAD-01 | Label acima do input | Mobile-first, mais legível, padrão shadcn |
| CAD-02 | Validação inline on-blur (Zod) | Feedback imediato sem ser intrusivo durante digitação |
| CAD-03 | Autosave em serviços (formulário longo) | Previne perda de insumos complexos já preenchidos |
| CAD-04 | Categorias pré-configuradas para despesa | FR-FI-05 — usuária não precisa inventar taxonomia |
| CAD-05 | "Tipo de custo" com linguagem coloquial (não "fixo/variável") | CON-UX-05 |
| CAD-06 | Listagem mobile usa cards (não tabela) | Tabela 4 colunas ilegível em 360px |
| CAD-07 | Exclusão mostra impacto explícito | Evita arrependimento + LGPD (usuária precisa entender) |
| CAD-08 | Callouts 💡 com cálculo de lucro em serviços | Educa + reforça posicionamento (lucro por serviço) |

---

## 10. Dependências

- shadcn: `form`, `input`, `label`, `textarea`, `select`, `checkbox`, `radio-group`, `switch`, `calendar`, `popover`, `command`, `alert-dialog`, `table`, `pagination`
- react-hook-form + `@hookform/resolvers/zod`
- Máscaras: `react-number-format` para currency; `imask` para phone
- TanStack Table para listagens (sort, filter, pagination headless)
