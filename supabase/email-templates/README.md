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
   - `magic-link.html` → `Seu link de acesso ao KEYRA`
7. Salvar

## Rationale (Story 7.2)

Validação manual da idealizadora (2026-05-02) detectou que o magic link chegava em **inglês padrão Supabase** (`Click here to sign in to your account`). Quebra de tom + risco de spam (template gringo + remetente custom = sinal misto pra filtros).

Solução: templates pt-BR alinhados com a identidade KEYRA (mentora, sofisticação editorial, tom não-corporativo).

### Princípios de design

- **Texto-pesado, 1 botão**: melhor deliverability (filtros anti-spam favorecem)
- **Sem imagens externas**: zero CDN, zero erros de carregamento offline, zero leak de IP do destinatário
- **Native font stack** (`system-ui`): zero embed de fonte, render consistente
- **Cores neutras** (`#fafaf9` / `#1a1a1a` / `#6b7280`): respeita dark mode dos clientes de email
- **Mobile-first**: max-width 480px, padding generoso, font ≥ 13px

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
