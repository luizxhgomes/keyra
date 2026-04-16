# 05 — Navegação (Sidebar + Bottom Nav)

> **Rastreia:** NFR-UX-01 (mobile-first PWA, 360px+), CON-UX-06 (setup em 24h)

---

## 1. Objetivo

Navegação principal em **2 formas responsivas**:

- **Desktop (≥ 1024px):** sidebar fixa à esquerda, 7 itens + user menu
- **Mobile (< 1024px):** bottom navigation com 5 itens principais + menu "Mais"

Princípios:
1. **Hierarquia clara** — ordem visual corresponde à importância/frequência
2. **Sem submenus** em nível 1 — até 7 itens caberão em primeiro nível
3. **Ícone + texto** sempre (não ícone-only — perde legibilidade para nova usuária)
4. **Estado ativo óbvio** — barra lateral no item ativo

---

## 2. Sidebar — Desktop (expandida, 240px)

```
┌──────────────────┐
│                  │
│   K E Y R A      │  ← logo (h-16, p-4)
│                  │
├──────────────────┤
│                  │
│  🏠  Dashboard   │  ← item ativo: bg-primary-50, border-l-4 border-primary-500
│                  │
│  📅  Agenda      │
│                  │
│  👥  Pacientes   │
│                  │
│  ✨  Serviços    │
│                  │
│  💼  Financeiro  │
│                  │
│  📦  Estoque     │
│                  │
│  ⚙   Configs     │
│                  │
│                  │
│                  │
├──────────────────┤
│                  │
│  👤  Camila S.   │  ← user menu
│      (profissional)│
│                  │
└──────────────────┘
```

**Tokens Tailwind:**
- Width: `w-60` (240px)
- Background: `bg-neutral-50`
- Border-right: `border-r border-neutral-200`
- Cada item: `py-3 px-4 rounded-md flex items-center gap-3 text-sm font-medium`
- Item ativo: `bg-primary-50 text-primary-700 border-l-4 border-primary-500`
- Item hover: `hover:bg-neutral-100`
- Ícone: `h-5 w-5`

---

## 3. Sidebar — Desktop (colapsada, 64px)

Toggle por botão `[<]` no header ou atalho `[`.

```
┌────┐
│    │
│ K  │  ← logo reduzido
│    │
├────┤
│    │
│ 🏠 │  ← tooltip ao hover mostra label
│    │
│ 📅 │
│    │
│ 👥 │
│    │
│ ✨ │
│    │
│ 💼 │
│    │
│ 📦 │
│    │
│ ⚙  │
│    │
├────┤
│ 👤 │
└────┘
```

Preferência salva em `localStorage` + cookie (SSR-aware).

---

## 4. Top bar (Header, h-16)

Fixa no topo, mesmo com sidebar colapsada.

```
┌───────────────────────────────────────────────────────────────────────────┐
│ [☰] Clínica Bella ▾                    [🔍 Buscar...]   🔔 3    Camila ▾ │
└───────────────────────────────────────────────────────────────────────────┘
```

**Elementos:**
- `[☰]` — botão toggle sidebar (mobile: abre drawer)
- **Org switcher** — `<Select>` ou `<DropdownMenu>` para trocar organização (multi-tenant)
  - Só aparece se usuária tem acesso a 2+ orgs
- **Busca global** — `<Command>` (cmd+k) — busca pacientes, serviços, agendamentos
  - [AUTO-DECISION] MVP: busca simples client-side; fase 5 full-text server
- **Notificações** — ícone sino + badge contador + dropdown com últimas 5
- **User menu** — avatar + nome + dropdown (Meus dados, Configurações, Sair)

---

## 5. Bottom nav — Mobile (fixed, h-16)

```
┌──────────────────────────────┐
│                              │
│                              │
│      [conteúdo da página]    │
│                              │
│                              │
├──────────────────────────────┤
│                              │
│ [🏠] [📅] [+] [👥] [⋯]       │  ← fixed bottom
│ Dash Agen    Pac  Mais       │
│                              │
└──────────────────────────────┘
```

**5 itens em mobile:**

| Posição | Item | Rota | Razão |
|---------|------|------|-------|
| 1 | 🏠 Dashboard | `/dashboard` | Home, tela mais importante |
| 2 | 📅 Agenda | `/agenda` | Segundo uso mais frequente |
| 3 | `[+]` FAB | contextual | Ação rápida (novo agendamento/comanda) |
| 4 | 👥 Pacientes | `/pacientes` | CRUD frequente |
| 5 | ⋯ Mais | drawer | Serviços + Financeiro + Estoque + Configs |

**FAB central:**
- Botão redondo `h-14 w-14 rounded-full bg-primary-500 text-white shadow-lg`
- Elevado acima da linha do bottom nav
- Ação **contextual**:
  - Em `/dashboard` → abre modal "Novo agendamento"
  - Em `/agenda` → abre modal "Novo agendamento"
  - Em `/pacientes` → abre form "Novo paciente"
  - Em `/servicos` → abre form "Novo serviço"
  - Em `/financeiro` → abre form "Nova despesa"

**"Mais" abre Sheet inferior:**
```
┌──────────────────────────────┐
│ Mais                     ✕   │
├──────────────────────────────┤
│ ✨  Serviços                 │
├──────────────────────────────┤
│ 💼  Financeiro               │
├──────────────────────────────┤
│ 📦  Estoque                  │
├──────────────────────────────┤
│ ⚙   Configurações            │
├──────────────────────────────┤
│ 👤  Meu perfil               │
├──────────────────────────────┤
│ 🚪  Sair                     │
└──────────────────────────────┘
```

---

## 6. Hierarquia completa de rotas (MVP)

```
/dashboard                         (home após login)
/agenda                            (visão semana default)
/agenda/novo                       (modal, não rota real)
/pacientes                         (lista)
/pacientes/novo                    (form)
/pacientes/[id]                    (detalhes)
/pacientes/[id]/editar
/servicos                          (lista)
/servicos/novo
/servicos/[id]
/servicos/[id]/editar
/financeiro                        (overview: entradas, saídas, saldo)
/financeiro/entradas               (lista de transações)
/financeiro/despesas               (lista)
/financeiro/despesas/nova
/financeiro/dre                    (tabela DRE)
/comandas                          (lista)
/comandas/[id]                     (tela de pagamento/detalhes)
/estoque                           (lista de insumos)
/estoque/[id]
/estoque/[id]/editar
/estoque/movimentacoes             (histórico de saídas/entradas)
/configuracoes                     (overview)
/configuracoes/organizacao
/configuracoes/profissionais
/configuracoes/formas-pagamento    (taxas de cartão)
/configuracoes/categorias          (plano de contas)
/configuracoes/conta
/auth/login
/auth/recuperar-senha
/onboarding                        (wizard 5 passos)
```

---

## 7. Onboarding — Wizard de 5 passos (CON-UX-06)

Entrega primeiro lucro visualizado em até 24h.

```
┌────────────────────────────────────────────────────────────┐
│ Vamos configurar o KEYRA                        1/5 ●●○○○  │
│                                                            │
│ Primeiro, conta pra gente sobre a sua clínica.             │
│                                                            │
│  «Nome da sua clínica/consultório» *                       │
│  [                                              ]          │
│                                                            │
│  «Seu papel»                                               │
│  [◉ Sou dona(o) da clínica]                                │
│  [ Sou profissional contratada(o)   ]                      │
│                                                            │
│                                [ Voltar ]   [ Continuar → ]│
└────────────────────────────────────────────────────────────┘
```

**Passos:**
1. Nome da clínica + papel
2. Primeiro profissional (você)
3. Cadastrar 3 serviços principais (mínimo 1 — "Cadastre os que você faz mais")
4. Cadastrar 3 pacientes (mínimo 0 — pode pular)
5. Primeiro agendamento (opcional — pula direto pro dashboard)

Cada passo tem:
- Header com contador (1/5)
- CTA "Pular por agora" (exceto passo 1 — nome obrigatório)
- CTA "Continuar" (primary)
- Barra de progresso visual com dots

Após passo 5 (ou skip), redireciona para `/dashboard` com empty state contextualizado
(ver `01-dashboard.md` seção 7.2).

---

## 8. Breadcrumbs (em páginas de detalhe)

Usar shadcn `<Breadcrumb>`:

```
Pacientes  »  Maria Silva  »  Histórico
```

Não usar em tela-home de cada módulo (redundante com sidebar ativa).

---

## 9. Estados de navegação

### 9.1 Rota ativa
- Sidebar: `bg-primary-50 border-l-4 border-primary-500 text-primary-700`
- Bottom nav: `text-primary-500` + ícone em `fill` (se disponível na Lucide)

### 9.2 Loading (SPA navigation)
- Next.js 16 Suspense + `loading.tsx` em cada route segment
- Barra de progresso no topo (shadcn não tem — usar `nextjs-toploader` ou similar)

### 9.3 404
```
┌──────────────────────────────────────┐
│              🔍                       │
│                                      │
│    Não encontramos essa página       │
│                                      │
│    Pode ter sido removida ou o       │
│    endereço pode estar errado.       │
│                                      │
│       [ Voltar ao dashboard ]        │
└──────────────────────────────────────┘
```

### 9.4 403 (acesso negado — usuária profissional tentando ver área de dono)
```
┌──────────────────────────────────────┐
│              🔒                       │
│                                      │
│   Essa área é só para quem é         │
│   dona da clínica.                   │
│                                      │
│   Peça para a proprietária           │
│   mudar suas permissões.             │
│                                      │
│       [ Voltar ]                     │
└──────────────────────────────────────┘
```

---

## 10. Multi-org (org switcher)

- Dropdown no header mostra orgs do usuário
- Trocar de org = reload da página (simples, sem estado a preservar)
- Badge sutil no header quando há 2+ orgs: mostra iniciais da org ativa
- Dono pode ter N orgs; profissional geralmente 1

```
Clínica Bella ▾
  ─────────────
  🏢 Clínica Bella    (ativa)
  🏢 Studio Camila
  ─────────────
  [+ Nova organização]
```

---

## 11. Acessibilidade

- Sidebar: `<nav aria-label="Navegação principal">`
- Cada item: `<Link>` com texto visível (não `aria-label` sozinho)
- Bottom nav mobile: `<nav aria-label="Navegação principal" role="navigation">`
- FAB: `<button aria-label="Novo {contextual}">` — label muda conforme contexto
- User menu: `<DropdownMenu>` com navegação por teclado nativa do Radix
- Skip link no topo: "Pular para o conteúdo" (visível só no foco do teclado)

---

## 12. Decisões registradas

| ID | Decisão | Razão |
|----|---------|-------|
| NAV-01 | Sidebar 240px expandida | Clareza textual > densidade; colapsável para casos de power users |
| NAV-02 | 7 itens em nível 1, sem submenus | Contador de trabalho cognitivo baixo; se precisar mais, virá na Fase 5+ |
| NAV-03 | Bottom nav 5 itens + FAB central | Padrão mobile dominante (Instagram-like); FAB contextualiza ação |
| NAV-04 | "Serviços" = ícone Sparkles, não Briefcase | Alinhado com nicho (estética/cuidado) — ver `00-design-principles.md` |
| NAV-05 | Onboarding wizard de 5 passos, pulável | NorthStar 24h; pacientes/agendamento opcionais reduzem fricção |
| NAV-06 | Busca global via cmd+k (shadcn Command) | Padrão moderno SaaS; mobile usa ícone de busca separado |
| NAV-07 | Org switcher só visível com 2+ orgs | Reduz ruído para usuária com 1 org (caso 90% no MVP) |
| NAV-08 | Sem breadcrumbs em tela-home de módulo | Redundante com sidebar + aumenta espaço útil |

---

## 13. Componente canônico: `<PageLayout>`

Todo page.tsx (exceto auth e onboarding) deve usar:

```tsx
<PageLayout>
  <PageLayout.Header title="Pacientes" description="Gerencie seus clientes.">
    <Button>Novo paciente</Button>
  </PageLayout.Header>
  <PageLayout.Content>
    {/* conteúdo da tela */}
  </PageLayout.Content>
</PageLayout>
```

`<PageLayout>` encapsula:
- Sidebar + top bar (desktop)
- Bottom nav + top bar (mobile)
- Header de página (h2 + description + action slot)
- Container com padding padrão `px-6 py-6 lg:px-12`

**Regra:** qualquer nova página DEVE usar `<PageLayout>` (gotcha: já é exigência
da `.claude/CLAUDE.md` do projeto).
