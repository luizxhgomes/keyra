# Credenciais KEYRA — Setup Isolado

Tokens de Vercel/Supabase/GitHub vivem em `.keyra-secrets/` e **só** são carregados quando você rodar um dos scripts abaixo. Não alteram autenticação global de nenhum CLI.

## Estrutura

```
.keyra-secrets/                  # chmod 700, gitignored
├── README.md                    # versionado
├── github.token                 # PAT GitHub (chmod 600)
├── vercel.token                 # Vercel access token
├── supabase.token               # PAT do Supabase CLI (sbp_*)
├── supabase-project-ref.txt     # ref do projeto (ex: ysuscgknjeaugzpsdbis)
├── supabase-anon.key            # JWT anon (cliente)
├── supabase-publishable.key     # sb_publishable_*
├── supabase-service-role.key    # JWT service_role (servidor)
└── supabase-secret.key          # sb_secret_*

scripts/
├── keyra-shell.sh   # source para carregar envs no shell atual
├── with-env.sh      # roda UM comando com envs (sem poluir shell)
├── sync-env.sh      # regenera .env.local a partir de .keyra-secrets/
└── check-tokens.sh  # valida cada token contra a API do provider

.env.local           # auto-gerado, chmod 600, gitignored — usado pelo Next.js
.env.local.example   # template comitável
```

## Uso

### Shell isolado (mais comum no dia a dia)
```bash
source ./scripts/keyra-shell.sh
gh repo view luizxhgomes/keyra
vercel projects ls
supabase projects list
```

### Comando único sem alterar shell
```bash
./scripts/with-env.sh gh auth status
./scripts/with-env.sh vercel deploy
```

### Regerar `.env.local` após mudar tokens
```bash
./scripts/sync-env.sh
```

### Validar credenciais
```bash
./scripts/check-tokens.sh
```

## Mapeamento de variáveis

| Arquivo `.keyra-secrets/`     | Env var exportada                          | Usado por             |
|-------------------------------|--------------------------------------------|-----------------------|
| `github.token`                | `GH_TOKEN`, `GITHUB_TOKEN`                 | `gh` CLI, Octokit     |
| `vercel.token`                | `VERCEL_TOKEN`                             | `vercel` CLI          |
| `supabase.token`              | `SUPABASE_ACCESS_TOKEN`                    | `supabase` CLI        |
| `supabase-project-ref.txt`    | `SUPABASE_PROJECT_REF`, `NEXT_PUBLIC_SUPABASE_URL` | App + CLI |
| `supabase-anon.key`           | `NEXT_PUBLIC_SUPABASE_ANON_KEY`            | Next.js client        |
| `supabase-publishable.key`    | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`     | Next.js client (novo) |
| `supabase-service-role.key`   | `SUPABASE_SERVICE_ROLE_KEY`                | Server actions admin  |
| `supabase-secret.key`         | `SUPABASE_SECRET_KEY`                      | Server admin (novo)   |

## Permissões mínimas recomendadas

### GitHub PAT (Fine-Grained)
- Repository access: **Only `keyra`**
- Permissions: Contents R/W, Issues R/W, PRs R/W, Workflows R/W

### Vercel
- Account-level token (Vercel não suporta scoping por projeto antes do projeto existir).
- **Após criar o projeto**, rotacione para um token de team scope.

### Supabase
- PAT pessoal (única opção). Após linkar o projeto local, ele identifica o `project_ref` e os comandos só atuam nele.

## Rotação

Se um token vazar (ex: foi colado em chat, log público):
1. Abra o painel do provider
2. Revogue o token antigo
3. Gere novo
4. `vim .keyra-secrets/<arquivo>` (sobrescreva)
5. `./scripts/sync-env.sh && ./scripts/check-tokens.sh`

## Boa prática para próximas trocas de credenciais

Sempre que possível, **NÃO cole o token em chat**. Em vez disso:
```bash
echo "ghp_..." > .keyra-secrets/github.token
chmod 600 .keyra-secrets/github.token
```
Assim o token nunca passa pelo histórico de mensagens.
