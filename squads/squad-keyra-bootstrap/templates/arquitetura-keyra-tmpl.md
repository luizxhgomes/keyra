# Documento de Arquitetura — {{NOME_DO_PRODUTO}}

> Versão: {{VERSÃO}}
> Data: {{DATA}}
> Autor: @architect (Aria)
> Status: Rascunho | Em Revisão | Aprovado

---

## 1. Visão Geral

**Objetivo:** {{o que este documento cobre}}

**Escopo:** {{limites da arquitetura}}

---

## 2. Stack Tecnológico

| Camada | Tecnologia | Versão | Justificativa |
|--------|-----------|--------|---------------|
| Frontend | {{tech}} | {{ver}} | {{por quê}} |
| Backend | {{tech}} | {{ver}} | {{por quê}} |
| Banco de Dados | {{tech}} | {{ver}} | {{por quê}} |
| Autenticação | {{tech}} | {{ver}} | {{por quê}} |
| Deploy | {{tech}} | — | {{por quê}} |

---

## 3. Diagrama de Arquitetura

```
{{diagrama ASCII ou referência para imagem}}
```

---

## 4. Camadas da Aplicação

### 4.1 Camada de Apresentação (UI)
{{descrição, padrões, componentes}}

### 4.2 Camada de API
{{rotas, padrões, autenticação}}

### 4.3 Camada de Domínio
{{lógica de negócio, serviços, validações}}

### 4.4 Camada de Dados
{{acesso ao banco, queries, cache}}

---

## 5. Autenticação e Autorização

{{fluxo de auth, JWT, roles, permissões}}

---

## 6. Multi-Tenancy

{{estratégia, isolamento, RLS}}

---

## 7. Integrações Externas

| Integração | Tipo | Prioridade |
|-----------|------|-----------|
| {{nome}} | API / Parsing / Webhook | Alta / Média / Baixa |

---

## 8. Decisões Arquiteturais (ADRs)

### ADR-001: {{Título}}
- **Decisão:** {{o que foi decidido}}
- **Contexto:** {{por que essa decisão foi necessária}}
- **Alternativas:** {{o que mais foi considerado}}
- **Consequências:** {{impactos positivos e negativos}}

---

## 9. Segurança

{{requisitos de segurança, criptografia, LGPD}}

---

## 10. Deploy e Operações

{{pipeline CI/CD, ambientes, monitoramento}}

---

## 11. Estrutura de Pastas

```
{{source tree}}
```

---

## 12. Referências

- PRD: `docs/prd/{{arquivo}}`
- Schema: `docs/architecture/SCHEMA.md`
- Tech Stack: `config/tech-stack.md`
