# Coding Standards — KEYRA Core

> Referência completa: `../squad-keyra-bootstrap/config/coding-standards.md`

Este squad herda os padrões definidos na Fase 0. Regras adicionais para implementação:

## Regras Financeiras no Código

```typescript
// ✅ CORRETO — centavos inteiros
const price = 15000 // R$ 150,00
const cost = 3500   // R$ 35,00
const margin = ((price - cost) * 100) / price // 76,67%

// ❌ ERRADO — nunca float para dinheiro
const price = 150.00 // PROIBIDO
```

## Formatação de Moeda

```typescript
// Usar função centralizada em src/lib/formatting/currency.ts
import { formatCurrency } from '@/lib/formatting/currency'

formatCurrency(15000) // "R$ 150,00"
formatCurrency(-23000) // "-R$ 230,00"
```

## Validação com Zod

```typescript
// Schemas centralizados em src/lib/validations/
import { z } from 'zod'

export const serviceSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  price: z.number().int().positive('Preço deve ser positivo'), // centavos
  duration_minutes: z.number().int().min(5).max(480),
})
```

## Commits deste Squad

```
feat(epic2): implementar CRUD de pacientes [Story 2.1]
feat(epic3): implementar comanda automática [Story 3.1]
feat(epic4): implementar DRE por serviço [Story 4.2]
fix(epic3): corrigir rateio de custos fixos [Story 3.3]
```
