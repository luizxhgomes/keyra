import { redirect } from 'next/navigation';

/**
 * `/estoque` redireciona para `/estoque/insumos` — a aba padrão do módulo.
 * Mantém o link no Sidebar consistente com o resto do app sem precisar de
 * lógica de "rota inicial" no client.
 */
export default function EstoqueIndex() {
  redirect('/estoque/insumos');
}
