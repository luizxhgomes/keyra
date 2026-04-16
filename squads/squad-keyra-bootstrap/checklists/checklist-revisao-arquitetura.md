# Checklist de Revisão de Arquitetura — KEYRA

## Stack e Decisões Técnicas

- [ ] Stack definido e justificado (Next.js 15, Supabase, Vercel)
- [ ] ADRs (Architecture Decision Records) documentados
- [ ] Alternativas consideradas e motivo da rejeição

## Camadas da Aplicação

- [ ] Camada de UI (componentes React, Server Components)
- [ ] Camada de API (Next.js API Routes)
- [ ] Camada de Domínio (lógica de negócio isolada em `lib/`)
- [ ] Camada de Dados (Supabase client, queries)
- [ ] Separação clara entre camadas

## Autenticação e Autorização

- [ ] Fluxo de login/cadastro definido
- [ ] JWT com claims de `tenant_id` e `role`
- [ ] Middleware de proteção de rotas
- [ ] RLS no banco como camada final de segurança

## Multi-Tenancy

- [ ] Estratégia definida (schema compartilhado com RLS)
- [ ] `tenant_id` propagado do JWT para todas as queries
- [ ] Isolamento de dados validado
- [ ] Sem possibilidade de acesso cross-tenant

## Integrações Externas

- [ ] Maquininhas (APIs ou parsing de extratos)
- [ ] OCR (tecnologia escolhida e justificada)
- [ ] NFS-e (estratégia de integração por município)
- [ ] Armazenamento de documentos (Supabase Storage)

## Performance e Escalabilidade

- [ ] Server Components para reduzir JavaScript no cliente
- [ ] Estratégia de cache definida
- [ ] Processamento assíncrono para tarefas pesadas (OCR, relatórios)
- [ ] Limites de upload definidos

## Segurança

- [ ] LGPD considerada na arquitetura
- [ ] Criptografia em trânsito (TLS 1.2+)
- [ ] Criptografia em repouso para dados sensíveis
- [ ] Sanitização de inputs
- [ ] Proteção contra OWASP Top 10

## Deploy e Operações

- [ ] Pipeline de CI/CD definido
- [ ] Ambientes: desenvolvimento, staging, produção
- [ ] Estratégia de migrações de banco
- [ ] Monitoramento e logging
- [ ] Backup e recuperação

## Estrutura de Pastas

- [ ] Source tree documentado (`config/source-tree.md`)
- [ ] Convenções de nomenclatura claras
- [ ] Separação entre código do framework e do projeto
