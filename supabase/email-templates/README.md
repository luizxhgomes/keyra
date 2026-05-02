# Email Templates · Supabase Auth

Templates HTML para emails transacionais disparados pelo Supabase Auth (não pelo helper `sendEmail()` do app — esses passam por aqui apenas).

## Templates

| Arquivo | Tipo Supabase | Acionamento |
|---------|---------------|-------------|
| `magic-link.html` | Magic Link | Login passwordless via OTP |

## Aplicação (manual, uma vez por ambiente)

> Supabase **não permite versionar templates de auth via migration**. A configuração é manual no Dashboard, por projeto. Estes arquivos servem como **fonte canônica** — qualquer mudança aqui DEVE ser refletida no Dashboard.

1. Acessar [Supabase Dashboard](https://supabase.com/dashboard) → projeto `keyra-br`
2. **Authentication → Email Templates**
3. Selecionar o template correspondente (ex: "Magic Link")
4. Copiar o conteúdo do `.html` deste diretório (excluindo o comentário do header)
5. Colar no editor do Supabase
6. Ajustar **Subject** se necessário:
   - `magic-link.html` → `Seu acesso à KEYRA`
7. Salvar

## Rationale

**v1.0 (Story 7.2 · 2026-05-02 manhã)** — Validação manual da idealizadora detectou que o magic link chegava em **inglês padrão Supabase** (`Click here to sign in to your account`). Quebra de tom + risco de spam (template gringo + remetente custom = sinal misto pra filtros). Solução: templates pt-BR alinhados com a identidade KEYRA.

**v2.0 (2026-05-02 tarde)** — Auditoria UX detectou que a v1.0 tinha pt-BR correto mas usava **paleta cinza-stone genérica** (`#fafaf9` / `#1a1a1a` / `#6b7280` — Vercel-like) em vez da paleta KEYRA real (terracota + creme). Email ficava genérico — poderia ser de qualquer SaaS. Mudanças aplicadas: paleta KEYRA real, wordmark editorial, botão terracota com `bgcolor` fallback Outlook, `<meta color-scheme>` para forçar light mode, copy revisto (`"Tudo pronto para entrar."` + CTA `"Acessar minha conta"`).

### Princípios de design

**Deliverability (não-negociáveis):**

- **Texto-pesado, 1 botão**: filtros anti-spam favorecem.
- **Sem imagens externas**: zero CDN, zero erros de carregamento offline, zero leak de IP do destinatário.
- **Native font stack** (`system-ui`): zero embed de fonte, render consistente.
- **Mobile-first**: max-width 480px, padding generoso, font ≥ 12px.

**Identidade visual KEYRA (v2.0 — 2026-05-02):**

- **Paleta KEYRA real** (não cinza-stone genérico): background `#FAF8F5`, foreground `#2E2A25`, primary `#C66A38`, muted `#5A5249`. Espelha `apps/web/tailwind.config.ts`.
- **Card sem border**: contraste por luminosidade (creme vs branco) em vez de hairline — evita pixel sujo em Retina/Outlook.
- **Wordmark editorial** (`KEYRA` 18px, weight 700, letter-spacing 0.22em): presença sem competir com headline.
- **Botão terracota com `bgcolor` fallback**: Outlook 2007-2019 ignora `background-color` CSS em alguns contextos; o atributo HTML `bgcolor` no `<td>` e no `<a>` garante a cor.
- **`<meta color-scheme: light only>`**: força light mode em Gmail dark e Apple Mail dark — sem isso, clientes invertem o creme em tom esquisito.
- **WCAG AA validado**: texto branco sobre `#C66A38` = contraste 4.71:1 (passa AA).

## Variáveis Supabase

Disponíveis em todos os templates:

| Variável | Significado |
|----------|-------------|
| `{{ .ConfirmationURL }}` | URL one-time-code (já com callback `${SITE_URL}/auth/callback?code=...`) |
| `{{ .Email }}` | Destinatário |
| `{{ .SiteURL }}` | URL canônica (`https://usekeyra.com`) |
| `{{ .Token }}` | Token cru (NÃO usar diretamente — preferir `ConfirmationURL`) |
| `{{ .TokenHash }}` | Hash (debug only) |

## Próximos templates (backlog)

- `confirm-signup.html` — quando email passa por verificação inicial
- `recovery.html` — reset de senha (não usado no MVP — KEYRA é passwordless-only)
- `email-change.html` — confirmação de troca de email
- `invite.html` — convite de membro (atualmente fluxo passa por templates próprios via React Email — ver `apps/web/src/lib/email/`)
