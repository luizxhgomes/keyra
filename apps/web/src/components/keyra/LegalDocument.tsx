import Link from 'next/link';
import type { Route } from 'next';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface LegalDocumentProps {
  /** Título canônico exibido no header (ex.: "Termos de Uso"). */
  title: string;
  /** Versão semântica do documento (ex.: "1.0.0"). */
  version: string;
  /** ISO date da publicação. Pode ser null se ainda não publicado. */
  publishedAt: string | null;
  /** Markdown bruto vindo de `legal_documents.content_md`. */
  contentMd: string;
  /** Links de navegação cruzada exibidos no footer (ex.: para o documento irmão). */
  altLinks?: Array<{ href: Route; label: string }>;
}

/**
 * Renderiza um documento legal (Termos de Uso, Política de Privacidade) com
 * tipografia editorial KEYRA — Inter Variable, weights extremos (200/600),
 * paleta terracota+sálvia, spacing roomy, tabelas responsivas.
 *
 * Recebe Markdown e converte via `react-markdown` + `remark-gfm` (suporte a
 * tabelas GFM e demais extensões). Cada elemento HTML resultante é mapeado
 * para um wrapper estilizado em harmonia com os tokens do design system
 * KEYRA (`tailwind.config.ts` → `fontSize`, `spacing`, `colors`).
 *
 * O primeiro H1 do `contentMd` é removido propositalmente: o título já é
 * exibido no header da página, evitar duplicação visual.
 */
export function LegalDocument({
  title,
  version,
  publishedAt,
  contentMd,
  altLinks = [],
}: LegalDocumentProps) {
  // Remove o primeiro `# Título` do markdown (já exibido no <header>).
  // Em seguida, limpa travessões (en-dash U+2013 e em-dash U+2014): o estilo
  // editorial KEYRA evita travessões em corpo de texto. Substitui por
  // espaço único e colapsa whitespace residual para preservar fluxo de leitura.
  const body = contentMd
    .replace(/^\s*#\s+.+\n+/, '')
    .replace(/[–—]/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/^[ \t]+/gm, '');

  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '—';

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 md:py-16">
      <header className="mb-section border-b border-border pb-stack-loose">
        <p className="text-label font-semibold uppercase tracking-wider text-primary-700">
          KEYRA
        </p>
        <h1 className="mt-stack-tight text-display font-extralight tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-stack-tight text-body-sm text-muted-foreground">
          Versão {version} · vigente desde {formattedDate}
        </p>
      </header>

      <article className="legal-prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {body}
        </ReactMarkdown>
      </article>

      <footer className="mt-page border-t border-border pt-stack-loose text-body-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">
          ← Voltar à página inicial
        </Link>
        {altLinks.map((link) => (
          <span key={link.href}>
            {' · '}
            <Link href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </Link>
          </span>
        ))}
      </footer>
    </main>
  );
}

/**
 * Mapeamento dos elementos HTML gerados pelo react-markdown para wrappers
 * estilizados com tokens KEYRA. Mantido fora do componente para evitar
 * recriação a cada render (Server Component, mas a regra vale).
 */
const markdownComponents: Components = {
  h2: ({ children, ...props }) => (
    <h2
      className="mt-section border-b border-border/60 pb-2 text-h2 font-semibold tracking-tight text-foreground first:mt-0 first:border-b-0 first:pb-0"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="mt-stack-loose text-h3 font-semibold tracking-tight text-foreground"
      {...props}
    >
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="mt-stack text-body leading-relaxed text-foreground first:mt-0" {...props}>
      {children}
    </p>
  ),
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      className="font-medium text-primary-700 underline decoration-primary-200 underline-offset-4 transition-colors hover:text-primary-800 hover:decoration-primary-400"
      rel={href?.startsWith('http') ? 'noreferrer noopener' : undefined}
      target={href?.startsWith('http') ? '_blank' : undefined}
      {...props}
    >
      {children}
    </a>
  ),
  ul: ({ children, ...props }) => (
    <ul
      className="mt-stack list-disc space-y-2 pl-6 text-body marker:text-primary-700"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol
      className="mt-stack list-decimal space-y-2 pl-6 text-body marker:font-semibold marker:text-primary-700"
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="leading-relaxed text-foreground" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="mt-stack-loose rounded-md border-l-2 border-primary-700 bg-primary-50/60 px-5 py-4 text-body text-foreground [&>*:first-child]:mt-0 [&>p]:my-1"
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ children, ...props }) => (
    <code
      className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
      {...props}
    >
      {children}
    </code>
  ),
  hr: ({ ...props }) => <hr className="my-page border-border" {...props} />,
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-foreground" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic text-foreground" {...props}>
      {children}
    </em>
  ),
  table: ({ children, ...props }) => (
    <div className="mt-stack-loose -mx-2 overflow-x-auto rounded-lg border border-border md:mx-0">
      <table className="w-full border-collapse text-body-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-muted/60" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }) => (
    <th
      className="border-b border-border px-4 py-3 text-left text-label font-semibold uppercase tracking-wider text-foreground"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td
      className="border-b border-border/60 px-4 py-3 align-top leading-relaxed text-foreground last:border-b-0"
      {...props}
    >
      {children}
    </td>
  ),
};
