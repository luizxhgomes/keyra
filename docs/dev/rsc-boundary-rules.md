# RSC Boundary Rules — Next 16 + React 19

> **Origem:** sessão 2026-05-02 onde o Dashboard ficou completamente quebrado em produção (digest `3213099672`) por mais de 1 hora apesar de Sprints 5, 6 e 7 terem sido fechadas como "Done" com deploys READY.
> **Status:** REGRAS OBRIGATÓRIAS para qualquer PR que toca camada UI ou Server↔Client boundary.
> **Bugs de origem:** commits `d39c84d` (EmptyState), `7f2a7ef` (AlertasList Client → Server), `4853c53` (useDismissedAlerts hidratação).

---

## Por que este documento existe

Em 2026-05-02 a idealizadora abriu produção e nenhuma rota autenticada (Dashboard, Comandas, Pacientes, Serviços, Financeiro, Estoque) carregava. Toda mostrava "ALGO DEU ERRADO" com digest opaco. Sprint 7 (Auth UX & Reliability) tinha fechado 4 dias antes, prometendo justamente resolver esse cenário. Build estava verde. Vercel deploy READY. Sentry capturando.

**O bug existia há SEMANAS sem que ninguém percebesse — porque ninguém tinha feito uma sessão real autenticada tocar as telas em produção.**

A causa raiz era uma classe de bug que `tsc`, `eslint`, `next build` e `vercel deploy` **não pegam**: violações da fronteira Server↔Client em React Server Components com Next 16.

Estas 4 regras existem para que isso nunca mais aconteça com regressão silenciosa.

---

## Regra 1 — Nunca passar `forwardRef` como prop através da fronteira Server↔Client

### Sintoma

```
Error: Functions cannot be passed directly to Client Components unless you
explicitly expose it by marking it with "use server".
{$$typeof: ..., render: function, displayName: ...}
digest: '3213099672'
```

`{$$typeof, render, displayName}` é a assinatura interna de um componente `React.forwardRef`. **Lucide icons, shadcn/ui Card/Button, qualquer wrapper `forwardRef`** se enquadra.

### Causa

Em React 19 + Next 16 RSC, props que cruzam de Server Component para Client Component precisam ser **serializáveis**. Componentes feitos com `React.forwardRef` (que é um objeto com função interna `render`) não são serializáveis. O erro aparece em runtime quando o React tenta enviar a prop pelo wire.

### Como prevenir

**Antipattern (BUG):**
```tsx
// PageServer.tsx (Server Component)
import { Sparkles } from 'lucide-react';
import { EmptyState } from '@/components/keyra'; // Client com 'use client'

<EmptyState icon={Sparkles} title="..." />
//          ^^^^^^^^^^^^^^^ forwardRef passado de Server → Client
```

**Pattern correto opção A — Server outer + Client inner:**
```tsx
// EmptyState.tsx (Server Component, sem 'use client')
import type { LucideIcon } from 'lucide-react';
export function EmptyState({ icon: Icon, ... }: { icon?: LucideIcon }) {
  return <div>{Icon ? <Icon /> : null} ...</div>;
  //                  ^^^^^^^ uso (não passar como prop) — Server-safe
}

// EmptyStateAction.tsx (Client Component, separado)
'use client';
export function EmptyStateAction({ onClick, label }: { onClick: () => void; label: string }) {
  return <button onClick={onClick}>{label}</button>;
}
```

**Pattern correto opção B — pré-renderizar no Server:**
```tsx
// Page.tsx (Server)
<EmptyState iconNode={<Sparkles className="..." />} title="..." />

// EmptyState.tsx (Client OK)
'use client';
export function EmptyState({ iconNode, ... }: { iconNode?: ReactNode }) {
  // iconNode é ReactElement já renderizado — serializável.
}
```

### Como auditar

Antes de PR mergear, grep por padrões suspeitos:
```bash
grep -rn "icon: LucideIcon" apps/web/src
grep -rn "icon:.*forwardRef" apps/web/src
```
Se qualquer Client Component (`'use client'`) tem prop de tipo `LucideIcon` ou recebe componente como prop, **revisar manualmente** se algum chamador é Server.

---

## Regra 2 — Client Component **não pode importar** Server Component diretamente

### Sintoma

Erro de hidratação que aparece "1 segundo depois de carregar" — SSR renderiza HTML, browser hidrata, falha silenciosamente. Aparece o boundary de erro.

### Causa

Em Next 16 RSC strict, a fronteira é unidirecional:
- Server pode importar Client (vira "ilha cliente")
- Client **NÃO pode** importar Server diretamente

Build não falha. ESLint não pega. Mas em runtime, a importação cria uma situação ambígua que quebra hidratação.

### Como prevenir

Sempre que adicionar `'use client'` num arquivo, auditar **todos os imports**:
- Imports de outros Client Components (`'use client'` no topo): OK
- Imports de utilitários puros (sem JSX): OK
- Imports de Server Components (sem `'use client'` mas exportando JSX): **PROIBIDO**

Se você precisa renderizar algo dentro de um Client que vive em um arquivo Server:
- **Opção A:** copia/inline o componente dentro do Client (caso `InlineEmptyState` em `alertas-list.tsx`)
- **Opção B:** passa como `children` prop através da fronteira (Server pode passar JSX já renderizado)

### Exemplo do bug real

```tsx
// alertas-list.tsx — 'use client'
import { EmptyState } from '@/components/keyra';
//                          ^^^^^^^^^^^^ era Server, falhou hidratação
```

Fix: definir `InlineEmptyState` no próprio arquivo Client.

---

## Regra 3 — `useSyncExternalStore` requer SSR snapshot consistente

### Sintoma

Erro de hidratação intermitente, sem digest consistente, sem stack trace claro.

### Causa

`useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)` exige que `getServerSnapshot()` (chamado durante SSR) e o primeiro `getSnapshot()` no client retornem **referências idênticas** ou sejam comparáveis por `Object.is`. Se houver divergência mínima, hidratação falha.

Em Next 16 + React 19, o pattern fica especialmente frágil quando `getSnapshot` lê `localStorage` ou outras APIs que existem só no client.

### Como prevenir

**Antipattern (BUG):**
```tsx
const entries = useSyncExternalStore(
  subscribe,
  () => readEntries(orgId),  // client snapshot
  () => EMPTY_SNAPSHOT,       // server snapshot
);
// readEntries() pode retornar [] na primeira chamada — referência diferente do EMPTY_SNAPSHOT
```

**Pattern correto — `useState + useEffect + queueMicrotask`:**
```tsx
const [entries, setEntries] = useState<DismissedEntry[]>([]);
useEffect(() => {
  let cancelled = false;
  queueMicrotask(() => {
    if (!cancelled) setEntries(readEntries(orgId));
  });
  // ... listeners
  return () => { cancelled = true; };
}, [orgId]);
```

Trade-off aceito: pode haver flash de ~50ms onde alertas silenciados aparecem antes de sumir. Aceitável porque (a) raramente há alertas silenciados no MVP, (b) confiabilidade > microoptimização visual.

### Quando usar `useSyncExternalStore`

Só quando você tem certeza absoluta da consistência SSR↔client. Caso típico: subscription a um store global em memória que é populado idêntico em ambos os lados (ex: Zustand server-side + client-side com mesma seed). **Para localStorage / sessionStorage, prefira `useEffect` com `queueMicrotask`.**

---

## Regra 4 — Build verde **não é** funcional

### Sintoma

Sprint fecha "Done", QA gate "PASS", deploy READY. Idealizadora abre prod, nada carrega.

### Causa

- `tsc --noEmit` valida tipos. **Não roda código.**
- `eslint --max-warnings 0` valida convenções. **Não roda código.**
- `next build` empacota. Roda algumas server-component renders durante prerender, **mas não com sessão autenticada real**.
- `vercel deploy` confirma que o pacote subiu. **Não toca o produto.**

Tudo isso é pré-condição. Nenhum prova funcionalidade real.

### Como prevenir

**Critério de Done atualizado** (a partir de 2026-05-02):

Toda story que toca **qualquer um** dos itens abaixo só fecha após smoke test ponta-a-ponta com sessão real autenticada da idealizadora em mobile real (375px), tocando as telas afetadas:

- [ ] Camada `app/(app)/**` (qualquer rota autenticada)
- [ ] `'use client'` boundary (qualquer adição/remoção)
- [ ] Componentes em `components/keyra/**` ou `components/ui/**`
- [ ] `lib/hooks/**` (qualquer hook novo ou modificado)
- [ ] `lib/motion/**` (framer-motion, AnimatePresence, m.div)
- [ ] Server Action que retorna dados consumidos por componente Client

**Não negociável.** PR que mergear sem essa validação volta com NO-GO retroativo.

### Validação obrigatória (checklist)

```
[ ] Build local verde (typecheck + lint + build)
[ ] Vercel deploy preview READY
[ ] Idealizadora abriu URL de preview em mobile real
[ ] Idealizadora tocou em todas as rotas afetadas pela story
[ ] Idealizadora tocou ações principais (criar, editar, deletar) onde aplicável
[ ] Sentry NÃO mostra issue novo no PR (URL Sentry compartilhada como evidência)
```

Sem 6 marcadores, story não é Done.

---

## Como auditar PR antes de aprovar

Checklist 30 segundos:

1. **`grep -rn "'use client'" apps/web/src/app/<rota-tocada>`** — ver onde tem fronteira Client
2. **Para cada Client encontrado:** ver props que ele declara. Se alguma é `LucideIcon` ou tipo de componente, verificar **todos os chamadores** Server → flag
3. **Para cada Client encontrado:** ver imports. Se importa arquivo sem `'use client'` e que exporta JSX, **flag**
4. **Para cada hook novo:** ver se usa `useSyncExternalStore`. Se sim, **flag** e revisar SSR consistency
5. **PR description:** evidência de smoke test mobile real está anexada? Se não, **flag**

---

## Histórico de violações (para referência futura)

| Data | Commit fix | Regra violada | Componente |
|------|-----------|---------------|------------|
| 2026-05-02 | `d39c84d` | Regra 1 | `EmptyState` (Client recebia `icon: LucideIcon` de Server) |
| 2026-05-02 | `7f2a7ef` | Regra 2 | `alertas-list.tsx` (Client) importava `EmptyState` (Server pós-fix) |
| 2026-05-02 | `4853c53` | Regra 3 | `useDismissedAlerts` usava `useSyncExternalStore` com `readEntries` lendo localStorage |
| (ongoing) | — | Regra 4 | Sprints 5/6/7 fecharam Done sem smoke real da idealizadora — origem de tudo acima |

Quando aparecer uma 5ª entrada aqui, é sinal de que o checklist do PR não foi seguido. **Revisar e endurecer.**
