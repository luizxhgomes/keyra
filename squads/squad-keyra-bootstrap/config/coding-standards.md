# Coding Standards — KEYRA

## Linguagem e Estilo

- **TypeScript** obrigatório — sem arquivos `.js`
- **Strict mode** ativado no `tsconfig.json`
- **ESLint** + **Prettier** para consistência
- **Imports absolutos** com alias `@/` mapeando para `src/`

## Convenções de Nomenclatura

| Item | Padrão | Exemplo |
|------|--------|---------|
| Componentes React | PascalCase | `DashboardCard.tsx` |
| Funções/variáveis | camelCase | `calculateMargin()` |
| Constantes | UPPER_SNAKE | `MAX_FILE_SIZE` |
| Arquivos de componente | PascalCase | `ServicePricing.tsx` |
| Arquivos utilitários | kebab-case | `format-currency.ts` |
| Tabelas do banco | snake_case | `service_orders` |
| Colunas do banco | snake_case | `tenant_id` |
| Rotas da API | kebab-case | `/api/bank-statements` |

## Estrutura de Componentes

```typescript
// 1. Imports
import { type FC } from 'react'

// 2. Tipos
interface DashboardCardProps {
  title: string
  value: number // em centavos
  comparison?: string
}

// 3. Componente
export const DashboardCard: FC<DashboardCardProps> = ({
  title,
  value,
  comparison,
}) => {
  // 4. Lógica
  const formatted = formatCurrency(value)

  // 5. Render
  return (...)
}
```

## Valores Monetários

```typescript
// CORRETO — centavos inteiros
const priceInCents = 2845000 // R$ 28.450,00

// ERRADO — nunca usar float para dinheiro
const price = 28450.00 // ❌ PROIBIDO
```

## Tratamento de Erros

```typescript
// Usar Result pattern ou try/catch com tipagem
try {
  const result = await processDocument(file)
} catch (error) {
  if (error instanceof DocumentParseError) {
    // tratar erro específico
  }
  throw error // re-throw para erros inesperados
}
```

## Commits

- Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`
- Referenciar story: `feat: implementar dashboard numérico [Story 1.1]`
- Commits atômicos e focados
