'use client';

import { StatCard, StatCardsSection } from '@/components/keyra';

interface Props {
  totalItems: number;
  activeItems: number;
  totalCategories: number;
  uncategorizedItems: number;
  totalItemsDelta: number | null;
  activeItemsDelta: number | null;
  totalCategoriesDelta: number | null;
  uncategorizedItemsDelta: number | null;
}

/**
 * 4 stats do catálogo — fase 2 da unificação em `<StatCard>` canônico
 * (Story reorg.5). Visual idêntico ao anterior; a implementação duplicada
 * (Cell/DeltaPill/ACCENT_RING locais, cópia de comandas-stats) foi removida.
 */
export function CatalogStats({
  totalItems,
  activeItems,
  totalCategories,
  uncategorizedItems,
  totalItemsDelta,
  activeItemsDelta,
  totalCategoriesDelta,
  uncategorizedItemsDelta,
}: Props) {
  return (
    <StatCardsSection ariaLabel="Resumo do catálogo">
      <StatCard
        icon="box"
        label="Total de itens"
        value={totalItems.toLocaleString('pt-BR')}
        delta={totalItemsDelta}
        accent="cocoa"
      />
      <StatCard
        icon="sparkles"
        label="Itens ativos"
        value={activeItems.toLocaleString('pt-BR')}
        delta={activeItemsDelta}
        accent="terracota"
      />
      <StatCard
        icon="layers"
        label="Categorias"
        value={totalCategories.toLocaleString('pt-BR')}
        delta={totalCategoriesDelta}
        accent="amber"
      />
      <StatCard
        icon="folder"
        label="Sem categoria"
        value={uncategorizedItems.toLocaleString('pt-BR')}
        delta={uncategorizedItemsDelta}
        accent="success"
      />
    </StatCardsSection>
  );
}
