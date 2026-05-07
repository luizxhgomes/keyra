# Page Transitions — Roteamento KEYRA

> Como rotas se conectam. Cada transição respeita os princípios em [`motion-principles.md`](motion-principles.md) e usa padrões nomeados de [`motion-vocabulary.md`](motion-vocabulary.md).

---

## 1. Mapa de transições do app

KEYRA tem 3 níveis de rotas:

| Nível | Exemplo | Transição padrão |
|-------|---------|------------------|
| **Top-level** (rotas principais) | `/dashboard`, `/agenda`, `/clientes`, `/dre`, `/configuracoes` | `page-fade` |
| **Sub-rota** (filha de top-level) | `/clientes/[id]`, `/clientes/novo`, `/agenda/[date]` | `page-slide-sub` |
| **Crítica** (auth/onboarding) | `/login → /dashboard`, `/onboarding/* → /dashboard` | `route-instant` (sem motion) |

---

## 2. Transições por contexto

### `page-fade` — Top-level → Top-level
```
Saída página atual:
  opacity 1 → 0
  scale 1 → 0.99
  duration: fast (200ms)
  easing: in-quiet

(gap de 100ms — evita crossfade ruim)

Entrada nova página:
  opacity 0 → 1
  translateY: small → 0
  duration: base (320ms)
  easing: out-soft
```

**Total:** ~420ms de transição completa. Suficiente para registrar mudança sem atrasar.

**Onde aplica:**
- `/dashboard` ↔ `/agenda`
- `/agenda` ↔ `/clientes`
- `/clientes` ↔ `/dre`
- Qualquer combinação top-level

### `page-slide-sub` — Top-level → Sub-rota (avançar)
```
Saída página atual:
  opacity 1 → 0
  translateX: 0 → -16px (sai pela esquerda)
  duration: fast (200ms)
  easing: in-quiet

Entrada sub-rota:
  opacity 0 → 1
  translateX: 16px → 0 (entra pela direita)
  duration: base (320ms)
  easing: out-soft
  delay: 100ms
```

**Onde aplica:**
- `/clientes` → `/clientes/[id]` (abrir cliente)
- `/clientes` → `/clientes/novo` (criar cliente)
- `/agenda` → `/agenda/[date]/[appointment]` (abrir atendimento)

### `page-slide-sub-back` — Sub-rota → Top-level (voltar)
Mesmo `page-slide-sub` mas com **direção inversa**:
```
Saída sub-rota:
  translateX: 0 → 16px (sai pela direita)

Entrada top-level:
  translateX: -16px → 0 (entra pela esquerda)
```

**Detecção:** comparar URL de origem com URL de destino. Se destino é parent de origem → usar variante `back`.

### `route-instant` — Sem transição
```
duration: 0
```

**Onde aplica:**
- `/login` → `/dashboard` (post-login: rota crítica, contexto novo, sem transição "frágil")
- `/onboarding/nova-organizacao` → `/dashboard` (post-onboarding: marco)
- Qualquer redirect forçado por permissão (`requireAuth` → `/login`)

---

## 3. Implementação no Next.js App Router

KEYRA usa Next.js 16 com App Router. Page transitions implementadas via:

### Opção 1 — View Transitions API (preferida quando disponível)
Browsers modernos suportam nativamente. Configurar em `apps/web/next.config.ts`:

```ts
const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
};
```

E em `app/layout.tsx`:

```tsx
import { unstable_ViewTransition as ViewTransition } from "next/view-transition";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ViewTransition>{children}</ViewTransition>
      </body>
    </html>
  );
}
```

CSS associado em `globals.css`:

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: var(--motion-duration-base);
  animation-timing-function: var(--motion-easing-out-soft);
}

::view-transition-old(root) {
  animation-name: page-fade-out;
  animation-duration: var(--motion-duration-fast);
  animation-timing-function: var(--motion-easing-in-quiet);
}

::view-transition-new(root) {
  animation-name: page-fade-in;
}

@keyframes page-fade-out {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.99); }
}

@keyframes page-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Sub-rota */
.sub-route::view-transition-old(root) {
  animation-name: page-slide-out-left;
}
.sub-route::view-transition-new(root) {
  animation-name: page-slide-in-right;
}

@keyframes page-slide-out-left {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(-16px); }
}
@keyframes page-slide-in-right {
  from { opacity: 0; transform: translateX(16px); }
  to { opacity: 1; transform: translateX(0); }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: 0;
  }
}
```

### Opção 2 — Framer Motion + AnimatePresence (fallback)
Se View Transitions API não disponível ou comportamento mais granular necessário:

```tsx
"use client";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.99 }}
        transition={{
          duration: 0.32,
          ease: [0.22, 1, 0.36, 1], // out-soft
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

⚠️ **Atenção em RSC:** Framer Motion exige client component. Wrapper deve ser estratégico — não envolver layouts que dependem de Server Components no path crítico (ver [`docs/dev/rsc-boundary-rules.md`](../../../dev/rsc-boundary-rules.md)).

---

## 4. Layout-aware transitions

KEYRA tem dois layouts persistentes:
- **AppShell** (Sidebar 240px + BottomNav) — em rotas autenticadas `app/(app)/*`
- **AuthShell** (centralizado, sem sidebar) — em `app/(auth)/*`

### Dentro do mesmo shell
Sidebar e BottomNav **não animam** entre rotas — só o conteúdo principal anima. Isso preserva orientação espacial da Camila.

```tsx
// app/(app)/layout.tsx (estrutura)
<AppShell>
  <Sidebar />          {/* persistente, sem motion */}
  <main>
    <PageTransition>   {/* só o main anima */}
      {children}
    </PageTransition>
  </main>
  <BottomNav />        {/* persistente, sem motion */}
</AppShell>
```

### Entre shells diferentes
Login → AppShell ou AppShell → Login (logout): `route-instant` — sem transição. Contexto muda totalmente, transição "frágil" só confunde.

---

## 5. Indicador de loading entre rotas

Next.js App Router tem `loading.tsx` por rota. Comportamento:

```
Click no link →
  Navigation start → Skeleton/Loading aparece (`fade-quiet` 200ms)
  Data ready → Conteúdo real (`fade-up` 320ms) substitui skeleton
  Crossfade total: ~200ms
```

Loading.tsx canônico KEYRA:

```tsx
// loading.tsx genérico para top-level rotas
export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      <div className="h-8 w-48 animate-shimmer rounded bg-ivory-100" />
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 animate-shimmer rounded-md bg-ivory-100" />
        ))}
      </div>
    </div>
  );
}
```

---

## 6. Anti-padrões em page transitions

| Anti-padrão | Por que evitar |
|-------------|---------------|
| Sidebar animando entre rotas | Quebra orientação espacial |
| Backdrop blur em transição | Performance ruim em mobile, anti-quiet |
| Transição > 600ms total | Lento para uso diário |
| Slide de página inteira em direção arbitrária | Confunde — direção precisa de semântica |
| Spinner full-screen entre rotas | KEYRA usa skeleton, não spinner global |
| Transição com som | KEYRA é silenciosa por princípio UX |
| Mudança de tema entre rotas | Inconsistência |

---

## 7. Checklist de implementação

Para cada conjunto de rotas (epic novo, feature):

1. ✅ Mapear top-level vs sub-rotas
2. ✅ Aplicar `page-fade` em top-level
3. ✅ Aplicar `page-slide-sub` (forward/back) em sub-rotas
4. ✅ Marcar rotas críticas com `route-instant`
5. ✅ Loading.tsx com skeleton warm (não cinza frio)
6. ✅ Validar `prefers-reduced-motion` (transição vira 0)
7. ✅ Testar em mobile real (Camila usa entre atendimentos)
8. ✅ Garantir que Sidebar/BottomNav permanecem estáticos
