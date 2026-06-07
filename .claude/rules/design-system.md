---
paths:
  - "apps/web/src/**/*.tsx"
  - "apps/web/src/**/*.css"
  - "apps/web/public/*.html"
  - "apps/web/tailwind.config.ts"
  - "docs/brand/**"
---

# Design System — Regra Inegociável da KEYRA

> **Status:** REGRA OBRIGATÓRIA para qualquer artefato visual da KEYRA — tela, componente,
> e-mail, landing, post, slide, proposta. Carregada automaticamente por qualquer agente
> AIOX que toque arquivos de UI (ver `paths:` acima).
> **Criada em:** 2026-05-18.
> **Precedente de forma:** `docs/dev/rsc-boundary-rules.md` (mesma mecânica: regra persistida
> + script de auditoria + job de CI).

---

## Por que este documento existe

O design system da KEYRA já é maduro e vive em `docs/brand/03-identity/` (preview.html,
PREVIEW-REFERENCE.md, DESIGN.md, tokens.json). O que faltava era **governança**: a regra
estava diluída em parágrafos dentro de documentos longos, não era carregada pelos agentes,
não validava o que já existia e não se replicava sozinha.

Este arquivo resolve isso. Ele **não duplica** o design system — ele o transforma em lei
executável: um conjunto curto de princípios inegociáveis + um script que audita o código +
um gate de CI que barra PR fora do padrão.

---

## ⬛ BLOCO EDITÁVEL — A regra básica

> **Este bloco é seu.** Edite aqui quando quiser ajustar o padrão do design system.
> É a única parte deste arquivo destinada a edição humana — o restante é mecânica de
> aplicação. Tudo abaixo dos princípios (auditoria, CI, workflow) deriva daqui.
> Ao alterar um princípio, rode `./scripts/check-design-system.sh` e ajuste o script
> se a regra mudou de forma que afete a auditoria automatizada.

<!-- ════════════ INÍCIO DO BLOCO EDITÁVEL ════════════ -->

### Os 8 princípios inegociáveis

**1. Tokens são lei.**
Toda cor, fonte, tamanho, espaçamento, raio, sombra e motion vem de
`docs/brand/03-identity/tokens.json` (e do `apps/web/tailwind.config.ts`, que o espelha).
Nenhum valor mágico: zero hex novo, zero `p-[13px]`, zero `text-[19px]`. Se o token não
existe, **cria-se o token primeiro**, depois usa-se.

**2. Quente sempre, frio nunca.**
Paleta KEYRA: ivory · sand · mocha · bronze · cocoa · ink + amber · terracotta · rust +
champagne · gold + verde-oliva contido (`success-leaf`/`success-deep`). **Proibida a paleta
default do Tailwind** (`blue`, `sky`, `cyan`, `indigo`, `violet`, `purple`, `fuchsia`,
`pink`, `rose`, `slate`, `gray`, `zinc`, `neutral`, `stone`). Nada de `#000`/`#fff` puro
como base — usar `cocoa-900` / `ivory-50`.

**3. Duas fontes, só duas.**
Fraunces (editorial / display) + Inter (produto / funcional). Nenhuma terceira família.

**4. Consultar a referência antes de inventar.**
Antes de criar qualquer peça, abrir `docs/brand/03-identity/preview.html` e o
`PREVIEW-REFERENCE.md` e reusar o componente / padrão equivalente. Nada se inventa do zero
quando já existe. Se não existe, **estende-se a referência primeiro**, depois usa-se.

**5. Duas camadas, mesma paleta.**
Brand layer (expressiva, editorial) e Product layer (contida, densa) usam as mesmas cores
e as mesmas fontes — muda só a **dose**. O app (`apps/web`) é product layer.

**6. Lei da Proporção Espacial.**
Todo espaço vazio é proporcional e intencional, em **mobile e desktop**:
- **Quebra por sentença, nunca por palavra.** Numa headline com mais de uma frase, cada
  sentença completa ocupa a própria linha. Nenhuma frase vaza parte de si para a linha de
  outra. Errado: "…sozinha. Você" + "decide com clareza." (deixa "Você" órfão no fim da
  linha 1). Certo: linha 1 = "A clínica vira financeiro *sozinha*." inteira; linha 2 =
  "Você decide com **clareza**." inteira. A unidade de quebra é a sentença — ou o verso,
  num hero composto — nunca a palavra solta.
- **Dentro de uma sentença, quem equilibra é `text-wrap: balance`.** Quando uma única
  sentença for longa e precisar quebrar em telas estreitas, o balance distribui as linhas
  dela. `<br>` manual continua **proibido** em heading — nem para separar sentenças (isso é
  estrutura semântica, um nó por sentença, não markup cego), nem dentro delas. Texto corrido
  usa `text-wrap: pretty`. Modelo mental: **"sentença quebra por estrutura; linha quebra por
  balance; `<br>` não existe."**
- **Títulos centralizados.** Todo heading de brand (display, h1, h2, eyebrow/tag, lead curto
  de hero ≤2 linhas, blockquote de fechamento, bloco de CTA) é `text-align: center`.
  Permanecem à esquerda: lead/subtítulo longo (>2 linhas), body corrido, listas,
  números/KPI/DRE, tabelas. Limiar prático: acima de 2 linhas → esquerda. Centralizar exige
  as três salvaguardas juntas — sentença por linha + measure curta (~14-18ch display/hero,
  ~28-34ch h2 de seção) + contraste de peso no bloco (nenhum heading monopeso) — sem as três,
  escorrega para o genérico. Enumeração retórica em rajada (ex.: "Sem planilha. Sem domingo
  perdido. Sem achismo.") é exceção deliberada: fica junta por cadência, `balance` cuida da
  quebra.
- **Cards da mesma fileira têm altura igual** e o conteúdo é distribuído — centralizado
  (`justify-content: center`) ou com rodapé empurrado (`margin-top: auto`). Nunca texto
  colado no topo deixando um buraco embaixo.
- **Espaço vazio é distribuído, não acumulado.** Pouco conteúdo → centraliza e respira;
  muito conteúdo → `gap` consistente. Nenhum campo vazio desproporcional.
- **Grids nunca terminam com órfãos** — ver Lei da Densidade Proporcional em
  `docs/brand/03-identity/DESIGN.md §9.bis`.
- Espaçamento escala por breakpoint usando tokens (`p-4 md:p-6 lg:p-8`), nunca valores
  fixos que estouram no mobile.

**7. UX inegociável do produto.**
Números absolutos, comparativos textuais ("R$ 2.300 a mais que o mês passado"), tela única.
Gráfico só como reforço proporcional — nunca como informação primária; validar com a
idealizadora.

**8. Motion calmo.**
Durations / easings / distances dos motion tokens. Default = `base 320ms` + `out-soft`.
Sem bounce gratuito, sem motion acima de `cinematic`.

<!-- ════════════ FIM DO BLOCO EDITÁVEL ════════════ -->

---

## Fontes canônicas (a regra aponta — não duplica)

| O quê | Arquivo |
|-------|---------|
| Brandbook executável (fonte visual) | `docs/brand/03-identity/preview.html` |
| Mapa canônico do preview | `docs/brand/03-identity/PREVIEW-REFERENCE.md` |
| Sistema técnico unificado | `docs/brand/03-identity/DESIGN.md` |
| Tokens DTCG (source of truth) | `docs/brand/03-identity/tokens.json` |
| Tokens aplicados no app | `apps/web/tailwind.config.ts` + `apps/web/src/app/globals.css` |
| Manual de cores | `docs/brand/03-identity/colors-manual.md` |
| Tipografia · Voz · Motion | `docs/brand/03-identity/{typography-system,voice-tone,motion-system}` |

Se houver conflito entre este arquivo e os documentos acima, **os 8 princípios prevalecem**
para fins de enforcement; o conteúdo profundo (paletas, escalas, exemplos) é dos canônicos.

---

## Workflow obrigatório antes de produzir qualquer peça

1. Abrir `preview.html` no browser e identificar o componente / padrão equivalente.
2. Copiar tokens, cores, tipografia e motion do equivalente — sem inventar variantes.
3. Aplicar a Lei da Proporção Espacial (princípio 6) ao layout antes de finalizar.
4. Rodar `./scripts/check-design-system.sh` localmente.
5. Validar contra os anti-padrões de `preview.html §09` e `BRANDBOOK.md §11`.
6. Smoke test visual em mobile real (375px) **e** desktop — ver `docs/dev/rsc-boundary-rules.md`
   Regra 4. Build verde não comprova layout correto.

---

## Checklist de conformidade (antes de marcar Done)

```
[ ] Nenhuma cor fora dos tokens KEYRA (sem paleta default do Tailwind, sem hex novo)
[ ] Apenas Fraunces + Inter
[ ] Headline multi-sentença com uma sentença por linha (cada frase é um nó próprio)
[ ] Nenhum título com palavra órfã / nenhum <br> manual em heading
[ ] Títulos centralizados (heading/eyebrow/lead curto); body/lista/número/tabela à esquerda
[ ] Cards da mesma fileira com altura igual e conteúdo distribuído
[ ] Nenhum campo vazio desproporcional — em mobile E desktop
[ ] Espaçamento vindo da escala de tokens (sem valores arbitrários)
[ ] Motion dentro dos tokens (default base + out-soft)
[ ] ./scripts/check-design-system.sh passou
[ ] Smoke visual mobile (375px) + desktop com a idealizadora
```

Sem os 11 marcadores, a peça não está conforme.

---

## Auditoria automatizada

**Script:** `scripts/check-design-system.sh` — roda local antes de push e em CI.

| Severidade | Verifica | Ação |
|-----------|----------|------|
| 🔴 HARD FAIL | Classes de cor da paleta default do Tailwind em `apps/web/src/**/*.tsx` | Barra o build |
| 🔴 HARD FAIL | Valores de espaçamento arbitrários (`p-[12px]`, `gap-[27px]`, ...) | Barra o build |
| 🔴 HARD FAIL | `<br>` dentro de heading/headline (hero, `.title`, `.combo-headline`, `h1`/`h2`) em `*.html` e `*.tsx` | Barra o build |
| 🟡 WARN | HEX literal em `.tsx` que deveria ser constante de token | Reporta (não barra) |

**CI:** job `design-system-audit` no workflow `.github/workflows/rls-tests.yml`. PR não
faz merge se o script falhar.

O script cobre o que é estaticamente detectável (cor e espaçamento). Órfãos tipográficos,
alinhamento de cards e proporção de espaço vazio são verificados no **smoke visual** do
checklist — não há substituto para olhar a tela renderizada.

---

## Histórico de desvios

| Data | Desvio | Regra | Situação |
|------|--------|-------|----------|
| 2026-05-18 | `StatusBadge.tsx` — `saida`/`despesa`/`outros` usavam `stone-*` e `imposto` usava `rose-*` (paleta default do Tailwind) | Princípio 2 | ✅ Corrigido — migrado para tokens KEYRA quentes |
| 2026-05-18 | `landing.html` — `<br>` manuais em 6 títulos geravam palavras órfãs em desktop e mobile | Princípio 6 | ✅ Corrigido — removidos; `text-wrap:balance` assume |
| 2026-05-18 | `landing.html` — `.cost-card` e `.app-msg` com texto colado no topo deixavam buraco embaixo em cards esticados | Princípio 6 | ✅ Corrigido — flex column + conteúdo centralizado |
| 2026-05-18 | 43 HEX literais em `.tsx` (maioria valores KEYRA corretos, mas hard-coded em SVGs de gráfico do `/financeiro`) | Princípio 1 | 🟡 Tech-debt — migrar progressivamente para constantes de token |
| 2026-06-07 | `preview.html` — headline de seção "A clínica vira financeiro *sozinha*. Você decide com **clareza**." deixava "Você" órfão no fim da linha 1 (o `text-wrap: balance` distribuía palavras entre as duas sentenças); títulos de brand eram left-aligned | Princípio 6 | ✅ Regra refinada — quebra por sentença + títulos centralizados canonizados; `preview.html` e app migrados |

Quando aparecer uma 6ª entrada, é sinal de que o checklist de conformidade não foi seguido.
Revisar e endurecer.
