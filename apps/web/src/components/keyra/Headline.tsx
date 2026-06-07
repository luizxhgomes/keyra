import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * `<Headline>` — headline canônica KEYRA "sentença por linha".
 *
 * Padrão de marca (decisão do arquiteto de identidade visual): toda headline
 * com mais de uma frase quebra por SENTENÇA, nunca por `<br>` manual. Cada
 * sentença vira um bloco próprio (`.hl-s`), que se equilibra internamente com
 * `text-wrap: balance` quando precisa quebrar em telas estreitas — eliminando
 * órfãos ENTRE sentenças (cada uma é nó próprio) e DENTRO da sentença (balance).
 *
 * O hero usa VERSO autoral fixo (`mode="verse"` → `.hl-line`): a quebra é
 * deliberada/semântica, sem balance cego.
 *
 * Modelo mental: "sentença quebra por estrutura; linha quebra por balance;
 * <br> não existe."
 *
 * Centralização e measure curta vêm do utilitário `.headline-sentences`
 * (globals.css `@layer components`), que espelha o bloco do brandbook vivo
 * (docs/brand/03-identity/preview.html). Salvaguarda de marca: a measure curta
 * (`level="display"` ~16ch / `level="title"` ~30ch) cria o vazio lateral
 * generoso que dá o ar de luxo. O contraste de peso (nenhum heading monopeso)
 * é responsabilidade do conteúdo passado em `sentences`.
 *
 * RSC-safe: Server Component puro (sem `'use client'`, sem `forwardRef`
 * cruzando a fronteira Server↔Client — ver docs/dev/rsc-boundary-rules.md
 * Regra 1). Sem libs novas.
 *
 * Reference: .claude/rules/design-system.md §Princípio 6 + PREVIEW-REFERENCE.md.
 *
 * @example
 * // h2 de seção com duas sentenças (centralizado, balance anti-órfão):
 * <Headline as="h2" level="title" sentences={[
 *   <>A clínica vira financeiro <em>sozinha</em>.</>,
 *   <>Você decide com <strong>clareza</strong>.</>,
 * ]} />
 *
 * @example
 * // hero com versos autorais (quebra deliberada):
 * <Headline as="h1" level="display" mode="verse" sentences={[
 *   'Sua clínica',
 *   <><span className="font-thin italic">rendendo</span> mais.</>,
 * ]} />
 */

/** Elementos permitidos para a headline — nunca um componente forwardRef. */
type HeadlineTag = 'h1' | 'h2' | 'h3' | 'p' | 'div';

export interface HeadlineProps {
  /**
   * Sentenças (mode `sentence`) ou versos (mode `verse`) da headline. Cada
   * item vira um bloco. Frase única é válida (array de 1).
   */
  sentences: ReactNode[];
  /** Elemento renderizado. Default `h2`. */
  as?: HeadlineTag;
  /**
   * `sentence` (default) → cada item é uma `.hl-s` (frase, com balance).
   * `verse` → cada item é uma `.hl-line` (verso autoral, sem balance).
   */
  mode?: 'sentence' | 'verse';
  /**
   * Nível tipográfico — define a measure curta (em `ch`):
   * `display` ~16ch (hero), `title` ~30ch (h2 de seção). Default `title`.
   */
  level?: 'display' | 'title';
  className?: string;
}

export function Headline({
  sentences,
  as: Tag = 'h2',
  mode = 'sentence',
  level = 'title',
  className,
}: HeadlineProps) {
  const blockClass = mode === 'verse' ? 'hl-line' : 'hl-s';

  return (
    <Tag
      className={cn(
        'headline-sentences',
        level === 'display' ? 'headline-display' : 'headline-title',
        className,
      )}
    >
      {sentences.map((sentence, index) => (
        // Índice como key é seguro: a lista de sentenças de uma headline é
        // estática e ordenada (não há reordenação/inserção em runtime).
        <span key={index} className={blockClass}>
          {sentence}
        </span>
      ))}
    </Tag>
  );
}
